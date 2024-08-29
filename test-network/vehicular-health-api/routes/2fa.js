const express = require('express');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/user');

const router = express.Router();

// Setup 2FA
router.post('/setup', async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).send('User not found');
    }

    const secret = speakeasy.generateSecret();
    user.twoFASecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
        if (err) {
            return res.status(500).send('Error generating QR code');
        }
        res.send({ qrCode: data_url });
    });
});

// Verify 2FA
router.post('/verify', async (req, res) => {
    const { username, token } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).send('User not found');
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: 'base32',
        token
    });

    if (verified) {
        user.twoFAEnabled = true;
        await user.save();
        res.send('2FA enabled successfully');
    } else {
        res.status(400).send('Invalid token');
    }
});

module.exports = router;

