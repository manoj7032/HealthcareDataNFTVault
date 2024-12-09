# Healthcare Data NFT Vault

## Team Members:
| Name                          | CWID       | Email                             |
|-------------------------------|------------|-----------------------------------|
| Venkata Abhinav Karthik Pulikonda | 885210294 | abhinavpulikonda@csu.fullerton.edu |
| Manoj Gangavarapu             | 885164319  | manojgangavarapu@csu.fullerton.edu |
| Sai Satya Jagannadh Doddipatla| 885177436  | saijagannadh@csu.fullerton.edu     |
| Rakesh Puppala                | 885175919  | rakeshpuppala2591@csu.fullerton.edu |

---

## Project Description
The **Healthcare Data NFT Vault** leverages blockchain technology to securely tokenize sensitive healthcare data. The project enables users to encrypt and transform their healthcare data into Non-Fungible Tokens (NFTs), store the encrypted data on the InterPlanetary File System (IPFS), and manage access permissions using Ethereum smart contracts.

---

## Project Overview

### Accomplishments:

1. **Smart Contract Development**:
   - Created core functionalities in Solidity for NFT minting, access granting, and revocation.
   - Integrated validations for token ownership and unique token IDs to enhance security.

2. **Frontend Development**:
   - Built a React-based interface for seamless user interaction.
   - Improved UI/UX with a simple, intuitive design.

3. **IPFS Integration**:
   - Integrated Pinata for storing encrypted healthcare data on IPFS.
   - Implemented encryption and decryption using CryptoJS to ensure data privacy.

4. **Access Control**:
   - Developed robust mechanisms for access control, enabling users to grant/revoke access to specific tokens.
   - Ensured only token owners can manage permissions through additional validations.

5. **Data Viewing**:
   - Implemented secure processes for authorized users to decrypt and view data.
   - Added detailed logging and error handling for a smooth user experience.

6. **Testing and Validation**:
   - Conducted comprehensive testing for all features, including minting, access granting, and decryption.
   - Fixed bugs related to user validation and decryption processes.

7. **Holesky Testnet Integration**:
   - Utilized the Holesky Testnet for testing in a blockchain environment, providing a better alternative to localhost.

---

### Features

#### 1. Patient Data Minting
- Tokenize sensitive patient data into Non-Fungible Tokens (NFTs).
- Mint NFTs with the following attributes:
  - **Token ID**: A unique identifier for each NFT.
  - **Data Type**: The type of healthcare data (e.g., Bloodwork, X-ray, MRI).
  - **Date**: The date of record entry or diagnosis.
  - **Provider**: The name of the healthcare provider or institution.
  - **Encrypted Healthcare Data**: Encrypted sensitive information to ensure privacy.
  - **Image**: Upload relevant healthcare images or reports (e.g., X-rays or MRI scans).
- **Encryption Mechanism**:
  - Uses CryptoJS to encrypt patient data before uploading it to the InterPlanetary File System (IPFS).
  - Ensures that only authorized users with the decryption key can access the data.

#### 2. Secure Storage on IPFS
- Leverages the Pinata API to securely store encrypted healthcare data on the decentralized IPFS network.
- Links the NFT metadata (such as `dataType`, `date`, `provider`, and `imageUrl`) to the IPFS hash for secure referencing.
- Ensures that sensitive data is not stored on-chain, reducing gas costs and improving privacy.

#### 3. Access Control Management
- Provides robust mechanisms for granting and revoking access to NFTs:
  - **Grant Access**:
    - Token owners can securely grant access to other users (e.g., doctors) by providing an encrypted key specific to the recipient.
    - Emits an `AccessGranted` event on the blockchain for traceability.
  - **Revoke Access**:
    - Token owners can revoke previously granted access.
    - Deletes the encrypted access key and emits an `AccessRevoked` event for accountability.
- Validates that only token owners can manage permissions.
- Keeps a record of all users with access permissions for specific tokens.

#### 4. Data Viewing and Decryption
- Allows authorized users to decrypt and view healthcare data securely:
  - Verifies access permissions using encrypted keys stored on-chain.
  - Fetches encrypted healthcare data from IPFS.
  - Decrypts the data using the user's private decryption key.
- Provides a seamless and user-friendly interface for authorized users to view the following:
  - **Healthcare Data Details**: Token ID, data type, date, provider, and encrypted data.
  - **Uploaded Images**: Displays medical images or reports linked to the NFT.

#### 5. User-Friendly Interface
- Built with React.js for a seamless and interactive user experience:
  - **Patient Data Entry Tab**: Mint NFTs and upload data.
  - **Access Control Tab**: Manage access permissions (grant or revoke access).
  - **Doctor View Tab**: View and decrypt healthcare data securely.
  - **Records Overview Tab**: View statistics and metadata of all minted records.
  - **Privacy Laws Tab**: Educates users on healthcare data privacy regulations (e.g., HIPAA, GDPR, HITECH Act).

#### 6. Comprehensive Statistics and Insights
- Provides a detailed overview of NFT records:
  - Total number of NFTs minted.
  - Breakdown by data type (e.g., X-ray, Bloodwork, etc.).
  - Records grouped by provider and date.
- Offers data insights using visual analytics to track healthcare record trends.

#### 7. Compliance with Privacy Regulations
- Designed with privacy laws and compliance in mind:
  - Ensures healthcare data is encrypted and accessible only to authorized users.
  - Meets key requirements of regulations like HIPAA, GDPR, and HITECH Act.

