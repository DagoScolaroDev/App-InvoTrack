document.addEventListener('DOMContentLoaded', () => {
    const agregarProductoForm = document.getElementById('agregarProductoForm');
    const agregarIngredienteForm = document.getElementById('agregarIngredienteForm');
    const productoSeleccionado = document.getElementById('productoSeleccionado');
    const ingredienteSeleccionado = document.getElementById('ingredienteSeleccionado');
    const cantidadIngredienteInput = document.getElementById('cantidadIngrediente');
    const listaProductos = document.getElementById('listaProductos');
    const listaSubRecetas = document.getElementById('listaSubRecetas');
    const esSubrecetaCheckbox = document.getElementById('esSubreceta');
    const tipoCantidadSubreceta = document.getElementById('tipoCantidadSubreceta');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const editNombreProducto = document.getElementById('editNombreProducto');
    const editIngredientesList = document.getElementById('editIngredientesList');
    const cancelEdit = document.getElementById('cancelEdit');
    const deleteProduct = document.getElementById('deleteProduct');

    let productos = JSON.parse(localStorage.getItem('productosRecetas')) || [];
    let ingredientes = JSON.parse(localStorage.getItem('productos')) || [];
    let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    let facturasPagadas = JSON.parse(localStorage.getItem('facturasPagadas')) || [];
    let currentEditIndex = null;


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

        // Crear grupo de opciones para ingredientes
        const optGroupIngredientes = document.createElement('optgroup');
        optGroupIngredientes.label = 'Ingredientes';
        ingredientes.forEach((ingrediente, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${ingrediente.nombre} (${ingrediente.tipoCantidad})`;
            optGroupIngredientes.appendChild(option);
        });
        ingredienteSeleccionado.appendChild(optGroupIngredientes);

        // Crear grupo de opciones para sub-recetas
        const optGroupSubRecetas = document.createElement('optgroup');
        optGroupSubRecetas.label = 'Sub-recetas';
        productos.forEach((producto, index) => {
            if (producto.esSubreceta) {
                const option = document.createElement('option');
                option.value = `producto-${index}`;
                option.textContent = `${producto.nombre} (${producto.tipoCantidad})`;
                optGroupSubRecetas.appendChild(option);
            }
        });
        ingredienteSeleccionado.appendChild(optGroupSubRecetas);
    }

    function renderizarProductos() {
        listaProductos.innerHTML = '';
        listaSubRecetas.innerHTML = '';
        productoSeleccionado.innerHTML = '';

        // Crear grupo de opciones para productos
        const optGroupProductos = document.createElement('optgroup');
        optGroupProductos.label = 'Productos';
        productos.forEach((producto, index) => {
            if (!producto.esSubreceta) {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = producto.nombre;
                optGroupProductos.appendChild(option);
            }
        });
        productoSeleccionado.appendChild(optGroupProductos);

        // Crear grupo de opciones para sub-recetas
        const optGroupSubRecetas = document.createElement('optgroup');
        optGroupSubRecetas.label = 'Sub-recetas';
        productos.forEach((producto, index) => {
            if (producto.esSubreceta) {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${producto.nombre} (${producto.tipoCantidad})`;
                optGroupSubRecetas.appendChild(option);
            }
        });
        productoSeleccionado.appendChild(optGroupSubRecetas);

        productos.forEach((producto, index) => {
            const card = document.createElement('div');
            card.classList.add('bg-white', 'rounded-lg', 'shadow-md', 'p-4', 'flex', 'flex-col', 'justify-between', 'relative');

            // Campo para el nombre del producto
            const inputNombre = document.createElement('input');
            inputNombre.type = 'text';
            inputNombre.value = producto.esSubreceta ? `${producto.nombre} (${producto.tipoCantidad})` : producto.nombre;
            inputNombre.disabled = true; // Deshabilitado por defecto
            inputNombre.classList.add('text-lg', 'font-bold', 'mb-2', 'text-blue-600', 'w-full');
            card.appendChild(inputNombre);

            // Botón para ver detalles
            const btnVerDetalles = document.createElement('button');
            btnVerDetalles.textContent = 'V';
            btnVerDetalles.classList.add('bg-blue-500', 'text-white', 'p-1', 'rounded', 'hover:bg-blue-700', 'transition-all', 'duration-300', 'absolute', 'top-2', 'right-2');
            btnVerDetalles.addEventListener('click', () => {
                detalles.classList.toggle('hidden');
            });
            card.appendChild(btnVerDetalles);

            // Sección de detalles
            const detalles = document.createElement('div');
            detalles.classList.add('hidden');

            const ulIngredientes = document.createElement('ul');
            ulIngredientes.classList.add('list-disc', 'pl-5', 'mb-4');

            let totalProducto = 0;
            producto.ingredientes.forEach((ingrediente) => {
                const liIngrediente = document.createElement('li');
                let precioIngrediente = 0;
                let ingredienteTexto = '';

                if (ingrediente.tipo === 'producto') {
                    const subProducto = productos[ingrediente.index];
                    if (subProducto) {
                        const subProductoPrecio = subProducto.ingredientes.reduce((total, ing) => {
                            return total + obtenerUltimoPrecioIngrediente(ing.nombre) * ing.cantidad;
                        }, 0);
                        precioIngrediente = subProductoPrecio * ingrediente.cantidad;
                        ingredienteTexto = `${subProducto.nombre} (Sub-receta) - $${subProductoPrecio.toLocaleString('es-AR')} por ${subProducto.tipoCantidad} (Subtotal: $${precioIngrediente.toLocaleString('es-AR')})`;
                    }
                } else {
                    const ultimoPrecio = obtenerUltimoPrecioIngrediente(ingrediente.nombre);
                    precioIngrediente = ultimoPrecio * ingrediente.cantidad;
                    ingredienteTexto = `${ingrediente.nombre} (${ingrediente.tipoCantidad}) - $${ultimoPrecio.toLocaleString('es-AR')} (Subtotal: $${precioIngrediente.toLocaleString('es-AR')})`;
                }

                totalProducto += precioIngrediente;

                // Campo para la cantidad del ingrediente
                const inputCantidad = document.createElement('input');
                inputCantidad.type = 'number';
                inputCantidad.step = ingrediente.tipoCantidad === 'kg' ? '0.01' : '1';
                inputCantidad.value = ingrediente.cantidad;
                inputCantidad.disabled = true; // Deshabilitado por defecto
                inputCantidad.classList.add('border', 'border-gray-300', 'rounded', 'px-1', 'py-0.5', 'mr-2', 'text-sm', 'w-16');

                const spanIngrediente = document.createElement('span');
                spanIngrediente.textContent = ingredienteTexto;
                spanIngrediente.classList.add('text-sm', 'text-gray-700');

                liIngrediente.appendChild(inputCantidad);
                liIngrediente.appendChild(spanIngrediente);

                ulIngredientes.appendChild(liIngrediente);
            });
            detalles.appendChild(ulIngredientes);

            const totalProductoElement = document.createElement('p');
            totalProductoElement.textContent = `Total: $${totalProducto.toLocaleString('es-AR')}`;
            totalProductoElement.classList.add('text-right', 'font-bold', 'text-gray-800', 'mb-4');
            detalles.appendChild(totalProductoElement);

            // Botón de editar
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.classList.add('bg-yellow-500', 'text-white', 'p-2', 'rounded', 'hover:bg-yellow-700', 'transition-all', 'duration-300', 'mr-2');
            btnEditar.addEventListener('click', () => abrirModalEditar(index));
            detalles.appendChild(btnEditar);

            card.appendChild(detalles);

            if (producto.esSubreceta) {
                listaSubRecetas.appendChild(card);
            } else {
                listaProductos.appendChild(card);
            }
        });
    }

    function abrirModalEditar(index) {
        currentEditIndex = index;
        const producto = productos[index];
        if (!producto) {
            console.error('Producto no encontrado');
            return;
        }
        editNombreProducto.value = producto.nombre;
        editIngredientesList.innerHTML = '';

        producto.ingredientes.forEach((ingrediente, ingIndex) => {
            const liIngrediente = document.createElement('li');
            const inputCantidad = document.createElement('input');
            inputCantidad.type = 'number';
            inputCantidad.step = ingrediente.tipoCantidad === 'kg' ? '0.01' : '1';
            inputCantidad.value = ingrediente.cantidad;
            inputCantidad.classList.add('border', 'border-gray-300', 'rounded', 'px-1', 'py-0.5', 'mr-2', 'text-sm', 'w-16');
            inputCantidad.addEventListener('change', (e) => {
                producto.ingredientes[ingIndex].cantidad = parseFloat(e.target.value);
            });

            const spanIngrediente = document.createElement('span');
            spanIngrediente.textContent = ingrediente.nombre || (productos[ingrediente.index] && productos[ingrediente.index].nombre);
            spanIngrediente.classList.add('text-sm', 'text-gray-700');

            const btnEliminarIngrediente = document.createElement('button');
            btnEliminarIngrediente.textContent = 'Eliminar';
            btnEliminarIngrediente.classList.add('bg-red-500', 'text-white', 'p-1', 'rounded', 'hover:bg-red-700', 'transition-all', 'duration-300', 'ml-2');
            btnEliminarIngrediente.addEventListener('click', () => {
                producto.ingredientes.splice(ingIndex, 1);
                abrirModalEditar(index);
            });

            liIngrediente.appendChild(inputCantidad);
            liIngrediente.appendChild(spanIngrediente);
            liIngrediente.appendChild(btnEliminarIngrediente);
            editIngredientesList.appendChild(liIngrediente);
        });

        editModal.classList.remove('hidden');
    }

    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const producto = productos[currentEditIndex];
        producto.nombre = editNombreProducto.value.trim();
        localStorage.setItem('productosRecetas', JSON.stringify(productos));
        renderizarProductos();
        renderizarIngredientes();
        editModal.classList.add('hidden');
    });

    cancelEdit.addEventListener('click', () => {
        editModal.classList.add('hidden');
    });

    deleteProduct.addEventListener('click', () => {
        eliminarProducto(currentEditIndex);
        editModal.classList.add('hidden');
    });

    function eliminarProducto(index) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            const productoEliminado = productos[index];
            productos.splice(index, 1);

            // Eliminar la sub-receta de los ingredientes de otros productos
            if (productoEliminado.esSubreceta) {
                productos.forEach(producto => {
                    producto.ingredientes = producto.ingredientes.filter(ingrediente => {
                        return !(ingrediente.tipo === 'producto' && ingrediente.index === index);
                    });
                });
            }

            localStorage.setItem('productosRecetas', JSON.stringify(productos));
            renderizarProductos();
            renderizarIngredientes();
        }
    }

    agregarProductoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nombreProducto = document.getElementById('nombreProducto').value.trim();
        const esSubreceta = esSubrecetaCheckbox.checked;
        const tipoCantidad = tipoCantidadSubreceta.value;
        if (nombreProducto) {
            productos.push({ nombre: nombreProducto, ingredientes: [], esSubreceta: esSubreceta, tipoCantidad: tipoCantidad });
            localStorage.setItem('productosRecetas', JSON.stringify(productos));
            renderizarProductos();
            renderizarIngredientes();
            agregarProductoForm.reset();
            esSubrecetaCheckbox.checked = false;
            tipoCantidadSubreceta.classList.add('hidden');
        }
    });

    tipoCantidadSubreceta.classList.add('hidden');

    esSubrecetaCheckbox.addEventListener('change', () => {
        tipoCantidadSubreceta.classList.toggle('hidden', !esSubrecetaCheckbox.checked);
    });

    agregarIngredienteForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const productoIndex = parseInt(productoSeleccionado.value, 10);
        const ingredienteValue = ingredienteSeleccionado.value;
        const cantidad = parseFloat(cantidadIngredienteInput.value);

        if (!isNaN(productoIndex) && cantidad >= 0) {
            if (ingredienteValue.startsWith('producto-')) {
                const subProductoIndex = parseInt(ingredienteValue.split('-')[1], 10);
                productos[productoIndex].ingredientes.push({
                    tipo: 'producto',
                    index: subProductoIndex,
                    cantidad: cantidad
                });
            } else {
                const ingredienteIndex = parseInt(ingredienteValue, 10);
                const ingrediente = ingredientes[ingredienteIndex];
                productos[productoIndex].ingredientes.push({
                    tipo: 'ingrediente',
                    nombre: ingrediente.nombre,
                    cantidad: cantidad,
                    tipoCantidad: ingrediente.tipoCantidad
                });
            }
            localStorage.setItem('productosRecetas', JSON.stringify(productos));
            renderizarProductos();
            renderizarIngredientes();
            agregarIngredienteForm.reset();
        }
    });

    renderizarProductos();
    renderizarIngredientes();
});