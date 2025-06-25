document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM de la página de resumen
    const form = document.getElementById('resumenForm');
    const calcularResumenBtn = document.getElementById('calcularResumenBtn');
    const porcentajePromedioSpan = document.getElementById('porcentajePromedio');
    const categoriasEvaluadasSpan = document.getElementById('categoriasEvaluadas');
    const observacionesGlobalesTextarea = document.getElementById('observacionesGlobales');
    const descargarPdfBtn = document.getElementById('descargarPdfBtn');

    const estadoControlColor = document.getElementById('estadoControlColor');
    const estadoControlTexto = document.getElementById('estadoControlTexto');

    // Referencias a todos los inputs de porcentaje
    const infraestructuraInput = document.getElementById('infraestructura');
    const recursosHumanosInput = document.getElementById('recursosHumanos');
    const desarrolloTecnologicoInput = document.getElementById('desarrolloTecnologico');
    const aprovisionamientoInput = document.getElementById('aprovisionamiento');
    const logisticaInternaInput = document.getElementById('logisticaInterna');
    const produccionInput = document.getElementById('produccion');
    const logisticaExternaInput = document.getElementById('logisticaExterna');
    const marketingVentasInput = document.getElementById('marketingVentas');
    // --- NUEVA REFERENCIA al input de servicios ---
    const serviciosInput = document.getElementById('servicios');


    let resumenChartInstance = null; // Instancia del gráfico de resumen

    // Lista de categorías para iterar y recopilar datos
    const categorias = [
        'infraestructura',
        'recursosHumanos',
        'desarrolloTecnologico',
        'aprovisionamiento',
        'logisticaInterna',
        'produccion',
        'logisticaExterna',
        'marketingVentas',
        'servicios'
    ];

    // Función para calcular y actualizar el resumen general y el estado de control del IEO
    function updateSummary() {
        let totalPorcentaje = 0;
        let countCategorias = 0;
        const dataForChart = []; // Datos para el gráfico de barras

        categorias.forEach(categoria => {
            const input = document.getElementById(categoria);
            const value = parseInt(input.value);
            // Solo sumar si el valor es un número válido (0-100)
            if (!isNaN(value) && value >= 0 && value <= 100) {
                totalPorcentaje += value;
                countCategorias++;
                dataForChart.push(value);
            } else {
                // Si el valor no es válido o está vacío, se asume 0 para el cálculo
                dataForChart.push(0); 
            }
        });

        // Calcular el promedio general de cumplimiento
        const promedio = countCategorias > 0 ? totalPorcentaje / countCategorias : 0;

        // Actualizar los elementos en el DOM
        porcentajePromedioSpan.textContent = promedio.toFixed(2) + '%';
        categoriasEvaluadasSpan.textContent = countCategorias;

        // Actualizar el gráfico y el estado de control del IEO
        updateChart(dataForChart);
        updateEstadoControl(promedio);
    }

    // Función para actualizar el estado de control del IEO (verde, amarillo, rojo)
    function updateEstadoControl(promedio) {
        // Remover clases de color existentes
        estadoControlColor.classList.remove('control-verde', 'control-amarillo', 'control-rojo');
        estadoControlTexto.classList.remove('estado-verde', 'estado-amarillo', 'estado-rojo');

        // Asignar clases y texto según el rango del promedio
        if (promedio >= 70) {
            estadoControlTexto.textContent = "EN CONTROL";
            estadoControlColor.classList.add('control-verde');
            estadoControlTexto.style.color = '#28a745'; // Color verde para el texto
        } else if (promedio >= 40 && promedio < 70) {
            estadoControlTexto.textContent = "BAJO CONTROL";
            estadoControlColor.classList.add('control-amarillo');
            estadoControlTexto.style.color = '#ffc107'; // Color amarillo para el texto
        } else { // promedio < 40
            estadoControlTexto.textContent = "FUERA DE CONTROL";
            estadoControlColor.classList.add('control-rojo');
            estadoControlTexto.style.color = '#dc3545'; // Color rojo para el texto
        }
    }

    // Función para crear o actualizar el gráfico de barras de cumplimiento por categoría
    function updateChart(data) {
        const ctx = document.getElementById('resumenChart').getContext('2d');

        // Destruir la instancia anterior del gráfico si existe
        if (resumenChartInstance) {
            resumenChartInstance.destroy();
        }

        // Crear una nueva instancia de Chart.js (gráfico de barras)
        resumenChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    'Infraestructura', 'Recursos Humanos', 'Desarrollo Tecnológico',
                    'Aprovisionamiento', 'Logística Interna', 'Producción',
                    'Logística Externa', 'Marketing y Ventas', 'Servicios'
                ],
                datasets: [{
                    label: 'Porcentaje de Cumplimiento',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(199, 199, 199, 0.7)',
                        'rgba(83, 102, 255, 0.7)',
                        'rgba(255, 99, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)',
                        'rgba(83, 102, 255, 1)',
                        'rgba(255, 99, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100, // Escala Y de 0 a 100
                        title: {
                            display: true,
                            text: 'Porcentaje (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Categoría'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // No mostrar leyenda para una sola serie
                    },
                    title: {
                        display: true,
                        text: 'Cumplimiento por Categoría',
                        font: { size: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // Event listener para el botón de Descargar PDF
    descargarPdfBtn.addEventListener('click', async () => {
        updateSummary(); // Asegura que todos los datos y el gráfico estén actualizados

        // Pequeña espera para permitir que el DOM y el gráfico se rendericen completamente
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { jsPDF } = window.jspdf; // Obtener la clase jsPDF
        const doc = new jsPDF('p', 'mm', 'a4'); // Crear un nuevo documento PDF

        const contentToCapture = document.body; // Elemento a capturar para el PDF

        // Opciones para html2canvas
        const options = {
            scale: 2, // Aumenta la escala para una mejor calidad de imagen en el PDF
            useCORS: true, // Habilitar CORS para cargar imágenes de origen cruzado
            logging: true, // Habilitar registro
            scrollX: 0, // No desplazar horizontalmente
            scrollY: 0, // No desplazar verticalmente
            windowWidth: document.documentElement.offsetWidth, // Usar el ancho total de la ventana
            windowHeight: document.documentElement.offsetHeight // Usar la altura total de la ventana
        };

        try {
            // Capturar el contenido del cuerpo de la página como un canvas
            const canvas = await html2canvas(contentToCapture, options);
            const imgData = canvas.toDataURL('image/jpeg', 0.9); // Convertir el canvas a una imagen JPG (calidad 0.9)

            // Obtener dimensiones del PDF
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();

            // Calcular las dimensiones de la imagen en el PDF para que quepa y mantenga la proporción
            const imgRatio = canvas.width / canvas.height;
            let imgWidth = pdfWidth - (2 * 10); // Ancho de la imagen con márgenes de 10mm a cada lado
            let imgHeight = imgWidth / imgRatio;

            let heightLeft = imgHeight; // Altura restante de la imagen a añadir al PDF
            let position = 10; // Posición vertical inicial en el PDF (margen superior de 10mm)

            // Añadir la primera parte de la imagen al PDF
            doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - position); // Reducir la altura restante por la parte ya añadida

            // Si la imagen es más grande que una página, añadir páginas adicionales
            while (heightLeft > 0) {
                position = - (imgHeight - heightLeft + 10); // Calcular la posición para la siguiente parte
                doc.addPage(); // Añadir nueva página
                doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight); // Añadir la siguiente parte de la imagen
                heightLeft -= pdfHeight; // Reducir la altura restante por la altura de la página
            }

            doc.save('resumen_cadena_valor.pdf'); // Guardar el PDF

        } catch (error) {
            console.error("Error al generar el PDF:", error);
            // Mostrar un mensaje amigable al usuario en caso de error
            alert("Hubo un error al generar el PDF. Por favor, asegúrate de que la página está completamente cargada y los datos ingresados son válidos. Inténtalo de nuevo.");
        }
    });

    // Event listener para el botón de "Calcular Resumen Global" del formulario
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevenir el envío del formulario por defecto
        updateSummary(); // Actualizar el resumen
    });

    // Cargar los valores de los checklists desde localStorage al iniciar la página
    function loadInfraestructuraFromLocalStorage() {
        const storedPercentage = localStorage.getItem('infraestructuraCompliancePercentage');
        if (storedPercentage !== null) {
            const parsedPercentage = parseInt(storedPercentage);
            if (!isNaN(parsedPercentage)) {
                infraestructuraInput.value = parsedPercentage;
            }
        }
    }
    loadInfraestructuraFromLocalStorage();

    function loadRecursosHumanosFromLocalStorage() {
        const storedPercentage = localStorage.getItem('recursosHumanosCompliancePercentage');
        if (storedPercentage !== null) {
            const parsedPercentage = parseInt(storedPercentage);
            if (!isNaN(parsedPercentage)) {
                recursosHumanosInput.value = parsedPercentage;
            }
        }
    }
    loadRecursosHumanosFromLocalStorage();

    function loadDesarrolloTecnologicoFromLocalStorage() {
        const storedPercentage = localStorage.getItem('desarrolloTecnologicoCompliancePercentage');
        if (storedPercentage !== null) {
            const parsedPercentage = parseInt(storedPercentage);
            if (!isNaN(parsedPercentage)) {
                desarrolloTecnologicoInput.value = parsedPercentage;
            }
        }
    }
    loadDesarrolloTecnologicoFromLocalStorage();

    function loadAprovisionamientoFromLocalStorage() {
        const storedPercentage = localStorage.getItem('aprovisionamientoCompliancePercentage');
        if (storedPercentage !== null) {
            const parsedPercentage = parseInt(storedPercentage);
            if (!isNaN(parsedPercentage)) {
                aprovisionamientoInput.value = parsedPercentage;
            }
        }
    }
    loadAprovisionamientoFromLocalStorage();

    function loadLogisticaInternaFromLocalStorage() {
        const storedPercentage = localStorage.getItem('logisticaInternaCompliancePercentage');
        if (storedPercentage !== null) {
            const parsedPercentage = parseInt(storedPercentage);
            if (!isNaN(parsedPercentage)) {
                logisticaInternaInput.value = parsedPercentage;
            }
        }
    }
    loadLogisticaInternaFromLocalStorage();

    function loadProduccionFromLocalStorage() {
        const storedPercentage = localStorage.getItem('produccionCompliancePercentage');
        if (storedPercentage !== null) {
            const parsedPercentage = parseInt(storedPercentage);
            if (!isNaN(parsedPercentage)) {
                produccionInput.value = parsedPercentage;
            }
        }
    }
    loadProduccionFromLocalStorage();

    function loadLogisticaExternaFromLocalStorage() {
        const storedPercentage = localStorage.getItem('logisticaExternaCompliancePercentage');
        if (storedPercentage !== null) {
            const parsedPercentage = parseInt(storedPercentage);
            if (!isNaN(parsedPercentage)) {
                logisticaExternaInput.value = parsedPercentage;
            }
        }
    }
    loadLogisticaExternaFromLocalStorage();

    function loadMarketingVentasFromLocalStorage() {
        const storedPercentage = localStorage.getItem('marketingVentasCompliancePercentage');
        if (storedPercentage !== null) {
            const parsedPercentage = parseInt(storedPercentage);
            if (!isNaN(parsedPercentage)) {
                marketingVentasInput.value = parsedPercentage;
            }
        }
    }
    loadMarketingVentasFromLocalStorage();

    // --- NUEVO: Función para cargar el valor de servicios desde localStorage ---
    function loadServiciosFromLocalStorage() {
        const storedPercentage = localStorage.getItem('serviciosCompliancePercentage');
        if (storedPercentage !== null) {
            const parsedPercentage = parseInt(storedPercentage);
            if (!isNaN(parsedPercentage)) {
                serviciosInput.value = parsedPercentage;
            }
        }
    }
    loadServiciosFromLocalStorage(); // Llamar al cargar


    // Actualizar resumen cada vez que se cambia un input (excluyendo los readonly)
    form.addEventListener('input', (event) => {
        // Solo actualizar si el input no es de solo lectura (para permitir al usuario editar los campos que no son checklists)
        if (event.target.tagName === 'INPUT' && event.target.type === 'number' && !event.target.readOnly) {
            updateSummary();
        }
    });
    // También actualizar al cambiar el área de texto de observaciones globales
    observacionesGlobalesTextarea.addEventListener('input', updateSummary);

    // Inicializar el resumen y el estado de control al cargar la página (después de cargar los valores de localStorage)
    updateSummary();
});