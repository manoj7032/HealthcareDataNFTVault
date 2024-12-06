import React from 'react';

const PatientDataEntry = ({
  tokenId,
  setTokenId,
  dataType,
  setDataType,
  date,
  setDate,
  provider,
  setProvider,
  data,
  setData,
  name,
  setName,
  age,
  setAge,
  gender,
  setGender,
  handleImageUpload,
  handleMintNFT,
}) => {
  const dataTypes = ['X-Ray', 'MRI', 'Blood Work', 'Ultrasound']; // Add more types if needed
  const genders = ['Male', 'Female', 'Other']; // Gender options

  return (
    <section className="card">
      <h2>Patient Data Entry</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Patient Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Patient Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="dropdown"
        >
          <option value="">Select Gender</option>
          {genders.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <select
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          className="dropdown"
        >
          <option value="">Select Data Type</option>
          {dataTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Provider (e.g., XYZ Hospital)"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
        <textarea
          placeholder="Enter healthcare data"
          value={data}
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
  );
};

export default PatientDataEntry;
