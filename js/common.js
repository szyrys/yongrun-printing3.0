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

// ===== 产品数据（8大类）=====
const products = [
    { id: 1, key: 'laser', icon: 'fas fa-star-of-life', sampleCount: 9 },
    { id: 2, key: 'flashcards', icon: 'fas fa-brain', sampleCount: 9 },
    { id: 3, key: 'playingcards', icon: 'fas fa-dice-d6', sampleCount: 9 },
    { id: 4, key: 'boardgames', icon: 'fas fa-gamepad', sampleCount: 9 },
    { id: 5, key: 'tarot', icon: 'fas fa-moon', sampleCount: 9 },
    { id: 6, key: 'advertising', icon: 'fas fa-bullhorn', sampleCount: 9 },
    { id: 7, key: 'kids', icon: 'fas fa-child', sampleCount: 9 },
    { id: 8, key: 'books', icon: 'fas fa-book', sampleCount: 0 }
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
        if (navSelect) navSelect.value = langCode;
        
        localStorage.setItem('preferredLanguage', langCode);
    } catch (error) {
        console.error('加载语言失败:', error);
    }
}

function updatePageText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) el.innerHTML = translations[key];
    });
}

function updatePlaceholders() {
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) el.placeholder = translations[key];
    });
}

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
            <div class="product-img"><i class="${product.icon}"></i></div>
            <h3>${translations[titleKey] || product.key}</h3>
            <p>${translations[descKey] || ''}</p>
        `;
        grid.appendChild(card);
    });
    
    // 免费获取精美样品卡片
    const sampleCard = document.createElement('div');
    sampleCard.className = 'product-card';
    sampleCard.onclick = () => {
        window.location.href = 'contact.html';
    };
    sampleCard.innerHTML = `
        <div class="product-img"><i class="fas fa-gift"></i></div>
        <h3>${translations['free_sample_title'] || 'Free Sample'}</h3>
        <p>${translations['free_sample_desc'] || 'Request a free exquisite sample →'}</p>
    `;
    grid.appendChild(sampleCard);
}

function renderLanguageButtons() {
    const container = document.getElementById('languageSelector');
    if (container) container.innerHTML = '';
}

function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
    }
}

function addLanguageSelectorToNavbar() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    const contactItem = Array.from(navMenu.children).find(li => {
        const link = li.querySelector('a');
        return link && link.getAttribute('data-i18n') === 'nav_contact';
    });
    if (!contactItem) return;
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
        if (lang.code === currentLang) option.selected = true;
        select.appendChild(option);
    });
    select.onchange = (e) => loadLanguage(e.target.value);
    newLi.appendChild(select);
    contactItem.insertAdjacentElement('afterend', newLi);
}

// ===== 加载 FAQ（从 Supabase）=====
async function loadFaqs() {
    const container = document.getElementById('faqList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">加载 FAQ 中...</div>';
    
    try {
        const { data, error } = await window.supabaseClient
            .from('faq')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p class="empty-state">暂无 FAQ，请稍后再来。</p>';
            return;
        }
        
        let html = '';
        data.forEach((faq, index) => {
            html += `
                <div class="faq-item">
                    <div class="faq-question" data-idx="${index}">
                        ${escapeHtml(faq.question)}
                    </div>
                    <div class="faq-answer" id="faq-answer-${index}">
                        ${escapeHtml(faq.answer)}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        
        // 绑定点击事件实现折叠/展开
        document.querySelectorAll('.faq-question').forEach(header => {
            header.addEventListener('click', function() {
                const answer = this.nextElementSibling;
                answer.classList.toggle('show');
                this.classList.toggle('active');
            });
        });
    } catch (err) {
        console.error('加载 FAQ 失败:', err);
        container.innerHTML = '<p class="empty-state">加载 FAQ 失败，请刷新页面重试。</p>';
    }
}

// 简单的防XSS函数
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

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
    addLanguageSelectorToNavbar();
    
    // 加载 FAQ（首页需要）
    loadFaqs();
        // ===== 五图画廊交互 =====
    const mainImg = document.getElementById('mainGalleryImage');
    const thumbsContainer = document.getElementById('galleryThumbnails');
    if (mainImg && thumbsContainer) {
        let currentThumbs = Array.from(thumbsContainer.querySelectorAll('.thumb'));
        
        // 初始化主图为中间图（索引2）
        if (currentThumbs[2]) {
            mainImg.src = currentThumbs[2].getAttribute('data-full');
        }
        
        function updateGallery(clickedThumb) {
            // 更新主图
            const fullUrl = clickedThumb.getAttribute('data-full');
            if (fullUrl) mainImg.src = fullUrl;
            
            // 重新排序缩略图：将点击的图移动到中间（索引2）
            const clickedIdx = currentThumbs.indexOf(clickedThumb);
            const middle = Math.floor(currentThumbs.length / 2); // 2
            if (clickedIdx !== middle) {
                const newOrder = [...currentThumbs];
                const [moved] = newOrder.splice(clickedIdx, 1);
                newOrder.splice(middle, 0, moved);
                currentThumbs = newOrder;
                // 重新渲染缩略图（保持事件绑定）
                thumbsContainer.innerHTML = '';
                currentThumbs.forEach(thumb => {
                    thumbsContainer.appendChild(thumb.cloneNode(true));
                });
                // 重新绑定事件
                currentThumbs = Array.from(thumbsContainer.querySelectorAll('.thumb'));
                currentThumbs.forEach(thumb => {
                    thumb.addEventListener('click', () => updateGallery(thumb));
                });
            }
        }
        
        // 绑定点击事件
        currentThumbs.forEach(thumb => {
            thumb.addEventListener('click', () => updateGallery(thumb));
        });
    }
});