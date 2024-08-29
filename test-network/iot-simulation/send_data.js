const axios = require('axios');
const https = require('https');
const elliptic = require('elliptic');
const EC = elliptic.ec;
const ec = new EC('p256');

// Private key as a hexadecimal string (replace with your actual private key hex string)
const privateKeyHex = '4b8e9ff10c716f78c3d4a7f7ae5a69b9e70567f28b4568de7066ae4dd3034741';

// Login credentials
const username = 'Monster';
const password = 'Monster123';

async function getToken() {
    try {
        const response = await axios.post('https://localhost:3000/login', {
            username,
            password
        }, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        return response.data.token; // Ensure this is the correct key where the token is stored
    } catch (error) {
        console.error('Error getting token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function sendData(vehicleID, data, token) {
    try {
        const key = ec.keyFromPrivate(privateKeyHex);
        const dataString = JSON.stringify(data);
        const hash = ec.hash().update(dataString).digest();
        const signature = key.sign(hash).toDER('hex');
        const publicKey = key.getPublic('hex');

        const payload = {
            vehicleID,
            data,
            signature,
            publicKey
        };
        console.log('Payload:', payload); // Log payload being sent

        const response = await axios.post('https://localhost:3000/addRecord', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            timeout: 10000 // Increase timeout to 10 seconds
        });
        console.log('Record added successfully:', response.data);
    } catch (error) {
        console.error('Error sending data:', error.response ? error.response.data : error.message);
    }
}

async function main() {
    try {
        const token = await getToken();
        console.log('Token obtained successfully:', token);

        const vehicleID = '1';
        const data = {
            engine_temperature: 85,
            oil_pressure: 30,
            tire_pressure: {
                front_left: 32,
                front_right: 32,
                rear_left: 32,
                rear_right: 32
            },
            battery_status: "Good",
            fuel_level: 75
        };

        await sendData(vehicleID, data, token);

        // Continuously send data for multiple vehicles
        setInterval(() => {
            for (let i = 1; i <= 3; i++) {
                const vehicleData = {
                    engine_temperature: Math.floor(Math.random() * 100),
                    oil_pressure: Math.floor(Math.random() * 50),
                    tire_pressure: {
                        front_left: Math.floor(Math.random() * 40),
                        front_right: Math.floor(Math.random() * 40),
                        rear_left: Math.floor(Math.random() * 40),
                        rear_right: Math.floor(Math.random() * 40)
                    },
                    battery_status: ["Good", "Fair", "Poor"][Math.floor(Math.random() * 3)],
                    fuel_level: Math.floor(Math.random() * 100)
                };
                sendData(i.toString(), vehicleData, token).catch(console.error);
            }
        }, 5000);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main();

