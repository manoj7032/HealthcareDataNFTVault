import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, getAddress } from 'ethers';
import CryptoJS from 'crypto-js';
import { uploadToIPFS } from './utils/pinata';
import DataInsights from './DataInsights';
import MedicalReferences from './MedicalReferences';
import { useCallback } from 'react';
import RecordsOverview from './RecordsOverview';
import PatientDataEntry from './PatientDataEntry';
import HealthcareDataNFT from './artifacts/contracts/HealthcareDataNFT.json';
import {  
  AlertCircle, 
  FileCheck,  
  Eye 
} from 'lucide-react';
import './App.css';
import cbcImage from './images/cbc.jpeg';
import bmpImage from './images/bmp.jpeg';
import chestXrayImage from './images/chest-xray.png';
import brainMriImage from './images/brain-mri.jpeg';


const App = () => {
  const [activeTab, setActiveTab] = useState('patient');
  const [data, setData] = useState('');
  const [dataType, setDataType] = useState('');
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [provider, setProvider] = useState('');
  const [image, setImage] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [accessTokenId, setAccessTokenId] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [decryptionKey, setDecryptionKey] = useState('');
  const [userPrivateKey, setUserPrivateKey] = useState('');
  const [viewTokenId, setViewTokenId] = useState('');
  const [status, setStatus] = useState('');
  const [mintedData, setMintedData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [recordsStats, setRecordsStats] = useState({
    total: 0,
    byType: {},
    byProvider: {},
    byMonth: {}
  });

  const contractAddress = '0x3972872407F2BB22dCc996f66447d45a0b4D1062';

  const medicalReferences = {
    BloodWork: [
      {
        test: 'Complete Blood Count (CBC)',
        range: 'WBC: 4,500-11,000/µL\nRBC: 4.5-5.9 million/µL\nHemoglobin: 13.5-17.5 g/dL (male), 12.0-15.5 g/dL (female)',
        explanation: 'CBC measures the levels of different blood cells, which can indicate infections, anemia, or other conditions.',
        unit: 'µL / g/dL',
        image: cbcImage, 
      },
      {
        test: 'Basic Metabolic Panel',
        range: 'Glucose: 70-99 mg/dL (fasting)\nCalcium: 8.5-10.5 mg/dL\nSodium: 135-145 mEq/L',
        explanation: 'Measures essential chemicals in the blood to monitor organ function and overall health.',
        unit: 'mg/dL / mEq/L',
        image: bmpImage, 
      },
    ],
    xray: [
      {
        test: 'Chest X-ray',
        range: 'PA view: 35-40 cm width\nLateral view: 25-35 cm depth',
        explanation: 'Used to diagnose conditions affecting the lungs, heart, and chest.',
        image: chestXrayImage, 
      },
    ],
    mri: [
      {
        test: 'Brain MRI',
        range: 'T1 relaxation time: 240-1400 ms\nT2 relaxation time: 40-200 ms',
        explanation: 'MRI uses magnetic fields to create detailed images of the brain.',
        unit: 'ms',
        image: brainMriImage, 
      },
    ],
  };
  
  

  const privacyLaws = [
    {
      name: 'HIPAA (Health Insurance Portability and Accountability Act)',
      key_points: [
        'Patient rights to access their health information',
        'Security measures for protecting health information',
        'Privacy of individually identifiable health information',
        'Breach notification requirements',
        'Penalties for violations'
      ]
    },
    {
      name: 'GDPR (General Data Protection Regulation) Healthcare Implications',
      key_points: [
        'Explicit consent for data processing',
        'Right to data portability',
        'Right to be forgotten',
        'Data protection by design',
        '72-hour breach notification'
      ]
    },
    {
      name: 'HITECH Act',
      key_points: [
        'Enhanced privacy and security protections',
        'Increased penalties for violations',
        'Promotion of EHR adoption',
        'Breach notification requirements',
        'Patient access to electronic health records'
      ]
    }
  ];

  const calculateRecordsStats = useCallback(() => {
    const stats = {
      total: mintedData.length,
      byType: {},
      byProvider: {},
      byMonth: {},
    };
  
    mintedData.forEach((item) => {
      const type = item.metadata[0];
      const provider = item.metadata[2];
      const date = new Date(item.metadata[1]);
  
      if (isNaN(date.getTime())) return;
  
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;
      stats.byMonth[monthYear] = (stats.byMonth[monthYear] || 0) + 1;
    });
  
    setRecordsStats(stats);
  }, [mintedData]);
  
  
  

  // const fetchMintedData = useCallback(async () => {
  //   try {
  //     const providerInstance = new BrowserProvider(window.ethereum);
  //     const contract = new Contract(contractAddress, HealthcareDataNFT.abi, providerInstance);
  //     const supply = await contract.totalSupply();
  
  //     const minted = [];
  //     for (let i = 1; i <= supply; i++) {
  //       const metadata = await contract.getMetadata(i);
  //       minted.push({ tokenId: i, metadata });
  //     }
  //     setMintedData(minted);
  //     calculateRecordsStats();
  //   } catch (error) {
  //     console.error('Error fetching minted data:', error.message);
  //   }
  // }, [contractAddress, calculateRecordsStats]); // Dependencies
  const fetchMintedData = useCallback(async () => {
    try {
      console.log("Fetching minted data...");
      const providerInstance = new BrowserProvider(window.ethereum);
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, providerInstance);
  
      // Check if contract is connected properly
      if (!contract) {
        throw new Error("Contract instance is not available.");
      }
  
      const supply = await contract.totalSupply();
      console.log("Total supply:", supply);
  
      const minted = [];
      for (let i = 1; i <= supply; i++) {
        const metadata = await contract.getMetadata(i);
        minted.push({ tokenId: i, metadata });
      }
  
      setMintedData(minted);
      calculateRecordsStats();
    } catch (error) {
      console.error("Error fetching minted data:", error.message);
      setStatus("Failed to fetch minted data. Check the contract implementation.");
    }
  }, [contractAddress, calculateRecordsStats]);

  // const fetchMintedData = useCallback(async () => {
  //   try {
  //     console.log("Fetching minted data...");
  //     const providerInstance = new BrowserProvider(window.ethereum);
  //     const contract = new Contract(contractAddress, HealthcareDataNFT.abi, providerInstance);
  
  //     // Fetch total supply
  //     const supply = await contract.totalSupply();
  //     console.log("Total supply:", supply.toString());
  
  //     const minted = [];
  //     for (let i = 1; i <= supply; i++) {
  //       const metadata = await contract.getMetadata(i);
  //       minted.push({ tokenId: i, metadata });
  //     }
  
  //     // Update state only if the fetched data is different
  //     setMintedData((prevData) => {
  //       if (JSON.stringify(prevData) !== JSON.stringify(minted)) {
  //         return minted;
  //       }
  //       return prevData; // Prevent unnecessary re-renders
  //     });
  //   } catch (error) {
  //     console.error("Error fetching minted data:", error.message);
  //     setStatus("Failed to fetch minted data. Check contract deployment and ABI.");
  //   }
  // }, [contractAddress, calculateRecordsStats]);
  
  

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert('Please select an image.');
      return;
    }
  
    setStatus('Uploading image to IPFS...');
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const ipfsUrl = await uploadToIPFS(formData);
      setImage(ipfsUrl);
      setStatus('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error.message);
      setStatus('Failed to upload image.');
    }
  };

  const handleMintNFT = async () => {
    if (!tokenId || !data || !dataType || !date || !provider || !image || !name || !age || !gender) {
      alert('Please fill out all fields and upload an image.');
      return;
    }
  
    // Generate a random decryption key
    const generateRandomKey = () => {
      const array = new Uint8Array(16); // 16 bytes = 128 bits
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };
  
    const decryptionKey = generateRandomKey();
    console.log("Generated Decryption Key:", decryptionKey);
    setDecryptionKey(decryptionKey); // Store it in the state if needed
  
    setStatus('Encrypting data...');
  
    // Encrypt healthcare data
    const patientDetails = { name, age, gender };
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify({ healthcareData: data, patientDetails }),
      decryptionKey
    ).toString();
    console.log("Encrypted Healthcare Data:", encryptedData);
  
    // Upload encrypted data to IPFS
    setStatus('Uploading encrypted data to IPFS...');
    try {
      const ipfsUrl = await uploadToIPFS({ encryptedData });
      console.log("Encrypted Data IPFS URL:", ipfsUrl);
  
      // Mint the NFT
      setStatus('Minting NFT...');
      const providerInstance = new BrowserProvider(window.ethereum);
      const signer = await providerInstance.getSigner();
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, signer);
  
      const tx = await contract.mintNFT(
        parseInt(tokenId),
        dataType,
        date,
        provider,
        ipfsUrl,
        image
      );
      await tx.wait();
  
      setStatus(`NFT minted successfully! Token ID: ${tokenId}, IPFS URL: ${ipfsUrl}`);
      alert(`Please save this decryption key securely: ${decryptionKey}`);
      fetchMintedData();
    } catch (error) {
      console.error('Error during NFT minting:', error.message);
      setStatus('Failed to mint NFT.');
    }
  };
  
  
  
  

  const handleGrantAccess = async () => {
    if (!accessTokenId || !userAddress || !decryptionKey) {
      alert('Token ID, user address, and decryption key are required.');
      return;
    }

    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const signer = await providerInstance.getSigner();
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, signer);

      const owner = await contract.ownerOf(accessTokenId);
      const connectedAddress = await signer.getAddress();

      if (owner.toLowerCase() !== connectedAddress.toLowerCase()) {
        alert('You are not the owner of this token. Only the token owner can grant access.');
        return;
      }

      const validatedAddress = getAddress(userAddress);
      const encryptedKey = CryptoJS.AES.encrypt(decryptionKey, validatedAddress).toString();

      setStatus('Granting access...');
      const tx = await contract.grantAccess(accessTokenId, validatedAddress, encryptedKey);
      await tx.wait();

      setStatus(`Access granted for Token ID: ${accessTokenId} to ${validatedAddress}`);
    } catch (error) {
      console.error('Grant access error:', error.message);
      setStatus('Failed to grant access.');
    }
  };

  const handleRevokeAccess = async () => {
    if (!accessTokenId || !userAddress) {
      alert('Token ID and user address are required.');
      return;
    }

    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const signer = await providerInstance.getSigner();
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, signer);

      const validatedAddress = getAddress(userAddress);

      const tx = await contract.revokeAccess(accessTokenId, validatedAddress);
      await tx.wait();

      setStatus(`Access revoked for Token ID: ${accessTokenId} from ${validatedAddress}`);
    } catch (error) {
      console.error('Revoke access error:', error.message);
      setStatus('Failed to revoke access.');
    }
  };

  const viewHealthcareDataWithAccess = async (tokenId = viewTokenId) => {
    if (!tokenId || !userPrivateKey) {
      setError("Both Token ID and Private Key are required to view healthcare data.");
      return;
    }
  
    setLoading(true);
    setError("");
    setStatus("Fetching healthcare data...");
  
    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, providerInstance);
  
      console.log("Fetching encrypted key from the contract...");
      const encryptedKey = await contract.getEncryptedKey(tokenId, userAddress);
  
      if (!encryptedKey) {
        throw new Error("No encrypted key found for the provided Token ID.");
      }
  
      console.log("Decrypting the access key...");
      const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, userPrivateKey).toString(CryptoJS.enc.Utf8);
  
      if (!decryptedKey) {
        throw new Error("Failed to decrypt the access key. Check your private key.");
      }
      console.log("Decrypted Access Key:", decryptedKey);
  
      console.log("Fetching metadata for Token ID:", tokenId);
      const metadata = await contract.getMetadata(tokenId);
  
      if (!metadata || metadata.length < 4) {
        throw new Error("Invalid metadata retrieved from the contract.");
      }
  
      const [dataType, date, provider, ipfsHash, imageUrl] = metadata;
  
      console.log("Fetching healthcare data from IPFS...");
      const ipfsResponse = await fetchFromIPFS(ipfsHash);
  
      if (!ipfsResponse) {
        throw new Error("Failed to fetch data from IPFS. Check the IPFS hash.");
      }
  
      const ipfsData = JSON.parse(ipfsResponse);
      const encryptedData = ipfsData.encryptedData || ipfsData.healthcareData;
  
      if (!encryptedData) {
        throw new Error("No encrypted data found in IPFS response.");
      }
      console.log("Encrypted Healthcare Data:", encryptedData);
  
      console.log("Decrypting healthcare data...");
      const decryptedData = CryptoJS.AES.decrypt(encryptedData, decryptedKey).toString(CryptoJS.enc.Utf8);
  
      if (!decryptedData) {
        throw new Error("Failed to decrypt healthcare data. Ensure the decryption key is correct.");
      }
      console.log("Decrypted Healthcare Data:", decryptedData);
  
      const parsedData = JSON.parse(decryptedData);
      const { healthcareData, patientDetails = {} } = parsedData;
  
      console.log("Parsed Healthcare Data:", parsedData);
  
      setSelectedRecord({
        tokenId,
        dataType,
        date,
        provider,
        imageUrl,
        healthcareData,
        patientDetails,
        timestamp: new Date(date).toLocaleString(),
      });
  
      setViewMode("detail"); // Ensure the view mode is set to display the detailed record
      setStatus("Healthcare Data Retrieved Successfully!");
    } catch (error) {
      console.error("Error viewing healthcare data:", error.message);
      setError(error.message || "Failed to retrieve healthcare data.");
      setStatus("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  
  
  
  const RecordsList = ({ records }) => {
    const filteredRecords = records.filter((record) => {
      const matchesSearch =
        record.metadata[0]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.metadata[2]?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || record.metadata[0] === filterType;
      return matchesSearch && matchesFilter;
    });
  
    if (filteredRecords.length === 0) {
      return <p className="text-gray-500 text-center">No records match your search or filter criteria.</p>;
    }
  
    return (
      <div className="records-container">
        {filteredRecords.map((record) => (
          <div
            key={record.tokenId}
            className="record-card"
            onClick={() => viewHealthcareDataWithAccess(record.tokenId)}
          >
            <h4>{record.metadata[0] || "Unknown Type"}</h4>
            <p>
              <strong>Token ID:</strong> {record.tokenId}
            </p>
            <p>
              <strong>Provider:</strong> {record.metadata[2] || "Unknown"}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(record.metadata[1]).toLocaleDateString() || "Invalid Date"}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent event propagation
                viewHealthcareDataWithAccess(record.tokenId);
              }}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    );
  };
  
  
  
  

  const RecordDetail = ({ record, onBack }) => {
    if (!record) {
      return (
        <div className="text-gray-500 text-center">
          <p>No record selected. Please select a record to view details.</p>
        </div>
      );
    }
  
    const { patientDetails = {}, healthcareData, tokenId, dataType, provider, timestamp, imageUrl } = record;
  
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Healthcare Record Details</h2>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            Back to List
          </button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Patient Details</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Name:</dt>
                <dd className="font-medium">{patientDetails.name || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Age:</dt>
                <dd className="font-medium">{patientDetails.age || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Gender:</dt>
                <dd className="font-medium">{patientDetails.gender || "N/A"}</dd>
              </div>
            </dl>
          </div>
  
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Basic Information</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">Token ID:</dt>
                <dd className="font-medium">{tokenId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Type:</dt>
                <dd className="font-medium">{dataType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Provider:</dt>
                <dd className="font-medium">{provider}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Date:</dt>
                <dd className="font-medium">{timestamp}</dd>
              </div>
            </dl>
          </div>
  
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Healthcare Data</h3>
            <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">
              {healthcareData || "No data available."}
            </pre>
          </div>
  
          {imageUrl && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Medical Image</h3>
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                <img src={imageUrl} alt="Medical scan" className="object-contain w-full h-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  

  
  

  const fetchFromIPFS = async (ipfsHash) => {
    try {
      if (!ipfsHash) {
        throw new Error("IPFS hash is required but not provided.");
      }
  
      const cleanHash = ipfsHash.startsWith('https://') ? ipfsHash.split('/ipfs/')[1] : ipfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
  
      console.log("Fetching from IPFS URL:", url);
  
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS. Status: ${response.status}`);
      }
  
      const data = await response.text();
      console.log("Raw IPFS Data:", data);
  
      // Validate data format
      const parsedData = JSON.parse(data);
      if (!parsedData || !parsedData.encryptedData) {
        throw new Error("Invalid or incomplete data retrieved from IPFS.");
      }
  
      return data;
    } catch (error) {
      console.error("Error fetching from IPFS:", error.message);
      throw error;
    }
  };
  
  
  
  
  

  const decryptData = (encryptedData, decryptionKey) => {
    try {
      console.log("Attempting to decrypt data...");
      console.log("Decryption Key:", decryptionKey);
      console.log("Encrypted Data:", encryptedData);
  
      const bytes = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  
      if (!decryptedData) {
        throw new Error('Decryption resulted in empty data');
      }
  
      console.log("Decrypted Data:", decryptedData); // Debug log
      return decryptedData;
    } catch (error) {
      console.error("Error decrypting data:", error.message);
      return null;
    }
  };
  
  

  useEffect(() => {
    fetchMintedData();
  }, [fetchMintedData]);
  

  const StatsCard = ({ icon: Icon, title, value, color = "indigo" }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
    </div>
  );

  const DataListCard = ({ title, data, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="h-6 w-6 text-indigo-600" />
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-gray-700 font-medium">{key}</span>
            <span className="text-indigo-600 font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  
    if (tab === "doctor") {
      setSelectedRecord(null);
      setViewMode("list");
      setViewTokenId("");
      setUserPrivateKey("");
      setError("");
      setStatus("");
    }
  };
  

  
  

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Healthcare Data NFT Vault</h1>
      </header>

      <div className="tab-navigation">
  <button
    className={`tab-button ${activeTab === 'patient' ? 'active' : ''}`}
    onClick={() => setActiveTab('patient')}
  >
    Patient Data Entry
  </button>
  <button
    className={`tab-button ${activeTab === 'access' ? 'active' : ''}`}
    onClick={() => setActiveTab('access')}
  >
    Access Control
  </button>
  <button
    className={`tab-button ${activeTab === 'doctor' ? 'active' : ''}`}
    onClick={() => handleTabChange('doctor')}
  >
    Doctor View
  </button>
  <button
    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
    onClick={() => setActiveTab('overview')}
  >
    Records Overview
  </button>
  <button
    className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`}
    onClick={() => setActiveTab('privacy')}
  >
    Privacy Laws
  </button>
  <button
    className={`tab-button ${activeTab === 'references' ? 'active' : ''}`}
    onClick={() => setActiveTab('references')}
  >
    Medical References
  </button>
  <button
    className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
    onClick={() => setActiveTab('insights')}
  >
    Data Insights
  </button>
</div>


      <main>
      {activeTab === 'patient' && (
          <PatientDataEntry
          tokenId={tokenId}
          setTokenId={setTokenId}
          dataType={dataType}
          setDataType={setDataType}
          date={date}
          setDate={setDate}
          provider={provider}
          setProvider={setProvider}
          data={data}
          setData={setData}
          name={name}
          setName={setName}
          age={age}
          setAge={setAge}
          gender={gender}
          setGender={setGender}
          handleImageUpload={handleImageUpload}
          handleMintNFT={handleMintNFT}
        />
        
        )}

        {activeTab === 'access' && (
          <section className="card">
            <h2>Access Control</h2>
            <div className="form-group">
              <input
                type="text"
                placeholder="Token ID"
                onChange={(e) => setAccessTokenId(e.target.value)}
              />
              <input
                type="text"
                placeholder="User Address (e.g., 0x123...)"
                onChange={(e) => setUserAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Decryption Key"
                onChange={(e) => setDecryptionKey(e.target.value)}
              />
              <div className="button-group">
                <button className="primary-button" onClick={handleGrantAccess}>
                  Grant Access
                </button>
                <button className="secondary-button" onClick={handleRevokeAccess}>
                  Revoke Access
                </button>
              </div>
            </div>
          </section>
        )}

{activeTab === "doctor" && (
  <section className="space-y-8">
    {/* Input Section */}
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-purple-600 mb-6">Doctor View</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Token ID</label>
          <input
            type="text"
            placeholder="Enter Token ID"
            className="w-full p-4 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            value={viewTokenId}
            onChange={(e) => setViewTokenId(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Private Key</label>
          <input
            type="password"
            placeholder="Enter User Private Key"
            className="w-full p-4 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            value={userPrivateKey}
            onChange={(e) => setUserPrivateKey(e.target.value)}
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-lg font-semibold rounded-lg transition-colors ${
            loading || !viewTokenId || !userPrivateKey
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
          onClick={() => viewHealthcareDataWithAccess(viewTokenId)}
          disabled={loading || !viewTokenId || !userPrivateKey}
        >
          <Eye className="h-6 w-6" />
          {loading ? "Loading..." : "View Healthcare Data"}
        </button>
      </div>
    </div>

    {/* Records Section */}
    <div className="bg-white rounded-lg shadow-lg p-8">
      {viewMode === "list" ? (
        <>
          <h3 className="text-xl font-semibold text-purple-600 mb-6">
            Healthcare Records
          </h3>

          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Search records..."
              className="flex-1 p-4 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="p-4 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {Array.from(new Set(mintedData.map((r) => r.metadata[0]))).map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Records List */}
          <RecordsList records={mintedData} />
        </>
      ) : (
        <RecordDetail
          record={selectedRecord}
          onBack={() => {
            setViewMode("list");
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  </section>
)}



{activeTab === 'insights' && <DataInsights mintedData={mintedData} />}



{activeTab === 'overview' && (
  <RecordsOverview recordsStats={recordsStats} mintedData={mintedData} />
)}



        {activeTab === 'privacy' && (
          <section className="card">
            <h2>Healthcare Privacy Laws</h2>
            <div className="privacy-laws">
              {privacyLaws.map((law, index) => (
                <div key={index} className="law-card">
                  <h3>{law.name}</h3>
                  <ul>
                    {law.key_points.map((point, pointIndex) => (
                      <li key={pointIndex}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

{activeTab === 'references' && (
  <MedicalReferences references={medicalReferences} />
)}


        {/* <section className="card">
          <h2>Minted Data</h2>
          <ul className="minted-data">
            {mintedData.map((item) => (
              <li key={item.tokenId}>
                <strong>Token ID:</strong> {item.tokenId},{' '}
                <strong>Metadata:</strong> {JSON.stringify(item.metadata)}
              </li>
            ))}
          </ul>
        </section> */}

        <p className="status-message">{status}</p>
      </main>
    </div>
  );
};

export default App;