document.addEventListener("DOMContentLoaded", function () {
    // Inicializar EmailJS con tu API key
    emailjs.init('kYrUmFZHE99ZYN3Lp');
    console.log('EmailJS initialized:', emailjs);

    // Elementos del DOM
    const resultadoDiv = document.getElementById("resultado");
    const enviarCorreoBtn = document.getElementById("enviarCorreo");
    const guardarPDFBtn = document.getElementById("guardarPDF");

    // Obtener datos de cotización desde localStorage o usar valores por defecto
    const cotizacion = JSON.parse(localStorage.getItem("cotizacion")) || {
        cliente: "Cliente de prueba",
        fecha: new Date().toLocaleDateString(),
        asunto: "Cotización de prueba",
        productos: [
            {
                cantidad: "2",
                articulo: "Producto de prueba",
                precio: "100.00",
                totalProducto: "$200.00"
            }
        ],
        total: 200.00
    };

    // Mostrar cotización en la página
    function mostrarCotizacion() {
        resultadoDiv.innerHTML = `
            <div class="cotizacion-detalle">
                <p><strong>Cliente:</strong> ${cotizacion.cliente}</p>
                <p><strong>Fecha:</strong> ${cotizacion.fecha}</p>
                <p><strong>Asunto:</strong> ${cotizacion.asunto}</p>
                
                <table class="tabla-productos">
                    <thead>
                        <tr>
                            <th>Cantidad</th>
                            <th>Artículo</th>
                            <th>Precio Unitario</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cotizacion.productos.map(producto => `
                            <tr>
                                <td>${producto.cantidad}</td>
                                <td>${producto.articulo}</td>
                                <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                                <td>${producto.totalProducto}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                
                <p class="total-final"><strong>Total General:</strong> $${cotizacion.total.toFixed(2)}</p>
            </div>
        `;
    }
    mostrarCotizacion();

    // Función para enviar la cotización por correo
    async function enviarCotizacionPorCorreo() {
        let loadingSwal;
        try {
            // Utilizar input de tipo email de SweetAlert2 para capturar el correo
            const { value: email } = await Swal.fire({
                title: 'Enviar cotización por correo',
                input: 'email',
                inputPlaceholder: 'ejemplo@cliente.com',
                showCancelButton: true,
                confirmButtonText: 'Enviar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#002b5c',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Debe ingresar un correo electrónico válido';
                    }
                }
            });
            // Si se cancela o no se ingresa un email, salimos
            if (!email) return;
            console.log("Email ingresado:", email);

            // Mostrar indicador de carga
            loadingSwal = Swal.fire({
                title: 'Enviando cotización...',
                html: 'Por favor espere mientras se envía la cotización',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            // Verificar que EmailJS está inicializado
            if (!window.emailjs?.send) {
                throw new Error('EmailJS no se ha inicializado correctamente');
            }

            // Preparar el contenido del correo
            const productosHTML = cotizacion.productos.map(p => `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${p.cantidad}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${p.articulo}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${parseFloat(p.precio).toFixed(2)}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${p.totalProducto}</td>
                </tr>
            `).join('');

            const templateParams = {
                to_email: email, // Asegúrate de que este nombre coincida con el de tu plantilla en EmailJS
                to_name: cotizacion.cliente || 'Cliente',
                from_name: 'COLOCAR NOMBRE',
                reply_to: 'COLOCAR CORREO',
                cliente: cotizacion.cliente || 'Cliente',
                fecha: cotizacion.fecha || new Date().toLocaleDateString(),
                asunto: cotizacion.asunto || 'Cotización PINTURAS',
                productos: productosHTML,
                total: `$${cotizacion.total?.toFixed(2) || '0.00'}`,
                mensaje: 'No se incluyó mensaje adicional',
                empresa: 'PINTURAS'
            };

            console.log("Template Params enviados:", templateParams);

            if (!templateParams.to_email) {
                throw new Error('La dirección de correo electrónico es inválida');
            }

            // Enviar el correo con timeout de 20 segundos
            await Promise.race([
                emailjs.send('service_o28e20d', 'template_py4f6sl', templateParams),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout: El servidor no respondió')), 20000)
                )
            ]);

            // Cerrar indicador de carga y mostrar mensaje de éxito
            await loadingSwal.close();
            Swal.fire({
                icon: 'success',
                title: '¡Enviado!',
                html: `Correo enviado a <strong>${templateParams.to_email}</strong>`,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#002b5c'
            });
        } catch (error) {
            console.error("Error al enviar:", error);
            if (loadingSwal) await loadingSwal.close();
            let errorMsg = 'Error al enviar: ';
            const mensajeError = (typeof error.message === 'string' && error.message) || error.text || 'Error desconocido';
            if (typeof mensajeError === 'string' && mensajeError.includes('recipients address is empty')) {
                errorMsg = 'Error: No se proporcionó una dirección de correo electrónico válida.';
            } else {
                errorMsg += mensajeError;
            }
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMsg,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#002b5c'
            });
        }
    }

    // Función para generar PDF (se mantiene igual)
    function generarPDF() {
        try {
            const { jsPDF } = window.jspdf;
            if (!jsPDF) {
                throw new Error('La librería jsPDF no está disponible');
            }
            const doc = new jsPDF();

            // Configurar propiedades del documento
            doc.setProperties({
                title: `Cotización ${cotizacion.cliente}`,
                subject: 'Cotización Ferreservicios Industriales',
                author: ''
            });

            // Agregar logo (si está disponible)
            try {
                const logo = new Image();
                logo.src = "LOGOTICKET.jpg";
            
                logo.onload = function () {
                    doc.addImage(logo, 'JPEG', 15, 15, 30, 20); // Aquí ajustas proporción y tamaño
                    doc.save("cotizacion.pdf"); // Guarda o continúa tu flujo aquí
                };
            
                logo.onerror = function (e) {
                    console.warn("No se pudo cargar el logo:", e);
                    doc.save("cotizacion.pdf"); // Incluso si falla, sigue
                };
            } catch (e) {
                console.warn("Error al intentar insertar el logo:", e);
            }
            

            // Información de la empresa
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.setFont("helvetica", "normal");
            doc.text("FERRESERVICIOS INDUSTRIALES", 70, 20);
            doc.text("Seguridad Indsutrial, Guantes de Trabajos", 70, 25);
            doc.text("ARTURO BARRAGAN GARCIA - R.F.C BAGA740813NJ8", 70, 30);
            doc.text("FCO. SARABIA No. 32B COL.RAMON FARIAS", 70, 35);
            doc.text("C.P 60050 URUAPAN, MICH", 70, 40);
            doc.text("CELULAR: (452) 524 30 69", 70, 45);

            // Línea divisoria
            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(15, 55, 195, 55);

            // Información de la cotización
            doc.setFontSize(12);
            doc.setTextColor(40);
            doc.setFont("helvetica", "bold");
            doc.text("COTIZACIÓN", 15, 65);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Cliente: ${cotizacion.cliente}`, 15, 75);
            doc.text(`Fecha: ${cotizacion.fecha}`, 15, 80);
            doc.text(`Asunto: ${cotizacion.asunto}`, 15, 85);

            // Tabla de productos
            const productosTable = cotizacion.productos.map(producto => [
                producto.cantidad,
                producto.articulo,
                `$${parseFloat(producto.precio).toFixed(2)}`,
                `$${producto.totalProducto.replace("$", "")}`
            ]);
            
            doc.autoTable({
                startY: 95,
                head: [['Cant.', 'Artículo', 'P. Unitario', 'Total']],
                body: productosTable,
                theme: 'grid',
                headStyles: {
                    fillColor: [0, 43, 92],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    overflow: 'linebreak'
                },
                columnStyles: {
                    0: { cellWidth: 15 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 25 }
                }
            });

            // Agregar total
            const finalY = doc.autoTable.previous.finalY + 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`TOTAL: $${cotizacion.total.toFixed(2)}`, 160, finalY);

            // Pie de página
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.setFont("helvetica", "italic");
            doc.text("LOS PRECIOS SON NETOS, YA INCLUYEN IVA Y SON SUJETOS A CAMBIOS SIN PREVIO AVISO  ", 105, 285, { align: 'center' });
            doc.text("GRACIAS POR SU PREFERENCIA", 105, 295, { align: 'center' });
            
            // Guardar PDF
            doc.save(`Cotización_${cotizacion.cliente}_${new Date().toISOString().slice(0,10)}.pdf`);

            // Notificar al usuario
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'PDF generado correctamente',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error("Error al generar PDF:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error al generar PDF',
                text: error.message,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#002b5c'
            });
        }
    }

    // Asignar eventos a los botones
    enviarCorreoBtn.addEventListener("click", enviarCotizacionPorCorreo);
    guardarPDFBtn.addEventListener("click", generarPDF);

    // Función de prueba para envío de correo (se recomienda comentar o eliminar si causa error)
    // window.pruebaEnvioCorreo = function() {
    //     emailjs.send('service_o28e20d', 'template_py4f6sl', {
    //         to_email: "tu_correo@ejemplo.com",
    //         to_name: "Prueba",
    //         message: "Este es un test"
    //     })
    //     .then(() => console.log("Prueba exitosa!"))
    //     .catch(error => console.error("Error en prueba:", error));
    // };
});
