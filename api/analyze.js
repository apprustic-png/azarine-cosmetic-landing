/**
 * api/analyze.js — Vercel Serverless Function
 * Menjadi proxy aman ke Gemini API. GEMINI_API_KEY disimpan sebagai
 * Environment Variable di Vercel (Server-side), TIDAK pernah dikirim ke browser.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY belum diset di environment Vercel.' });
    }

    try {
        const { mimeType, imageBase64, prompt } = req.body || {};
        if (!imageBase64 || !prompt) {
            return res.status(400).json({ error: 'Payload tidak lengkap.' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { inline_data: { mime_type: mimeType, data: imageBase64 } },
                        { text: prompt }
                    ]
                }],
                generation_config: { thinking_level: 'low' }
            })
        });

        const data = await geminiRes.json();
        if (!geminiRes.ok) {
            return res.status(geminiRes.status).json({ error: data.error?.message || `HTTP ${geminiRes.status}` });
        }
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Gagal memproses permintaan.' });
    }
}