#### 8. Integration with Ethereum Blockchain
- Utilizes Ethereum smart contracts to ensure immutability and transparency.
- Supports interactions via MetaMask for seamless blockchain connectivity.
- Deployable on local Ethereum test networks (e.g., Ganache) or public testnets (e.g., Holesky Testnet).

#### 9. Holesky Testnet Integration
- Offers a test environment for blockchain deployment and testing.
- Enables users to interact with smart contracts on a public blockchain without incurring real gas fees.

#### 10. Robust Error Handling and Validation
- Implements detailed logging and error handling for smooth user experience:
  - Detects and resolves decryption issues.
  - Validates token ownership and access permissions.
  - Handles RPC errors and MetaMask integration seamlessly.

---

## Project Structure
1. **Smart Contracts**: For NFT minting, access control, and data management.
2. **IPFS Integration**: For securely storing encrypted data.
3. **Frontend with React**: To manage user interaction and permission settings.
4. **Encryption**: Data is encrypted before storage on IPFS to ensure privacy.
5. **Access Control**: Access is given to the Doctor's address with the encryption key.
6. **Decryption**: Data is decrypted and viewed by the Doctor.

---

## Setup and Run the Project

### Prerequisites
- Node.js and npm installed
- Ganache or an Ethereum-compatible development blockchain
- MetaMask browser extension
- API credentials for Pinata

### Steps:

1. **Clone the Repository**:
```bash
git clone https://github.com/your-repo/healthcare-data-nft-vault.git
cd healthcare-data-nft-vault
```

2. **Install Dependencies**:
```bash
npm install
npm install -g truffle
npm install dotenv
npm install @truffle/hdwallet-provider
```

3. **Set Up Ganache Workspace**:
   - Open Ganache and create a new workspace.
   - Add the `truffle-config.js` file from the project to the workspace.
   - Start the workspace.

4. **Deploy Smart Contracts**:
```bash
cd contracts
truffle migrate --reset
```
   - Note down the deployed contract address (`HealthcareDataNFT`).
   - Update these addresses in `App.js`:
```javascript
const contractAddress = "Update your Contract address";
```

5. **Configure Pinata**:
   - Sign up for a Pinata account and obtain your API credentials.
   - Update `pinata.js` utility with the following:
```javascript
const PINATA_API_KEY = "Your_Pinata_API_Key";
const PINATA_API_SECRET = "Your_Pinata_API_Secret";
```

6. **Frontend Setup**:
```bash
cd client
npm install crypto-js
npm install ethers ipfs-http-client crypto-js
npm install @pinata/sdk
npm install axios
npm install lucide-react
npm install chart.js
npm install react-chartjs-2
npm start
```
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

7. **MetaMask Setup**:
   - Install MetaMask extension in your browser if not already installed.
   - Create a new network in MetaMask with the following details:
     - **Network Name**: Localhost 8545
     - **RPC URL**: `http://127.0.0.1:7545`
     - **Chain ID**: 1337
     - **Currency Symbol**: ETH
   - Import accounts using private keys from Ganache:
   - Go to Ganache > Accounts > Private Key.
   - Use these keys to import accounts in MetaMask.

8. **Mint Patient Data and Grant Access**:
   1. Use the Patient Data Entry tab in the frontend to mint NFTs by filling out all fields.
   2. Go to the Patient Data Entry tab in the application.
   3. Fill in the required fields:
      - **Name**
      - **Age**
      - **Token ID**
      - **Data Type** (e.g., Bloodwork, X-Ray, etc.)
      - **Date**
      - **Provider Name**
      - **Healthcare Data Description**
   4. Upload an image for the healthcare data.
   5. Click **Mint NFT** to tokenize the data.

9. **Grant Access**:
   1. Switch to the Access Control tab in the application.
   2. Enter the Token ID and the address of the user (doctor) you want to grant access to.
   3. Enter the decryption key for the data.
   4. Click **Grant Access**.

10. **View Healthcare Data**:
    - Switch to the Doctor View tab in the application.
    - Enter the Token ID and the private key of the user to decrypt the data.
    - Click View Healthcare Data to view the details securely.

11. **Set Up Holesky in Metamask**:
   - Open MetaMask
   - Add the Holesky Testnet:
     - **Network Name**: Holesky Testnet
     - **New RPC URL**: `https://holesky.infura.io/v3/YOUR_INFURA_PROJECT_ID`
     - **Chain ID**: 17000
     - **Currency Symbol**: ETH
     - **Block Explorer URL**: `https://holesky.etherscan.io/`
   - Save the Network Configuration

---

## Issues, Challenges, and Questions

- **Encryption and Decryption**:
  - Debugged issues with malformed decryption keys by improving validation and logging mechanisms.

- **Smart Contract Integration**:
  - Resolved challenges in granting access by adding proper validations in both smart contracts and the front end.

- **UI Enhancements**:
  - Iterated designs to create a more user-friendly and responsive interface.

- **Blockchain Gas Fees**:
  - Considered potential deployment issues related to high gas fees.

---

## Troubleshooting and Tips

- **Error**: MetaMask - RPC Error: Ensure that the RPC URL in Ganache and MetaMask match.
- **Decryption issues**: Check that the correct decryption key is provided.
- **Contract deployment issues**: Ensure Ganache is running before deploying the smart contracts.
- **IPFS upload errors**: Double-check Pinata API Key and Secret configuration.

---

## Live Demo
*(Insert live demo video link here)*
