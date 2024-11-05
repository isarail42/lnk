const { ethers } = require('ethers');
const prompt = require('prompt-sync')();
require('dotenv').config();

const RPC_URL = 'https://rpc-qnd-sepolia.inkonchain.com';
const CHAIN_ID = 763373;
const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const colors = require('colors');
function generateRandomAddress() {
  return ethers.Wallet.createRandom().address;
}
const figlet = require('figlet');


console.clear();
console.log(figlet.textSync('ZERO2HERO').rainbow);
console.log(' Welcome mấy thèn ML  !'.green);
console.log(' Telegram [https://t.me/zero2hero100x]'.red);


async function main() {
  const seedPhrases = JSON.parse(process.env.SEED_PHRASES || '[]');
  const privateKeys = JSON.parse(process.env.PRIVATE_KEYS || '[]');

  let wallets = [];
  seedPhrases.forEach((mnemonic) => {
    wallets.push(ethers.Wallet.fromPhrase(mnemonic.trim()));
  });
  privateKeys.forEach((privateKey) => {
    wallets.push(new ethers.Wallet(privateKey.trim()));
  });

  if (wallets.length === 0) {
    console.error('No wallets found');
    process.exit(1);
  }

  wallets = wallets.map((wallet) => wallet.connect(provider));

  const amountToSend = prompt('How much ETH do you want to send (in ETH): '.blue);
  const numAddresses = prompt('How many addresses do you want to send to: '.blue);

  const amountInWei = ethers.parseUnits(amountToSend, 'ether');
  const gasPrice = await provider.getFeeData().then((feeData) => feeData.gasPrice);

  const delayBetweenTransactions = 5000;

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`Wallet ${wallet.address} balance: ${balanceInEth} ETH`);

    if (parseFloat(balanceInEth) <= 0) {
      console.error(`Wallet ${wallet.address} has insufficient balance. Skipping transactions for this wallet.`);
      continue;
    }

    for (let j = 0; j < numAddresses; j++) {
      const randomAddress = generateRandomAddress();
      const tx = {
        to: randomAddress,
        value: amountInWei,
        gasLimit: 21000,
        gasPrice: gasPrice,
      };

      try {
        const txResponse = await wallet.sendTransaction(tx);
        console.log(`Sent ${amountToSend} ETH from ${wallet.address} to ${randomAddress}`.yellow);
        console.log(`Tx Hash: ${txResponse.hash}`.green);
      } catch (error) {
        console.error(`Failed to send transaction from ${wallet.address} to ${randomAddress}:`, error);
      }

      if (j < numAddresses - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenTransactions));
      }
    }

    if (i < wallets.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenTransactions));
    }
  }

  // Display logo at the end
  
}

main();
