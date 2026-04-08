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
        
        // 同步导航栏语言下拉框的值
        const navSelect = document.getElementById('navLanguageSelect');
        if (navSelect) {
            navSelect.value = langCode;
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

// ===== 渲染语言切换按钮（已禁用，改用导航栏下拉框）=====
function renderLanguageButtons() {
    // 不再使用顶部按钮，已移至导航栏
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

// ===== 在导航栏 Contact 后面添加语言下拉框 =====
function addLanguageSelectorToNavbar() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    
    // 找到 Contact 对应的 li 元素
    const contactItem = Array.from(navMenu.children).find(li => {
        const link = li.querySelector('a');
        return link && link.getAttribute('data-i18n') === 'nav_contact';
    });
    
    if (!contactItem) return;
    
    // 防止重复添加
    if (document.getElementById('navLanguageSelect')) return;
    
    const newLi = document.createElement('li');
    newLi.style.marginLeft = '10px';
    
    const select = document.createElement('select');
    select.id = 'navLanguageSelect';
    select.style.cssText = 'padding: 6px 12px; border-radius: 6px; background: #1a2a4f; color: white; border: 1px solid #c9a03d; cursor: pointer; font-size: 14px;';
    
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        if (lang.code === currentLang) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    select.onchange = (e) => {
        loadLanguage(e.target.value);
    };
    
    newLi.appendChild(select);
    contactItem.insertAdjacentElement('afterend', newLi);
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
    
    // 添加导航栏语言下拉框
    addLanguageSelectorToNavbar();
});