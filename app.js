const runApp = async () => {
  const { ethereum } = window;

  if (!ethereum) {
    console.log("Make sure you have metamask!");
    return;
  }

  const CONTRACT_ADDRESS = "0xF8Fcc6304f91F8b7ce9957B82AcA2e9B92bC4415";
  const rinkebyChainId = "0x4"; 
  let href = `https://rinkeby.rarible.com/collection/${CONTRACT_ADDRESS}`;
  let currentAccount = null;

  let collectionLink = document.querySelector('#collection-link');
  let connectBtn = document.querySelector('#connect-btn');
  let mintBtn = document.querySelector('#mint-btn');
  let warning = document.querySelector('#warning');
  let mintingMsg = document.querySelector('#minting-msg');
  let successMsg = document.querySelector('#success-msg');

  collectionLink.href = href;

  let chainId = await ethereum.request({ method: 'eth_chainId' });

  if (chainId !== rinkebyChainId) {
    warning.classList.toggle('hidden')
  }

  const instantiateContract = async () => {

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    let response = await fetch("./artifacts/contracts/CryptoPlanet.sol/CryptoPlanet.json");
    let data = await response.json();
    let ABI = data.abi;

    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    return connectedContract
  }

  const connectedContract = await instantiateContract()

  connectedContract.on("CryptoPlanetMinted", (from, tokenId) => {
    mintingMsg.classList.toggle('hidden')

    successMsg.innerHTML = `We've minted your NFT and sent it to your wallet. It may be blank right now. Here's the link: https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}`;

    successMsg.classList.remove('hidden')
    successMsg.classList.add('visible')
  });

  const setAccount = account => {
      currentAccount = account
      console.log("Connected to: ", "0xXXXXXXXXX...")
  }

  const toggleButtons = () => {
    connectBtn.classList.toggle("hidden")
    mintBtn.classList.toggle("visible")
  }
  
  const connectToWallet = async () => {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0])
    toggleButtons()
  }

  const askContractToMintNft = async () => {

    console.log("Going to pop wallet now to pay gas...")
    let nftTxn = await connectedContract.makeCryptoPlanet();

    mintingMsg.classList.toggle('hidden')
    successMsg.classList.remove('visible')
    successMsg.classList.add('hidden')

    await nftTxn.wait();
      
    console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
  }

  connectBtn.addEventListener('click', connectToWallet)
  mintBtn.addEventListener('click', askContractToMintNft)

  const accounts = await ethereum.request({ method: 'eth_accounts'});
  if (accounts.length != 0) {
    setAccount(accounts[0])
    toggleButtons()
  }
}
