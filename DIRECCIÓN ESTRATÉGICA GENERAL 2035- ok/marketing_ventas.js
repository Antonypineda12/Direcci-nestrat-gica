document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checklistForm');
    const calculateBtn = document.getElementById('calculateSummaryBtn');
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
                for (const radio of radios) {
                    if (radio.checked) {
                        const value = parseInt(radio.value);
                        totalScore += value;
                        complianceCounts[value]++;
                        answeredQuestions++;
                        break;
                    }
                }
            }
        }

        const maxPossibleScore = totalQuestions * 3;
        const percentage = answeredQuestions > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

        totalScoreSpan.textContent = totalScore;
        maxScoreSpan.textContent = maxPossibleScore;
        compliancePercentageSpan.textContent = percentage.toFixed(2) + '%';

        localStorage.setItem('marketingVentasCompliancePercentage', percentage.toFixed(0));

        updateChart(complianceCounts);
    }

    function updateChart(dataCounts) {
        const ctx = document.getElementById('complianceChart').getContext('2d');

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: [dataCounts[0], dataCounts[1], dataCounts[2], dataCounts[3]],
                    backgroundColor: chartColors,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    title: {
                        display: true,
                        text: 'Distribución de Cumplimiento',
                        font: { size: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) label += ': ';
                                label += context.parsed + ' respuestas';
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    downloadPdfBtn.addEventListener('click', async () => {
        updateSummary();

        await new Promise(resolve => setTimeout(resolve, 800));

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const options = {
            scale: 2,
            useCORS: true
        };

        try {
            // Capturar checklist (excluyendo resumen)
            const checklistElement = document.querySelector('.tabla-de-lista-de-verificación');
            const resumenElement = document.querySelector('.sección-de-resumen');

            const checklistCanvas = await html2canvas(checklistElement, options);
            const resumenCanvas = await html2canvas(resumenElement, options);

            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();

            // Página 1: Checklist
            const checklistImgData = checklistCanvas.toDataURL('image/jpeg', 0.9);
            const checklistRatio = checklistCanvas.width / checklistCanvas.height;
            let checklistWidth = pdfWidth - 20;
            let checklistHeight = checklistWidth / checklistRatio;
            doc.addImage(checklistImgData, 'JPEG', 10, 10, checklistWidth, checklistHeight);

            // Página 2: Resumen
            doc.addPage();
            const resumenImgData = resumenCanvas.toDataURL('image/jpeg', 0.9);
            const resumenRatio = resumenCanvas.width / resumenCanvas.height;
            let resumenWidth = pdfWidth - 20;
            let resumenHeight = resumenWidth / resumenRatio;
            doc.addImage(resumenImgData, 'JPEG', 10, 10, resumenWidth, resumenHeight);

            doc.save('checklist_marketing_ventas.pdf');
        } catch (error) {
            alert('Error al generar el PDF.');
            console.error(error);
        }
    });

    calculateBtn.addEventListener('click', updateSummary);
    form.addEventListener('change', updateSummary);

    updateSummary();
});
