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
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // 移动端下拉菜单点击处理
    const dropdowns = document.querySelectorAll('.dropdown > a');
    dropdowns.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = trigger.parentElement;
                parent.classList.toggle('open');
            }
        });
    });
}

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

document.addEventListener('DOMContentLoaded', async () => {
    renderLanguageButtons();
    initMobileMenu();
    
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language.split('-')[0];
    let initLang = 'en';
    if (savedLang && languages.some(l => l.code === savedLang)) initLang = savedLang;
    else if (languages.some(l => l.code === browserLang)) initLang = browserLang;
    
    await loadLanguage(initLang);
        // 绑定语言下拉框事件
    const langSelect = document.getElementById('navLanguageSelect');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            loadLanguage(e.target.value);
        });
    }
    loadFaqs();
    
    // 七图画廊
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
        
        function nextSlide() {
            if (isPaused) return;
            const nextIndex = (middleIndex + 1) % total;
            const nextImg = imgs[nextIndex];
            if (nextImg) reorderToMiddle(nextImg);
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
    
    // 公司简介轮播图
    const slides = document.querySelectorAll('#aboutSlider .slide');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsContainer = document.getElementById('sliderDots');
    let currentSlide = 0;
    let slideInterval;

    if (slides.length > 0) {
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        function goToSlide(index) {
            slides[currentSlide].classList.remove('active');
            dotsContainer.children[currentSlide].classList.remove('active');
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            dotsContainer.children[currentSlide].classList.add('active');
        }

        function nextSlideFn() { goToSlide(currentSlide + 1); }
        function prevSlideFn() { goToSlide(currentSlide - 1); }

        nextBtn.addEventListener('click', () => {
            nextSlideFn();
            resetInterval();
        });
        prevBtn.addEventListener('click', () => {
            prevSlideFn();
            resetInterval();
        });

        function startInterval() {
            slideInterval = setInterval(nextSlideFn, 4000);
        }
        function resetInterval() {
            clearInterval(slideInterval);
            startInterval();
        }
        startInterval();
    }
});
// ===== 全局浮动咨询按钮 =====
(function() {
    // 创建浮动按钮
    const floatBtn = document.createElement('div');
    floatBtn.id = 'floatConsultBtn';
    floatBtn.innerHTML = '<i class="fas fa-comment-dots"></i>';
    floatBtn.title = 'Get a Quote';
    document.body.appendChild(floatBtn);
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.id = 'consultModal';
    modal.innerHTML = `
        <div class="consult-modal-content">
            <span class="consult-close">&times;</span>
            <h3>Get a Free Quote</h3>
            <p>Fill out the form below and we'll reply within 24 hours</p>
            <form id="consultForm">
                <input type="text" id="consult_name" placeholder="Your Name *" required>
                <input type="tel" id="consult_phone" placeholder="Phone Number">
                <input type="email" id="consult_email" placeholder="Email Address">
                <select id="consult_product">
                    <option value="" disabled selected>Select Product Type</option>
                    <option value="cards">Cards</option>
                    <option value="books">Books</option>
                    <option value="board-games">Board Games</option>
                    <option value="puzzles">Puzzles</option>
                    <option value="other">Other</option>
                </select>
                <textarea id="consult_message" rows="4" placeholder="Tell us about your project..."></textarea>
                <div style="font-size: 12px; color: #666; margin: 10px 0;">Please provide either Phone or Email</div>
                <button type="submit">Send Message</button>
            </form>
            <div id="consultStatus"></div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 样式
    const style = document.createElement('style');
    style.textContent = `
        #floatConsultBtn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: #c9a03d;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 28px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s;
            z-index: 999;
        }
        #floatConsultBtn:hover {
            transform: scale(1.1);
            background: #b08a2c;
        }
        #consultModal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        .consult-modal-content {
            background: white;
            max-width: 500px;
            width: 90%;
            padding: 25px;
            border-radius: 12px;
            position: relative;
            max-height: 85vh;
            overflow-y: auto;
        }
        .consult-close {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 28px;
            cursor: pointer;
            color: #999;
        }
        .consult-close:hover {
            color: #333;
        }
        .consult-modal-content h3 {
            color: #1a2a4f;
            margin-bottom: 10px;
        }
        .consult-modal-content input,
        .consult-modal-content select,
        .consult-modal-content textarea {
            width: 100%;
            padding: 10px;
            margin: 8px 0;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }
        .consult-modal-content button {
            width: 100%;
            padding: 12px;
            background: #c9a03d;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 10px;
        }
        .consult-modal-content button:hover {
            background: #b08a2c;
        }
        #consultStatus {
            margin-top: 10px;
            font-size: 14px;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
    
    // 打开弹窗
    floatBtn.onclick = () => {
        modal.style.display = 'flex';
    };
    
    // 关闭弹窗
    modal.querySelector('.consult-close').onclick = () => {
        modal.style.display = 'none';
    };
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
    
    // 表单提交
    const consultForm = document.getElementById('consultForm');
    consultForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('consult_name').value.trim();
        const phone = document.getElementById('consult_phone').value.trim();
        const email = document.getElementById('consult_email').value.trim();
        const product = document.getElementById('consult_product').value;
        const message = document.getElementById('consult_message').value.trim();
        const statusDiv = document.getElementById('consultStatus');
        
        if (!name) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">Please enter your name</span>';
            return;
        }
        if (!phone && !email) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">Please provide either phone or email</span>';
            return;
        }
        
        statusDiv.innerHTML = '<span style="color: #3498db;">Sending...</span>';
        
        try {
            const fullMessage = `Product: ${product}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message || 'No message'}`;
            const { error } = await window.supabaseClient
                .from('messages')
                .insert([{ name, email: email || 'Not provided', message: fullMessage, phone: phone || 'Not provided' }]);
            
            if (error) throw error;
            
            statusDiv.innerHTML = '<span style="color: #27ae60;">Message sent! We will contact you soon.</span>';
            consultForm.reset();
            setTimeout(() => {
                statusDiv.innerHTML = '';
                modal.style.display = 'none';
            }, 3000);
        } catch (err) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">Failed to send, please try again</span>';
        }
    };
})();