
$path = "c:\Users\62896\Documents\tamuureact\apps\api\tamuu-api-worker.js"
$content = Get-Content $path -Raw

$oldCode = @"
                const systemInstruction = {
                    parts: [{ text: systemPrompt }]
                };

                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${env.GEMINI_API_KEY}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            system_instruction: systemInstruction,
                            contents: messages.map(m => ({
                                role: m.role === 'assistant' ? 'model' : 'user',
                                parts: [{ text: m.content }]
                            }))
                        })
                    });

                    const data = await response.json();
                    
                    if (data.error) {
                        return json({ content: ``Gemini API Error: \${data.error.message}`` }, corsHeaders);
                    }

                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    
                    if (!text) {
                        const blockReason = data.candidates?.[0]?.finishReason || "Unknown";
                        return json({ content: ``AI tidak bisa memberi jawaban (Reason: \${blockReason}). Coba pertanyaan lain.`` }, corsHeaders);
                    }

                    return json({ content: text }, corsHeaders);
                } catch (err) {
                    return json({ content: ``Technical Error: \${err.message}`` }, corsHeaders);
                }
"@

$newCode = @"
                try {
                    const text = await fetchGemini(systemPrompt, messages);
                    return json({ content: text }, corsHeaders);
                } catch (err) {
                    const friendlyMsg = err.message.includes('quota') || err.message.includes('padat')
                        ? "Maaf, antrean AI sedang penuh. Tunggu sekitar 15 detik dan silakan coba tanya lagi ya! ✨"
                        : ``Assistant Error: \${err.message}``;
                    return json({ content: friendlyMsg }, corsHeaders);
                }
"@

# Note: Using -replace with escaping or just string substitution
$content = $content.Replace($oldCode, $newCode)
Set-Content $path $content -NoNewline
