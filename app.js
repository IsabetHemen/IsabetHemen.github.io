// Global Müşteri Uygulama Durumu
let products = [];
let cart = []; // [{ id, name, price, quantity }]
let activeCategory = 'Tümü';
let searchQuery = '';
let marketOpen = true;

// Yasaklı Sınıflar (Kız Sınıfları)
const RESTRICTED_CLASSES = ['8-D', '8-E', '7-D', '7-E', '6-D', '6-E', '5-C', '5-D'];

// Backend sunucu adresi (Amazon VDS IP'nizi veya alan adınızı buraya yazın)
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : (window.location.protocol === 'file:' ? 'http://localhost:3000' : 'http://13.51.167.62:3000'); // Kendi Amazon VDS IP adresiniz entegre edildi!

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', async () => {
  await checkMarketStatus();
  if (marketOpen) {
    await loadProducts();
  }

  // Sınıf seçildiğinde üst barda göster ve yasak kontrolünü yap
  const classSelect = document.getElementById('order-class');
  if (classSelect) {
    classSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      const headerDisplay = document.getElementById('selected-delivery-class');
      if (headerDisplay && val) {
        headerDisplay.textContent = 'Sınıf: ' + val;
      }
      
      // Sınıf yasaklı mı kontrol et
      checkClassroomRestriction(val);
    });
  }
});

// Market Açık mı Kapalı mı Denetle
async function checkMarketStatus() {
  try {
    if (window.location.protocol === 'file:') {
      throw new Error('Local file mode');
    }
    const res = await fetch(`${BACKEND_URL}/api/market-status`);
    const data = await res.json();
    
    const badge = document.getElementById('market-status-badge');
    const statusText = document.getElementById('market-status-text');
    const marketScreen = document.getElementById('market-screen');
    const closedScreen = document.getElementById('closed-screen');

    if (data.status === 'acik') {
      marketOpen = true;
      badge.className = 'market-status-badge open';
      statusText.textContent = 'Market Açık';
      marketScreen.style.display = 'block';
      closedScreen.style.display = 'none';
    } else {
      marketOpen = false;
      badge.className = 'market-status-badge closed';
      statusText.textContent = 'Market Kapalı';
      marketScreen.style.display = 'none';
      closedScreen.style.display = 'block';
      document.getElementById('floating-cart').style.display = 'none';
    }
  } catch (err) {
    console.warn('Sunucu bağlantısı yok, yerel mod etkin.');
    marketOpen = true;
    const badge = document.getElementById('market-status-badge');
    const statusText = document.getElementById('market-status-text');
    if (badge && statusText) {
      badge.className = 'market-status-badge open';
      statusText.textContent = 'Market Açık (Yerel Önizleme)';
    }
  }
}

