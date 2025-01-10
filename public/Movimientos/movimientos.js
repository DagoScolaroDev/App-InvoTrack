document.addEventListener('DOMContentLoaded', () => {
    const listaMovimientos = document.querySelector('#listaMovimientos tbody');
    let movimientos = JSON.parse(localStorage.getItem('movimientos')) || [];
    let sortOrder = { tipo: 1, descripcion: 1, monto: 1, fecha: -1 }; // Inicialmente ordenado por fecha descendente
    let currentSortColumn = 'fecha';

    function agregarMovimiento(tipo, descripcion, monto, fecha) {
        const fila = document.createElement('tr');

        const tipoElemento = document.createElement('td');
        tipoElemento.textContent = tipo;
        tipoElemento.classList.add('border', 'px-4', 'py-2');

        const descripcionElemento = document.createElement('td');
        descripcionElemento.textContent = descripcion;
        descripcionElemento.classList.add('border', 'px-4', 'py-2');

        const montoElemento = document.createElement('td');
        montoElemento.textContent = `$${monto.toLocaleString('es-AR')}`;
        montoElemento.classList.add('border', 'px-4', 'py-2');

        const fechaElemento = document.createElement('td');
        fechaElemento.textContent = new Date(fecha).toLocaleString();
        fechaElemento.classList.add('border', 'px-4', 'py-2');

        fila.appendChild(tipoElemento);
        fila.appendChild(descripcionElemento);
        fila.appendChild(montoElemento);
        fila.appendChild(fechaElemento);

        listaMovimientos.appendChild(fila);
    }

    function renderizarMovimientos() {
        listaMovimientos.innerHTML = '';
        movimientos.forEach(mov => agregarMovimiento(mov.tipo, mov.descripcion, mov.monto, mov.fecha));
    }

    function ordenarMovimientos(criterio) {
        movimientos.sort((a, b) => {
            if (a[criterio] < b[criterio]) return -1 * sortOrder[criterio];
            if (a[criterio] > b[criterio]) return 1 * sortOrder[criterio];
            return 0;
        });
        sortOrder[criterio] *= -1;
        currentSortColumn = criterio;
        renderizarMovimientos();
        actualizarEncabezados();
    }

    function actualizarEncabezados() {
        document.querySelectorAll('th').forEach(th => {
            const criterio = th.textContent.toLowerCase().replace(/ ▲| ▼/, '');
            th.innerHTML = criterio.charAt(0).toUpperCase() + criterio.slice(1);
        });

        const th = Array.from(document.querySelectorAll('th')).find(th => th.textContent.toLowerCase().includes(currentSortColumn));
        if (th) {
            const flecha = sortOrder[currentSortColumn] === 1 ? '▲' : '▼';
            th.innerHTML += ` ${flecha}`;
        }
    }

    document.querySelectorAll('th').forEach(th => {
        th.addEventListener('click', () => {
            const criterio = th.textContent.toLowerCase();
            ordenarMovimientos(criterio);
        });
    });

    ordenarMovimientos('fecha'); // Ordenar por fecha al cargar la página
});