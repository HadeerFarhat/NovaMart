// ===== NovaMart App - Vanilla JS =====

const STORAGE_KEYS = {
  cart: 'novamart_cart',
  wishlist: 'novamart_wishlist',
  lang: 'novamart_lang',
  user: 'novamart_user',
  theme: 'novamart_theme'
};

// State
let cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
let wishlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.wishlist) || '[]');
let currentLang = localStorage.getItem(STORAGE_KEYS.lang) || 'en';
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null');
let currentTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'light';

// Categories
const SITE_CATEGORIES = window.SITE_CATEGORIES = [
  { id: 'all', name_en: 'All', name_ar: 'الكل' },
  { id: 'watches', name_en: 'Watches', name_ar: 'ساعات' },
  { id: 'jewelry', name_en: 'Jewelry', name_ar: 'مجوهرات' },
  { id: 'footwear', name_en: 'Footwear', name_ar: 'أحذية' },
  { id: 'bags', name_en: 'Bags', name_ar: 'حقائب' },
  { id: 'accessories', name_en: 'Accessories', name_ar: 'إكسسوارات' },
  { id: 'winter', name_en: 'Winter Wear', name_ar: 'شتوي' },
  { id: 'summer', name_en: 'Summer Wear', name_ar: 'صيفي' },
  { id: 'appliances', name_en: 'Appliances', name_ar: 'أجهزة كهربائية' },
  { id: 'electronics', name_en: 'Electronics', name_ar: 'إلكترونيات' },
  { id: 'beauty', name_en: 'Makeup', name_ar: 'مكياج' },
  { id: 'furniture', name_en: 'Furniture', name_ar: 'أثاث' },
  { id: 'gaming', name_en: 'Gaming', name_ar: 'ألعاب' }
];



// i18n — dictionaries loaded from js/lang/en.js & js/lang/ar.js (before this file)
const i18n = {
  en: window.LANG_EN || {},
  ar: window.LANG_AR || {}
};


function getProducts() {
  return (typeof products !== "undefined" && products) || window.products || [];
}

function t(key) {
  return i18n[currentLang][key] || key;
}

function saveCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  updateBadges();
}

function saveWishlist() {
  localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
  updateBadges();
}

function updateBadges() {
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const wishCount = wishlist.length;
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = cartCount;
    el.style.display = cartCount > 0 ? 'flex' : 'none';
  });
  document.querySelectorAll('[data-wish-count]').forEach(el => {
    el.textContent = wishCount;
    el.style.display = wishCount > 0 ? 'flex' : 'none';
  });
}


function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem(STORAGE_KEYS.theme, currentTheme);
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

function setLanguage(lang) {
  currentLang = lang;
  window.currentLang = lang;
  localStorage.setItem(STORAGE_KEYS.lang, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  applyTranslations();
  renderNavCats();
  renderSidebarCats();
  if (typeof renderProducts === 'function') renderProducts();
  if (typeof renderCart === 'function') renderCart();
  if (typeof renderWishlist === 'function') renderWishlist();
  if (typeof renderProductDetail === 'function') renderProductDetail();
  if (typeof renderCategories === 'function') renderCategories();
  if (typeof renderOffers === 'function') renderOffers();
  if (typeof renderClearance === 'function') renderClearance();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[currentLang][key]) el.textContent = i18n[currentLang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[currentLang][key]) el.placeholder = i18n[currentLang][key];
  });
  updateLangButton();
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg || '';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function updateLangButton() {
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = currentLang === 'ar' ? 'EN' : 'عربي';
}

function addToCart(productId, qty = 1) {
  const product = getProducts().find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  window.cart = cart;
  saveCart();
  showToast(t('added_cart'));
}

function removeFromCart(productId) {
  const idx = cart.findIndex(i => i.id === productId);
  if (idx > -1) cart.splice(idx, 1);
  window.cart = cart;
  saveCart();
  if (typeof renderCart === 'function') renderCart();
}

function updateCartQty(productId, qty) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart();
    if (typeof renderCart === 'function') renderCart();
  }
}

function toggleWishlist(productId) {
  const idx = wishlist.indexOf(productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast(t('removed_wish'));
  } else {
    wishlist.push(productId);
    showToast(t('added_wish'));
  }
  window.wishlist = wishlist;
  saveWishlist();
  // Update all wishlist buttons for this product
  document.querySelectorAll('[data-wish-id="' + productId + '"]').forEach(btn => {
    const active = wishlist.includes(productId);
    btn.classList.toggle('active', active);
    if (btn.classList.contains('wishlist-btn')) {
      btn.textContent = active ? '♥' : '♡';
    }
  });
  if (typeof renderWishlist === 'function') renderWishlist();
}

