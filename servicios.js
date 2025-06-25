document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('servicesChecklistForm');
    const calculateBtn = document.getElementById('calculateServicesSummaryBtn');
    const totalScoreSpan = document.getElementById('totalScore');
    const maxScoreSpan = document.getElementById('maxScore');
    const compliancePercentageSpan = document.getElementById('compliancePercentage');
    const globalObservationsTextarea = document.getElementById('globalObservations');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

    let chartInstance = null;
    const totalQuestions = 19;
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

        localStorage.setItem('serviciosCompliancePercentage', percentage.toFixed(0));
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
                    backgroundColor: chartColors
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
                                return `${context.label}: ${context.parsed} preguntas`;
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
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - 2 * margin;

        const options = { scale: 2, useCORS: true };

        try {
            // Capturar el checklist (todo el formulario)
            const checklistSection = document.querySelector('.tabla-de-lista-de-verificación');
            const checklistCanvas = await html2canvas(checklistSection, options);
            const checklistImage = checklistCanvas.toDataURL('image/jpeg', 1.0);

            const imgProps = {
                width: checklistCanvas.width,
                height: checklistCanvas.height
            };
            const ratio = contentWidth / imgProps.width;
            const imgHeight = imgProps.height * ratio;

            let position = 0;
            let heightLeft = imgHeight;

            // Renderizar imagen del checklist en múltiples páginas si es necesario
            while (heightLeft > 0) {
                const imgPosition = margin + position;
                doc.addImage(checklistImage, 'JPEG', margin, margin, contentWidth, imgHeight, undefined, 'FAST');
                heightLeft -= pageHeight - 2 * margin;
                if (heightLeft > 0) {
                    doc.addPage();
                    position -= pageHeight - 2 * margin;
                }
            }

            // Capturar resumen
            const summarySection = document.querySelector('.sección-de-resumen');
            const summaryCanvas = await html2canvas(summarySection, options);
            const summaryImage = summaryCanvas.toDataURL('image/jpeg', 1.0);

            const summaryRatio = contentWidth / summaryCanvas.width;
            const summaryHeight = summaryCanvas.height * summaryRatio;

            doc.addPage();
            doc.addImage(summaryImage, 'JPEG', margin, margin, contentWidth, summaryHeight);

            doc.save('checklist_servicios.pdf');
        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("Hubo un error al generar el PDF. Intenta nuevamente.");
        }
    });

    calculateBtn.addEventListener('click', updateSummary);
    form.addEventListener('change', event => {
        if (event.target.type === 'radio' || event.target.tagName === 'TEXTAREA') {
            updateSummary();
        }
    });

    updateSummary();
});
