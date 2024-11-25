const HealthcareDataNFT = artifacts.require("HealthcareDataNFT");

module.exports = function(deployer) {
  deployer.deploy(HealthcareDataNFT);
};
