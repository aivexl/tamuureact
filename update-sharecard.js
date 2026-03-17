const fs = require('fs');
let code = fs.readFileSync('apps/web/src/components/UserEditor/Panels/ShareCardPanel.tsx', 'utf8');

// 1. Tambahkan import useRef dan html2canvas, storage
code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';");
if (!code.includes('import html2canvas')) {
    code = code.replace("import { useStore } from '@/store/useStore';", "import { useStore } from '@/store/useStore';\nimport html2canvas from 'html2canvas';");
}
code = code.replace("import { invitations } from '@/lib/api';", "import { invitations, storage } from '@/lib/api';");

// 2. Modifikasi state di dalam komponen
code = code.replace(
    "const [guestName, setGuestName] = useState('TAMU UNDANGAN');",
    "const [guestName, setGuestName] = useState('TAMU UNDANGAN');\n    const [savedImageUrl, setSavedImageUrl] = useState('');\n    const cardRef = useRef<HTMLDivElement>(null);"
);

// 3. Tambahkan pengambilan og_image_url di loadData
code = code.replace(
    "setLocation(settings.loc || '');",
    "setLocation(settings.loc || '');\n                            setSavedImageUrl(settings.og_image_url || '');"
);

// 4. Ubah logika handleSave
const newHandleSave = `
    const handleSave = async () => {
        try {
            setSaving(true);
            let finalImageUrl = savedImageUrl;

            // 1. Generate Image from DOM via html2canvas
            if (cardRef.current) {
                try {
                    const canvas = await html2canvas(cardRef.current, {
                        scale: 3, // High quality render (3x resolution)
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                    });

                    // 2. Convert to Blob
                    const blob = await new Promise<Blob | null>((resolve) => {
                        canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
                    });

                    if (blob) {
                        // 3. Upload to R2 Storage
                        const file = new File([blob], \`og-\${slug}-\${Date.now()}.png\`, { type: 'image/png' });
                        const uploadResult = await storage.upload(file, 'og-images', { userId: user?.id });
                        finalImageUrl = uploadResult.url;
                        setSavedImageUrl(finalImageUrl);
                    }
                } catch (imgError) {
                    console.error('Failed to generate/upload image:', imgError);
                }
            }

            const ogSettings = {
                event: eventName,
                n1: name1,
                n2: name2,
                time: dateTime,
                loc: location,
                og_image_url: finalImageUrl
            };
            
            await invitations.update(invitationId, {
                og_settings: JSON.stringify(ogSettings)
            });
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 2000);
        } catch (error: any) {
            console.error('Failed to save OG settings:', error);
            showModal({
                title: 'Gagal Menyimpan',
                message: error.message || 'Terjadi kesalahan saat menyimpan pengaturan Kartu Share.',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };
`;

// Buang toggle previewMode dan getPreviewUrl
code = code.replace(/const \[previewMode, setPreviewMode\] = useState\<'css' \| 'api'\>\('css'\);/g, "");
code = code.replace(/const getPreviewUrl = \(\) => {[\s\S]*?return \`\${baseUrl}\?\${params\.toString\(\)}\`;\n    };/g, "");

// Ganti copyUrl agar copy URL asli
const newCopyUrl = `
    const copyUrl = () => {
        if (!savedImageUrl) {
             showModal({
                title: 'Belum Disimpan',
                message: 'Silakan Simpan Pengaturan Kartu terlebih dahulu untuk menghasilkan Link Gambar.',
                type: 'error'
            });
            return;
        }
        navigator.clipboard.writeText(savedImageUrl);
        showModal({
            title: 'URL Disalin',
            message: 'Link gambar share statis telah disalin ke clipboard.',
            type: 'success'
        });
    };
`;
code = code.replace(/const copyUrl = \(\) => {[\s\S]*?\}\);\n    };/g, newCopyUrl);

// Ganti block UI preview
code = code.replace(/<div className="flex bg-slate-100 p-1 rounded-xl mr-2">[\s\S]*?<\/div>/, "");
code = code.replace(/href=\{getPreviewUrl\(\)\}/, "href={savedImageUrl || '#'}");

// Hapus block img logic dari previewMode dan tambahkan cardRef
code = code.replace(/{previewMode === 'api' \? \([\s\S]*?\) : \(/, "");
code = code.replace(/<div className="w-full h-full bg-white flex flex-col p-\[10%\] relative leading-none"/, '<div ref={cardRef} className="w-full h-full bg-white flex flex-col p-[10%] relative leading-none"');
// Hapus closing parenthesis dari previewMode
code = code.replace(/<\/div>\n                        \)}/, "</div>");

// Tulis juga ganti user context untuk storage
code = code.replace(/const \{ currentInvitationId: invitationId, slug, showModal \} = useStore\(\);/, "const { currentInvitationId: invitationId, slug, showModal, user } = useStore();");

// Replace handleSave
const handleSaveRegex = /const handleSave = async \(\) => \{[\s\S]*?finally \{\n            setSaving\(false\);\n        \}\n    \};/g;
code = code.replace(handleSaveRegex, newHandleSave);

fs.writeFileSync('apps/web/src/components/UserEditor/Panels/ShareCardPanel.tsx', code);
console.log('Update selesai');