function isInWishlist(id) {
  return wishlist.includes(id);
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const p = products.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function formatPrice(price) {
  return currentLang === 'ar' ? `${price.toFixed(2)} $` : `$${price.toFixed(2)}`;
}

function getProductName(p) {
  return currentLang === 'ar' ? p.name_ar : p.name_en;
}

function getProductDesc(p) {
  return currentLang === 'ar' ? p.desc_ar : p.desc_en;
}

function getCategoryName(catId) {
  const cat = SITE_CATEGORIES.find(c => c.id === catId);
  return cat ? (currentLang === 'ar' ? cat.name_ar : cat.name_en) : catId;
}

// Product card HTML generator
function productCardHTML(p) {
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const inWish = isInWishlist(p.id);
  const desc = getProductDesc(p);
  const shortDesc = desc.length > 70 ? desc.slice(0, 70) + '…' : desc;
  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img-wrap">
        <a href="product.html?id=${p.id}">
          <img src="${p.image}" alt="${getProductName(p)}" loading="lazy">
        </a>
        ${discount > 0 ? `<span class="product-badge">-${discount}%</span>` : ''}
        <button class="wishlist-btn ${inWish ? 'active' : ''}" data-wish-id="${p.id}" onclick="toggleWishlist(${p.id})" title="Wishlist">
          ${inWish ? '♥' : '♡'}
        </button>
      </div>
      <div class="product-info">
        <div class="product-cat">${getCategoryName(p.category)}</div>
        <a href="product.html?id=${p.id}" class="product-name">${getProductName(p)}</a>
        <p class="product-desc">${shortDesc}</p>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
          <span>(${p.reviews || Math.round((p.rating||4)*17+5)})</span>
        </div>
        <div class="product-price">
          <span class="price-current">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})">${t('add_to_cart')}</button>
        </div>
      </div>
    </div>
  `;
}

// Header HTML

function getSidebarHTML() {
  return `
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <a href="index.html" class="logo" dir="ltr" onclick="closeSidebar()">
          <div class="logo-icon">N</div>
          <span class="logo-text">Nova<span>Mart</span></span>
        </a>
        <button class="sidebar-close" onclick="closeSidebar()">✕</button>
      </div>
      <nav class="sidebar-nav">
        <a href="index.html" onclick="closeSidebar()"><span>🏠</span> <span data-i18n="home">Home</span></a>
        <a href="about.html" onclick="closeSidebar()"><span>✨</span> <span data-i18n="about_us">About Us</span></a>
        <a href="index.html#categories" onclick="closeSidebar()"><span>📦</span> <span data-i18n="categories">Categories</span></a>
        <a href="index.html#products" onclick="closeSidebar()"><span>🛍️</span> <span data-i18n="all_products">All Products</span></a>
        <a href="index.html#offers" onclick="closeSidebar()"><span>🔥</span> <span data-i18n="offers">Special Offers</span></a>
        <a href="cart.html" onclick="closeSidebar()"><span>🛒</span> <span data-i18n="cart">Cart</span></a>
        <a href="wishlist.html" onclick="closeSidebar()"><span>♡</span> <span data-i18n="wishlist">Wishlist</span></a>
        <a href="login.html" onclick="closeSidebar()"><span>👤</span> <span data-i18n="account">Account</span></a>
      </nav>
      <div class="sidebar-cats">
        <h4 data-i18n="categories">Categories</h4>
        <div id="sidebarCats"></div>
      </div>
      <div class="sidebar-footer">
        <p>📍 <span data-i18n="showroom_address">Pyramids Road, Giza, Egypt</span></p>
        <p data-i18n="home_delivery">Home Delivery</p>
        <p data-i18n="showroom_pickup">Showroom Pickup</p>
      </div>
    </aside>
  `;
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('sidebarOverlay')?.classList.toggle('open');
  document.body.classList.toggle('sidebar-open');
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
  document.body.classList.remove('sidebar-open');
}

function renderSidebarCats() {
  const el = document.getElementById('sidebarCats');
  if (!el) return;
  el.innerHTML = SITE_CATEGORIES.filter(c => c.id !== 'all').map(c =>
    `<a href="category.html?id=${c.id}" onclick="closeSidebar()">${currentLang === 'ar' ? c.name_ar : c.name_en}</a>`
  ).join('');
}


function getHeaderHTML() {
  return `
    <header class="header">
      <div class="container header-top">
        <button class="menu-btn" id="menuBtn" onclick="toggleSidebar()" aria-label="Menu">☰</button>
        <a href="index.html" class="logo" dir="ltr">
          <div class="logo-icon">N</div>
          <span class="logo-text">Nova<span>Mart</span></span>
        </a>
        <div class="search-bar search-wrap">
          <input type="text" id="searchInput" data-i18n-placeholder="search_placeholder" placeholder="Search products..." autocomplete="off" oninput="liveSearch(this.value)" onkeypress="if(event.key==='Enter'){doSearch();hideSuggestions();}" onfocus="liveSearch(this.value)">
          <button type="button" onclick="doSearch()">🔍</button>
          <div id="searchSuggestions" class="search-suggestions" role="listbox"></div>
        </div>
        <div class="header-actions">
          <button class="theme-toggle" id="themeToggle" onclick="toggleTheme()" title="Toggle theme">🌙</button>
          <button class="lang-toggle" id="langToggle" onclick="toggleLang()"></button>
          <a href="wishlist.html" class="header-btn">
            <span class="icon">♡</span>
            <span data-i18n="wishlist">Wishlist</span>
            <span class="badge" data-wish-count style="display:none">0</span>
          </a>
          <a href="cart.html" class="header-btn">
            <span class="icon">🛒</span>
            <span data-i18n="cart">Cart</span>
            <span class="badge" data-cart-count style="display:none">0</span>
          </a>
          <a href="login.html" class="header-btn" id="accountBtn">
            <span class="icon">👤</span>
            <span data-i18n="account">Account</span>
          </a>
        </div>
      </div>
      <nav class="nav-cats">
        <div class="container">
          <ul id="navCats"></ul>
        </div>
      </nav>
    </header>
  `;
}

function getFooterHTML() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <h4 data-i18n="footer_about">About NovaMart</h4>
            <p data-i18n="footer_about_text" style="font-size:0.9rem;line-height:1.6"></p>
          </div>
          <div>
            <h4 data-i18n="footer_links">Quick Links</h4>
            <a href="index.html" data-i18n="home">Home</a>
            <a href="about.html" data-i18n="about_us">About Us</a>
            <a href="index.html#products" data-i18n="all_products">All Products</a>
            <a href="cart.html" data-i18n="cart">Cart</a>
            <a href="wishlist.html" data-i18n="wishlist">Wishlist</a>
          </div>
          <div>
            <h4 data-i18n="footer_contact">Contact</h4>
            <a href="mailto:support@novamart.com">support@novamart.com</a>
            <a href="tel:+20238551234">+20 2 3855 1234</a>
            <p style="margin-top:8px;font-size:0.9rem">
              📍 <span data-i18n="address_full">Pyramids Road, Giza, Egypt</span>
            </p>
            <p style="margin-top:8px;font-size:0.85rem">
              <span data-i18n="free_shipping">Free shipping over $50</span> · 
              <span data-i18n="secure">Secure checkout</span>
            </p>
          </div>
          <div>
            <h4 data-i18n="return_policy_title">Return Policy</h4>
            <p style="font-size:0.9rem;line-height:1.6" data-i18n="returns_policy"></p>
            <p style="margin-top:8px;font-size:0.85rem">
              <span data-i18n="free_return">30-Day Free Returns</span> · 
              <span data-i18n="ssl">SSL Encrypted</span>
            </p>
          </div>
        </div>
        <div class="footer-bottom" data-i18n="footer_rights">© 2026 NovaMart. All rights reserved.</div>
      </div>
    </footer>
  `;
}

