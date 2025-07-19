import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const  ExcelUpload = () => {
    const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResponse(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post('http://localhost:8000/api/merchant/products/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    }
  };

  return (
    <div className="p-4 border rounded bg-light shadow-sm">
      <h4>Upload Products via Excel</h4>
      <input type="file" accept=".xlsx" onChange={handleFileChange} className="form-control my-2" />
      <button className="btn btn-primary" onClick={handleUpload}>Upload</button>

      {response && (
        <div className="alert alert-success mt-3">
          <p>{response.message}</p>
          <ul>
            {response.products.map((prod, index) => (
              <li key={index}>{prod}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;
