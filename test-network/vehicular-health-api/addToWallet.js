const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // Create a new file system-based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.get('appUser');
        if (userExists) {
            console.log('An identity for the user "appUser" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const credPath = path.join(__dirname, '..', 'organizations', 'peerOrganizations', 'org1.example.com', 'users', 'Admin@org1.example.com', 'msp');
        const certificate = fs.readFileSync(path.join(credPath, 'signcerts', 'Admin@org1.example.com-cert.pem')).toString();
        const privateKey = fs.readFileSync(path.join(credPath, 'keystore', 'priv_sk')).toString();

        const identity = {
            credentials: {
                certificate,
                privateKey
            },
            mspId: 'Org1MSP',
            type: 'X.509'
        };

        await wallet.put('appUser', identity);
        console.log('Successfully added appUser to the wallet');
    } catch (error) {
        console.error(`Failed to add user to wallet: ${error}`);
    }
}

main();

