const BROKER_ADDR = "0x501870Af2320fC83EC0DD30048eBB5b598B5e1Ed";
const TOKEN_ADDR = "0x8B066E93aB5Da75B7F8131570fc94b61ebd04e52";
let signer;
let brokerContract;

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
            console.error(error);
        }
    } else {
        alert("Instala MetaMask");
    }
}

async function actualizarBalance() {
    if (!brokerContract) return;
    try {
        const precioRaw = await brokerContract.precioRecompra();
        const precio = parseFloat(ethers.utils.formatUnits(precioRaw, 6));
        document.getElementById('userValue').innerText = "$" + (precio * 1.5).toFixed(2);
    } catch (e) { console.log(e); }
}

async function ejecutarOperacion(tipo) {
    const cant = document.getElementById('amountInput').value;
    if (!signer) return conectarWallet();
    try {
        const montoWei = ethers.utils.parseEther(cant);
        let tx = (tipo === 'comprar') ? await brokerContract.comprarAcciones(montoWei) : await brokerContract.venderAlBroker(montoWei);
        await tx.wait();
        alert("Éxito");
    } catch (e) { alert("Error: " + e.message); }
}

// Escuchadores de eventos (Para evitar el error de Inline Script)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnConnect').addEventListener('click', conectarWallet);
    document.getElementById('btnBuy').addEventListener('click', () => ejecutarOperacion('comprar'));
    document.getElementById('btnSell').addEventListener('click', () => ejecutarOperacion('vender'));

    // Gráfico
    const ctx = document.getElementById('mainChart');
    if(ctx) {
        new Chart(ctx, {
            type: 'line',
            data: { labels: ['S1','S2','S3','S4'], datasets: [{ data: [1, 1.2, 1.1, 1.5], borderColor: '#27ae60', tension: 0.4 }] },
            options: { plugins: { legend: { display: false } } }
        });
    }
});
