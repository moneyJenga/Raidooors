var provider = new ethers.providers.Web3Provider(window.ethereum);
const SacraficeButton = document.getElementById("sacrafice");
const galleryButton = document.getElementById("gallery");
const accountTokensButton = document.getElementById("accountTokens");
const page = document.getElementById("app");
const NetworkId = 1;
var currentDisplayed = 0;

var connected = false;

function sacraficePage () {
    page.innerHTML = '<p id = "displayBal">Prepare your altar for Odin!</p><div align = "center"><button class = buttons id = "ConnectWallet">Connect</button></div>';
    document.getElementById("metadata").innerHTML = "";
    var displayBal = document.getElementById("displayBal");
    var button = document.getElementById("ConnectWallet");
    button.addEventListener("click",connectMint);
    document.getElementById("metadata").innerHTML = ""; 
}

function galleryPage (imageSrc = "images/selectRaidoor.png") {
    page.innerHTML = '<h2 align = "center">Gallery</h2><div align = "center"><img class = "gallery" id = "gallery" width = 350px height = 350px src = '+imageSrc+'></div><div align = "center"><label class = labs for = "tkId">select by ID (' + currentDisplayed + '):  </label><input class = inputs type = "number" id = "tokenId" name = "tkId"></div> <div align = "center" class = "btn-group" ><button id = "prevPic">Previous</button><button id = "Display">Show</button><button id = "nextPic">Next</button></div>';
    //var displayBal = document.getElementById("displayBal");
    tokenIDinput = document.getElementById("tokenId");
    document.getElementById("Display").addEventListener("click", showNFT);
    document.getElementById("prevPic").addEventListener("click",prevNFT);
    document.getElementById("nextPic").addEventListener("click",nextNFT);
}

function accountTokensPage () {
    if (isCorrectNetwork()) {
        page.innerHTML = '<br><br><div align = "center"><button class = "buttons" id = "displayBal">Your Raidooors</button></div><p align = "center" id = "userTokensList"></p>';
        document.getElementById("displayBal").addEventListener("click",getAccountTokens);
        document.getElementById("metadata").innerHTML = "";
    } else {
        page.innerHTML = "Connect to Avalanche network!";
        document.getElementById("metadata").innerHTML = "";
    }
}

const getAccountTokens = async () => {
    var account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = account[0]; // <- do i need that ?
    const signer = provider.getSigner();
    const contract = await new ethers.Contract(minter.address, minter.abi, signer);

    var latestMinted = await contract.latestMinted(); latestMinted = parseInt(latestMinted)
    var userBalance = await contract.balanceOf(account); userBalance = parseInt(userBalance);

    if (userBalance == 0) {
        document.getElementById("userTokensList").innerHTML = "You have made no sarafices, Odin is not pleased!";
    } else {
        var tokenList = "Odin is pleased with your sacrafices, Your Raidooors are listed below.<br><br>";
        var counter = 0;
        var userTokens = "";
        for (let i = 0; i <= latestMinted; i ++) {
            var curOwner = await contract.ownerOf(i);
            
            if (curOwner.toLowerCase() == account.toLowerCase()) {
                console.log(typeof(curOwner));
                counter = counter + 1;
                tokenList = tokenList + "Raidooor ID: " + i + "<br>";
                if (counter >= userBalance) {break; } 
            }
        }
        document.getElementById("userTokensList").innerHTML = tokenList;
    }

}

const isCorrectNetwork = async () => {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    var chainId = await provider.getNetwork();
    if (chainId.chainId == NetworkId) {
        return true;
    } else  {
        return false;
    }
}

