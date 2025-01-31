document.addEventListener('DOMContentLoaded', () => {
    const crearFacturaForm = document.getElementById('crearFacturaForm');
    const listaFacturas = document.getElementById('listaFacturas');
    const listaFacturasPagadas = document.getElementById('listaFacturasPagadas');
    const productosContainer = document.getElementById('productosContainer');
    const agregarProductoBtn = document.getElementById('agregarProductoBtn');
    const detallesModal = document.getElementById('detallesModal');
    const detallesFactura = document.getElementById('detallesFactura');
    const modal = document.getElementById('modal');
    const cuentaSelect = document.getElementById('cuentaSelect');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const cerrarDetallesBtn = document.getElementById('cerrarDetallesBtn');
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    let facturaToDelete = null;
    let tipoToDelete = null;
    let facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    let facturasPagadas = JSON.parse(localStorage.getItem('facturasPagadas')) || [];
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    let cuentas = JSON.parse(localStorage.getItem('cuentas')) || [];
    let recetas = JSON.parse(localStorage.getItem('productosRecetas')) || [];

    function convertirAMayusculas(event) {
        event.target.value = event.target.value.toUpperCase();
    }

    function agregarEventosMayusculas() {
        const inputs = crearFacturaForm.querySelectorAll('input[type="text"], input[type="date"], input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', convertirAMayusculas);
        });
    }



    function guardarFormulario() {
        const formData = {
            fecha: document.getElementById('fechaFactura').value,
            proveedor: document.getElementById('proveedorFactura').value,
            rubro: document.getElementById('rubroFactura').value,
            numero: document.getElementById('numeroFactura').value,
            tipo: document.getElementById('tipoFactura').value,
            totalEsperado: document.getElementById('totalEsperadoFactura').value,
            productos: []
        };

        document.querySelectorAll('.producto').forEach(productoDiv => {
            const nombre = productoDiv.querySelector('.productoNombre').value;
            const cantidad = productoDiv.querySelector('.productoCantidad').value;
            const precio = productoDiv.querySelector('.productoPrecio').value;
            formData.productos.push({ nombre, cantidad, precio });
        });

        localStorage.setItem('formData', JSON.stringify(formData)); // Guardar en localStorage
    }

    function cargarFormulario() {
        const formData = JSON.parse(localStorage.getItem('formData'));
        if (formData) {
            document.getElementById('fechaFactura').value = formData.fecha;
            document.getElementById('proveedorFactura').value = formData.proveedor;
            document.getElementById('rubroFactura').value = formData.rubro;
            document.getElementById('numeroFactura').value = formData.numero;
            document.getElementById('tipoFactura').value = formData.tipo;
            document.getElementById('totalEsperadoFactura').value = formData.totalEsperado;

            formData.productos.forEach(producto => {
                const productoDiv = document.createElement('div');
                productoDiv.classList.add('producto', 'mb-2');
                productoDiv.innerHTML = `
                <select class="productoNombre border p-2 mb-2" required></select>
                <input type="number" class="productoCantidad border p-2 mb-2" placeholder="Cantidad" step="0.01" required>
                <input type="number" class="productoPrecio border p-2 mb-2" placeholder="Precio Total" required>
                <button type="button" class="eliminarProductoBtn bg-red-500 text-white p-2 mb-2 rounded hover:bg-red-700">Eliminar</button>
            `;
                productosContainer.appendChild(productoDiv);
                renderizarProductosSelect();

                productoDiv.querySelector('.productoNombre').value = producto.nombre;
                productoDiv.querySelector('.productoCantidad').value = producto.cantidad;
                productoDiv.querySelector('.productoPrecio').value = producto.precio;

                productoDiv.querySelector('.eliminarProductoBtn').addEventListener('click', () => {
                    productosContainer.removeChild(productoDiv);
                    guardarFormulario();
                });
            });
        }
    }

    // FUNCIONES PARA ORDENAMIENTO Y BUSQUEDA

    document.getElementById('searchProveedorNoPagadas').addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        renderizarFacturas(searchTerm);
    });

    document.getElementById('searchProveedorPagadas').addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        renderizarFacturasPagadas(searchTerm);
    });

    document.getElementById('ordenarNoPagadas').addEventListener('change', (event) => {
        const sortBy = event.target.value;
        renderizarFacturas('', sortBy);
    });

    document.getElementById('ordenarPagadas').addEventListener('change', (event) => {
        const sortBy = event.target.value;
        renderizarFacturasPagadas('', sortBy);
    });


    // Añadir botón "Editar" en la función renderizarFacturas
    function renderizarFacturas(searchTerm = '', sortBy = 'fechaAsc') {
        listaFacturas.innerHTML = '';
        const facturasFiltradas = facturas
            .filter(factura => factura.proveedor && factura.proveedor.toLowerCase().includes(searchTerm))
            .sort((a, b) => ordenarFacturas(a, b, sortBy));

        facturasFiltradas.forEach((factura) => {
            const li = document.createElement('li');
            li.innerHTML = `
            <p>NI: ${factura.numeroInterno}</p>
            <p style="background-color: #f0f8ff;">Fecha: ${new Date(factura.fecha).toLocaleDateString('es-ES')}</p>
            <p style="background-color: #e6e6fa;">Proveedor: ${factura.proveedor}</p>
            <p style="background-color: #f5f5dc;">Rubro: ${factura.rubro}</p>
            <p style="background-color: #e6ffe6; color: green;">Total: $${factura.total.toLocaleString('es-AR')}</p>
            ${factura.total !== factura.totalEsperado ? '<span>⚠️</span>' : ''}
        `;
            const verDetallesBtn = document.createElement('button');
            verDetallesBtn.textContent = 'Ver Detalles';
            verDetallesBtn.classList.add('bg-blue-500', 'text-white', 'p-2', 'rounded', 'hover:bg-blue-700', 'ml-2');
            verDetallesBtn.addEventListener('click', () => {
                mostrarDetallesFactura(factura);
            });
            const editarBtn = document.createElement('button');
            editarBtn.textContent = 'Editar';
            editarBtn.classList.add('bg-yellow-500', 'text-white', 'p-2', 'rounded', 'hover:bg-yellow-700', 'ml-2');
            editarBtn.addEventListener('click', () => {
                editarFactura(factura);
            });
            const eliminarBtn = document.createElement('button');
            eliminarBtn.textContent = 'Eliminar';
            eliminarBtn.classList.add('bg-red-500', 'text-white', 'p-2', 'rounded', 'hover:bg-red-700', 'ml-2');
            eliminarBtn.addEventListener('click', () => {
                eliminarFactura(factura, 'noPagada');
            });
            const pagarBtn = document.createElement('button');
            pagarBtn.textContent = 'Pagar';
            pagarBtn.classList.add('bg-green-500', 'text-white', 'p-2', 'rounded', 'hover:bg-green-700', 'ml-2');
            pagarBtn.addEventListener('click', () => pagarFactura(factura));
            li.appendChild(verDetallesBtn);
            li.appendChild(editarBtn);
            li.appendChild(eliminarBtn);
            li.appendChild(pagarBtn);
            listaFacturas.appendChild(li);
        });
    }

    const guardarCambiosBtn = document.createElement('button');
    guardarCambiosBtn.textContent = 'Guardar Cambios';
    guardarCambiosBtn.classList.add('bg-green-500', 'text-white', 'p-2', 'rounded', 'hover:bg-green-700', 'ml-2');
    guardarCambiosBtn.style.display = 'none'; // Ocultar inicialmente

    const cancelarEdicionBtn = document.createElement('button');
    cancelarEdicionBtn.textContent = 'Cancelar';
    cancelarEdicionBtn.classList.add('bg-gray-500', 'text-white', 'p-2', 'rounded', 'hover:bg-gray-700', 'ml-2');
    cancelarEdicionBtn.style.display = 'none'; // Ocultar inicialmente

    document.getElementById('crearFacturaForm').appendChild(guardarCambiosBtn);
    document.getElementById('crearFacturaForm').appendChild(cancelarEdicionBtn);

