/**
 * api/analyze.js — Vercel Serverless Function
 *
 * Proxy aman ke Vertex AI (Gemini di Google Cloud). Autentikasi memakai
 * Service Account (OAuth2), BUKAN API key Gemini berbayar. Kredit ditagih ke
 * project GCP (bisa memakai free trial $300).
 *
 * Env var yang dibutuhkan di Vercel (Server-side, JANGAN di client):
 *   GCP_SERVICE_ACCOUNT  = isi JSON penuh service account (satu baris atau multi-baris)
 *   GCP_LOCATION         = (opsional) lokasi model, default "global"
 *   GEMINI_MODEL         = (opsional) default "gemini-3.5-flash"
 */
import { GoogleAuth } from 'google-auth-library';

let cachedAuth = null;

function getAuth() {
    if (cachedAuth) return cachedAuth;
    const raw = process.env.GCP_SERVICE_ACCOUNT;
    if (!raw) throw new Error('GCP_SERVICE_ACCOUNT belum diset di environment Vercel.');
    const credentials = JSON.parse(raw);
    cachedAuth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    return cachedAuth;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { mimeType, imageBase64, prompt } = req.body || {};
        if (!imageBase64 || !prompt) {
            return res.status(400).json({ error: 'Payload tidak lengkap.' });
        }

        const auth = getAuth();
        const projectId = JSON.parse(process.env.GCP_SERVICE_ACCOUNT).project_id;
        const location = process.env.GCP_LOCATION || 'global';
        const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

        // Endpoint Vertex: "global" memakai host aiplatform.googleapis.com,
        // lokasi regional memakai host {location}-aiplatform.googleapis.com
        const host = location === 'global'
            ? 'aiplatform.googleapis.com'
            : `${location}-aiplatform.googleapis.com`;
        const url = `https://${host}/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const accessToken = tokenResponse.token;

        const vertexRes = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [
                        { inlineData: { mimeType, data: imageBase64 } },
                        { text: prompt }
                    ]
                }]
            })
        });

        const data = await vertexRes.json();
        if (!vertexRes.ok) {
            const msg = Array.isArray(data) ? data[0]?.error?.message : data.error?.message;
            return res.status(vertexRes.status).json({ error: msg || `HTTP ${vertexRes.status}` });
        }
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Gagal memproses permintaan.' });
    }
}
