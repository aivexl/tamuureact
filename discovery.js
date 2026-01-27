const apiKey = 'AIzaSyAJPi2nk9hd1crhL7bitnPAq912JpBcsUQ';

async function auditAndTest() {
    console.log('--- Model Discovery ---');
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();

    if (!listData.models) {
        console.error('List failed:', listData);
        return;
    }

    const candidates = listData.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));

    console.log(`Found candidates: ${candidates.join(', ')}`);

    for (const model of candidates) {
        process.stdout.write(`Testing [${model}]... `);
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
            });
            const data = await res.json();
            if (data.error) {
                console.log(`❌ Quota/Error: ${data.error.message.substring(0, 50)}...`);
            } else {
                console.log(`✅ SUCCESS! Response: ${data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 30)}...`);
            }
        } catch (e) {
            console.log(`❌ Failed: ${e.message}`);
        }
    }
}

auditAndTest();
