var contractAddress = '0x9a62d3825e07342568a34aa31aad38bb04250806';
var contractAddressRopsten = '0xb4fddd37602b03fa086c42bfa7b9739be38682c3'; // For testing in Ropsten testnet only

var netId;
var web3js;
var userAccount = false;

var Contract;

// Checking if Web3 has been injected by the browser (Mist/MetaMask)
window.addEventListener('load', function () {
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new Web3(web3.currentProvider);
        // Debug only: override web3js instead of using Mist/MetaMask
//        web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545")); // Local-node, use Geth or testrpc to start one
//        web3js = new Web3(new Web3.providers.HttpProvider('https://api.myetherapi.com/eth')); // Mainnet node
//        web3js = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/93Pkd62SaFUrBJZC646A')); // Mainnet node 2
//        web3js = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/93Pkd62SaFUrBJZC646A")); // Ropsten testnet node
        startApp();
    } else {
        toggleMetaMaskPrompt(true);
    }
});

$('#bet-button').click(function (event) {
    event.preventDefault();
    $("#transaction-status").show().text("Transaction submitted, please confirm in MetaMask.");
    web3js.eth.sendTransaction({
        from: userAccount,
        value: web3js.utils.toWei("0.1", "ether"),
        to: contractAddress
    })
    .once('transactionHash', function (hash) {
        $("#transaction-status").html("Your contribution is being processed... <br />Transaction Hash: " + getTransactionUrl(hash));
    })
    .once('receipt', function(receipt){
        $('#transaction-status').html("Congrates! Your contribution has been processed and you received new CUBIKs!");
    })
//    .on('confirmation', function(confNumber, receipt){ console.log("confirmation"); console.log(confNumber); console.log(receipt); })
    .on('error', function (error) {
        $("#transaction-status").html("There was an error processing your contribution.<br />" + String(error));
    });
});

function startApp() {
    // Check if in mainnet or testnets
    web3js.eth.net.getId().then(function (networkId) {
        netId = networkId;
        if (netId === 3) {
            tokenContractAddress = contractAddressRopsten;
            $('#testnet-warning').show().html("This is a Ropsten <b>Testnet</b> Transaction Only.");
        } else if (netId !== 1) {
            $('#testnet-warning').show().html("You're not connected! Open MetaMask and make sure you are on the Main Ethereum Network.");
        }

        // Get hold of contract instance
        Contract = new web3js.eth.Contract(abi, tokenContractAddress);

        // Update account detail every 3 seconds
        setInterval(checkAccountDetail, 3000);
    });
}

function checkAccountDetail() {
    // Get default account
    web3js.eth.getAccounts().then(function (accounts) {
        // Just keep updating, so the user's balance is updated after purchase
        userAccount = accounts[0];
        updateAccountDetail();
    });
}

function updateAccountDetail() {
    console.log(userAccount);
    if (userAccount === undefined) {
        toggleMetaMaskPrompt(true);
    } else {
        toggleMetaMaskPrompt(false);
        getBttingDetail();
    }
}

function getBttingDetail() {
//    // Address
//    $('#address').text(userAccount);
//    // Account balance in Ether
//    web3js.eth.getBalance(userAccount).then(function (res) {
//        var balance = web3js.utils.fromWei(res, 'ether');
//        $('#eth-amount').text(balance);
//    });
    // Bet Count
//    Contract.methods.getBetCount().call().then(function (res) {
//        $('#bet-count').text(res);
//    });
    // Bet Pool
    web3js.eth.getBalance(contractAddress).then(function (res) {
        var balance = web3js.utils.fromWei(res, 'ether');
        $('#bet-pool').text(balance);
    });
//    // Start Date
//    Contract.methods.getStartDate().call().then(function (res) {
//        $('#start-date').text(res);
//    });
//    // End Date
//    Contract.methods.getEndDate().call().then(function (res) {
//        $('#end-date').text(res);
//    });
    // Check if bet already
//    Contract.methods.getBetOf(userAccount).call().then(function (res) {
//        $('#bet-button').toggle(res === 0);
//        $('#already-bet').toggle(res === 0);
//    });
}

function toggleMetaMaskPrompt(toggle) {
    $('#no-metamask').toggle(toggle);
    $('#bet-button').prop('disabled', toggle);
}

function getTransactionUrl(address) {
    return getEtherScanUrl("tx", address);
}

function getTokenUrl(address) {
    return getEtherScanUrl("token", address);
}

function getContractUrl(address) {
    return getEtherScanUrl("address", address);
}

function getEtherScanUrl(type, address) {
    var url = netId === 3 ? "ropsten.etherscan.io" : "etherscan.io";
    return "<a href='https://" + url + "/" + type + "/" + address + "' target='_blank'>" + address + "</a>";
}