const connectMint = async () =>  {
    if (!connected) {
        if (await isCorrectNetwork()) {
            // connect account
            var account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            displayBal.innerHTML = "Sacraficial altar: " +  account;
            document.getElementById("ConnectWallet").innerHTML = "Sacrafice!";
            connected = true;
        } else {
            if (["Please switch to Avalanche-C chain!","<big>I said switch to Avalanche!!</big>"].includes(displayBal.innerHTML)) {
                displayBal.innerHTML = "<big>I said switch to Avalanche!!</big>";
            } else {
                displayBal.innerHTML = "Please switch to Avalanche-C chain!";
            }
        }
    } else {
        if (await isCorrectNetwork()) {
            const signer = provider.getSigner();
            const contract = await new ethers.Contract(minter.address, minter.abi, signer);
            let mintReady = await contract.activateMint();
            console.log(mintReady);
            if (mintReady) {
                const options = await {value: ethers.utils.parseEther("0.25")};
                let tx = await contract.sacrafice(options);
                displayBal.innerHTML = "Your sacrafice: " + tx.hash;
                console.log(tx.hash);
            } else {
                displayBal.innerHTML = "Odin not ready for sacrafice, come back soon!";
            }
        } else {
            displayBal.innerHTML = "Please switch to Avalanche-C chain!";
            connected = false;
        }

    }
}

//tokenIDinput = document.getElementById("tokenId")
const showNFT = async () => {
    const signer = provider.getSigner();
    const contract = await new ethers.Contract(
        minter.address, minter.abi,
        signer
    );
    let value = await tokenIDinput.value;
    let latestMinted = await contract.latestMinted();
    latestMinted = parseInt(latestMinted);
    if (latestMinted >= value) {
        let metadata = await contract.tokenURI(value);
        metadata = metadata.replace("ipfs://","https://gateway.pinata.cloud/ipfs/");
        metadata = await $.getJSON(metadata);
        metadata.image = metadata.image.replace("ipfs://","https://gateway.pinata.cloud/ipfs/");
        currentDisplayed = parseInt(value);
        galleryPage(imageSrc = metadata.image);
        displayMetadata(metadata);
        
    } else {
        galleryPage(imageSrc = "images/doesntExist.png");
    }
}


const prevNFT = async () => {
    const signer = provider.getSigner();
    const contract = await new ethers.Contract(
        minter.address, minter.abi,
        signer
    );
    let value = currentDisplayed;
    let latestMinted = await contract.latestMinted();
    latestMinted = parseInt(latestMinted);
    if (currentDisplayed <= 0 | value > latestMinted){
        value = latestMinted;
    } else  {
        value = value - 1;
    } 
    currentDisplayed = value;
    let metadata = await contract.tokenURI(value);
    metadata = metadata.replace("ipfs://","https://gateway.pinata.cloud/ipfs/");
    metadata = await $.getJSON(metadata);
    metadata.image = metadata.image.replace("ipfs://","https://gateway.pinata.cloud/ipfs/");
    galleryPage(imageSrc = metadata.image);
    displayMetadata(metadata);
}

const nextNFT = async () => {
    const signer = provider.getSigner();
    const contract = await new ethers.Contract(
        minter.address, minter.abi,
        signer
    );
    let value = currentDisplayed;
    let latestMinted = await contract.latestMinted();
    latestMinted = parseInt(latestMinted);
    if (currentDisplayed >= latestMinted | value < 0){
        value = 0;
    } else  {
        value = value + 1;
    } 
    currentDisplayed = value;
    let metadata = await contract.tokenURI(value);
    metadata = metadata.replace("ipfs://","https://gateway.pinata.cloud/ipfs/");
    metadata = await $.getJSON(metadata);
    metadata.image = metadata.image.replace("ipfs://","https://gateway.pinata.cloud/ipfs/");
    galleryPage(imageSrc = metadata.image);
    document.getElementById("metadata").innerHTML = metadata;
    displayMetadata(metadata);
}

function displayMetadata (metadata) {
    var attr = metadata.attributes;
    var attributes = ""
    for (let i = 0; i < attr.length; i++) {
        at = attr[i]
        attributes = attributes + at.trait_type + ": " + at.value + "<br>"
    }
    document.getElementById("metadata").innerHTML = "ID: " + metadata.name.replace("Raidooors","") + "<br>Attributes: <br>" + attributes; 
}

// App
SacraficeButton.addEventListener("click",sacraficePage);
galleryButton.addEventListener("click",function () {galleryPage(imageSrc = "images/selectRaidoor.png");
                                                    document.getElementById("metadata").innerHTML = ""; });
accountTokensButton.addEventListener("click", accountTokensPage);


