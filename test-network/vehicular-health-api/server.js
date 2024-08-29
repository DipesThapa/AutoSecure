require('dotenv').config(); // Ensure this is at the top
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const morgan = require('morgan');
const winston = require('winston');
const cookieParser = require('cookie-parser');
const { Gateway, Wallets } = require('fabric-network');
const elliptic = require('elliptic');
const jwt = require('jsonwebtoken'); // Add JWT
const axios = require('axios');

const EC = elliptic.ec;
const ec = new EC('p256');
const app = express();
const port = 3000;

const privateKey = fs.readFileSync('./certs/private.key', 'utf8');
const certificate = fs.readFileSync('./certs/certificate.crt', 'utf8');
const ca = fs.readFileSync('./certs/ca_bundle.crt', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'vehicular-health-frontend'))); // Serve static files
app.use(morgan('combined'));
app.use(helmet());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

let contract;

async function initializeContract() {
    try {
        const ccpPath = path.resolve(__dirname, '../fabric-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');
        contract = network.getContract('vehicle-health');
        console.log('Smart contract initialized');
    } catch (error) {
        console.error(`Failed to initialize contract: ${error}`);
        process.exit(1);
    }
}

const JWT_SECRET = process.env.JWT_SECRET || '3n9rf8zX3+K9kP3LZgB5QK1+XcY3hD5e1G8xH1V3f4Y='; // Ensure JWT_SECRET is set

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === 'Monster' && password === 'Monster123') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(403).send('Forbidden');
    }
});

app.post('/addRecord', authenticateToken, async (req, res) => {
    const { vehicleID, data, signature, publicKey } = req.body;

    logger.info(`Received data: vehicleID=${vehicleID}, data=${JSON.stringify(data)}, signature=${signature}, publicKey=${publicKey}`);

    if (!vehicleID || !data || !signature || !publicKey) {
        logger.warn('Invalid data format');
        return res.status(400).send('Invalid data format');
    }

    const dataString = JSON.stringify(data);
    const key = ec.keyFromPublic(publicKey, 'hex');
    const hash = ec.hash().update(dataString).digest();
    const isValidSignature = key.verify(hash, signature);

    if (!isValidSignature) {
        logger.error('Invalid digital signature');
        return res.status(400).send('Invalid digital signature');
    }

    try {
        await contract.submitTransaction('AddRecord', vehicleID, dataString, signature, publicKey);
        logger.info(`Record added for vehicleID: ${vehicleID}`);
        res.send('Record added successfully');
    } catch (error) {
        logger.error(`Failed to add record for vehicleID: ${vehicleID} - ${error.message}`);
        res.status(500).send(`Failed to add record: ${error.message}`);
    }
});

app.get('/getRecords/:vehicleID', authenticateToken, async (req, res) => {
    const vehicleID = req.params.vehicleID;
    logger.info(`Fetching records for vehicleID: ${vehicleID}`);
    try {
        const result = await contract.evaluateTransaction('GetRecords', vehicleID);
        const records = JSON.parse(result.toString());
        logger.info(`Records retrieved for vehicleID: ${vehicleID}`);
        res.json(records);
    } catch (error) {
        logger.error(`Failed to retrieve records for vehicleID: ${vehicleID} - ${error.message}`);
        res.status(500).send(`Failed to retrieve records: ${error.message}`);
    }
});

https.createServer(credentials, app).listen(port, () => {
    console.log(`API server listening at https://localhost:${port}`);
    initializeContract(); // Initialize contract when the server starts
});

