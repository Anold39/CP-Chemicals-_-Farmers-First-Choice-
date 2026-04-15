/* ==========================================
   1. DATA OBJECTS & GLOBAL STATE
   ========================================== */

const branches = [
    { name: "Mount Hampden (HQ)", location: "16km peg Lomagundi Road", phone: "+263777379313", mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15197.666687042572!2d30.9167!3d-17.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1931080800000000%3A0x0!2zMTfCsDQ1JzAwLjAiUyAzMMKwNTUnMDAuMCJF!5e0!3m2!1sen!2szw!4v1620000000000!5m2!1sen!2szw", agronomist: "Anold" },
    { name: "Mvurwi Branch", location: "Mvurwi Town Center", phone: "+263777379313", mapUrl: "#", agronomist: "Simba" },
    { name: "Bindura Branch", location: "Shop 12 Thurlows Avenue", phone: "+263777379313", mapUrl: "#", agronomist: "Anold" },
    { name: "Chegutu Branch", location: "CBD, Shop 1, Alexandra Ave", phone: "+263777379313", mapUrl: "#", agronomist: "Simba" },
    { name: "Chinhoyi Branch", location: "Stand 2 Robson Manyika Road", phone: "+263777379313", mapUrl: "#", agronomist: "Anold" },
    { name: "Granite Side Branch", location: "No. 112 Seke road", phone: "+263777379313", mapUrl: "#", agronomist: "Mbetsa" }
];

const agriData = {
    tips: [
        "<h3>Pro Tip: Moisture</h3><p>Ensure soil moisture is at 60% before applying chemicals for maximum efficacy.</p>",
        "<h3>Pro Tip: Water pH</h3><p>High pH (alkaline) water can neutralize herbicides. Always test your water source.</p>"
    ],
    weed: [
        "<h3>Weed ID: Yellow Nutsedge</h3><p>Recognizable by its triangular stem. Best treated with CP-Halt early.</p>",
        "<h3>Weed ID: Couch Grass</h3><p>Requires systemic herbicides for total control of underground rhizomes.</p>"
    ],
    calibrate: [
        "<h3>The 100m Test</h3><p>Spray a 100m strip to calculate exactly how many litres you use per hectare.</p>",
        "<h3>Nozzle Wear</h3><p>If output varies by 10%, replace the nozzle. Worn nozzles waste chemicals.</p>"
    ]
};

let currentIndices = { tips: 0, weed: 0, calibrate: 0 };
let cart = JSON.parse(localStorage.getItem('CP_CART')) || [];

/* ==========================================
   2. SHOPPING CART LOGIC
   ========================================== */

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const countElement = document.getElementById('cart-count');
    if (countElement) countElement.innerText = totalItems;
}

function addToCart(name, price, qtyInputId) {
    const quantityInput = document.getElementById(qtyInputId);
    const quantity = parseInt(quantityInput.value);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    const existingItemIndex = cart.findIndex(item => item.name === name);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].qty += quantity;
        cart[existingItemIndex].subtotal = cart[existingItemIndex].qty * price;
    } else {
        cart.push({ name, price: parseFloat(price), qty: quantity, subtotal: price * quantity });
    }

    localStorage.setItem('CP_CART', JSON.stringify(cart));
    updateCartCount();
    alert(`${quantity}x ${name} added to cart!`);
    quantityInput.value = 1;
}

