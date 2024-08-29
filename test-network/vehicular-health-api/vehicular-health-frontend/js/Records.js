import React, { useState } from 'react';
import axios from 'axios';

function Records({ token }) {
  const [vehicleID, setVehicleID] = useState('');
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`https://localhost:3000/getRecords/${vehicleID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRecords(response.data);
      setError('');
    } catch (error) {
      setError('Error getting records');
    }
  };

  return (
    <div>
      <h2>Get Records</h2>
      <div>
        <label>Vehicle ID</label>
        <input type="text" value={vehicleID} onChange={(e) => setVehicleID(e.target.value)} />
        <button onClick={fetchRecords}>Get Records</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        {records.map((record, index) => (
          <div key={index}>
            <pre>{JSON.stringify(record, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Records;