function renderNavCats() {
  const ul = document.getElementById('navCats');
  if (!ul) return;
  const params = new URLSearchParams(location.search);
  const current = params.get('id') || params.get('cat') || 'all';
  ul.innerHTML = SITE_CATEGORIES.map(c => {
    const href = c.id === 'all' ? 'index.html#products' : `category.html?id=${c.id}`;
    const active = current === c.id ? 'active' : '';
    const name = currentLang === 'ar' ? c.name_ar : c.name_en;
    return `<li><a href="${href}" class="${active}">${name}</a></li>`;
  }).join('');
}

function toggleLang() {
  setLanguage(currentLang === 'en' ? 'ar' : 'en');
  renderNavCats();
  renderSidebarCats();
  applyTranslations();
}

function liveSearch(q) {
  const box = document.getElementById('searchSuggestions');
  if (!box) return;
  q = (q || '').trim().toLowerCase();
  if (q.length < 1) { box.classList.remove('open'); box.innerHTML = ''; return; }
  const list = (typeof products !== 'undefined' ? products : []);
  const hits = list.filter(p => {
    const n = ((p.name_en || '') + ' ' + (p.name_ar || '') + ' ' + (p.category || '')).toLowerCase();
    return n.includes(q);
  }).slice(0, 8);
  if (!hits.length) {
    box.innerHTML = `<div class="sug-item" style="cursor:default;opacity:.7">${currentLang==='ar'?'لا نتائج':'No results'}</div>`;
    box.classList.add('open');
    return;
  }
  box.innerHTML = hits.map(p => `
    <a class="sug-item" href="product.html?id=${p.id}" role="option">
      <img src="${p.image}" alt="" loading="lazy" onerror="this.style.opacity=.3">
      <div class="sug-meta">
        <div class="sug-name">${currentLang==='ar'?(p.name_ar||p.name_en):(p.name_en||p.name_ar)}</div>
        <div class="sug-price">${formatPrice(p.price)}</div>
      </div>
    </a>`).join('');
  box.classList.add('open');
}
function hideSuggestions() {
  const box = document.getElementById('searchSuggestions');
  if (box) { box.classList.remove('open'); box.innerHTML = ''; }
}
function doSearch() {
  const q = document.getElementById('searchInput')?.value?.trim();
  if (q) {
    window.location.href = `index.html?search=${encodeURIComponent(q)}`;
  }
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrap')) hideSuggestions();
});

