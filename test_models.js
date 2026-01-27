const apiKey = 'AIzaSyAJPi2nk9hd1crhL7bitnPAq912JpBcsUQ';
const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-preview',
    'gemini-1.5-pro'
];

async function testModels() {
    for (const model of models) {
        console.log(`--- Testing Model: ${model} ---`);
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "hi" }] }]
                })
            });
            const data = await response.json();
            if (data.error) {
                console.log(`[${model}] Error: ${data.error.message}`);
                console.log(`[${model}] Details: ${JSON.stringify(data.error.details)}`);
            } else {
                console.log(`[${model}] Success: ${data.candidates?.[0]?.content?.parts?.[0]?.text}`);
            }
        } catch (err) {
            console.log(`[${model}] Fetch Failed: ${err.message}`);
        }
        console.log('\n');
    }
}

testModels();
