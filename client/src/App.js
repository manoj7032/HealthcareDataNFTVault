import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, getAddress } from 'ethers';
import CryptoJS from 'crypto-js';
import { uploadToIPFS } from './utils/pinata';
import { useCallback } from 'react';
import RecordsOverview from './RecordsOverview';
import HealthcareDataNFT from './artifacts/contracts/HealthcareDataNFT.json';
import {  
  AlertCircle, 
  FileCheck,  
  Eye 
} from 'lucide-react';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('patient');
  const [data, setData] = useState('');
  const [dataType, setDataType] = useState('');
  const [date, setDate] = useState('');
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

  const contractAddress = '0xd414c3c046B5Faf91CD3eEE4EbC4c392e378163a';

  const medicalReferences = {
    bloodWork: [
      { test: 'Complete Blood Count (CBC)', range: 'WBC: 4,500-11,000/µL\nRBC: 4.5-5.9 million/µL\nHemoglobin: 13.5-17.5 g/dL (male), 12.0-15.5 g/dL (female)' },
      { test: 'Basic Metabolic Panel', range: 'Glucose: 70-99 mg/dL (fasting)\nCalcium: 8.5-10.5 mg/dL\nSodium: 135-145 mEq/L' },
      { test: 'Lipid Panel', range: 'Total Cholesterol: < 200 mg/dL\nHDL: > 40 mg/dL\nLDL: < 100 mg/dL\nTriglycerides: < 150 mg/dL' }
    ],
    xray: [
      { test: 'Chest X-ray', range: 'PA view: 35-40 cm width\nLateral view: 25-35 cm depth' },
      { test: 'Bone X-ray', range: 'Cortical thickness: 3-8 mm\nTrabeculae spacing: 0.5-1.5 mm' }
    ],
    mri: [
      { test: 'Brain MRI', range: 'T1 relaxation time: 240-1400 ms\nT2 relaxation time: 40-200 ms' },
      { test: 'Spine MRI', range: 'Disc height: 8-12 mm\nSpinal canal diameter: 12-14 mm' }
    ]
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
  
  
  

  const fetchMintedData = useCallback(async () => {
    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, providerInstance);
      const supply = await contract.totalSupply();
  
      const minted = [];
      for (let i = 1; i <= supply; i++) {
        const metadata = await contract.getMetadata(i);
        minted.push({ tokenId: i, metadata });
      }
      setMintedData(minted);
      calculateRecordsStats();
    } catch (error) {
      console.error('Error fetching minted data:', error.message);
    }
  }, [contractAddress, calculateRecordsStats]); // Dependencies

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
    if (!tokenId || !data || !dataType || !date || !provider || !image) {
      alert('Please fill out all fields and upload an image.');
      return;
    }

    setStatus('Encrypting data...');
    const encryptionKey = 'encryption-key';
    const encryptedData = CryptoJS.AES.encrypt(data, encryptionKey).toString();

    setStatus('Uploading data to IPFS...');
    const ipfsUrl = await uploadToIPFS({ healthcareData: encryptedData });

    setStatus('Minting NFT...');
    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const signer = await providerInstance.getSigner();
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, signer);

      const tx = await contract.mintNFT(parseInt(tokenId), dataType, date, provider, ipfsUrl, image);
      await tx.wait();

      setStatus(`NFT minted successfully! IPFS URL: ${ipfsUrl}`);
      fetchMintedData();
    } catch (error) {
      console.error('Minting error:', error.message);
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
    // Ensure required inputs are provided
    if (!tokenId || !userPrivateKey) {
      setError("Both Token ID and Private Key are required to view healthcare data.");
      return;
    }
  
    setLoading(true); // Start loading
    setError(""); // Reset errors
    setStatus("Fetching healthcare data...");
  
    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      const contract = new Contract(contractAddress, HealthcareDataNFT.abi, providerInstance);
  
      // Fetch encrypted key and decrypt it using private key
      const encryptedKey = await contract.getEncryptedKey(tokenId, userAddress);
      const decryptedKey = CryptoJS.AES.decrypt(encryptedKey, userPrivateKey).toString(CryptoJS.enc.Utf8);
  
      if (!decryptedKey) {
        throw new Error("Failed to decrypt the access key. Please check your private key.");
      }
  
      // Fetch metadata and healthcare data
      const metadata = await contract.getMetadata(tokenId);
      const [dataType, date, provider, ipfsHash, imageUrl] = metadata;
  
      const encryptedData = await fetchFromIPFS(ipfsHash);
      const healthcareData = decryptData(JSON.parse(encryptedData).healthcareData, decryptedKey);
  
      if (!healthcareData) {
        throw new Error("Failed to decrypt healthcare data.");
      }
  
      // Update selected record for detail view
      setSelectedRecord({
        tokenId,
        dataType,
        date,
        provider,
        imageUrl,
        healthcareData,
        timestamp: new Date(date).toLocaleString(),
      });
  
      setViewMode("detail"); // Switch to detail view
      setStatus("Healthcare Data Retrieved Successfully!");
    } catch (error) {
      console.error("Error viewing healthcare data:", error.message);
      setError(error.message || "Failed to retrieve healthcare data.");
      setStatus("Error: " + error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };
  
  
  const RecordsList = ({ records }) => {
    const filteredRecords = records.filter(record => {
      const matchesSearch = record.metadata[0].toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.metadata[2].toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || record.metadata[0] === filterType;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search records..."
            className="flex-1 p-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border rounded-lg"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {Array.from(new Set(records.map(r => r.metadata[0]))).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        {filteredRecords.map((record) => (
          <div
            key={record.tokenId}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => viewHealthcareDataWithAccess(record.tokenId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <FileCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {record.metadata[0]} - Token ID: {record.tokenId}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Provider: {record.metadata[2]}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(record.metadata[1]).toLocaleDateString()}
                </p>
                <button
                  className="text-indigo-600 text-sm hover:text-indigo-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    viewHealthcareDataWithAccess(record.tokenId);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const RecordDetail = ({ record, onBack }) => {
    if (!record) return null;
  
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Healthcare Record Details</h2>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to List
          </button>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Basic Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Token ID:</dt>
                  <dd className="font-medium">{record.tokenId}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Type:</dt>
                  <dd className="font-medium">{record.dataType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Provider:</dt>
                  <dd className="font-medium">{record.provider}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Date:</dt>
                  <dd className="font-medium">{record.timestamp}</dd>
                </div>
              </dl>
            </div>
  
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Healthcare Data</h3>
              <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">
                {record.healthcareData}
              </pre>
            </div>
          </div>
  
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Medical Image</h3>
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={record.imageUrl}
                  alt="Medical scan"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  
  

  const fetchFromIPFS = async (ipfsHash) => {
    try {
      const cleanHash = ipfsHash.startsWith('https://') ? ipfsHash.split('/ipfs/')[1] : ipfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS. Status: ${response.status}`);
      }
  
      return await response.text();
    } catch (error) {
      console.error('Error fetching from IPFS:', error.message);
      throw error;
    }
  };
  

  const decryptData = (encryptedData, decryptionKey) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedData) {
        throw new Error('Decryption resulted in empty data');
      }
      return decryptedData;
    } catch (error) {
      console.error('Error decrypting data:', error.message);
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
  
    // Reset Doctor View state on tab change
    if (tab === "doctor") {
      setSelectedRecord(null); // Clear selected record
      setViewMode("list"); // Reset view mode
      setViewTokenId(""); // Clear token ID
      setUserPrivateKey(""); // Clear private key
      setError(""); // Reset error
      setStatus(""); // Clear status message
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
      </div>

      <main>
        {activeTab === 'patient' && (
          <section className="card">
            <h2>Patient Data Entry</h2>
            <div className="form-group">
              <input
                type="text"
                placeholder="Token ID"
                onChange={(e) => setTokenId(e.target.value)}
              />
              <input
                type="text"
                placeholder="Data Type (e.g., X-ray)"
                onChange={(e) => setDataType(e.target.value)}
              />
              <input
                type="date"
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                type="text"
                placeholder="Provider (e.g., XYZ Hospital)"
                onChange={(e) => setProvider(e.target.value)}
              />
              <textarea
                placeholder="Enter healthcare data"
                onChange={(e) => setData(e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button className="primary-button" onClick={handleMintNFT}>
                Mint Healthcare NFT
              </button>
            </div>
          </section>
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

{activeTab === 'doctor' && (
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
    value={viewTokenId} // Bind to state
    onChange={(e) => setViewTokenId(e.target.value)}
  />
</div>

<div>
  <label className="block text-gray-700 font-medium mb-2">Private Key</label>
  <input
    type="password"
    placeholder="Enter User Private Key"
    className="w-full p-4 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
    value={userPrivateKey} // Bind to state
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

  {/* Conditional Rendering for Details or List View */}
  {viewMode === "detail" && selectedRecord ? (
    <RecordDetail
      record={selectedRecord}
      onBack={() => {
        setViewMode("list"); // Reset view mode
        setSelectedRecord(null); // Clear the selected record
      }}
    />
  ) : (
    <div className="bg-white rounded-lg shadow-lg p-8">
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
      <div className="records-container">
        {mintedData.map((record) => (
          <div key={record.tokenId} className="record-card">
            <h4>
              {record.metadata[0]} - Token ID: {record.tokenId}
            </h4>
            <p>
              <strong>Provider:</strong> {record.metadata[2] || "Unknown"}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(record.metadata[1]).toLocaleDateString() ||
                "Invalid Date"}
            </p>
            <button
              onClick={() => viewHealthcareDataWithAccess(record.tokenId)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
</section>

)}




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
          <section className="card">
            <h2>Medical Reference Ranges</h2>
            <div className="medical-references">
              <div className="reference-section">
                <h3>Blood Work Reference Ranges</h3>
                {medicalReferences.bloodWork.map((test, index) => (
                  <div key={index} className="reference-item">
                    <h4>{test.test}</h4>
                    <p>{test.range}</p>
                  </div>
                ))}
              </div>
              <div className="reference-section">
                <h3>X-Ray Reference Ranges</h3>
                {medicalReferences.xray.map((test, index) => (
                  <div key={index} className="reference-item">
                    <h4>{test.test}</h4>
                    <p>{test.range}</p>
                  </div>
                ))}
              </div>
              <div className="reference-section">
                <h3>MRI Reference Ranges</h3>
                {medicalReferences.mri.map((test, index) => (
                  <div key={index} className="reference-item">
                    <h4>{test.test}</h4>
                    <p>{test.range}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
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