// Init common
function initCommon() {
  // Inject header/footer if placeholders exist
  const headerEl = document.getElementById('site-header');
  if (headerEl) headerEl.innerHTML = getHeaderHTML();
  if (!document.getElementById('sidebar')) {
    document.body.insertAdjacentHTML('afterbegin', getSidebarHTML());
  }
  const footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.innerHTML = getFooterHTML();
  renderSidebarCats();

  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  applyTranslations();
  applyTheme();
  renderNavCats();
  updateBadges();
  injectMobileNav();

  // Account button
  const accBtn = document.getElementById('accountBtn');
  if (accBtn && currentUser) {
    accBtn.querySelector('span:last-child').textContent = currentUser.name?.split(' ')[0] || t('account');
  }
}

// Expose globals
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
window.toggleLang = toggleLang;
window.doSearch = doSearch;
window.liveSearch = liveSearch;
window.hideSuggestions = hideSuggestions;
window.removeFromCart = removeFromCart;
window.updateCartQty = updateCartQty;
window.t = t;
window.formatPrice = formatPrice;
window.getProductName = getProductName;
window.getProductDesc = getProductDesc;
window.getCategoryName = getCategoryName;
window.productCardHTML = productCardHTML;
window.getCartTotal = getCartTotal;
window.showToast = showToast;
window.cart = cart;
window.wishlist = wishlist;
window.currentLang = currentLang;
window.products = products;
window.SITE_CATEGORIES = SITE_CATEGORIES;

window.initCommon = initCommon;
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
window.updateLangButton = updateLangButton;
window.updateBadges = updateBadges;
window.saveCart = saveCart;
window.currentUser = currentUser;
window.STORAGE_KEYS = STORAGE_KEYS;

function getMobileNavHTML() {
  const cartN = (JSON.parse(localStorage.getItem('novamart_cart')||'[]')).reduce((s,i)=>s+(i.qty||1),0);
  const wishN = (JSON.parse(localStorage.getItem('novamart_wishlist')||'[]')).length;
  return `<nav class="mobile-bottom-nav" id="mobileBottomNav" aria-label="Mobile navigation">
    <a href="index.html" class="mbn-item" data-page="home"><span class="mbn-icon">🏠</span><span class="mbn-label" data-i18n="home">Home</span></a>
    <a href="category.html?id=all" class="mbn-item" data-page="cats"><span class="mbn-icon">⊞</span><span class="mbn-label" data-i18n="categories">Categories</span></a>
    <a href="cart.html" class="mbn-item mbn-cart" data-page="cart"><span class="mbn-icon">🛒</span><span class="mbn-label" data-i18n="cart">Cart</span><span class="mbn-badge" data-cart-count style="display:${cartN?'flex':'none'}">${cartN||0}</span></a>
    <a href="wishlist.html" class="mbn-item" data-page="wish"><span class="mbn-icon">♡</span><span class="mbn-label" data-i18n="wishlist">Wishlist</span></a>
    <a href="login.html" class="mbn-item" data-page="account"><span class="mbn-icon">👤</span><span class="mbn-label" data-i18n="account">Account</span></a>
  </nav>`;
}

function injectMobileNav() {
  if (document.getElementById('mobileBottomNav')) return;
  document.body.insertAdjacentHTML('beforeend', getMobileNavHTML());
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.mbn-item').forEach(a => {
    if ((path === 'index.html' || path === '') && a.dataset.page === 'home') a.classList.add('active');
    if (path.includes('category') && a.dataset.page === 'cats') a.classList.add('active');
    if (path.includes('cart') && a.dataset.page === 'cart') a.classList.add('active');
    if (path.includes('wishlist') && a.dataset.page === 'wish') a.classList.add('active');
    if (path.includes('login') && a.dataset.page === 'account') a.classList.add('active');
  });
}


window.injectMobileNav = injectMobileNav;
