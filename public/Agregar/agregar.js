document.addEventListener('DOMContentLoaded', () => {
    const agregarForm = document.getElementById('agregarForm');
    const listaProductos = document.getElementById('listaProductos');

    // Cargar productos desde el almacenamiento local
    const productos = JSON.parse(localStorage.getItem('productos')) || [];

    // Función para renderizar la lista de productos
    function renderizarProductos() {
        listaProductos.innerHTML = '';
        productos.forEach((producto, index) => {
            const li = document.createElement('li');
            li.textContent = `${producto.nombre} - ${producto.tipoCantidad}`;
            const eliminarBtn = document.createElement('button');
            eliminarBtn.textContent = 'Eliminar';
            eliminarBtn.classList.add('bg-red-500', 'text-white', 'p-2', 'ml-2');
            eliminarBtn.addEventListener('click', () => {
                eliminarProducto(index);
            });
            li.appendChild(eliminarBtn);
            listaProductos.appendChild(li);
        });
    }

    // Agregar producto a la lista y al almacenamiento local
    agregarForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nombre = document.getElementById('nombre').value;
        const tipoCantidad = document.getElementById('tipoCantidad').value;

        const producto = { nombre, tipoCantidad };
        productos.push(producto);
        localStorage.setItem('productos', JSON.stringify(productos));

        renderizarProductos();
        agregarForm.reset();
    });

    // Eliminar producto de la lista y del almacenamiento local
    function eliminarProducto(index) {
        productos.splice(index, 1);
        localStorage.setItem('productos', JSON.stringify(productos));
        renderizarProductos();
    }

    // Renderizar productos al cargar la página
    renderizarProductos();
});