// Función para editar factura
    function editarFactura(factura) {
        document.getElementById('fechaFactura').value = new Date(factura.fecha).toISOString().split('T')[0];
        document.getElementById('proveedorFactura').value = factura.proveedor;
        document.getElementById('rubroFactura').value = factura.rubro;
        document.getElementById('numeroFactura').value = factura.numero;
        document.getElementById('tipoFactura').value = factura.tipo;
        document.getElementById('totalEsperadoFactura').value = factura.totalEsperado;

        productosContainer.innerHTML = '';
        factura.productos.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto', 'mb-2');
            productoDiv.innerHTML = `
            <select class="productoNombre border p-2 mb-2" required></select>
            <input type="number" class="productoCantidad border p-2 mb-2" placeholder="Cantidad" step="0.01" required>
            <input type="number" class="productoPrecio border p-2 mb-2" placeholder="Precio Total" required>
            <button type="button" class="eliminarProductoBtn bg-red-500 text-white p-2 mb-2 rounded hover:bg-red-700">Eliminar</button>
        `;
            productosContainer.appendChild(productoDiv);
            renderizarProductosSelect();

            productoDiv.querySelector('.productoNombre').value = producto.nombre;
            productoDiv.querySelector('.productoCantidad').value = producto.cantidad;
            productoDiv.querySelector('.productoPrecio').value = producto.precio;

            productoDiv.querySelector('.eliminarProductoBtn').addEventListener('click', () => {
                productosContainer.removeChild(productoDiv);
                guardarFormulario();
            });
        });

        // Mostrar botones "Guardar Cambios" y "Cancelar"
        guardarCambiosBtn.style.display = 'inline-block';
        cancelarEdicionBtn.style.display = 'inline-block';

        // Guardar cambios al formulario
        guardarCambiosBtn.onclick = (event) => {
            event.preventDefault();
            factura.fecha = new Date(document.getElementById('fechaFactura').value);
            factura.proveedor = document.getElementById('proveedorFactura').value;
            factura.rubro = document.getElementById('rubroFactura').value;
            factura.numero = document.getElementById('numeroFactura').value;
            factura.tipo = document.getElementById('tipoFactura').value;
            factura.totalEsperado = parseFloat(document.getElementById('totalEsperadoFactura').value) || 0;

            factura.productos = [];
            let total = 0;
            document.querySelectorAll('.producto').forEach(productoDiv => {
                const nombre = productoDiv.querySelector('.productoNombre').value;
                const cantidad = parseFloat(productoDiv.querySelector('.productoCantidad').value);
                const precioTotal = parseFloat(productoDiv.querySelector('.productoPrecio').value);
                if (nombre && !isNaN(cantidad) && !isNaN(precioTotal)) {
                    const tipoCantidad = productos.find(p => p.nombre === nombre).tipoCantidad;
                    const precioUnitario = precioTotal / cantidad;
                    const subtotal = precioTotal;
                    total += subtotal;
                    factura.productos.push({ nombre, cantidad, precio: precioUnitario, tipoCantidad, subtotal });
                }
            });
            factura.total = total;

            localStorage.setItem('facturas', JSON.stringify(facturas));
            renderizarFacturas();
            crearFacturaForm.reset();
            productosContainer.innerHTML = '';
            guardarCambiosBtn.style.display = 'none'; // Ocultar botón "Guardar Cambios"
            cancelarEdicionBtn.style.display = 'none'; // Ocultar botón "Cancelar"
            crearFacturaForm.onsubmit = guardarFormulario; // Reset the form submit handler
        };

        // Cancelar edición
        cancelarEdicionBtn.onclick = (event) => {
            event.preventDefault();
            crearFacturaForm.reset();
            productosContainer.innerHTML = '';
            guardarCambiosBtn.style.display = 'none'; // Ocultar botón "Guardar Cambios"
            cancelarEdicionBtn.style.display = 'none'; // Ocultar botón "Cancelar"
            crearFacturaForm.onsubmit = guardarFormulario; // Reset the form submit handler
        };
    }


    const reiniciarFormularioBtn = document.createElement('button');
    reiniciarFormularioBtn.textContent = 'Reiniciar Formulario';
    reiniciarFormularioBtn.classList.add('bg-red-500', 'text-white', 'p-2', 'rounded', 'hover:bg-red-700', 'ml-2');

