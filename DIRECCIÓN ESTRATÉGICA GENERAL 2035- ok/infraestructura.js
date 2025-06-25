document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checklistForm');
    const calculateBtn = document.getElementById('calculateSummaryBtn');
    const totalScoreSpan = document.getElementById('totalScore');
    const maxScoreSpan = document.getElementById('maxScore');
    const compliancePercentageSpan = document.getElementById('compliancePercentage');
    const globalObservationsTextarea = document.getElementById('globalObservations');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

    const checklistContent = document.getElementById('checklistContent');
    const summaryContent = document.getElementById('summaryContent');

    let chartInstance = null;
    const totalQuestions = 15;
    const chartLabels = ['Malo (0)', 'Regular (1)', 'Bueno (2)', 'Excelente (3)'];
    const chartColors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db'];

    function updateSummary() {
        let totalScore = 0;
        let answeredQuestions = 0;
        const complianceCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };

        for (let i = 1; i <= totalQuestions; i++) {
            const radios = form.elements[`q${i}`];
            if (radios) {
                let selectedValue = null;
                for (const radio of radios) {
                    if (radio.checked) {
                        selectedValue = parseInt(radio.value);
                        break;
                    }
                }
                if (selectedValue !== null) {
                    totalScore += selectedValue;
                    answeredQuestions++;
                    complianceCounts[selectedValue]++;
                }
            }
        }

        const maxPossibleScore = totalQuestions * 3;
        const percentage = answeredQuestions > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

        totalScoreSpan.textContent = totalScore;
        maxScoreSpan.textContent = maxPossibleScore;
        compliancePercentageSpan.textContent = percentage.toFixed(2) + '%';

        localStorage.setItem('infraestructuraCompliancePercentage', percentage.toFixed(0));
        updateChart(complianceCounts);
    }

    function updateChart(dataCounts) {
        const ctx = document.getElementById('complianceChart').getContext('2d');

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Nivel de Cumplimiento',
                    data: [dataCounts[0], dataCounts[1], dataCounts[2], dataCounts[3]],
                    backgroundColor: chartColors,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución de Cumplimiento por Nivel',
                        font: { size: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed + ' preguntas';
                                }
                                return label;
                            }
                        }
                    },
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 20 }
                    }
                }
            }
        });
    }

downloadPdfBtn.addEventListener('click', async () => {
    updateSummary();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    const options = {
        scale: 2,
        useCORS: true
    };

    // 🔹 Clonar contenido en contenedores temporales
    const cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'absolute';
    cloneContainer.style.left = '-9999px'; // oculto fuera de pantalla
    document.body.appendChild(cloneContainer);

    try {
        // ✅ CAPTURAR checklist
        const checklistClone = document.getElementById('checklistContent').cloneNode(true);
        cloneContainer.innerHTML = ''; // limpiar
        cloneContainer.appendChild(checklistClone);

        await new Promise(r => setTimeout(r, 300)); // render delay
        const checklistCanvas = await html2canvas(cloneContainer, options);
        const checklistImg = checklistCanvas.toDataURL('image/jpeg', 0.9);

        const checklistRatio = checklistCanvas.width / checklistCanvas.height;
        const checklistHeight = (pdfWidth - 2 * margin) / checklistRatio;

        doc.addImage(checklistImg, 'JPEG', margin, margin, pdfWidth - 2 * margin, checklistHeight);

        // ✅ CAPTURAR resumen
        const summaryClone = document.getElementById('summaryContent').cloneNode(true);
        cloneContainer.innerHTML = '';
        cloneContainer.appendChild(summaryClone);

        await new Promise(r => setTimeout(r, 300));
        const summaryCanvas = await html2canvas(cloneContainer, options);
        const summaryImg = summaryCanvas.toDataURL('image/jpeg', 0.9);

        const summaryRatio = summaryCanvas.width / summaryCanvas.height;
        const summaryHeight = (pdfWidth - 2 * margin) / summaryRatio;

        doc.addPage();
        doc.addImage(summaryImg, 'JPEG', margin, margin, pdfWidth - 2 * margin, summaryHeight);

        doc.save('checklist_infraestructura.pdf');
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        alert('Ocurrió un error al generar el PDF.');
    } finally {
        // 🔹 Limpieza del clon
        document.body.removeChild(cloneContainer);
    }
});



    calculateBtn.addEventListener('click', updateSummary);

    form.addEventListener('change', (event) => {
        if (event.target.type === 'radio' || event.target.tagName === 'TEXTAREA') {
            updateSummary();
        }
    });

    updateSummary();
});
