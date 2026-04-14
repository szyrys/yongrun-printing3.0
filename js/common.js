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

// ===== 加载 FAQ =====
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
                    <div class="faq-question" data-idx="${index}">${escapeHtml(faq.question)}</div>
                    <div class="faq-answer" id="faq-answer-${index}">${escapeHtml(faq.answer)}</div>
                </div>
            `;
        });
        container.innerHTML = html;
        document.querySelectorAll('.faq-question').forEach(header => {
            header.addEventListener('click', function() {
                const answer = this.nextElementSibling;
                answer.classList.toggle('show');
                this.classList.toggle('active');
            });
        });
    } catch (err) {
        container.innerHTML = '<p class="empty-state">加载 FAQ 失败，请刷新页面重试。</p>';
    }
}

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
    if (savedLang && languages.some(l => l.code === savedLang)) initLang = savedLang;
    else if (languages.some(l => l.code === browserLang)) initLang = browserLang;
    
    await loadLanguage(initLang);
    addLanguageSelectorToNavbar();
    loadFaqs();
    
         // ===== 七图画廊 =====
    const gallery = document.getElementById('sevenGallery');
    if (gallery) {
        let imgs = Array.from(gallery.querySelectorAll('.gallery-img'));
        const total = imgs.length;
        const middleIndex = Math.floor(total / 2);
        let autoTimer = null;
        let isPaused = false;
        
        function reorderToMiddle(clickedImg) {
            const currentIdx = imgs.indexOf(clickedImg);
            if (currentIdx === middleIndex) return;
            
            let steps = currentIdx - middleIndex;
            let newImgs = [...imgs];
            
            if (steps > 0) {
                for (let i = 0; i < steps; i++) {
                    const first = newImgs.shift();
                    newImgs.push(first);
                }
            } else if (steps < 0) {
                for (let i = 0; i < -steps; i++) {
                    const last = newImgs.pop();
                    newImgs.unshift(last);
                }
            }
            
            imgs = newImgs;
            
            gallery.innerHTML = '';
            imgs.forEach(img => {
                gallery.appendChild(img.cloneNode(true));
            });
            
            imgs = Array.from(gallery.querySelectorAll('.gallery-img'));
            bindClickEvents();
        }
        
        // 自动轮播：向右移动一张（将当前中间图片的右边一张移到中间）
        function nextSlide() {
            if (isPaused) return;
            const nextIndex = (middleIndex + 1) % total;
            const nextImg = imgs[nextIndex];
            if (nextImg) {
                reorderToMiddle(nextImg);
            }
        }
        
        function bindClickEvents() {
            imgs.forEach(img => {
                img.addEventListener('click', () => {
                    if (autoTimer) {
                        clearInterval(autoTimer);
                        autoTimer = null;
                    }
                    isPaused = true;
                    reorderToMiddle(img);
                    setTimeout(() => {
                        isPaused = false;
                        startAutoPlay();
                    }, 5000);
                });
            });
        }
        
        function startAutoPlay() {
            if (autoTimer) clearInterval(autoTimer);
            autoTimer = setInterval(() => {
                if (!isPaused) nextSlide();
            }, 3000);
        }
        
        gallery.addEventListener('mouseenter', () => { isPaused = true; });
        gallery.addEventListener('mouseleave', () => { isPaused = false; });
        
        bindClickEvents();
        startAutoPlay();
    }
});