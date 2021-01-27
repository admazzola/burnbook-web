/* eslint-disable */

//https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider
const tokenContractABI = require('../contracts/ERC20ABI.json')
const uniswapv2addabi = require('../contracts/uniswapv2add.json')
const uniswapv2removeabi = require('../contracts/uniswapv2remove.json')

const contractData = require('../contracts/Mainnet.json')
 
const BigNumber = require('bignumber.js');

const Web3 = require('web3');
const web3utils = Web3.utils;
//var max_target = web3utils.toBN( 2 ).pow( web3utils.toBN( 234 ) ) ;


var helper = {

  init(){
    console.log('init web3 helper')

    /**********************************************************/
    /* Handle chain (network) and chainChanged (per EIP-1193) */
    /**********************************************************/

    // Normally, we would recommend the 'eth_chainId' RPC method, but it currently
    // returns incorrectly formatted chain ID values.
    let currentChainId = window.ethereum.chainId;

    window.ethereum.on('chainChanged', handleChainChanged);

    function handleChainChanged(_chainId) {
      // We recommend reloading the page, unless you must do otherwise
      window.location.reload();
    }


    window.ethereum.on('accountsChanged', handleAccountsChanged);

      // For now, 'eth_accounts' will continue to always return an array
      function handleAccountsChanged(accounts) {
        window.location.reload();
      }

  },

  ethereumChainID()
  {
    return 0x1
  },
  maticChainID()
  {
    return 0x89
  },

  async getConnectedAccounts()
  {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts;
  },

  async getProviderNetworkID()
  {
    var net_id = await  window.ethereum.chainId;
    console.log('net id is', net_id)
    return net_id;
  },
  async getTokenContract(web3, contractAddress)
  {

    var tokenContract = new web3.eth.Contract(tokenContractABI,contractAddress)

    return tokenContract;
  },
  async getInvaderContractAddress()
  {

    var contractAddress = contractData.contracts.matic_network.InvaderToken.address;


    return contractAddress;
  },
  async getInvaderContract(web3)
  {

    var contractAddress = await this.getInvaderContractAddress()

    var contract =  new web3.eth.Contract(invaderContractABI,contractAddress)

    return contract;
  },
  async getAlienContractAddress()
  {

    var contractAddress = contractData.contracts.matic_network.AlienToken.address;


    return contractAddress;
  },
  async getAlienContract(web3)
  {

    var contractAddress = await this.getAlienContractAddress()

    var contract = new web3.eth.Contract(alienContractABI,contractAddress)

    return contract;
  },

  async getTokensAllowance(tokenAddress, ownerAddress, spender )
  {

    var web3 = new Web3(Web3.givenProvider);


    console.log('get token allowance', tokenAddress)
  //    var tokenContract = await this.getTokenContract(web3, tokenAddress);
    var tokenContract = new web3.eth.Contract(tokenContractABI,tokenAddress)



    console.log('meep',tokenContract,spender,ownerAddress)

    var allowance =0

     await new Promise((resolve, reject) => {

     tokenContract.methods.allowance( ownerAddress, spender).call( {}  )
      .then(function(result){
        console.log('we got ', result)
        allowance = result;
        resolve(result);
      })
      .catch(function(err){
        console.error(err)
        reject(err)
      })
    });


  //  console.log('get allowance .. promise',tokenAddress,spender,ownerAddress)
  //  var allowance = new Promise tokenContract.methods.allowance(spender,ownerAddress).call();
    console.log('allowance!!! ',allowance)
    return allowance;
  },


  async hasEnoughAllowance(acctAddress,spenderAddress,assetName,requestedDepositAmountFormatted)
  {
    console.log('hasEnoughAllowance',acctAddress,spenderAddress,assetName,requestedDepositAmountFormatted)

        var numApproved = await this.getTokensAllowance(CryptoAssets.assets[assetName]['MaticContract'], acctAddress ,spenderAddress)

        var numApprovedFormatted = this.rawAmountToFormatted(numApproved,CryptoAssets.assets[assetName]['Decimals'])

          console.log('num Approved ',assetName, numApproved)
          console.log('num Approved f ', numApprovedFormatted)

      return  ( parseFloat(numApprovedFormatted) >= parseFloat(requestedDepositAmountFormatted) )


  },
/*  async getTipjarTokensBalance( tokenAddress, ownerAddress)
  {

    var web3 = new Web3(Web3.givenProvider);


    var contractAddress = contractData.contracts.matic_network.InvaderToken.address;


    var tipjarContract = new web3.eth.Contract(invaderContractABI, contractAddress, {});


    var balance = await tipjarContract.methods.getBalance(tokenAddress,ownerAddress).call();

    return balance;
  },*/

  async getMaticTokensBalance(contractAddress, ownerAddress)
  {

    var web3 = new Web3(Web3.givenProvider);


    var tokenContract = new web3.eth.Contract(tokenContractABI, contractAddress, {});


    var balance = await tokenContract.methods.balanceOf(ownerAddress).call();

    return balance;
  },
  async getStakedInvaderBalance( ownerAddress)
  {

    var web3 = new Web3(Web3.givenProvider);

    var contractAddress = await this.getAlienContractAddress();

    var alienContract = new web3.eth.Contract(alienContractABI, contractAddress, {});


    var balance = await alienContract.methods.getStakedTokenBalance(ownerAddress).call();

    return balance;
  },
  async getYieldAvailable( ownerAddress)
  {

    var web3 = new Web3(Web3.givenProvider);

    var contractAddress = await this.getAlienContractAddress();

    var alienContract = new web3.eth.Contract(alienContractABI, contractAddress, {});


    var balance = await alienContract.methods.getYieldAvailable(ownerAddress).call();

    return balance;
  },

  rawAmountToFormatted(amount,decimals)
  {
    console.log('formatting',amount,decimals)
    return (amount * Math.pow(10,-1 * decimals)).toFixed(decimals);
  },

  formattedAmountToRaw(amountFormatted,decimals)
  {

    var multiplier = new BigNumber( 10 ).exponentiatedBy( decimals ) ;


    return multiplier.multipliedBy(amountFormatted).toFixed() ;
  },

  async connect()
  {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts
  },

  async disconnect()
  {
    console.log('disconnecting')
    const accounts = await window.ethereum.request({
     method: "eth_requestAccounts",
     params: [
       {
         eth_accounts: {}
       }
     ]
   });
   window.location.reload();
  }
}

export default helper
