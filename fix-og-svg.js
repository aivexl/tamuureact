const fs = require('fs');
const path = 'apps/api/tamuu-api-worker.js';
let content = fs.readFileSync(path, 'utf8');

const newHandler = `            // ============================================
            // DYNAMIC INVITATION CARD (OG IMAGE) - SVG Edition
            // ============================================
            if (path === '/api/og' && method === 'GET') {
                const eventName = url.searchParams.get('event') || 'The Wedding of';
                const name1 = url.searchParams.get('n1') || 'Andi';
                const name2 = url.searchParams.get('n2') || 'Sita';
                const dateTime = url.searchParams.get('time') || '';
                const location = url.searchParams.get('loc') || '';
                const guestName = url.searchParams.get('to') || 'Tamu Undangan';
                const qrData = url.searchParams.get('qr') || 'https://tamuu.id';

                try {
                    if (!satoriInitialized) {
                        const yoga = await initYoga();
                        initSatori(yoga);
                        satoriInitialized = true;
                    }

                    const fontData = await getFontData();
                    const qrCodeSvg = await QRCode.toString(qrData, {
                        type: 'svg',
                        margin: 1,
                        width: 400,
                        color: { dark: '#1a1a1a', light: '#ffffff' }
                    });
                    const qrCodeDataUri = \`data:image/svg+xml;base64,\${btoa(qrCodeSvg)}\`;

                    const svg = await satori(
                        {
                            type: 'div',
                            props: {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '1080px',
                                    height: '1080px',
                                    backgroundColor: '#ffffff',
                                    padding: '100px',
                                    fontFamily: 'Inter',
                                    position: 'relative'
                                },
                                children: [
                                    {
                                        type: 'div',
                                        props: {
                                            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' },
                                            children: [
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { display: 'flex', flexDirection: 'column', width: '65%' },
                                                        children: [
                                                            {
                                                                type: 'img',
                                                                props: {
                                                                    src: 'https://api.tamuu.id/assets/tamuu-logo-header.png',
                                                                    style: { width: '120px', opacity: 0.4, marginBottom: '60px' }
                                                                }
                                                            },
                                                            {
                                                                type: 'div',
                                                                props: {
                                                                    style: { fontSize: '20px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '12px', fontWeight: 500, marginBottom: '40px' },
                                                                    children: eventName.toUpperCase()
                                                                }
                                                            },
                                                            {
                                                                type: 'div',
                                                                props: {
                                                                    style: { fontSize: '72px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-2px' },
                                                                    children: name1.toUpperCase()
                                                                }
                                                            },
                                                            {
                                                                type: 'div',
                                                                props: {
                                                                    style: { fontSize: '48px', color: '#cbd5e1', fontWeight: 200, margin: '15px 0' },
                                                                    children: '&'
                                                                }
                                                            },
                                                            {
                                                                type: 'div',
                                                                props: {
                                                                    style: { fontSize: '72px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-2px' },
                                                                    children: name2.toUpperCase()
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { width: '280px', height: '280px', display: 'flex', paddingTop: '20px' },
                                                        children: [
                                                            {
                                                                type: 'img',
                                                                props: { src: qrCodeDataUri, style: { width: '100%', height: '100%' } }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        type: 'div',
                                        props: {
                                            style: { display: 'flex', flexDirection: 'column', marginTop: '100px' },
                                            children: [
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { fontSize: '28px', color: '#475569', fontWeight: 700, letterSpacing: '4px' },
                                                        children: dateTime.toUpperCase()
                                                    }
                                                },
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { fontSize: '24px', color: '#94a3b8', fontWeight: 400, marginTop: '15px', letterSpacing: '2px' },
                                                        children: location.toUpperCase()
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        type: 'div',
                                        props: {
                                            style: { marginTop: 'auto', display: 'flex', flexDirection: 'column', width: '100%' },
                                            children: [
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { fontSize: '20px', color: '#94a3b8', letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '10px', opacity: 0.6 },
                                                        children: 'Kepada Yth:'
                                                    }
                                                },
                                                {
                                                    type: 'div',
                                                    props: {
                                                        style: { fontSize: '48px', fontWeight: 800, color: '#1e293b' },
                                                        children: guestName.toUpperCase()
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            width: 1080,
                            height: 1080,
                            fonts: [
                                {
                                    name: 'Inter',
                                    data: typeof fontData === 'object' && fontData.regular ? fontData.regular : fontData,
                                    weight: 400,
                                    style: 'normal',
                                }
                            ],
                        }
                    );

                    return new Response(svg, {
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'image/svg+xml',
                            'Cache-Control': 'public, max-age=31536000, immutable'
                        }
                    });

                } catch (error) {
                    console.error('SVG Generation error:', error);
                    return json({ error: 'Failed to generate card', details: error.message }, { ...corsHeaders, status: 500 });
                }
            }`;

const regex = /\/\/ =+[\s\S]*?\/\/ DYNAMIC INVITATION CARD \(OG IMAGE\)[\s\S]*?if \(path === '\/api\/og'[\s\S]*?\} \n\s+catch \(error\) \{[\s\S]*?return json\(\{ error: 'Failed to generate image', details: error.message[\s\S]*?\}\); \n\s+\}\n\s+\}/;

// Better regex attempt - search by the start and end tokens we know
const startToken = "// ============================================\n            // DYNAMIC INVITATION CARD (OG IMAGE)\n            // ============================================";
const endToken = "status: 500 });\n                }\n            }";

const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken, startIndex) + endToken.length;

if (startIndex !== -1 && endIndex > startIndex) {
    content = content.substring(0, startIndex) + newHandler + content.substring(endIndex);
    fs.writeFileSync(path, content);
    console.log('Update OG Handler success');
} else {
    console.log('Tokens not found:', startIndex, content.indexOf(endToken, startIndex));
}
