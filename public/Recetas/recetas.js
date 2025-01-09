document.addEventListener('DOMContentLoaded', () => {
    const agregarProductoForm = document.getElementById('agregarProductoForm');
    const agregarIngredienteForm = document.getElementById('agregarIngredienteForm');
    const productoSeleccionado = document.getElementById('productoSeleccionado');
    const ingredienteSeleccionado = document.getElementById('ingredienteSeleccionado');
    const cantidadIngredienteInput = document.getElementById('cantidadIngrediente');
    const listaProductos = document.getElementById('listaProductos');
    const precioTotalProducto = document.getElementById('precioTotalProducto');

    let productos = JSON.parse(localStorage.getItem('productosRecetas')) || [];
    let ingredientes = JSON.parse(localStorage.getItem('productos')) || [];
    let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    let facturasPagadas = JSON.parse(localStorage.getItem('facturasPagadas')) || [];

    function obtenerUltimoPrecioIngrediente(nombreIngrediente) {
        let ultimoPrecio = 0;
        let maxNI = -1;
        const todasFacturas = [...facturas, ...facturasPagadas];
        todasFacturas.forEach(factura => {
            if (factura.numeroInterno > maxNI) {
                factura.productos.forEach(producto => {
                    if (producto.nombre === nombreIngrediente) {
                        ultimoPrecio = producto.precio;
                        maxNI = factura.numeroInterno;
                    }
                });
            }
        });
        return ultimoPrecio;
    }

    function renderizarIngredientes() {
        ingredienteSeleccionado.innerHTML = ''; // Limpiar lista

        // Mostrar ingredientes disponibles
        ingredientes.forEach((ingrediente, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${ingrediente.nombre} (${ingrediente.tipoCantidad})`;
            ingredienteSeleccionado.appendChild(option);
        });

        console.log('Ingredientes renderizados:', ingredientes);
    }

    function renderizarProductos() {
        listaProductos.innerHTML = '';
        productoSeleccionado.innerHTML = '';

        let totalPrecioProducto = 0;

        productos.forEach((producto, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = producto.nombre;
            productoSeleccionado.appendChild(option);

            const card = document.createElement('div');
            card.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'p-4', 'flex', 'flex-col', 'justify-between', 'relative');

            // Campo editable para el nombre del producto
            const inputNombre = document.createElement('input');
            inputNombre.type = 'text';
            inputNombre.value = producto.nombre;
            inputNombre.disabled = true; // Deshabilitado por defecto
            inputNombre.classList.add('text-lg', 'font-bold', 'mb-2', 'text-blue-600', 'w-full');
            card.appendChild(inputNombre);

            const btnGuardarNombre = document.createElement('button');
            btnGuardarNombre.textContent = 'Guardar';
            btnGuardarNombre.classList.add('hidden', 'bg-green-500', 'text-white', 'px-2', 'py-1', 'rounded', 'absolute', 'top-2', 'right-2');
            btnGuardarNombre.addEventListener('click', () => {
                producto.nombre = inputNombre.value.trim();
                localStorage.setItem('productosRecetas', JSON.stringify(productos));
                renderizarProductos();
            });
            card.appendChild(btnGuardarNombre);

            const btnEditarNombre = document.createElement('button');
            btnEditarNombre.textContent = 'Editar';
            btnEditarNombre.classList.add('bg-blue-500', 'text-white', 'px-2', 'py-1', 'rounded', 'absolute', 'top-2', 'right-2');
            btnEditarNombre.addEventListener('click', () => {
                inputNombre.disabled = false;
                inputNombre.focus();
                btnEditarNombre.classList.add('hidden');
                btnGuardarNombre.classList.remove('hidden');
            });
            card.appendChild(btnEditarNombre);

            const ulIngredientes = document.createElement('ul');
            ulIngredientes.classList.add('list-disc', 'pl-5', 'mb-4');

            let totalProducto = 0;
            producto.ingredientes.forEach((ingrediente, ingIndex) => {
                const liIngrediente = document.createElement('li');
                const ultimoPrecio = obtenerUltimoPrecioIngrediente(ingrediente.nombre);
                const precioIngrediente = ultimoPrecio * ingrediente.cantidad;
                totalProducto += precioIngrediente;

                // Campo editable para la cantidad del ingrediente
                const inputCantidad = document.createElement('input');
                inputCantidad.type = 'number';
                inputCantidad.step = ingrediente.tipoCantidad === 'kg' ? '0.01' : '1';
                inputCantidad.value = ingrediente.cantidad;
                inputCantidad.disabled = true; // Deshabilitado por defecto
                inputCantidad.classList.add('border', 'border-gray-300', 'rounded', 'px-1', 'py-0.5', 'mr-2', 'text-sm', 'w-16');

                const spanIngrediente = document.createElement('span');
                spanIngrediente.textContent = `${ingrediente.nombre} (${ingrediente.tipoCantidad}) - $${ultimoPrecio.toFixed(2)} (Subtotal: $${precioIngrediente.toFixed(2)})`;
                spanIngrediente.classList.add('text-sm', 'text-gray-700');

                const btnGuardarCantidad = document.createElement('button');
                btnGuardarCantidad.textContent = 'Guardar';
                btnGuardarCantidad.classList.add('hidden', 'bg-green-500', 'text-white', 'px-2', 'py-1', 'rounded', 'ml-2');
                btnGuardarCantidad.addEventListener('click', () => {
                    const nuevaCantidad = parseFloat(inputCantidad.value);
                    if (nuevaCantidad >= 0) {
                        ingrediente.cantidad = nuevaCantidad;
                        localStorage.setItem('productosRecetas', JSON.stringify(productos));
                        renderizarProductos();
                    }
                });

                const btnEditarCantidad = document.createElement('button');
                btnEditarCantidad.textContent = 'Editar';
                btnEditarCantidad.classList.add('bg-blue-500', 'text-white', 'px-2', 'py-1', 'rounded', 'ml-2');
                btnEditarCantidad.addEventListener('click', () => {
                    inputCantidad.disabled = false;
                    inputCantidad.focus();
                    btnEditarCantidad.classList.add('hidden');
                    btnGuardarCantidad.classList.remove('hidden');
                });

                // Botón para eliminar ingrediente
                const eliminarIngredienteBtn = document.createElement('button');
                eliminarIngredienteBtn.textContent = 'Eliminar';
                eliminarIngredienteBtn.classList.add('bg-red-500', 'text-white', 'px-2', 'py-1', 'rounded', 'ml-2');
                eliminarIngredienteBtn.addEventListener('click', () => {
                    eliminarIngrediente(index, ingIndex);
                });

                liIngrediente.appendChild(inputCantidad);
                liIngrediente.appendChild(spanIngrediente);
                liIngrediente.appendChild(btnEditarCantidad);
                liIngrediente.appendChild(btnGuardarCantidad);
                liIngrediente.appendChild(eliminarIngredienteBtn);

                ulIngredientes.appendChild(liIngrediente);
            });
            card.appendChild(ulIngredientes);

            totalPrecioProducto += totalProducto;

            const totalProductoElement = document.createElement('p');
            totalProductoElement.textContent = `Total: $${totalProducto.toFixed(2)}`;
            totalProductoElement.classList.add('text-right', 'font-bold', 'text-gray-800', 'mb-4');
            card.appendChild(totalProductoElement);

            const eliminarBtn = document.createElement('button');
            eliminarBtn.textContent = 'Eliminar Producto';
            eliminarBtn.classList.add('bg-red-500', 'text-white', 'px-4', 'py-2', 'rounded', 'hover:bg-red-700', 'self-end');
            eliminarBtn.addEventListener('click', () => {
                eliminarProducto(index);
            });
            card.appendChild(eliminarBtn);

            listaProductos.appendChild(card);
        });

        precioTotalProducto.textContent = `Total general: $${totalPrecioProducto.toFixed(2)}`;
    }

    function eliminarProducto(index) {
        productos.splice(index, 1);
        localStorage.setItem('productosRecetas', JSON.stringify(productos));
        renderizarProductos();
    }

    function eliminarIngrediente(productoIndex, ingredienteIndex) {
        productos[productoIndex].ingredientes.splice(ingredienteIndex, 1);
        localStorage.setItem('productosRecetas', JSON.stringify(productos));
        renderizarProductos();
    }

    agregarProductoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nombreProducto = document.getElementById('nombreProducto').value.trim();
        if (nombreProducto) {
            productos.push({ nombre: nombreProducto, ingredientes: [] });
            localStorage.setItem('productosRecetas', JSON.stringify(productos));
            renderizarProductos();
            agregarProductoForm.reset();
        }
    });

    agregarIngredienteForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const productoIndex = parseInt(productoSeleccionado.value, 10);
        const ingredienteIndex = parseInt(ingredienteSeleccionado.value, 10);
        const cantidad = parseFloat(cantidadIngredienteInput.value);
        if (!isNaN(productoIndex) && !isNaN(ingredienteIndex) && cantidad >= 0) {
            const ingrediente = ingredientes[ingredienteIndex];
            productos[productoIndex].ingredientes.push({
                nombre: ingrediente.nombre,
                cantidad: cantidad,
                tipoCantidad: ingrediente.tipoCantidad
            });
            localStorage.setItem('productosRecetas', JSON.stringify(productos));
            renderizarProductos();
            agregarIngredienteForm.reset();
        }
    });

    renderizarProductos();
    renderizarIngredientes();
});