function loadCartPage() {
    const cartTable = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    if (!cartTable) return; 

    cartTable.innerHTML = ''; 
    let grandTotal = 0;

    if (cart.length === 0) {
        cartTable.innerHTML = '<tr><td colspan="5" style="text-align:center;">Your cart is empty.</td></tr>';
    } else {
        cart.forEach((item, index) => {
            grandTotal += item.subtotal; 
            cartTable.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.qty}</td>
                    <td><b>$${item.subtotal.toFixed(2)}</b></td>
                    <td><button onclick="removeItem(${index})" style="background:red; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">Remove</button></td>
                </tr>`;
        });
    }
    if (totalElement) totalElement.innerText = `$${grandTotal.toFixed(2)}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('CP_CART', JSON.stringify(cart));
    loadCartPage();
    updateCartCount();
}

/* ==========================================
   3. BRANCH & MAP LOGIC
   ========================================== */

function loadBranches() {
    const grid = document.getElementById('branchGrid');
    if (!grid) return;
    grid.innerHTML = branches.map(branch => `
        <div class="card">
            <h3>${branch.name}</h3>
            <p><i class="fas fa-map-marker-alt"></i> ${branch.location}</p>
            <p><i class="fas fa-user-tie"></i> Agronomist: ${branch.agronomist}</p>
            <div style="margin-top:15px;">
                <button class="btn-shop" onclick="openMap('${branch.mapUrl}')">Map</button>
                <a href="tel:${branch.phone}" class="btn-shop" style="text-decoration:none; background:#555;">Call</a>
            </div>
        </div>
    `).join('');
}

function openMap(url) {
    const modal = document.getElementById('mapModal');
    const container = document.getElementById('mapContainer');
    if (modal && container) {
        container.innerHTML = `<iframe src="${url}" width="100%" height="400" style="border:0;" allowfullscreen></iframe>`;
        modal.style.display = "flex";
    }
}

function closeMap() {
    const modal = document.getElementById('mapModal');
    if (modal) modal.style.display = "none";
}

/* ==========================================
   4. AGRITALK & STAFF POSTING
   ========================================== */

function openAgri(topic) {
    const display = document.getElementById('agri-display');
    if (!display) return;

    // UI Highlight for buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const contentList = agriData[topic];
    const index = currentIndices[topic];
    display.innerHTML = contentList[index];
    currentIndices[topic] = (index + 1) % contentList.length;
}

async function publishPost() {
    const title = document.getElementById('blogTitle').value;
    const content = document.getElementById('blogContent').value;
    const file = document.getElementById('blogImage').files[0];

    if (!title || !content) { alert("Title and Content required"); return; }

    let imageData = "";
    if (file) {
        const reader = new FileReader();
        imageData = await new Promise(r => { reader.onload = e => r(e.target.result); reader.readAsDataURL(file); });
    }

    const posts = JSON.parse(localStorage.getItem('CP_BLOGS')) || [];
    posts.unshift({ title, content, image: imageData, date: new Date().toLocaleDateString() });
    
    try {
        localStorage.setItem('CP_BLOGS', JSON.stringify(posts));
        alert("Post Published!");
        location.reload();
    } catch(e) { alert("Image too large for storage."); }
}

/* ==========================================
   5. STAFF DASHBOARD LOGIC
   ========================================== */

function loadFarmerQueries() {
    const container = document.getElementById('incoming-queries-area');
    if (!container) return;
    const queries = JSON.parse(localStorage.getItem('CP_QUERIES')) || [];

    container.innerHTML = queries.length === 0 ? "<p>No inquiries.</p>" : 
        queries.map((q, i) => `
            <div class="card" style="text-align:left; margin-bottom:10px;">
                <span style="font-size:0.7rem; color:green;">${q.status}</span>
                <h4>${q.name} - ${q.branch}</h4>
                <p>${q.message}</p>
                <button onclick="deleteQuery(${i})" style="background:red; color:white; border:none; padding:5px; border-radius:4px;">Dismiss</button>
            </div>
        `).join('');
}

function deleteQuery(i) {
    let q = JSON.parse(localStorage.getItem('CP_QUERIES'));
    q.splice(i, 1);
    localStorage.setItem('CP_QUERIES', JSON.stringify(q));
    loadFarmerQueries();
}

/* ==========================================
   6. INITIALIZATION
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('branchGrid')) loadBranches();
    if (document.getElementById('cart-items')) loadCartPage();
    if (document.getElementById('incoming-queries-area')) loadFarmerQueries();
    
    // Auto-close modal on outside click
    window.onclick = (e) => { if (e.target.className === 'modal') closeMap(); };
});