// Ürünleri Yükle
async function loadProducts() {
  try {
    if (window.location.protocol === 'file:') {
      throw new Error('Local file mode');
    }
    const res = await fetch(`${BACKEND_URL}/api/products`);
    products = await res.json();
    renderProducts();
  } catch (err) {
    console.warn('API bağlantısı kurulamadı, yerel örnek ürünler yükleniyor.');
    products = [
      // Patates Cipsleri
      { id: 1, name: "Lay’s Fırından Parti Boy 134 G", price: 90.95, category: "Patates Cipsleri", in_stock: 1 },
      { id: 2, name: "Lay's Klasik Parti Boy 160 G", price: 90.95, category: "Patates Cipsleri", in_stock: 1 },
      { id: 3, name: "Ruffles Ketçap Aromalı Patates Cipsi Parti Boy 160 G", price: 90.95, category: "Patates Cipsleri", in_stock: 1 },
      { id: 4, name: "Ruffles Originals Patates Cipsi Süper Boy 125 G", price: 70.50, category: "Patates Cipsleri", in_stock: 1 },
      { id: 5, name: "Lay’s Yoğurt & Mevsim Yeşillikleri Süper Boy 125 G", price: 70.50, category: "Patates Cipsleri", in_stock: 1 },
      { id: 6, name: "Lay’s Yoğurt & Mevsim Yeşillikli Parti Boy 160 G", price: 90.95, category: "Patates Cipsleri", in_stock: 1 },
      { id: 7, name: "Lay's Baharatlı Süper Boy 125 G", price: 70.50, category: "Patates Cipsleri", in_stock: 1 },
      { id: 8, name: "Ruffles Originals Patates Cipsi Mega Boy 193 G", price: 81.50, category: "Patates Cipsleri", in_stock: 1 },
      { id: 9, name: "Lay's Klasik Mega Boy 193 G", price: 81.50, category: "Patates Cipsleri", in_stock: 1 },
      { id: 10, name: "Ruffles Ketçap Aromalı Patates Cipsi Süper Boy 125 G", price: 70.50, category: "Patates Cipsleri", in_stock: 1 },
      { id: 11, name: "Lay’s Fırınlanmış Yoğurtu & Mevsim Yeşillikli Süper Boy 110 G", price: 70.50, category: "Patates Cipsleri", in_stock: 1 },
      { id: 12, name: "Lay's Baharatlı Parti Boy 160 G", price: 90.95, category: "Patates Cipsleri", in_stock: 1 },
      { id: 13, name: "Ruffles Peynir ve Soğan Aromalı Patates Cipsi Süper Boy 125 G", price: 70.50, category: "Patates Cipsleri", in_stock: 1 },
      { id: 14, name: "Lay's Fırından Deniz Tuzlu Patates Cipsi 110 G", price: 70.50, category: "Patates Cipsleri", in_stock: 1 },
      { id: 15, name: "Lay's Klasik Süper Boy 125 G", price: 70.50, category: "Patates Cipsleri", in_stock: 1 },
      { id: 16, name: "Lay's Klasik Medium Patates Cipsi 50 G", price: 41.00, category: "Patates Cipsleri", in_stock: 1 },

      // Mısır Cipsleri ve Çerezler
      { id: 17, name: "Lay's Ruffles Doritos 2'li Avantaj Paketi 176 G", price: 85.95, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 18, name: "Doritos Haşhaşlı ve Domatesli Mısır Cipsi Süper Boy 130 G", price: 68.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 19, name: "Doritos Nacho Parti Boy 185 G", price: 88.45, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 20, name: "Çerezza Kokteyl Karışık Mısır Çerezi Süper Boy 117 G", price: 61.95, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 21, name: "Cheetos Fıstıklı / Biftek Aromalı Mısır Çerezi Aile Boy 40 G", price: 36.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 22, name: "Doritos Dippas Mısır Cipsi Parti Boy 140 G", price: 85.50, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 23, name: "Çerezza Sinema Peynir Soğan Aromalı Mısır Çerezi Süper Boy 117 G", price: 61.95, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 24, name: "Doritos Taco Baharatlı Mısır Cipsi Süper Boy 135 G", price: 68.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 25, name: "Doritos Nacho Süper Boy 130 G", price: 68.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 26, name: "Doritos Taco Mega Boy 218 G", price: 81.50, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 27, name: "Cheetos Fıstıklı / Fıstık Aromalı Mısır Çerezi Aile Boy 40 G", price: 36.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 28, name: "Doritos Nacho Mega Boy 218 G", price: 81.50, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 29, name: "Çerezza Sinema Peynir Soğan Aromalı Mısır Çerezi Parti Boy 170 G", price: 83.95, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 30, name: "Doritos Twist Kırmızı Köz Biberli 115 G", price: 70.50, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 31, name: "Cheetos Fıstıklı / Peynir Aromalı Mısır Çerezi Aile Boy 40 G", price: 36.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 32, name: "Çerezza Muhabbet Biftek & Soğan Aromalı Mısır Çerezi 60 G", price: 41.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 33, name: "Doritos Storm Flamin Hot Süper Boy 125 G", price: 70.50, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 34, name: "Cheetos 3'lü Paket Mısır Çerezi 60 G", price: 41.95, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 35, name: "Doritos Extreme Süper Boy 130 G", price: 68.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 36, name: "Doritos Hot Corn Parti Boy 180 G", price: 88.45, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 37, name: "Çerezza 3'lü Çoklu Paket 103 G", price: 40.95, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 38, name: "Çerezza Muhabbet Klasik 60 G", price: 41.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 39, name: "Çerezza TV Süt Mısırı Aromalı Mısır Çerezi Süper Boy 117 G", price: 61.95, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 40, name: "Doritos Taco Parti Boy 185 G", price: 88.45, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 41, name: "Doritos Hot Corn Acı Biberli Mısır Cipsi Süper Boy 130 G", price: 68.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 42, name: "Çerezza Acı Baharatlı Mısır Çerezi Süper Boy 117 G", price: 61.95, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 43, name: "Doritos Storm Bi Tık Acı Süper Boy 125 G", price: 70.50, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 44, name: "Doritos Storm Tatlı Acı Süper Boy 125 G", price: 70.50, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 45, name: "Çerezza Popcorn Patlamış Mısır Süper Boy 80 G", price: 51.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 46, name: "Cheetos Shots 3'lü Paket 42 G", price: 31.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 47, name: "Cheetos Fıstıklı / Peynir Aromalı Mısır Çerezi 75 G", price: 50.95, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 48, name: "Çerezza Dev Baharatlı Domates Sosu Aromalı Mısır Çerezi Parti Boy 150 G", price: 81.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 49, name: "Çerezza Dev Yer Fıstıklı Mısır Çerezi Parti Boy 145 G", price: 81.00, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },
      { id: 50, name: "Cheetos Fıstıklı / Fıstıklı Mısır Çerezi 75 G", price: 50.95, category: "Mısır Cipsleri & Çerezler", in_stock: 1 },

      // Atıştırmalık, Kraker ve Sakızlar
      { id: 51, name: "Eti Karam Gurme Bitter Çikolatalı Gofret 50 G", price: 35.95, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 52, name: "Ülker Çikolatalı Gofret 36 G", price: 23.90, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 53, name: "Ülker Tuzlu Çubuk Kraker 40 G", price: 13.50, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 54, name: "Eti Crax Çubuk Kraker 40 G", price: 13.50, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 55, name: "Eti Balık Kraker 40 G", price: 17.00, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 56, name: "Crax Patlayan Lezzet Acı Baharatlı Çubuk 50 G", price: 26.00, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 57, name: "Eti Crax Peynirli Çubuk Kraker 175 G", price: 45.90, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 58, name: "Eti Crax Patlayan Lezzet Chili Lime Çubuk Kraker 50 G", price: 26.00, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 59, name: "Falım 5'li Nane Aromalı Şekersiz Sakız 35 G", price: 65.95, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 60, name: "Vivident Şerit Sakız 45 Dakika 33 G", price: 63.95, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 61, name: "First Sensations Damla Sakızlı 27 G", price: 65.95, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 62, name: "Falım 5’li Damla Şekersiz Sakız 35 G", price: 65.95, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 63, name: "Falım Işıl 5'li Naneli Şekersiz Sakız 40 G", price: 65.95, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 64, name: "Vivident Şerit Sakız Extra 26 G", price: 62.45, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 65, name: "Falım 5'li Karışık Meyve Şekersiz Sakız 35 G", price: 65.95, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 66, name: "First 60 Dk Infinity Ahududu & Limon Aromalı Şekersiz Sakız 27 G", price: 65.95, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 67, name: "Falım 5'li Çilek Aromalı Şekersiz Sakız 35 G", price: 65.95, category: "Atıştırmalık & Sakızlar", in_stock: 1 },
      { id: 68, name: "First 60 Dk Infinity Nane Aromalı Sakız 27 G", price: 65.95, category: "Atıştırmalık & Sakızlar", in_stock: 1 },

      // İçecekler ve Sular
      { id: 69, name: "Fuse Tea Mango Ananas Soğuk Çay Pet 1 L", price: 66.00, category: "İçecekler & Sular", in_stock: 1 },
      { id: 70, name: "Lipton Ice Tea Şekersiz Şeftali Aromalı İçecek Pet 1 L", price: 63.00, category: "İçecekler & Sular", in_stock: 1 },
      { id: 71, name: "Fuse Tea Limon Soğuk Çay Pet 1 L", price: 66.00, category: "İçecekler & Sular", in_stock: 1 },
      { id: 72, name: "Lipton Ice Tea Şeftali 1 L", price: 63.00, category: "İçecekler & Sular", in_stock: 1 },
      { id: 73, name: "Lipton Ice Tea Limon 1 L", price: 63.00, category: "İçecekler & Sular", in_stock: 1 },
      { id: 74, name: "Fuse Tea Karpuz Soğuk Çay Pet 1 L", price: 66.00, category: "İçecekler & Sular", in_stock: 1 },
      { id: 75, name: "Uludağ Limonata 1 L", price: 58.50, category: "İçecekler & Sular", in_stock: 1 },
      { id: 76, name: "Saka Doğal Mineralli Su 500 Ml", price: 23.25, category: "İçecekler & Sular", in_stock: 1 },
      { id: 77, name: "Damla Doğal Kaynak Suyu Pet 500 ML", price: 24.00, category: "İçecekler & Sular", in_stock: 1 },
      { id: 78, name: "Damla Doğal Kaynak Suyu Pet 1,5 L", price: 38.50, category: "İçecekler & Sular", in_stock: 1 },
      { id: 79, name: "Erikli Su 500 Ml", price: 28.95, category: "İçecekler & Sular", in_stock: 1 }
    ];
    renderProducts();
  }
}

