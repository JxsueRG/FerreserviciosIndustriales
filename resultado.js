function generarPDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'jsPDF no está disponible.',
        });
        return;
    }

    const doc = new jsPDF();

    const generarContenido = (logoCargado = false) => {
        // Si el logo cargó, ya fue agregado antes
        if (!logoCargado) {
            console.warn("Generando sin logo.");
        }

        // Datos empresa
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

        // Cotización info
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

        // Total final
        const finalY = doc.autoTable.previous.finalY + 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL: $${cotizacion.total.toFixed(2)}`, 160, finalY);

        // Pie
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont("helvetica", "italic");
        doc.text("LOS PRECIOS SON NETOS, YA INCLUYEN IVA Y SON SUJETOS A CAMBIOS SIN PREVIO AVISO", 105, 285, { align: 'center' });
        doc.text("GRACIAS POR SU PREFERENCIA", 105, 295, { align: 'center' });

        // Guardar
        doc.save(`Cotización_${cotizacion.cliente}_${new Date().toISOString().slice(0, 10)}.pdf`);
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'PDF generado correctamente',
            showConfirmButton: false,
            timer: 1500
        });
    };

    // Cargar logo
    const logo = new Image();
    logo.src = "LOGOTICKET.jpg";

    logo.onload = function () {
        doc.addImage(logo, 'JPEG', 15, 15, 30, 20);
        generarContenido(true);
    };

    logo.onerror = function () {
        Swal.fire({
            icon: 'warning',
            title: 'Logo no cargado',
            text: 'Se generará el PDF sin el logo porque no se pudo cargar.',
            confirmButtonColor: '#002b5c'
        }).then(() => {
            generarContenido(false);
        });
    };
}
