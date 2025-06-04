import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary

const UploadForm = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", image);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message);
    } catch (error) {
      setMessage("Upload failed");
    }
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Enter name" onChange={(e) => setName(e.target.value)} required />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} required />
        <button type="submit">Upload</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default UploadForm;