// Sınıf Kısıtlamasını Kontrol Et (Yasaklı sınıf)
function checkClassroomRestriction(classroom) {
  if (RESTRICTED_CLASSES.includes(classroom)) {
    alert(`❌ Bu sınıf (kız sınıfı) için siparişler kapalıdır.`);
    document.getElementById('order-class').value = '';
    const headerDisplay = document.getElementById('selected-delivery-class');
    if (headerDisplay) headerDisplay.textContent = 'Sınıf Seçin (Teslimat Yeri)';
    return false;
  }
  return true;
}

// Ürün Kataloğunu Çiz (Görselsiz, SMM panel tarzı)
function renderProducts() {
  const container = document.getElementById('products-container');
  
  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === 'Tümü' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filteredProducts.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">Aramanıza uygun ürün bulunamadı.</div>`;
    return;
  }

  container.innerHTML = filteredProducts.map(p => {
    const outOfStock = p.in_stock === 0;
    
    return `
      <div class="product-card ${outOfStock ? 'out-of-stock' : ''}" style="min-height: 120px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
        ${outOfStock ? '<span class="out-of-stock-badge">TÜKENDİ</span>' : ''}
        <button class="add-to-cart-icon-btn" onclick="addToCart(${p.id})">＋</button>
        <div>
          <div class="product-category">${escapeHTML(p.category)}</div>
          <div class="product-name" style="font-size: 1rem; font-weight: 700; margin-top: 0.25rem; min-height: auto; margin-bottom: 0.5rem;">${escapeHTML(p.name)}</div>
        </div>
        <div class="product-footer" style="border: none; padding: 0; margin: 0;">
          <div class="product-price" style="font-size: 1.2rem;">${p.price.toFixed(2)} TL</div>
        </div>
      </div>
    `;
  }).join('');
}

