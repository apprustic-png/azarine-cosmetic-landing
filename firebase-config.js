/**
 * firebase-config.js
 * Inisialisasi Firebase menggunakan nilai dari ENV_CONFIG (env-config.js).
 * env-config.js TIDAK di-commit ke GitHub.
 */

// Pastikan ENV_CONFIG sudah dimuat sebelum file ini (via <script src="env-config.js">)
const firebaseConfig = {
    apiKey: ENV_CONFIG.FIREBASE_API_KEY,
    authDomain: ENV_CONFIG.FIREBASE_AUTH_DOMAIN,
    projectId: ENV_CONFIG.FIREBASE_PROJECT_ID,
    storageBucket: ENV_CONFIG.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: ENV_CONFIG.FIREBASE_MESSAGING_SENDER_ID,
    appId: ENV_CONFIG.FIREBASE_APP_ID,
    measurementId: ENV_CONFIG.FIREBASE_MEASUREMENT_ID
};

let db = null;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("✅ Firebase Firestore berhasil diinisialisasi.");
} catch (error) {
    console.error("❌ Gagal menginisialisasi Firebase:", error);
    // Fallback ke LocalStorage jika Firebase gagal
    db = buildLocalStorageFallback();
}

function buildLocalStorageFallback() {
    console.warn("⚠️ Menggunakan LocalStorage sebagai fallback.");
    const defaultProducts = [
        { id: "p1", name: "Hydrasoothe Sunscreen Gel SPF 45 PA++++", category: "sunscreen", desc: "Sunscreen bertekstur gel air super dingin, bebas alkohol.", ingredients: "Royal Jelly, Aloe Vera, Green Tea, Resveratrol", price: "Rp 66.000 - Rp 73.000", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600", link: "https://shopee.co.id/azarinecosmetic", isBestSeller: true },
        { id: "p2", name: "Niacinamide 5% + Moisture Sepiwhite Serum", category: "serum", desc: "Mengatasi kulit kusam, memudarkan noda hitam bekas jerawat.", ingredients: "Niacinamide 5%, Sepiwhite, Centella Asiatica", price: "Rp 59.000", image: "https://images.unsplash.com/photo-1631390243880-fb0a00e24de8?auto=format&fit=crop&q=80&w=600", link: "https://shopee.co.id/azarinecosmetic", isBestSeller: true },
        { id: "p3", name: "Oil Free Brightening Daily Moisturizer", category: "moisturizer", desc: "Pelembap harian bertekstur gel ringan tanpa minyak.", ingredients: "Centella Asiatica, Royal Jelly, Arbutin", price: "Rp 48.000 - Rp 70.000", image: "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?auto=format&fit=crop&q=80&w=600", link: "https://shopee.co.id/azarinecosmetic", isBestSeller: false },
        { id: "p4", name: "Acne Gentle Cleansing Foam", category: "facialwash", desc: "Pembersih wajah busa lembut, cocok untuk kulit berjerawat.", ingredients: "Salicylic Acid, Portulaca, Allantoin", price: "Rp 23.000 - Rp 36.000", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&q=80&w=600", link: "https://shopee.co.id/azarinecosmetic", isBestSeller: true }
    ];

    if (!localStorage.getItem("azarine_products")) {
        localStorage.setItem("azarine_products", JSON.stringify(defaultProducts));
    }
    if (!localStorage.getItem("azarine_leads")) {
        localStorage.setItem("azarine_leads", JSON.stringify([]));
    }

    return {
        collection: (colName) => ({
            get: () => new Promise(resolve => {
                const items = JSON.parse(localStorage.getItem("azarine_" + colName) || "[]");
                resolve({ forEach: (cb) => items.forEach(item => cb({ id: item.id, data: () => item })) });
            }),
            add: (data) => new Promise(resolve => {
                const items = JSON.parse(localStorage.getItem("azarine_" + colName) || "[]");
                const newId = colName.charAt(0) + "_" + Date.now();
                items.push({ id: newId, ...data });
                localStorage.setItem("azarine_" + colName, JSON.stringify(items));
                resolve({ id: newId });
            }),
            doc: (docId) => ({
                delete: () => new Promise(resolve => {
                    const items = JSON.parse(localStorage.getItem("azarine_" + colName) || "[]");
                    localStorage.setItem("azarine_" + colName, JSON.stringify(items.filter(i => i.id !== docId)));
                    resolve();
                })
            })
        })
    };
}
