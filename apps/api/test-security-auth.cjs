const crypto = require('node:crypto').webcrypto;

/**
 * MOCK ENVIRONMENT SETUP
 */
const mockEnv = {
    JWT_SECRET: 'super-secret-key-12345'
};

/**
 * Helper to encode Base64URL
 */
function b64UrlEncode(obj) {
    const str = JSON.stringify(obj);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Helper to encode signature to Base64URL
 */
function bufToB64Url(buf) {
    const bin = String.fromCharCode(...new Uint8Array(buf));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Generate a JWT manually using Web Crypto
 */
async function generateJWT(payload, secret) {
    const encoder = new TextEncoder();
    const header = { alg: 'HS256', typ: 'JWT' };
    
    const headerB64 = b64UrlEncode(header);
    const payloadB64 = b64UrlEncode(payload);
    
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const key = await crypto.subtle.importKey(
        'raw', encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false, ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, data);
    const signatureB64 = bufToB64Url(signature);
    
    return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * THE LOGIC TO TEST (Extracted from tamuu-api-worker.js)
 */
async function verifyJWT(token, secret) {
    if (!token || !secret) return { valid: false, reason: 'Missing token or secret' };
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return { valid: false, reason: 'Invalid JWT format' };
        
        const [headerB64, payloadB64, signatureB64] = parts;

        const encoder = new TextEncoder();
        const data = encoder.encode(`${headerB64}.${payloadB64}`);
        
        // Convert Base64URL to ArrayBuffer
        const b64ToBuf = (b64) => {
            const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
            const buf = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
            return buf;
        };

        const signature = b64ToBuf(signatureB64);
        const key = await crypto.subtle.importKey(
            'raw', encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false, ['verify']
        );

        const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
        if (!isValid) return { valid: false, reason: 'Signature mismatch' };

        const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
            return { valid: false, reason: 'Token expired', payload };
        }

        return { valid: true, payload };
    } catch (e) {
        return { valid: false, reason: e.message };
    }
}

/**
 * TEST RUNNER
 */
async function runTests() {
    console.log('--- JWT SECURITY VERIFICATION TEST ---');
    
    const testPayload = {
        sub: 'user-123',
        email: 'test@tamuu.id',
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };

    // 1. Test Valid Token
    console.log('\n[TEST 1] Verifying a valid token...');
    const validToken = await generateJWT(testPayload, mockEnv.JWT_SECRET);
    const validResult = await verifyJWT(validToken, mockEnv.JWT_SECRET);
    console.log('Result:', validResult.valid ? 'PASSED ✅' : 'FAILED ❌');
    if (!validResult.valid) console.error('Reason:', validResult.reason);

    // 2. Test Forged Token (Wrong Secret)
    console.log('\n[TEST 2] Verifying a forged token (wrong secret)...');
    const forgedToken = await generateJWT(testPayload, 'attacker-secret');
    const forgedResult = await verifyJWT(forgedToken, mockEnv.JWT_SECRET);
    console.log('Result:', !forgedResult.valid && forgedResult.reason === 'Signature mismatch' ? 'PASSED ✅ (Rejected correctly)' : 'FAILED ❌');
    if (forgedResult.valid) console.error('Error: Token with wrong secret was accepted!');

    // 3. Test Modified Payload
    console.log('\n[TEST 3] Verifying a modified payload...');
    const parts = validToken.split('.');
    const modifiedPayload = b64UrlEncode({ ...testPayload, sub: 'admin-user' });
    const tamperedToken = `${parts[0]}.${modifiedPayload}.${parts[2]}`;
    const tamperedResult = await verifyJWT(tamperedToken, mockEnv.JWT_SECRET);
    console.log('Result:', !tamperedResult.valid ? 'PASSED ✅ (Rejected tampering)' : 'FAILED ❌');
    if (tamperedResult.valid) console.error('Error: Tampered token was accepted!');

    // 4. Test Expired Token
    console.log('\n[TEST 4] Verifying an expired token...');
    const expiredPayload = { ...testPayload, exp: Math.floor(Date.now() / 1000) - 60 };
    const expiredToken = await generateJWT(expiredPayload, mockEnv.JWT_SECRET);
    const expiredResult = await verifyJWT(expiredToken, mockEnv.JWT_SECRET);
    console.log('Result:', !expiredResult.valid && expiredResult.reason === 'Token expired' ? 'PASSED ✅ (Detected expiry)' : 'FAILED ❌');
    
    console.log('\n--- TESTS COMPLETE ---');
}

runTests().catch(console.error);
