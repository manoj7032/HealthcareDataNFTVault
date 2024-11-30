import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, getAddress } from "ethers";
import CryptoJS from "crypto-js";
import { uploadToIPFS } from "./utils/pinata";
import HealthcareDataNFT from "./artifacts/contracts/HealthcareDataNFT.json";
import "./App.css";

const App = () => {
  const [data, setData] = useState("");
  const [dataType, setDataType] = useState("");
  const [date, setDate] = useState("");
  const [provider, setProvider] = useState("");
  const [image, setImage] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [accessTokenId, setAccessTokenId] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [decryptionKey, setDecryptionKey] = useState("");
  const [userPrivateKey, setUserPrivateKey] = useState("");
  const [viewTokenId, setViewTokenId] = useState("");
  const [status, setStatus] = useState("");
  const [mintedData, setMintedData] = useState([]);

  const contractAddress = "0x4B21AB3cf2Fa252107c19dd367Ba2a7B9d8584f9"; // Replace with your deployed contract address

  // Fetch Minted Data
  const fetchMintedData = async () => {
    try {
      console.log("Fetching minted data...");
      const providerInstance = new BrowserProvider(window.ethereum);
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, providerInstance);
      const supply = await contract.totalSupply();
      console.log("Total supply:", supply);

      const minted = [];
      for (let i = 1; i <= supply; i++) {
        const metadata = await contract.getMetadata(i);
        console.log(`Fetched metadata for Token ID ${i}:`, metadata);
        minted.push({ tokenId: i, metadata });
      }
      setMintedData(minted);
      console.log("Minted data updated:", minted);
    } catch (error) {
      console.error("Error fetching minted data:", error.message);
    }
  };

   // Handle Image Upload
  //  const handleImageUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) {
  //     alert("Please select an image.");
  //     return;
  //   }

  //   setStatus("Uploading image to IPFS...");
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const ipfsUrl = await uploadToIPFS(formData);
  //     setImage(ipfsUrl);
  //     setStatus("Image uploaded successfully!");
  //   } catch (error) {
  //     console.error("Error uploading image:", error.message);
  //     setStatus("Failed to upload image.");
  //   }
  // };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select an image.");
      return;
    }
  
    setStatus("Uploading image to IPFS...");
    const formData = new FormData();
    formData.append("file", file); // Append the file to FormData
  
    try {
      const ipfsUrl = await uploadToIPFS(formData); // Upload file to IPFS
      setImage(ipfsUrl);
      setStatus("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error.message);
      setStatus("Failed to upload image.");
    }
  };
  

  // Mint NFT
  const handleMintNFT = async () => {
    if (!tokenId || !data || !dataType || !date || !provider || !image) {
      alert("Please fill out all fields and upload an image.");
      return;
    }

    console.log("Starting NFT minting process...");
    setStatus("Encrypting data...");
    const encryptionKey = "encryption-key"; // Replace with a securely generated key in production
    const encryptedData = CryptoJS.AES.encrypt(data, encryptionKey).toString();
    console.log("Encrypted healthcare data:", encryptedData);

    setStatus("Uploading data to IPFS...");
    const ipfsUrl = await uploadToIPFS({ healthcareData: encryptedData });
    console.log("Uploaded to IPFS. URL:", ipfsUrl);

    setStatus("Minting NFT...");
    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const signer = await providerInstance.getSigner();
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, signer);

      console.log("Minting with Token ID:", tokenId);
      const tx = await contract.mintNFT(parseInt(tokenId), dataType, date, provider, ipfsUrl, image);
      await tx.wait();

      setStatus(`NFT minted successfully! IPFS URL: ${ipfsUrl}`);
      console.log("NFT minted successfully.");
      fetchMintedData(); // Update minted data
    } catch (error) {
      console.error("Minting error:", error.message);
      setStatus("Failed to mint NFT.");
    }
  };

  // Grant Access
  const handleGrantAccess = async () => {
    if (!accessTokenId || !userAddress || !decryptionKey) {
      alert("Token ID, user address, and decryption key are required.");
      return;
    }

    console.log("Starting grant access process...");
    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const signer = await providerInstance.getSigner();
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, signer);

      const owner = await contract.ownerOf(accessTokenId);
      const connectedAddress = await signer.getAddress();
      console.log(`Owner of Token ID ${accessTokenId}:`, owner);
      console.log(`Connected Address:`, connectedAddress);

      if (owner.toLowerCase() !== connectedAddress.toLowerCase()) {
        alert("You are not the owner of this token. Only the token owner can grant access.");
        return;
      }

      const validatedAddress = getAddress(userAddress);
      const encryptedKey = CryptoJS.AES.encrypt(decryptionKey, validatedAddress).toString();
      console.log("Encrypted Key for Access:", encryptedKey);

      setStatus("Granting access...");
      const tx = await contract.grantAccess(accessTokenId, validatedAddress, encryptedKey);
      await tx.wait();

      setStatus(`Access granted for Token ID: ${accessTokenId} to ${validatedAddress}`);
      console.log("Access granted successfully.");
    } catch (error) {
      console.error("Grant access error:", error.message);
      setStatus("Failed to grant access.");
    }
  };

  // Revoke Access
  const handleRevokeAccess = async () => {
    if (!accessTokenId || !userAddress) {
      alert("Token ID and user address are required.");
      return;
    }

    console.log("Starting revoke access process...");
    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const signer = await providerInstance.getSigner();
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, signer);

      const validatedAddress = getAddress(userAddress);
      console.log("Revoking access for Address:", validatedAddress);

      const tx = await contract.revokeAccess(accessTokenId, validatedAddress);
      await tx.wait();

      setStatus(`Access revoked for Token ID: ${accessTokenId} from ${validatedAddress}`);
      console.log("Access revoked successfully.");
    } catch (error) {
      console.error("Revoke access error:", error.message);
      setStatus("Failed to revoke access.");
    }
  };

  // View Healthcare Data
  const viewHealthcareDataWithAccess = async () => {
    if (!viewTokenId || !userPrivateKey) {
      alert("Token ID and user private key are required.");
      return;
    }
  
    console.log("Starting view healthcare data process...");
    setStatus("Fetching encrypted key...");
    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, providerInstance);
  
      const encryptedKey = await contract.getEncryptedKey(viewTokenId, userAddress); // Fetch key specific to user
      console.log("Fetched Encrypted Key:", encryptedKey);
  
      const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, userPrivateKey).toString(CryptoJS.enc.Utf8);
      console.log("Decrypted Key:", decryptedKey);
  
      setStatus("Fetching metadata...");
      const metadata = await contract.getMetadata(viewTokenId);
      console.log("Fetched Metadata:", metadata);
  
      //const ipfsHash = metadata[3]; // Extract IPFS hash
      const [dataType, date, provider, ipfsHash, imageUrl] = metadata;
      console.log("Fetching data from IPFS URL:", ipfsHash);
      const encryptedData = await fetchFromIPFS(ipfsHash); // Fetch encrypted data from IPFS
      console.log("Encrypted Data from IPFS:", encryptedData);
  
      const healthcareData = decryptData(JSON.parse(encryptedData).healthcareData, decryptedKey); // Decrypt data
      if (healthcareData) {
        alert(`Healthcare Data:\n${healthcareData}`);
        setStatus("Healthcare Data Retrieved Successfully!");
        // Display image
        document.getElementById("image-display").src = imageUrl;
      } else {
        setStatus("Failed to decrypt healthcare data.");
      }
    } catch (error) {
      console.error("View data error:", error.message);
      setStatus("Failed to retrieve healthcare data.");
    }
  };
  
  // Fetch from IPFS
  const fetchFromIPFS = async (ipfsHash) => {
    try {
      const cleanHash = ipfsHash.startsWith("https://") ? ipfsHash.split("/ipfs/")[1] : ipfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
      console.log("Fetching data from IPFS URL:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS. Status: ${response.status}`);
      }

      const encryptedData = await response.text();
      console.log("Encrypted Data from IPFS:", encryptedData);
      return encryptedData;
    } catch (error) {
      console.error("Error fetching from IPFS:", error.message);
      throw error;
    }
  };

  // Decrypt Data
  // const decryptData = (encryptedData, decryptionKey) => {
  //   try {
  //     const bytes = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
  //     const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  //     console.log("Decrypted Healthcare Data:", decryptedData);
  //     return decryptedData;
  //   } catch (error) {
  //     console.error("Error decrypting data:", error.message);
  //     return null;
  //   }
  // };
  const decryptData = (encryptedData, decryptionKey) => {
    try {
      console.log("Decrypting with key:", decryptionKey);
      const bytes = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedData) {
        throw new Error("Decryption resulted in empty data");
      }
      console.log("Decrypted Healthcare Data:", decryptedData);
      return decryptedData;
    } catch (error) {
      console.error("Error decrypting data:", error.message);
      return null;
    }
  };
  

  useEffect(() => {
    fetchMintedData();
  }, []);

  return (
//     <div>
//       <h1>Healthcare Data NFT Vault</h1>
//       {/* Mint Healthcare NFT Section */}
//       <input type="text" placeholder="Token ID" onChange={(e) => setTokenId(e.target.value)} />
//       <input type="text" placeholder="Data Type (e.g., X-ray)" onChange={(e) => setDataType(e.target.value)} />
//       <input type="text" placeholder="Date (YYYY-MM-DD)" onChange={(e) => setDate(e.target.value)} />
//       <input type="text" placeholder="Provider (e.g., XYZ Hospital)" onChange={(e) => setProvider(e.target.value)} />
//       <textarea placeholder="Enter healthcare data" onChange={(e) => setData(e.target.value)} />
//       <button onClick={handleMintNFT}>Mint Healthcare NFT</button>
//       {/* Components */}
//       {/* Access Control Section */}
//       <h2>Access Control</h2>
//       <input type="text" placeholder="Token ID" onChange={(e) => setAccessTokenId(e.target.value)} />
//       <input type="text" placeholder="User Address (e.g., 0x123...)" onChange={(e) => setUserAddress(e.target.value)} />
//       <input type="text" placeholder="Decryption Key" onChange={(e) => setDecryptionKey(e.target.value)} />
//       <button onClick={handleGrantAccess}>Grant Access</button>
//       <button onClick={handleRevokeAccess}>Revoke Access</button>
//       {/* View Healthcare Data Section */}
//       <h2>View Healthcare Data</h2>
//       <input type="text" placeholder="Token ID" onChange={(e) => setViewTokenId(e.target.value)} />
//       <input type="text" placeholder="User Private Key" onChange={(e) => setUserPrivateKey(e.target.value)} />
//       <button onClick={viewHealthcareDataWithAccess}>View Healthcare Data</button>
//       {/* Minted Data Section */}
//       <h2>Minted Data</h2>
//       <ul>
//         {mintedData.map((item) => (
//           <li key={item.tokenId}>
//             Token ID: {item.tokenId}, Metadata: {JSON.stringify(item.metadata)}
//           </li>
//         ))}
//         </ul>
//       <p>{status}</p>
//     </div>
//   );
// };

// export default App;
<div className="app-container">
<header className="app-header">
  <h1>Healthcare Data NFT Vault</h1>
</header>

<main>
  {/* Mint Healthcare NFT Section */}
  <section className="card">
    <h2>Mint Healthcare NFT</h2>
    <div className="form-group">
      <input type="text" placeholder="Token ID" onChange={(e) => setTokenId(e.target.value)} />
      <input type="text" placeholder="Data Type (e.g., X-ray)" onChange={(e) => setDataType(e.target.value)} />
      <input type="date" onChange={(e) => setDate(e.target.value)} />
      <input type="text" placeholder="Provider (e.g., XYZ Hospital)" onChange={(e) => setProvider(e.target.value)} />
      <textarea placeholder="Enter healthcare data" onChange={(e) => setData(e.target.value)}></textarea>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <button className="primary-button" onClick={handleMintNFT}>Mint Healthcare NFT</button>
    </div>
  </section>

  {/* Access Control Section */}
  <section className="card">
    <h2>Access Control</h2>
    <div className="form-group">
      <input type="text" placeholder="Token ID" onChange={(e) => setAccessTokenId(e.target.value)} />
      <input type="text" placeholder="User Address (e.g., 0x123...)" onChange={(e) => setUserAddress(e.target.value)} />
      <input type="text" placeholder="Decryption Key" onChange={(e) => setDecryptionKey(e.target.value)} />
      <div className="button-group">
        <button className="primary-button" onClick={handleGrantAccess}>Grant Access</button>
        <button className="secondary-button" onClick={handleRevokeAccess}>Revoke Access</button>
      </div>
    </div>
  </section>

  {/* View Healthcare Data Section */}
  <section className="card">
    <h2>View Healthcare Data</h2>
    <div className="form-group">
      <input type="text" placeholder="Token ID" onChange={(e) => setViewTokenId(e.target.value)} />
      <input type="text" placeholder="User Private Key" onChange={(e) => setUserPrivateKey(e.target.value)} />
      <button className="primary-button" onClick={viewHealthcareDataWithAccess}>View Healthcare Data</button>
    </div>
    <img id="image-display" alt="Healthcare Data" className="image-display" />
  </section>

  {/* Minted Data Section */}
  <section className="card">
    <h2>Minted Data</h2>
    <ul className="minted-data">
      {mintedData.map((item) => (
        <li key={item.tokenId}>
          <strong>Token ID:</strong> {item.tokenId}, <strong>Metadata:</strong> {JSON.stringify(item.metadata)}
        </li>
      ))}
    </ul>
  </section>

  <p className="status-message">{status}</p>
</main>
</div>
);
};

export default App;
