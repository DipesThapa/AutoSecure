const axios = require('axios');

const url = 'http://localhost:3000/addRecord';
const data = {
    vehicleID: 'vehicle1',
    dataHash: 'hash_of_health_data'
};

axios.post(url, data)
    .then(response => {
        console.log('Record added successfully');
    })
    .catch(error => {
        console.log('Failed to add record:', error.response ? error.response.data : error.message);
    });