// Añadir el botón al formulario
    document.getElementById('crearFacturaForm').appendChild(reiniciarFormularioBtn);

// Función para reiniciar el formulario
    reiniciarFormularioBtn.onclick = (event) => {
        event.preventDefault();
        crearFacturaForm.reset();
        productosContainer.innerHTML = '';
        localStorage.removeItem('formData');
        guardarCambiosBtn.style.display = 'none'; // Ocultar botón "Guardar Cambios"
        cancelarEdicionBtn.style.display = 'none'; // Ocultar botón "Cancelar"
        crearFacturaForm.onsubmit = guardarFormulario; // Reset the form submit handler
    };


    function renderizarFacturasPagadas(searchTerm = '', sortBy = 'fechaAsc') {
        listaFacturasPagadas.innerHTML = '';
        const cuentas = JSON.parse(localStorage.getItem('cuentas')) || [];
        const facturasFiltradas = facturasPagadas
            .filter(factura => factura.proveedor.toLowerCase().includes(searchTerm))
            .sort((a, b) => ordenarFacturas(a, b, sortBy));

        facturasFiltradas.forEach((factura) => {
            const cuenta = cuentas.find(c => c.nombre === factura.cuentaPagada);
            const color = cuenta ? cuenta.color : '#ffffff';
            const li = document.createElement('li');
            li.innerHTML = `
            <p>NI: ${factura.numeroInterno}</p>
            <p style="background-color: #f0f8ff;">Fecha: ${new Date(factura.fecha).toLocaleDateString('es-ES')}</p>
            <p style="background-color: #e6e6fa;">Proveedor: ${factura.proveedor}</p>
            <p style="background-color: #f5f5dc;">Rubro: ${factura.rubro}</p>
            <p style="background-color: #e6ffe6; color: green;">Total: $${factura.total.toLocaleString('es-AR')}</p>
            ${factura.total !== factura.totalEsperado ? '<span>⚠️</span>' : ''}
            <p style="background-color: ${color};">Pagada con: ${factura.cuentaPagada}</p>
        `;
            const verDetallesBtn = document.createElement('button');
            verDetallesBtn.textContent = 'Ver Detalles';
            verDetallesBtn.classList.add('bg-blue-500', 'text-white', 'p-2', 'rounded', 'hover:bg-blue-700', 'ml-2');
            verDetallesBtn.addEventListener('click', () => {
                mostrarDetallesFactura(factura);
            });
            const eliminarBtn = document.createElement('button');
            eliminarBtn.textContent = 'Eliminar';
            eliminarBtn.classList.add('bg-red-500', 'text-white', 'p-2', 'rounded', 'hover:bg-red-700', 'ml-2');
            eliminarBtn.addEventListener('click', () => {
                eliminarFactura(factura, 'pagada');
            });
            li.appendChild(verDetallesBtn);
            li.appendChild(eliminarBtn);
            listaFacturasPagadas.appendChild(li);
        });
    }


    function ordenarFacturas(a, b, sortBy) {
        switch (sortBy) {
            case 'fechaAsc':
                return new Date(a.fecha) - new Date(b.fecha);
            case 'fechaDesc':
                return new Date(b.fecha) - new Date(a.fecha);
            case 'precioAsc':
                return a.total - b.total;
            case 'precioDesc':
                return b.total - a.total;
            case 'rubro':
                return a.rubro.localeCompare(b.rubro);
            case 'proveedor':
                return a.proveedor.localeCompare(b.proveedor);
            case 'cuenta':
                return a.cuentaPagada ? a.cuentaPagada.localeCompare(b.cuentaPagada) : 0;
            default:
                return 0;
        }
    }




    function pagarFactura(factura) {
        if (factura.total !== factura.totalEsperado) {
            document.getElementById('confirmDiscrepancyModal').classList.remove('hidden');
            document.getElementById('confirmDiscrepancyBtn').onclick = () => {
                document.getElementById('confirmDiscrepancyModal').classList.add('hidden');
                abrirModal(factura);
            };
            document.getElementById('cancelDiscrepancyBtn').onclick = () => {
                document.getElementById('confirmDiscrepancyModal').classList.add('hidden');
            };
        } else {
            abrirModal(factura);
        }
    }

    function abrirModal(factura) {
        cuentaSelect.innerHTML = '';
        cuentas.forEach((cuenta, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = cuenta.nombre;
            cuentaSelect.appendChild(option);
        });
        confirmBtn.onclick = () => confirmarPago(factura);
        modal.classList.remove('hidden');
    }

    function confirmarPago(factura) {
        const cuentaIndex = parseInt(cuentaSelect.value, 10);
        if (cuentaIndex >= 0 && factura) {
            const cuenta = cuentas[cuentaIndex];
            cuenta.saldo -= factura.total;
            factura.cuentaPagada = cuenta.nombre;
            facturasPagadas.push(factura);
            facturas = facturas.filter(f => f !== factura);
            localStorage.setItem('cuentas', JSON.stringify(cuentas));
            localStorage.setItem('facturas', JSON.stringify(facturas));
            localStorage.setItem('facturasPagadas', JSON.stringify(facturasPagadas));
            renderizarFacturas();
            renderizarFacturasPagadas();
            guardarMovimiento('Pago', `Factura pagada: ${factura.proveedor} - ${factura.rubro} Debitado de: ${cuenta.nombre}`, factura.total);
            modal.classList.add('hidden');
        }
    }

    function mostrarDetallesFactura(factura) {
        detallesFactura.innerHTML = `
        <h3 class="text-xl font-bold mb-2">Detalles de la Factura</h3>
        <p>Fecha: ${new Date(factura.fecha).toLocaleDateString('es-ES')}</p>
        <p>Proveedor: ${factura.proveedor}</p>
        <p>Rubro: ${factura.rubro}</p>
        <p>Número de Factura: ${factura.numero}</p>
        <p>Tipo de Factura: ${factura.tipo}</p>
        <ul class="list-disc pl-5 mb-2">
            ${factura.productos.map(producto => `
            <li>${producto.nombre} - ${producto.cantidad} ${producto.tipoCantidad} - $${producto.precio.toLocaleString('es-AR')} (Subtotal: $${producto.subtotal.toLocaleString('es-AR')})</li>
            `).join('')}
        </ul>
        <p class="font-bold">Total: $${factura.total.toLocaleString('es-AR')}</p>
        <p class="font-bold">Total Esperado: $${factura.totalEsperado.toLocaleString('es-AR')}</p>
        ${factura.cuentaPagada ? `<p>Pagada con: ${factura.cuentaPagada}</p>` : ''}
    `;
        detallesModal.style.display = 'flex';
    }


    cerrarDetallesBtn.addEventListener('click', () => {
        detallesModal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    crearFacturaForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const fechaInput = document.getElementById('fechaFactura').value;
        const fecha = new Date(fechaInput);
        fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset()); // Adjust for timezone

        const proveedor = document.getElementById('proveedorFactura').value;
        const rubro = document.getElementById('rubroFactura').value;
        const numero = document.getElementById('numeroFactura').value;
        const tipo = document.getElementById('tipoFactura').value;
        const totalEsperado = parseFloat(document.getElementById('totalEsperadoFactura').value) || 0; // Default to 0 if not provided
        const productosFactura = [];
        let total = 0;

        document.querySelectorAll('.producto').forEach(productoDiv => {
            const nombre = productoDiv.querySelector('.productoNombre').value;
            const cantidad = parseFloat(productoDiv.querySelector('.productoCantidad').value);
            const precioTotal = parseFloat(productoDiv.querySelector('.productoPrecio').value);
            if (nombre && !isNaN(cantidad) && !isNaN(precioTotal)) {
                const tipoCantidad = productos.find(p => p.nombre === nombre).tipoCantidad;
                const precioUnitario = precioTotal / cantidad;
                const subtotal = precioTotal;
                total += subtotal;
                productosFactura.push({ nombre, cantidad, precio: precioUnitario, tipoCantidad, subtotal });
            }
        });

        // Calculate the highest existing numeroInterno
        const maxNumeroInterno = Math.max(
            ...facturas.map(f => f.numeroInterno || 0),
            ...facturasPagadas.map(f => f.numeroInterno || 0),
            0
        );

        const numeroInterno = maxNumeroInterno + 1;
        const factura = { fecha, proveedor, rubro, numero, tipo, productos: productosFactura, total, totalEsperado, numeroInterno };
        facturas.push(factura);
        localStorage.setItem('facturas', JSON.stringify(facturas));
        renderizarFacturas();
        actualizarDatalists();
        actualizarPreciosRecetas(); // Update recipes with the latest prices
        crearFacturaForm.reset();
        productosContainer.innerHTML = '';

        // Clear the form data from localStorage
        localStorage.removeItem('formData');
    });



    function eliminarFactura(factura, tipo) {
        facturaToDelete = factura;
        tipoToDelete = tipo;
        confirmDeleteModal.classList.remove('hidden');
    }

    confirmDeleteBtn.addEventListener('click', () => {
        if (tipoToDelete === 'noPagada') {
            facturas = facturas.filter(f => f !== facturaToDelete);
            localStorage.setItem('facturas', JSON.stringify(facturas));
            renderizarFacturas();
        } else if (tipoToDelete === 'pagada') {
            facturasPagadas = facturasPagadas.filter(f => f !== facturaToDelete);
            localStorage.setItem('facturasPagadas', JSON.stringify(facturasPagadas));
            renderizarFacturasPagadas();
        }
        guardarMovimiento('Eliminación', `Factura eliminada: ${facturaToDelete.proveedor} - ${facturaToDelete.rubro}`, facturaToDelete.total);
        confirmDeleteModal.classList.add('hidden');
        facturaToDelete = null;
        tipoToDelete = null;
    });

    cancelDeleteBtn.addEventListener('click', () => {
        confirmDeleteModal.classList.add('hidden');
        facturaToDelete = null;
        tipoToDelete = null;
    });

    function actualizarDatalists() {
        const proveedoresList = document.getElementById('proveedoresList');
        const rubrosList = document.getElementById('rubrosList');
        const proveedores = new Set();
        const rubros = new Set();

        [...facturas, ...facturasPagadas].forEach(factura => {
            proveedores.add(factura.proveedor);
            rubros.add(factura.rubro);
        });

        proveedoresList.innerHTML = '';
        rubrosList.innerHTML = '';

        proveedores.forEach(proveedor => {
            const option = document.createElement('option');
            option.value = proveedor;
            proveedoresList.appendChild(option);
        });

        rubros.forEach(rubro => {
            const option = document.createElement('option');
            option.value = rubro;
            rubrosList.appendChild(option);
        });
    }

    function renderizarProductosSelect() {
        const selects = document.querySelectorAll('.productoNombre');
        selects.forEach(select => {
            const selectedValue = select.value;
            select.innerHTML = '';
            productos.forEach(producto => {
                const option = document.createElement('option');
                option.value = producto.nombre;
                option.textContent = producto.nombre;
                select.appendChild(option);
            });
            select.value = selectedValue;

            // Agregar evento change para actualizar el placeholder de cantidad
            select.addEventListener('change', (event) => {
                const selectedProducto = productos.find(p => p.nombre === event.target.value);
                const cantidadInput = event.target.closest('.producto').querySelector('.productoCantidad');
                if (selectedProducto) {
                    cantidadInput.placeholder = `Cantidad (${selectedProducto.tipoCantidad})`;
                }
            });

            // Disparar el evento change para inicializar el placeholder
            const event = new Event('change');
            select.dispatchEvent(event);
        });
    }

    function guardarMovimiento(tipo, descripcion, monto) {
        const movimientos = JSON.parse(localStorage.getItem('movimientos')) || [];
        movimientos.push({ tipo, descripcion, monto, fecha: new Date().toISOString() });
        localStorage.setItem('movimientos', JSON.stringify(movimientos));
    }

    function obtenerUltimosPrecios() {
        const ultimosPrecios = {};

        [...facturas, ...facturasPagadas].forEach((factura, index) => {
            if (factura.productos) {
                factura.productos.forEach(producto => {
                    if (!ultimosPrecios[producto.nombre] || index > ultimosPrecios[producto.nombre].index) {
                        ultimosPrecios[producto.nombre] = {
                            precio: producto.precio,
                            index: index
                        };
                    }
                });
            }
        });

        return ultimosPrecios;
    }

    function actualizarPreciosRecetas() {
        const ultimosPrecios = obtenerUltimosPrecios();

        recetas.forEach(receta => {
            receta.ingredientes.forEach(ingrediente => {
                if (ultimosPrecios[ingrediente.nombre]) {
                    ingrediente.precio = ultimosPrecios[ingrediente.nombre].precio;
                }
            });
        });

        localStorage.setItem('productosRecetas', JSON.stringify(recetas));
    }

    crearFacturaForm.addEventListener('input', guardarFormulario);
    productosContainer.addEventListener('input', guardarFormulario);

    agregarProductoBtn.addEventListener('click', () => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('producto', 'mb-2');
        productoDiv.innerHTML = `
            <select class="productoNombre border p-2 mb-2" required></select>
            <input type="number" class="productoCantidad border p-2 mb-2" placeholder="Cantidad" step="0.01" required>
            <input type="number" class="productoPrecio border p-2 mb-2" placeholder="Precio Total" required>
            <button type="button" class="eliminarProductoBtn bg-red-500 text-white p-2 mb-2 rounded hover:bg-red-700">Eliminar</button>
        `;
        productosContainer.appendChild(productoDiv);
        renderizarProductosSelect();

        productoDiv.querySelector('.eliminarProductoBtn').addEventListener('click', () => {
            productosContainer.removeChild(productoDiv);
            guardarFormulario();
        });
    });

    agregarEventosMayusculas(); // Agregar eventos a los inputs existentes
    cargarFormulario();
    actualizarDatalists();
    renderizarProductosSelect();
    renderizarFacturas();
    renderizarFacturasPagadas();
});