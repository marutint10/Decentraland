const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with ${deployer.address} on Goerli testnet`);

  const RealEstate = await ethers.getContractFactory("RealEstate");
  const realEstate = await RealEstate.deploy();
  await realEstate.deployed();

  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`);
  console.log(`Minting 3 properties...\n`);

  for (let i = 0; i < 3; i++) {
    const transaction = await realEstate
      .connect(deployer)
      .mint(
        `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${
          i + 1
        }.json`
      );
    await transaction.wait();
  }

  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    realEstate.address,
    deployer.address,
    deployer.address,
    deployer.address
  );
  await escrow.deployed();

  console.log(`Deployed Escrow Contract at: ${escrow.address}`);
  console.log(`Listing 3 properties...\n`);

  for (let i = 0; i < 3; i++) {
    let transaction = await realEstate
      .connect(deployer)
      .approve(escrow.address, i + 1);
    await transaction.wait();
  }

  transaction = await escrow
    .connect(deployer)
    .list(1, deployer.address, tokens(20), tokens(10));
  await transaction.wait();

  transaction = await escrow
    .connect(deployer)
    .list(2, deployer.address, tokens(15), tokens(5));
  await transaction.wait();

  transaction = await escrow
    .connect(deployer)
    .list(3, deployer.address, tokens(10), tokens(5));
  await transaction.wait();

  console.log(`Finished.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
