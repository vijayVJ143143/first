import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Create __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Initialize paymentData as an empty object globally
let paymentData = {};

// API endpoint to get credentials
app.get('/api/credentials', (req, res) => {
    res.json({
        API_Key: process.env.API_Key,
        Merchant_Id: process.env.Merchant_Id,
        Business_Unit_Code: process.env.Business_Unit_Code
    });
});

// API endpoint to receive data from main.js
app.post('/api/store-payment-response', async (req, res) => {

    // Assuming you are sending a JSON body from main.js
    const paymentResponse = req.body;

    console.log("paymentResponse: "+ paymentResponse);

    if (!paymentResponse || !paymentResponse.legalEntityCode || !paymentResponse.orderId) {
        return res.status(400).send('Invalid payment data received');
    }

    // Log the data received from main.js
    console.log('Data received from main.js:', paymentResponse);

    // Assuming boxpaySaltKey is already defined somewhere in your code
    const boxpaySaltKey = 'kBTvCI4t5SkBTvCI4t5T'; // Replace with actual value

    // Construct the signature text
    const signatureText = [
        boxpaySaltKey,
        paymentResponse.legalEntityCode,
        paymentResponse.orderId,
        paymentResponse.transactionId,
        paymentResponse.operationId,
        paymentResponse.eventId,
        paymentResponse.countryCode,
        paymentResponse.status.status,
        paymentResponse.money.currencyCode,
        paymentResponse.money.amount
    ].join('');

    // Hash the signature text using SHA-256
    const hash = crypto.createHash('sha256');
    const output = hash.update(signatureText, 'utf8').digest();

    // Convert the output to a hexadecimal string
    let hashText = output.toString('hex');

    // Add preceding 0s to make it 64 characters long (if necessary)
    while (hashText.length < 64) {
        hashText = '0' + hashText;
    }

    // Calculated signature
    const calculatedSignature = hashText;

    // Extract the 'x-signature' header
    const receivedSignature = req.headers['x-signature'];

    // Log the received signature and the calculated signature for comparison
    console.log('Received Signature:', receivedSignature);
    console.log('Calculated Signature:', calculatedSignature);

    // Respond to the client
    res.status(200).send('Payment data and signature received and stored successfully');
});


// Webhook endpoint
app.post('/api/webhook', (req, res) => {

     // Assuming you are sending a JSON body from main.js
    const paymentResponse = req.body;

    if (!paymentResponse || !paymentResponse.legalEntityCode || !paymentResponse.orderId) {
        return res.status(400).send('Invalid payment data received');
    }

    // Log the data received from main.js
    console.log('Data received from main.js:', paymentResponse);

    // Assuming boxpaySaltKey is already defined somewhere in your code
    const boxpaySaltKey = 'kBTvCI4t5SkBTvCI4t5T'; // Replace with actual value

    // Construct the signature text
    const signatureText = [
        boxpaySaltKey,
        paymentResponse.legalEntityCode,
        paymentResponse.orderId,
        paymentResponse.transactionId,
        paymentResponse.operationId,
        paymentResponse.eventId,
        paymentResponse.countryCode,
        paymentResponse.status.status,
        paymentResponse.money.currencyCode,
        paymentResponse.money.amount
    ].join('');

    // Hash the signature text using SHA-256
    const hash = crypto.createHash('sha256');
    const output = hash.update(signatureText, 'utf8').digest();

    // Convert the output to a hexadecimal string
    let hashText = output.toString('hex');

    // Add preceding 0s to make it 64 characters long (if necessary)
    while (hashText.length < 64) {
        hashText = '0' + hashText;
    }

    // Calculated signature
    const calculatedSignature = hashText;

    // Extract the 'x-signature' header
    const receivedSignature = req.headers['x-signature'];

    // Log the received signature and the calculated signature for comparison
    console.log('Received Signature:', receivedSignature);
    console.log('Calculated Signature:', calculatedSignature);

    // Respond to the client
    res.status(200).send('Payment data and signature received and stored successfully');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
