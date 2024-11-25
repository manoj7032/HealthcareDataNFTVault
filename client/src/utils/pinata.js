import axios from "axios";

// Replace these with your actual Pinata API Key and Secret
const PINATA_API_KEY = "d5cb8a65660984270262";
const PINATA_API_SECRET = "fe5d895092aaccae81ad2e86a74945278a8acb9b24ef6e0cae9d5fd2978c437f";

// Function to upload JSON data to IPFS via Pinata
export const uploadToIPFS = async (data) => {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  try {
    // Make a POST request to Pinata's API
    const response = await axios.post(url, data, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });

    // Return the IPFS gateway URL for the uploaded content
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to Pinata:", error.response?.data || error.message);
    return null;
  }
};
