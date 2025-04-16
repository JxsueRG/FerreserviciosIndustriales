document.addEventListener("DOMContentLoaded", function () {
    const productosDiv = document.getElementById("tablaProductos").getElementsByTagName("tbody")[0];
    const agregarProductoBtn = document.getElementById("agregarProducto");
    const totalCotizacionSpan = document.getElementById("totalCotizacion");
    
    // Configurar fecha por defecto como hoy
    const fechaInput = document.querySelector("input[name='fecha']");
    fechaInput.valueAsDate = new Date();
    
    let total = 0;
    
    // Función para agregar un nuevo producto
    function agregarFilaProducto() {
        const nuevaFila = document.createElement("tr");
        nuevaFila.innerHTML = `
            <td><input type="number" class="cantidad" min="1" value="1" required></td>
            <td><input type="text" class="articulo" placeholder="Nombre del artículo" required></td>
            <td><input type="number" class="precio" min="0" step="0.01" placeholder="Precio unitario" required></td>
            <td class="totalProducto">$0.00</td>
            <td><button type="button" class="btn-eliminar"><i class="fas fa-trash-alt"></i> Eliminar</button></td>
        `;
        productosDiv.appendChild(nuevaFila);
        
        // Agregar eventos a los inputs
        const cantidadInput = nuevaFila.querySelector(".cantidad");
        const precioInput = nuevaFila.querySelector(".precio");
        const totalProducto = nuevaFila.querySelector(".totalProducto");
        
        const actualizarTotal = () => {
            const cantidad = parseFloat(cantidadInput.value) || 0;
            const precio = parseFloat(precioInput.value) || 0;
            const totalProductoValor = cantidad * precio;
            totalProducto.textContent = `$${totalProductoValor.toFixed(2)}`;
            calcularTotalGeneral();
            
            // Validación visual
            if (cantidadInput.value === "" || precioInput.value === "") {
                cantidadInput.style.borderColor = "#e74c3c";
                precioInput.style.borderColor = "#e74c3c";
            } else {
                cantidadInput.style.borderColor = "#d1d5db";
                precioInput.style.borderColor = "#d1d5db";
            }
        };
        
        cantidadInput.addEventListener("input", actualizarTotal);
        precioInput.addEventListener("input", actualizarTotal);
        
        // Evento para eliminar fila
        nuevaFila.querySelector(".btn-eliminar").addEventListener("click", function () {
            productosDiv.removeChild(nuevaFila);
            calcularTotalGeneral();
        });
        
        // Enfocar el campo de artículo
        nuevaFila.querySelector(".articulo").focus();
    }
    
    // Función para calcular el total general
    function calcularTotalGeneral() {
        total = 0;
        const filas = productosDiv.querySelectorAll("tr");
        filas.forEach(fila => {
            const totalProducto = parseFloat(fila.querySelector(".totalProducto").textContent.replace("$", "")) || 0;
            total += totalProducto;
        });
        totalCotizacionSpan.textContent = `$${total.toFixed(2)}`;
    }
    
    // Evento para agregar producto
    agregarProductoBtn.addEventListener("click", agregarFilaProducto);
    
    // Agregar una fila por defecto al cargar
    agregarFilaProducto();
    
    // Validación del formulario
    document.getElementById("cotizacionForm").addEventListener("submit", function (event) {
        event.preventDefault();
        
        // Validar campos vacíos
        const inputs = this.querySelectorAll("input[required]");
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = "#e74c3c";
                isValid = false;
            } else {
                input.style.borderColor = "#d1d5db";
            }
        });
        
        // Validar al menos un producto
        const filas = productosDiv.querySelectorAll("tr");
        if (filas.length === 0) {
            alert("Por favor, agregue al menos un producto.");
            isValid = false;
        }
        
        // Validar productos completos
        filas.forEach(fila => {
            const articulo = fila.querySelector(".articulo");
            const precio = fila.querySelector(".precio");
            
            if (!articulo.value.trim() || !precio.value.trim()) {
                articulo.style.borderColor = "#e74c3c";
                precio.style.borderColor = "#e74c3c";
                isValid = false;
            }
        });
        
        if (isValid) {
            const cliente = document.querySelector("input[name='cliente']").value;
            const fecha = document.querySelector("input[name='fecha']").value;
            const asunto = document.querySelector("input[name='asunto']").value;
            
            const productos = [];
            filas.forEach(fila => {
                const cantidad = fila.querySelector(".cantidad").value;
                const articulo = fila.querySelector(".articulo").value;
                const precio = fila.querySelector(".precio").value;
                const totalProducto = fila.querySelector(".totalProducto").textContent;
                productos.push({ cantidad, articulo, precio, totalProducto });
            });
            
            // Guardar los datos en localStorage
            localStorage.setItem("cotizacion", JSON.stringify({
                cliente,
                fecha,
                asunto,
                productos,
                total
            }));
            
            // Redirigir a la página de resultado
            window.location.href = "resultado.html";
        } else {
            // Mostrar mensaje de error
            const errorDiv = document.createElement("div");
            errorDiv.className = "error-message";
            errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Por favor, complete todos los campos requeridos.';
            errorDiv.style.color = "#e74c3c";
            errorDiv.style.marginTop = "15px";
            errorDiv.style.textAlign = "center";
            
            // Eliminar mensaje anterior si existe
            const existingError = document.querySelector(".error-message");
            if (existingError) {
                existingError.remove();
            }
            
            this.appendChild(errorDiv);
            
            // Hacer scroll al mensaje de error
            errorDiv.scrollIntoView({ behavior: "smooth" });
        }
    });
});