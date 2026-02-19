// CONFIGURACIÓN - TOBAR CORP
const BROKER_ADDR = "0x501870Af2320fC83EC0DD30048eBB5b598B5e1Ed";
const TOKEN_ADDR = "0x8B066E93aB5Da75B7F8131570fc94b61ebd04e52";
let signer;
let brokerContract;

// Función para conectar la Wallet
async function conectarWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            const address = await signer.getAddress();
            
            document.getElementById('btnConnect').innerText = "Wallet: " + address.substring(0,6) + "...";
            
            const abi = [
                "function comprarAcciones(uint256)", 
                "function venderAlBroker(uint256)",
                "function precioRecompra() view returns (uint256)"
            ];
            brokerContract = new ethers.Contract(BROKER_ADDR, abi, signer);
            actualizarBalance();
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    } else {
        alert("Por favor, instala MetaMask o usa un navegador Web3.");
    }
}

// Función para actualizar el valor en pantalla
async function actualizarBalance() {
    if (!brokerContract) return;
    try {
        const precioRaw = await brokerContract.precioRecompra();
        const precio = parseFloat(ethers.utils.formatUnits(precioRaw, 6));
        document.getElementById('userValue').innerText = "$" + (precio * 1.5).toFixed(2);
    } catch (e) { console.log("Error balance:", e); }
}

// Función para ejecutar transacciones
async function ejecutarOperacion(tipo) {
    const cant = document.getElementById('amountInput').value;
    if (!signer) return conectarWallet();
    if (!cant) return alert("Ingresa una cantidad");

    try {
        const montoWei = ethers.utils.parseEther(cant);
        let tx = (tipo === 'comprar') 
            ? await brokerContract.comprarAcciones(montoWei) 
            : await brokerContract.venderAlBroker(montoWei);
        
        alert("Transacción enviada. Esperando red...");
        await tx.wait();
        alert("¡Operación exitosa!");
        actualizarBalance();
    } catch (e) { 
        alert("Error: " + (e.reason || e.message)); 
    }
}

// INICIALIZACIÓN (Cuando la página carga)
document.addEventListener('DOMContentLoaded', () => {
    // Escuchadores de clics (Reemplazan al onclick del HTML)
    document.getElementById('btnConnect').addEventListener('click', conectarWallet);
    document.getElementById('btnBuy').addEventListener('click', () => ejecutarOperacion('comprar'));
    document.getElementById('btnSell').addEventListener('click', () => ejecutarOperacion('vender'));

    // Configuración del Gráfico
    const ctx = document.getElementById('mainChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: { 
                labels: ['Sem 1','Sem 2','Sem 3','Sem 4'], 
                datasets: [{ 
                    data: [1, 1.2, 1.1, 1.5], 
                    borderColor: '#27ae60', 
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(39, 174, 96, 0.05)'
                }] 
            },
            options: { plugins: { legend: { display: false } } }
        });
    }
});

