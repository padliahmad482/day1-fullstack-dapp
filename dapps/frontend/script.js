const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");

const AVALANCHE_FUJI_CHAIN_ID = "0xa869";
let isConnected = false;

function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  return (balance / 1e18).toFixed(4);
}

function disconnectWallet() {
  addressEl.textContent = "-";
  networkEl.textContent = "-";
  balanceEl.textContent = "-";
  statusEl.textContent = "Not Connected";
  statusEl.style.color = "#ffffff";
  connectBtn.textContent = "CONNECT WALLET";
  isConnected = false;
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Core Wallet tidak terdeteksi. Silakan install Core Wallet.");
    return;
  }

  try {
    statusEl.textContent = "Connecting...";

    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });

    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    const address = accounts[0];
    addressEl.textContent = address;

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = "Avalanche Fuji Testnet";
      statusEl.textContent = "Connected ✅";
      statusEl.style.color = "#4cd137";
      
      connectBtn.textContent = "DISCONNECT";
      isConnected = true;

      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      balanceEl.textContent = formatAvaxBalance(balanceWei);
    } else {
      // FITUR TAMBAHAN: OTOMATIS MINTA PINDAH JARINGAN
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: AVALANCHE_FUJI_CHAIN_ID }],
        });
        // Jika sukses pindah, panggil fungsi connect lagi untuk update data
        connectWallet();
      } catch (switchError) {
        // Jika gagal pindah (misal user klik cancel)
        networkEl.textContent = "Wrong Network ❌";
        statusEl.textContent = "Please switch to Avalanche Fuji";
        statusEl.style.color = "#fbc531";
        balanceEl.textContent = "-";
      }
    }
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Connection Failed ❌";
    connectBtn.textContent = "CONNECT WALLET";
  }
}

connectBtn.addEventListener("click", () => {
  if (isConnected) {
    disconnectWallet();
  } else {
    connectWallet();
  }
});