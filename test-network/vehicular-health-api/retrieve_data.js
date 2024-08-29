const axios = require('axios');

const url = 'http://localhost:3000/getRecords/vehicle1';

axios.get(url)
    .then(response => {
        console.log('Retrieved records:', response.data);
    })
    .catch(error => {
        console.log('Failed to retrieve records:', error.response ? error.response.data : error.message);
    });

