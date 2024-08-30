const contractAddress = '0x609a65060ea0a845864414c38d1d361547b176e8';
const contractABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "artist",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "ArtworkListed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "ArtworkSold",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "buyArtwork",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "listArtwork",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_newPrice",
				"type": "uint256"
			}
		],
		"name": "updateArtworkPrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "artworkCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "artworks",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "artist",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isForSale",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let provider, signer, contract;

async function init() {
    if (typeof window.ethereum !== 'undefined') {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('disconnectWallet').style.display = 'inline-block';
        const address = await signer.getAddress();
        document.getElementById('walletAddress').innerText = `Connected: ${address}`;
        updateArtworkList();
    } else {
        document.getElementById('status').innerText = 'Please install MetaMask to use this dApp.';
    }
}

function disconnect() {
    provider = null;
    signer = null;
    contract = null;
    document.getElementById('walletAddress').innerText = '';
    document.getElementById('connectWallet').style.display = 'inline-block';
    document.getElementById('disconnectWallet').style.display = 'none';
}

async function updateArtworkList() {
    const artworkCount = await contract.artworkCount();
    const artworkListElement = document.getElementById('artworkList');
    artworkListElement.innerHTML = '<h2>Available Artworks</h2>';

    for (let i = 1; i <= artworkCount; i++) {
        const artwork = await contract.artworks(i);
        if (artwork.isForSale) {
            const artworkElement = document.createElement('div');
            artworkElement.className = 'artwork';
            artworkElement.innerHTML = `
                <p>ID: ${artwork.id}</p>
                <p>Title: ${artwork.title}</p>
                <p>Artist: ${artwork.artist}</p>
                <p>Price: ${ethers.utils.formatEther(artwork.price)} ETH</p>
            `;
            artworkListElement.appendChild(artworkElement);
        }
    }
}

document.getElementById('connectWallet').addEventListener('click', init);
document.getElementById('disconnectWallet').addEventListener('click', disconnect);

document.getElementById('listArtwork').addEventListener('click', async () => {
    const title = document.getElementById('artworkTitle').value;
    const price = ethers.utils.parseEther(document.getElementById('artworkPrice').value);
    await contract.listArtwork(title, price);
    updateArtworkList();
});

document.getElementById('buyArtwork').addEventListener('click', async () => {
    const id = document.getElementById('artworkId').value;
    const artwork = await contract.artworks(id);
    await contract.buyArtwork(id, { value: artwork.price });
    updateArtworkList();
});

document.getElementById('updatePrice').addEventListener('click', async () => {
    const id = document.getElementById('updateArtworkId').value;
    const newPrice = ethers.utils.parseEther(document.getElementById('newPrice').value);
    await contract.updateArtworkPrice(id, newPrice);
    updateArtworkList();
});