// Kategori Filtresi Seç
function selectCategory(categoryName) {
  activeCategory = categoryName;
  
  const buttons = document.querySelectorAll('.category-btn');
  buttons.forEach(btn => {
    if (btn.textContent === categoryName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  renderProducts();
}

// Arama Girişi
function handleSearch() {
  searchQuery = document.getElementById('search-input').value;
  renderProducts();
}

// Sepete Ürün Ekle
function addToCart(productId) {
  if (!marketOpen) return;

  const product = products.find(p => p.id === productId);
  if (!product || product.in_stock === 0) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  updateCartUI();
  toggleCartDrawer(true);
}

// Sepet Miktar Güncelle
function updateCartQuantity(productId, delta) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex === -1) return;

  cart[itemIndex].quantity += delta;

  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
  }

  updateCartUI();
}

// Sepet UI Güncelle
function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const floatingBtn = document.getElementById('floating-cart');
  if (totalCount > 0 && marketOpen) {
    floatingBtn.style.display = 'flex';
    document.getElementById('cart-count').textContent = totalCount;
    document.getElementById('cart-total-price').textContent = totalPrice.toFixed(2) + ' TL';
  } else {
    floatingBtn.style.display = 'none';
  }

  const listContainer = document.getElementById('cart-items-list');
  const formContainer = document.getElementById('checkout-form-container');

  if (cart.length === 0) {
    listContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: 3rem;">Sepetiniz boş. Hemen ürün ekleyin!</div>`;
    formContainer.style.display = 'none';
    return;
  }

  formContainer.style.display = 'block';
  document.getElementById('form-total-price').textContent = totalPrice.toFixed(2) + ' TL';

  listContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-details">
        <div class="cart-item-name">${escapeHTML(item.name)}</div>
        <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)} TL</div>
      </div>
      <div class="quantity-controls">
        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

