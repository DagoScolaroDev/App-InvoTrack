document.addEventListener('DOMContentLoaded', () => {
    const balancesContainer = document.getElementById('balancesContainer');
    const agregarSaldoBtn = document.getElementById('agregarSaldoBtn');
    const quitarSaldoBtn = document.getElementById('quitarSaldoBtn');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const cuentaSelect = document.getElementById('cuentaSelect');
    const saldoInput = document.getElementById('saldoInput');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const crearCuentaForm = document.getElementById('crearCuentaForm');
    const nombreCuenta = document.getElementById('nombreCuenta');
    const colorCuenta = document.getElementById('colorCuenta');
    const totalBalance = document.getElementById('totalBalance');

    let cuentas = JSON.parse(localStorage.getItem('cuentas')) || [];

    function renderizarBalances() {
        balancesContainer.innerHTML = '';
        let total = 0;
        cuentas.forEach((cuenta, index) => {
            const div = document.createElement('div');
            div.classList.add('mb-2', 'flex', 'justify-between', 'items-center');
            div.innerHTML = `
                <span>${cuenta.nombre}: $${cuenta.saldo.toFixed(2)}</span>
                <span style="background-color: ${cuenta.color}; width: 20px; height: 20px; display: inline-block; border: 1px solid #000;"></span>
                <button class="bg-red-500 text-white p-2 rounded" onclick="eliminarCuenta(${index})">Delete</button>
            `;
            balancesContainer.appendChild(div);
            total += cuenta.saldo;
        });
        totalBalance.textContent = `Total Balance: $${total.toFixed(2)}`;
    }

    function abrirModal(tipo) {
        modalTitle.textContent = tipo === 'agregar' ? 'Add Balance' : 'Remove Balance';
        cuentaSelect.innerHTML = '';
        cuentas.forEach((cuenta, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = cuenta.nombre;
            cuentaSelect.appendChild(option);
        });
        saldoInput.value = '';
        confirmBtn.onclick = () => confirmarCambioSaldo(tipo);
        modal.classList.remove('hidden');
    }

    function confirmarCambioSaldo(tipo) {
        const cuentaIndex = parseInt(cuentaSelect.value, 10);
        const monto = parseFloat(saldoInput.value);
        if (!isNaN(monto) && cuentaIndex >= 0) {
            const cuenta = cuentas[cuentaIndex];
            if (tipo === 'agregar') {
                cuenta.saldo += monto;
                guardarMovimiento('Ingreso', `Saldo agregado a la cuenta ${cuenta.nombre}`, monto);
            } else if (tipo === 'quitar') {
                cuenta.saldo -= monto;
                guardarMovimiento('Egreso', `Saldo retirado de la cuenta ${cuenta.nombre}`, monto);
            }
            localStorage.setItem('cuentas', JSON.stringify(cuentas));
            renderizarBalances();
            modal.classList.add('hidden');
        }
    }

    function guardarMovimiento(tipo, descripcion, monto) {
        const movimientos = JSON.parse(localStorage.getItem('movimientos')) || [];
        movimientos.push({ tipo, descripcion, monto, fecha: new Date().toISOString() });
        localStorage.setItem('movimientos', JSON.stringify(movimientos));
    }

    window.eliminarCuenta = function(index) {
        cuentas.splice(index, 1);
        localStorage.setItem('cuentas', JSON.stringify(cuentas));
        renderizarBalances();
    }

    crearCuentaForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nuevaCuenta = {
            nombre: nombreCuenta.value,
            saldo: 0,
            color: colorCuenta.value
        };
        cuentas.push(nuevaCuenta);
        localStorage.setItem('cuentas', JSON.stringify(cuentas));
        renderizarBalances();
        crearCuentaForm.reset();
    });

    agregarSaldoBtn.addEventListener('click', () => abrirModal('agregar'));
    quitarSaldoBtn.addEventListener('click', () => abrirModal('quitar'));
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    renderizarBalances();
});