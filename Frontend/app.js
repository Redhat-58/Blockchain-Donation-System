window.addEventListener('load', async () => {
    let web3;
    let contract;
    let userAccount;
    let isRevealed = false;
    // Replace with your contract address after deployment in contracts.
    const contractAddress = '*'; 
    const abi = [
        {
            "constant": false,
            "inputs": [],
            "name": "donate",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getTotalDonations",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ];

    const connectButton = document.getElementById('connectButton');
    const walletStatus = document.getElementById('walletStatus');
    const donationAmountInput = document.getElementById('donationAmount');
    const donateButton = document.getElementById('donateButton');
    const totalDonationsDisplay = document.getElementById('totalDonations');
    const warningMessage = document.createElement('p');
    
    warningMessage.id = 'warningMessage';
    warningMessage.style.color = 'red';
    warningMessage.style.display = 'none';
    donationAmountInput.insertAdjacentElement('afterend', warningMessage);

    const eyeButton = document.createElement('button');
    eyeButton.className = 'eye-button';
    eyeButton.innerHTML = '👁️ View Address';

    const eyeCloseButton = document.createElement('button');
    eyeCloseButton.className = 'eye-close-button';
    eyeCloseButton.innerHTML = 'Hide Address';

    async function connectWallet() {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                userAccount = accounts[0];
                contract = new web3.eth.Contract(abi, contractAddress);

                const chainId = await web3.eth.getChainId();
                if (chainId !== 1337) {  // Check if connected to Ganache (Chain ID 1337)
                    showWarning();
                } else {
                    hideWarning();
                    updateWalletDisplay();
                    connectButton.innerText = 'Disconnect Wallet';
                }
            } catch (error) {
                console.error('User denied account access or there was an issue connecting');
            }
        } else {
            alert('MetaMask not detected');
        }
    }

    function disconnectWallet() {
        web3 = null;
        userAccount = null;
        contract = null;
        walletStatus.innerText = 'Wallet Disconnected';
        connectButton.innerText = 'Connect Wallet';
        walletStatus.innerHTML = ''; // Clear the walletStatus content
        hideWarning();
        donateButton.style.display = 'none';
    }

    function updateWalletDisplay() {
        const shortenedAddress = `${userAccount.slice(0, 4)}****${userAccount.slice(-4)}`;
        const displayText = isRevealed ? userAccount : shortenedAddress;
        walletStatus.innerHTML = `Wallet Connected: ${displayText}`;
        walletStatus.appendChild(isRevealed ? eyeCloseButton : eyeButton);
        donateButton.style.display = 'block';
    }

    function showWarning() {
        warningMessage.style.display = 'block';
        warningMessage.innerHTML = `
            Please add and switch to the Ganache network and refresh the page to donate:<br>
            <b>Add:</b><br>
            Name: Ganache TestNet<br>
            Chain ID: 1337<br>
            RPC Server: http://127.0.0.1:7545
        `;
        donateButton.style.display = 'none';
    }

    function hideWarning() {
        warningMessage.style.display = 'none';
    }

    eyeButton.addEventListener('click', () => {
        isRevealed = true;
        updateWalletDisplay();
    });

    eyeCloseButton.addEventListener('click', () => {
        isRevealed = false;
        updateWalletDisplay();
    });

    connectButton.addEventListener('click', () => {
        if (userAccount) {
            disconnectWallet();
        } else {
            connectWallet();
        }
    });

    donateButton.addEventListener('click', async () => {
        const amount = donationAmountInput.value;
        if (!contract || !userAccount) {
            alert('Please connect your wallet first.');
            return;
        }
        if (parseFloat(amount) <= 0) {
            warningMessage.style.display = 'block';
            warningMessage.innerText = 'Donation amount must be a positive number.';
            return;
        }

        try {
            await contract.methods.donate().send({ from: userAccount, value: web3.utils.toWei(amount, 'ether') });
            alert('Thank you for your donation!');
            await updateTotalDonations(); // Ensure this is awaited
        } catch (error) {
            console.error('Error during donation:', error);
        }
    });

    donationAmountInput.addEventListener('input', () => {
        if (parseFloat(donationAmountInput.value) < 0) {
            warningMessage.style.display = 'block';
            warningMessage.innerText = 'Negative numbers are not allowed.';
        } else {
            warningMessage.style.display = 'none';
        }
    });

    async function updateTotalDonations() {
        if (contract) {
            try {
                const total = await contract.methods.getTotalDonations().call();
                totalDonationsDisplay.innerText = `Total Donations: ${web3.utils.fromWei(total, 'ether')} ETH`;
            } catch (error) {
                console.error('Error fetching total donations:', error);
            }
        }
    }

    document.getElementById('getTotalButton').addEventListener('click', async () => {
        await updateTotalDonations(); // Ensure this is awaited
    });
});
