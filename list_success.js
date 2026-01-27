const apiKey = 'AIzaSyAJPi2nk9hd1crhL7bitnPAq912JpBcsUQ';
async function findGoodModel() {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listRes.json();
    const candidates = listData.models
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));

    console.log('--- Successful Models ---');
    for (const model of candidates) {
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: "hi" }] }] })
            });
            const data = await res.json();
            if (!data.error) {
                console.log(model);
            }
        } catch (e) { }
    }
}
findGoodModel();
