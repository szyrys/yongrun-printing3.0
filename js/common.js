// ===== 多语言配置 =====
const languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'zh-CN', name: '简体中文', dir: 'ltr' },
    { code: 'zh-TW', name: '繁體中文', dir: 'ltr' },
    { code: 'de', name: 'Deutsch', dir: 'ltr' },
    { code: 'es', name: 'Español', dir: 'ltr' },
    { code: 'pt', name: 'Português', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
    { code: 'ja', name: '日本語', dir: 'ltr' },
    { code: 'ko', name: '한국어', dir: 'ltr' }
];

let currentLang = 'en';
let translations = {};

// ===== 产品数据（7大类）=====
const products = [
    { id: 1, key: 'laser', icon: 'fas fa-star-of-life', sampleCount: 9 },
    { id: 2, key: 'flashcards', icon: 'fas fa-brain', sampleCount: 9 },
    { id: 3, key: 'playingcards', icon: 'fas fa-dice-d6', sampleCount: 9 },
    { id: 4, key: 'boardgames', icon: 'fas fa-gamepad', sampleCount: 9 },
    { id: 5, key: 'tarot', icon: 'fas fa-moon', sampleCount: 9 },
    { id: 6, key: 'advertising', icon: 'fas fa-bullhorn', sampleCount: 9 },
    { id: 7, key: 'kids', icon: 'fas fa-child', sampleCount: 9 }
];

// ===== 加载语言文件 =====
async function loadLanguage(langCode) {
    try {
        const response = await fetch(`locales/${langCode}.json`);
        if (!response.ok) throw new Error('Language file not found');
        translations = await response.json();
        currentLang = langCode;
        
        const langObj = languages.find(l => l.code === langCode);
        if (langObj) {
            document.documentElement.setAttribute('dir', langObj.dir);
            document.documentElement.setAttribute('lang', langCode);
        }
        
        updatePageText();
        updatePlaceholders();
        updateProductGrid();
        
        // 同步页脚语言下拉框
        const footerSelect = document.getElementById('footerLanguageSelect');
        if (footerSelect) {
            footerSelect.value = langCode;
        }
        
        localStorage.setItem('preferredLanguage', langCode);
    } catch (error) {
        console.error('加载语言失败:', error);
    }
}

// ===== 更新页面文本 =====
function updatePageText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.innerHTML = translations[key];
        }
    });
}

// ===== 更新placeholder =====
function updatePlaceholders() {
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });
}

// ===== 更新产品网格 =====
function updateProductGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    products.forEach(product => {
        const titleKey = `product_${product.key}_title`;
        const descKey = `product_${product.key}_desc`;
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => {
            window.location.href = `products/${product.key}.html`;
        };
        
        card.innerHTML = `
            <div class="product-img">
                <i class="${product.icon}"></i>
            </div>
            <h3>${translations[titleKey] || product.key}</h3>
            <p>${translations[descKey] || ''}</p>
        `;
        grid.appendChild(card);
    });
}

// ===== 渲染语言切换按钮（已禁用，改用页脚下拉框）=====
function renderLanguageButtons() {
    // 不再使用顶部按钮，已移至页脚
    const container = document.getElementById('languageSelector');
    if (container) {
        container.innerHTML = '';
    }
}

// ===== 移动端菜单 =====
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// ===== 在页脚动态添加语言选择下拉框 =====
function addFooterLanguageSelector() {
    const footer = document.querySelector('.footer .container');
    if (footer && !document.getElementById('footerLanguageSelect')) {
        const div = document.createElement('div');
        div.style.marginTop = '20px';
        div.innerHTML = `
            <label style="margin-right: 10px;">🌐 Language / 语言 :</label>
            <select id="footerLanguageSelect" style="padding: 6px 12px; border-radius: 6px; background: white; color: #1a2a4f; border: 1px solid #c9a03d; cursor: pointer; font-size: 14px;">
                <option value="en">English</option>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="pt">Português</option>
                <option value="ar">العربية</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
            </select>
        `;
        footer.appendChild(div);
        
        const select = document.getElementById('footerLanguageSelect');
        select.addEventListener('change', (e) => {
            loadLanguage(e.target.value);
        });
        select.value = currentLang;
    }
}

// ===== 辅助函数 =====
function t(key) {
    return translations[key] || key;
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', async () => {
    renderLanguageButtons();
    initMobileMenu();
    
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language.split('-')[0];
    
    let initLang = 'en';
    if (savedLang && languages.some(l => l.code === savedLang)) {
        initLang = savedLang;
    } else if (languages.some(l => l.code === browserLang)) {
        initLang = browserLang;
    }
    
    await loadLanguage(initLang);
    
    // 添加页脚语言下拉框
    addFooterLanguageSelector();
});