// Sepet Çekmecesini Aç/Kapat
function toggleCartDrawer(isOpen) {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (isOpen) {
    overlay.classList.add('active');
  } else {
    overlay.classList.remove('active');
  }
}

function handleOverlayClick(e) {
  if (e.target.id === 'cart-drawer-overlay') {
    toggleCartDrawer(false);
  }
}

// Siparişi Gönder (Ban uyarısı ve teslimat vakti eklendi)
async function submitOrder() {
  if (cart.length === 0) return;

  const name = document.getElementById('order-name').value.trim();
  const classroom = document.getElementById('order-class').value;
  const note = document.getElementById('order-note').value.trim();
  const deliveryDay = document.getElementById('order-day').value;
  const deliveryBreak = document.getElementById('order-break').value;

  if (!name) {
    alert('Lütfen adınızı soyadınızı girin.');
    return;
  }
  if (!classroom) {
    alert('Lütfen sınıfınızı seçin.');
    return;
  }
  if (!deliveryBreak) {
    alert('Lütfen teslimat yapılacak teneffüsü seçin.');
    return;
  }

  // Sınıf kısıtlama kontrolü
  if (!checkClassroomRestriction(classroom)) return;

  // Kalıcı Ban Uyarısı
  const confirmOrder = confirm("⚠️ UYARI: Eğer siparişi oluşturup ödemesini okulda elden yapmazsanız, sistemden kalıcı olarak banlanırsınız. Sipariş vermek istediğinize emin misiniz?");
  if (!confirmOrder) {
    return;
  }

  const orderData = {
    name: name,
    classroom: classroom,
    items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
    note: note,
    deliveryDay: deliveryDay,
    deliveryBreak: deliveryBreak
  };

  try {
    const res = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      cart = [];
      updateCartUI();
      toggleCartDrawer(false);

      document.getElementById('order-note').value = '';
      document.getElementById('order-break').value = '';

      // Başarılı Yönlendirme Modali (Özel teneffüs ve 8/B uyarısı ile)
      document.getElementById('success-message-text').innerHTML = `Siparişiniz Alındı! Sipariş Numaranız: <strong>#${data.orderId}</strong>.<br><br>📍 Lütfen <strong>${escapeHTML(deliveryDay)}</strong> günü, <strong>${escapeHTML(deliveryBreak)}</strong> vaktinde <strong>8/B sınıfının önüne</strong> gelerek siparişinizi elden teslim alın.<br><br>💵 Ödemeyi teslimat anında elden yapmayı unutmayın.`;
      document.getElementById('successModalOverlay').classList.add('active');
    } else {
      alert(data.error || 'Sipariş gönderilirken bir hata oluştu.');
    }
  } catch (err) {
    console.error('Sipariş gönderme hatası:', err);
    alert('Bağlantı hatası. Lütfen internetinizi kontrol edin.');
  }
}

function closeSuccessModal() {
  document.getElementById('successModalOverlay').classList.remove('active');
}

// Yardımcı Güvenlik Fonksiyonu
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
