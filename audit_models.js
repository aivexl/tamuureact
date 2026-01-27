const fs = require('fs');

async function auditModels() {
    const apiKey = 'AIzaSyAJPi2nk9hd1crhL7bitnPAq912JpBcsUQ';
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        console.log('--- Fetching Model Audit Data ---');
        const response = await fetch(url);
        const data = await response.json();

        if (!data.models) {
            console.error('No models found or error:', data);
            return;
        }

        const audit = data.models.map(m => ({
            name: m.name,
            version: m.version,
            methods: m.supportedGenerationMethods,
            v1_support: m.supportedGenerationMethods?.includes('generateContent'),
        }));

        console.log(JSON.stringify(audit, null, 2));
    } catch (err) {
        console.error('Audit failed:', err);
    }
}

auditModels();
