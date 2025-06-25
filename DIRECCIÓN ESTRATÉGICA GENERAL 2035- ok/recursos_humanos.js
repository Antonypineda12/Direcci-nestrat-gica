document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checklistForm');
    const calculateBtn = document.getElementById('calculateSummaryBtn');
    const totalScoreSpan = document.getElementById('totalScore');
    const maxScoreSpan = document.getElementById('maxScore');
    const compliancePercentageSpan = document.getElementById('compliancePercentage');
    const globalObservationsTextarea = document.getElementById('globalObservations');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn'); // Asumo que este botón ya existe en tu HTML de RRHH

    const contentToCapture = document.body; // Para la captura del PDF

    let chartInstance = null;

    const totalQuestions = 15;
    const chartLabels = ['Malo (0)', 'Regular (1)', 'Bueno (2)', 'Excelente (3)'];
    const chartColors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db'];

    // Función para calcular y actualizar el resumen
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

        // --- NUEVA LÍNEA: Guardar el porcentaje en localStorage para Recursos Humanos ---
        localStorage.setItem('recursosHumanosCompliancePercentage', percentage.toFixed(0));

        updateChart(complianceCounts);
    }

    // Función para crear/actualizar el gráfico
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
                            label: function(context) {
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
                        labels: {
                            boxWidth: 20
                        }
                    }
                }
            }
        });
    }

downloadPdfBtn.addEventListener('click', async () => {
    updateSummary();

    await new Promise(resolve => setTimeout(resolve, 500));

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    const pdfWidth = doc.internal.pageSize.getWidth();

    const options = {
        scale: 2,
        useCORS: true
    };

    try {
        // Capturar checklist
        const checklist = document.querySelector('.checklist-table');
        const canvas1 = await html2canvas(checklist, options);
        const img1 = canvas1.toDataURL('image/jpeg', 0.9);
        const ratio1 = canvas1.width / canvas1.height;
        const height1 = (pdfWidth - 2 * margin) / ratio1;
        doc.addImage(img1, 'JPEG', margin, margin, pdfWidth - 2 * margin, height1);

        // Capturar resumen
        const summary = document.querySelector('.summary-section');
        const canvas2 = await html2canvas(summary, options);
        const img2 = canvas2.toDataURL('image/jpeg', 0.9);
        const ratio2 = canvas2.width / canvas2.height;
        const height2 = (pdfWidth - 2 * margin) / ratio2;

        doc.addPage();
        doc.addImage(img2, 'JPEG', margin, margin, pdfWidth - 2 * margin, height2);

        doc.save('checklist_recursos_humanos.pdf');
    } catch (error) {
        console.error("ERROR AL GENERAR PDF:", error);
        alert("Hubo un error al generar el PDF. Revisa consola.");
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