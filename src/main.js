const button = document.getElementById('button');

if (button) {
    button.addEventListener('click', async () => {
        const credentialsResponse = await fetch('http://localhost:3000/api/credentials');
        if (!credentialsResponse.ok) {
            console.error('Failed to fetch credentials:', credentialsResponse.statusText);
            return;
        }
        const credentials = await credentialsResponse.json();

        const token = credentials.API_Key;
        const merchantId = credentials.Merchant_Id;
        const businessUnitCode = credentials.Business_Unit_Code;
        const url = `https://sandbox-apis.boxpay.tech/v0/merchants/${merchantId}/sessions`;

        const body = {
            "context": {
                "countryCode": "IN",
                "legalEntity": {
                    "code": businessUnitCode
                },
                "orderId": "test12",
                "localCode": "fr-FR"
            },
            "paymentType": "S",
            "money": {
                "amount": "7568.50",
                "currencyCode": "INR"
            },
            "shopper": {
                "uniqueReference": "UNIQUE_SHOPPER"
            },
            "frontendReturnUrl": "https://www.appprotech.com/",
            "frontendBackUrl": "https://www.appprotech.com/",
            "statusNotifyUrl": "https://boxpay-webhook-pwtpxoecv-vijayraghavas-projects.vercel.app/api/webhook"
        };

        // Function to create SHA-256 hash using Web Crypto API
        async function createHash(input) {
            const encoder = new TextEncoder();
            const data = encoder.encode(input);
            const hash = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }

        const saltKey = 'kBTvCI4t5SkBTvCI4t5T'; // Replace with actual salt key
        const signatureText = saltKey + merchantId + body.context.orderId; // Example for building a signature
        const generatedSignature = await createHash(signatureText);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-signature': generatedSignature
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const data = await response.json();
                const redirectUrl = data.url; // Adjust based on actual response structure

                window.location.href = redirectUrl; // Redirect to the received URL
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    });
}
