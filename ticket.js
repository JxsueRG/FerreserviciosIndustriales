document.addEventListener("DOMContentLoaded", function () {
    let folioActual = parseInt(localStorage.getItem("folioTicket")) || 1000;

    const productosDiv = document.querySelector("#tablaProductosTicket tbody");
    const agregarProductoBtn = document.getElementById("agregarProductoTicket");
    const totalTicketSpan = document.getElementById("totalTicket");
    const imprimirTicketBtn = document.getElementById("imprimirTicket");
    const nuevoTicketBtn = document.getElementById("nuevoTicket");
    const ticketPreview = document.getElementById("ticketPreview");
    const ticketFolio = document.getElementById("ticketFolio");

    document.getElementById("fechaTicket").value = new Date().toISOString().slice(0, 16);

    function agregarFilaProducto() {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><input type="number" class="cantidad" min="1" value="1" required></td>
            <td><input type="text" class="articulo" placeholder="Descripción" required></td>
            <td><input type="number" class="precio" min="0" step="0.01" placeholder="0.00" required></td>
            <td class="totalProducto">$0.00</td>
            <td><button type="button" class="btn-eliminar">🗑️</button></td>
        `;
        productosDiv.appendChild(fila);

        fila.querySelector(".cantidad").addEventListener("input", actualizarFila);
        fila.querySelector(".precio").addEventListener("input", actualizarFila);
        fila.querySelector(".btn-eliminar").addEventListener("click", function () {
            fila.remove();
            calcularTotal();
        });
    }

    function actualizarFila() {
        const fila = this.closest("tr");
        const cantidad = parseFloat(fila.querySelector(".cantidad").value) || 0;
        const precio = parseFloat(fila.querySelector(".precio").value) || 0;
        fila.querySelector(".totalProducto").textContent = `$${(cantidad * precio).toFixed(2)}`;
        calcularTotal();
    }

    function calcularTotal() {
        let total = 0;
        productosDiv.querySelectorAll("tr").forEach(fila => {
            total += parseFloat(fila.querySelector(".totalProducto").textContent.replace("$", "")) || 0;
        });
        totalTicketSpan.textContent = `$${total.toFixed(2)}`;
    }

    function generarVistaPrevia() {
        folioActual++;
        localStorage.setItem("folioTicket", folioActual);
    
        console.log("Folio generado:", folioActual);
    
        ticketFolio.textContent = folioActual;
        document.getElementById("ticketCliente").textContent = document.getElementById("clienteTicket").value || "CONSUMIDOR FINAL";
        
        // Obtener la fecha y convertirla correctamente a la hora local
        let fechaInput = document.getElementById("fechaTicket").value;
        let fechaLocal = new Date(fechaInput.replace("T", " ") + " GMT-6"); // Ajuste manual a la zona horaria de México
    
        document.getElementById("ticketFecha").textContent = fechaLocal.toLocaleString('es-MX', {
            hour12: true, // Para mostrar AM/PM
            timeZone: 'America/Mexico_City'
        });
        
        document.getElementById("ticketTotal").textContent = totalTicketSpan.textContent;
        
        const ticketProductosBody = document.getElementById("ticketProductosBody");
        ticketProductosBody.innerHTML = "";
    
        productosDiv.querySelectorAll("tr").forEach(fila => {
            const cantidad = fila.querySelector(".cantidad").value;
            const articulo = fila.querySelector(".articulo").value;
            const precio = parseFloat(fila.querySelector(".precio").value).toFixed(2);
            const totalProducto = fila.querySelector(".totalProducto").textContent;
    
            const filaProducto = document.createElement("tr");
            filaProducto.innerHTML = `<td>${cantidad}</td><td>${articulo}</td><td>$${precio}</td><td>${totalProducto}</td>`;
            ticketProductosBody.appendChild(filaProducto);
        });
    }
    

    function imprimirTicket() {
        generarVistaPrevia();
        let contenidoTicket = ticketPreview.innerHTML;
        console.log("Contenido del ticket antes de imprimir:", contenidoTicket);

        if (!contenidoTicket.trim()) {
            alert("No hay información para imprimir.");
            return;
        }

        let ventanaImpresion = window.open("", "", "width=400,height=600");

        if (ventanaImpresion) {
            ventanaImpresion.document.write(`
                <html>
                <head>
                    <title>Imprimir Ticket</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; }
                        .ticket-header, .ticket-body, .ticket-footer { margin-bottom: 10px; }
                        .ticket-divider { border-top: 1px dashed #000; margin: 5px 0; }
                        .ticket-total { font-weight: bold; font-size: 18px; }
                    </style>
                </head>
                <body>${contenidoTicket}</body>
                </html>
            `);

            ventanaImpresion.document.close();
            ventanaImpresion.print();
            ventanaImpresion.close();
        } else {
            alert("No se pudo abrir la ventana de impresión.");
        }
    }

    function nuevoTicket() {
        if (confirm("¿Desea crear un nuevo ticket? Se perderán los datos no guardados.")) {
            productosDiv.innerHTML = "";
            document.getElementById("ticketForm").reset();
            document.getElementById("fechaTicket").value = new Date().toISOString().slice(0, 16);
            totalTicketSpan.textContent = "$0.00";
            agregarFilaProducto();
        }
    }

    agregarProductoBtn.addEventListener("click", agregarFilaProducto);
    imprimirTicketBtn.addEventListener("click", imprimirTicket);
    nuevoTicketBtn.addEventListener("click", nuevoTicket);

    ticketFolio.textContent = folioActual; // Mostrar el folio al cargar
    agregarFilaProducto();
});
