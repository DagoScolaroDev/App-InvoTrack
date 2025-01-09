document.addEventListener('DOMContentLoaded', () => {
    const listaMovimientos = document.getElementById('listaMovimientos');

    function agregarMovimiento(tipo, descripcion, monto, fecha) {
        const movimiento = document.createElement('div');
        movimiento.classList.add('p-4', 'mb-4', 'border', 'border-gray-300', 'rounded', 'shadow-sm');

        const tipoElemento = document.createElement('p');
        tipoElemento.textContent = `Tipo: ${tipo}`;
        tipoElemento.classList.add('font-bold', 'text-lg');

        const descripcionElemento = document.createElement('p');
        descripcionElemento.textContent = `Descripción: ${descripcion}`;
        descripcionElemento.classList.add('text-gray-700');

        const montoElemento = document.createElement('p');
        montoElemento.textContent = `Monto: $${monto.toFixed(2)}`;
        montoElemento.classList.add('text-gray-700');

        const fechaElemento = document.createElement('p');
        fechaElemento.textContent = `Fecha: ${new Date(fecha).toLocaleString()}`;
        fechaElemento.classList.add('text-gray-500', 'text-sm');

        movimiento.appendChild(tipoElemento);
        movimiento.appendChild(descripcionElemento);
        movimiento.appendChild(montoElemento);
        movimiento.appendChild(fechaElemento);

        listaMovimientos.insertBefore(movimiento, listaMovimientos.firstChild);
    }

    const movimientos = JSON.parse(localStorage.getItem('movimientos')) || [];
    movimientos.forEach(mov => agregarMovimiento(mov.tipo, mov.descripcion, mov.monto, mov.fecha));
});