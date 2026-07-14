// Firebase Configuration and Initialization
const firebaseConfig = {
  apiKey: "AIzaSyCSRv9FngUUknBEiIFPZEKdJe8qSwBWngc",
  authDomain: "azarine-25eec.firebaseapp.com",
  projectId: "azarine-25eec",
  storageBucket: "azarine-25eec.firebasestorage.app",
  messagingSenderId: "1023045938940",
  appId: "1:1023045938940:web:9ac2a22a07842a39acb179",
  measurementId: "G-VD2K8HE0XY"
};

let db = null;
let useFirebase = false;

// Cek konfigurasi Firebase
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        useFirebase = true;
        console.log("Firebase Firestore berhasil diinisialisasi.");
    } catch (error) {
        console.error("Gagal menginisialisasi Firebase. Beralih ke LocalStorage fallback.", error);
    }
}

// Fallback Database menggunakan LocalStorage jika Firebase belum dikonfigurasi
if (!useFirebase) {
    console.log("Menggunakan LocalStorage sebagai basis data lokal (Fallback).");
    
    // Inisialisasi data produk bawaan jika LocalStorage kosong
    const defaultProducts = [
        {
            id: "p1",
            name: "Hydrasoothe Sunscreen Gel SPF 45 PA++++",
            category: "sunscreen",
            desc: "Sunscreen bertekstur gel air super dingin, bebas alkohol, minyak, dan silikon. Sangat cocok untuk kulit berminyak, kombinasi, dan berjerawat.",
            ingredients: "Royal Jelly, Aloe Vera, Green Tea, Resveratrol",
            price: "Rp 66.000 - Rp 73.000",
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400",
            link: "https://shopee.co.id/azarinecosmetic",
            isBestSeller: true
        },
        {
            id: "p2",
            name: "Hydramax-C Sunscreen Serum SPF 50 PA++++",
            category: "sunscreen",
            desc: "Sunscreen bertekstur krim-gel yang sangat menghidrasi dan memberikan efek glowing instan. Sempurna untuk kulit normal cenderung kering.",
            ingredients: "Vitamin C, Hyaluronic Acid, Ectoin",
            price: "Rp 47.000 - Rp 68.000",
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
            link: "https://shopee.co.id/azarinecosmetic",
            isBestSeller: false
        },
        {
            id: "p3",
            name: "Niacinamide 5% + Moisture Sepiwhite Serum",
            category: "serum",
            desc: "Mengatasi kulit kusam dengan cepat, memudarkan noda hitam bekas jerawat (PIE/PIH) dan meratakan warna kulit tidak merata.",
            ingredients: "Niacinamide 5%, Sepiwhite, Centella Asiatica",
            price: "Rp 59.000",
            image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=400",
            link: "https://shopee.co.id/azarinecosmetic",
            isBestSeller: true
        },
        {
            id: "p4",
            name: "Acne Spot Serum",
            category: "serum",
            desc: "Serum totol jerawat bertekstur cair yang cepat mengempeskan jerawat meradang tanpa mengeringkan kulit sekitarnya.",
            ingredients: "Succinic Acid, Cinnamon Bark, Centella Asiatica",
            price: "Rp 29.000 - Rp 35.000",
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
            link: "https://shopee.co.id/azarinecosmetic",
            isBestSeller: false
        },
        {
            id: "p5",
            name: "Oil Free Brightening Daily Moisturizer",
            category: "moisturizer",
            desc: "Pelembap gel ringan bebas kilap untuk menghidrasi kulit berminyak serta membantu mengontrol produksi sebum berlebih.",
            ingredients: "Centella Asiatica, Royal Jelly, Arbutin",
            price: "Rp 48.000 - Rp 70.000",
            image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=400",
            link: "https://shopee.co.id/azarinecosmetic",
            isBestSeller: false
        },
        {
            id: "p6",
            name: "Acne Gentle Cleansing Foam",
            category: "facialwash",
            desc: "Sabun cuci muka busa lembut tanpa kandungan sabun (soap-free) yang membersihkan sisa kotoran tanpa memicu efek ketarik.",
            ingredients: "Salicylic Acid, Portulaca, Allantoin",
            price: "Rp 23.000 - Rp 36.000",
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400",
            link: "https://shopee.co.id/azarinecosmetic",
            isBestSeller: true
        }
    ];

    if (!localStorage.getItem("azarine_products")) {
        localStorage.setItem("azarine_products", JSON.stringify(defaultProducts));
    }

    if (!localStorage.getItem("azarine_leads")) {
        localStorage.setItem("azarine_leads", JSON.stringify([]));
    }

    // Mock Firestore API
    db = {
        collection: function(colName) {
            return {
                get: function() {
                    return new Promise((resolve) => {
                        const items = JSON.parse(localStorage.getItem("azarine_" + colName) || "[]");
                        resolve({
                            forEach: function(callback) {
                                items.forEach(item => {
                                    callback({
                                        id: item.id,
                                        data: () => item
                                    });
                                });
                            }
                        });
                    });
                },
                add: function(data) {
                    return new Promise((resolve) => {
                        const items = JSON.parse(localStorage.getItem("azarine_" + colName) || "[]");
                        const newId = colName.substring(0, 1) + "_" + Date.now();
                        const newItem = { id: newId, ...data };
                        items.push(newItem);
                        localStorage.setItem("azarine_" + colName, JSON.stringify(items));
                        resolve({ id: newId });
                    });
                },
                doc: function(docId) {
                    return {
                        delete: function() {
                            return new Promise((resolve) => {
                                const items = JSON.parse(localStorage.getItem("azarine_" + colName) || "[]");
                                const filtered = items.filter(item => item.id !== docId);
                                localStorage.setItem("azarine_" + colName, JSON.stringify(filtered));
                                resolve();
                            });
                        }
                    };
                }
            };
        }
    };
}
