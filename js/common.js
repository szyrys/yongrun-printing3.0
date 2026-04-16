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
    // ===== 回到顶部按钮 =====
    const backToTopBtn = document.createElement('div');
    backToTopBtn.id = 'backToTopBtn';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.title = 'Back to Top';
    document.body.appendChild(backToTopBtn);
    
    // 样式
        const backToTopStyle = document.createElement('style');
    backToTopStyle.textContent = `
        #backToTopBtn {
            position: fixed;
            bottom: 110px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(8px);
            color: #1a2a4f;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 22px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: all 0.3s;
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            border: 1px solid rgba(255,255,255,0.3);
        }
        #backToTopBtn:hover {
            background: rgba(255,255,255,0.35);
            transform: translateY(-3px);
        }
        #backToTopBtn.show {
            opacity: 1;
            visibility: visible;
        }
        @media (max-width: 768px) {
            #backToTopBtn {
                width: 45px;
                height: 45px;
                font-size: 18px;
                bottom: 100px;
                right: 20px;
            }
        }
    `;
    document.head.appendChild(backToTopStyle);
    
    // 滚动监听
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    // 点击回到顶部
    backToTopBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
// ===== 全局浮动咨询按钮 =====
(function() {
    // 创建浮动按钮
    const floatBtn = document.createElement('div');
    floatBtn.id = 'floatConsultBtn';
    floatBtn.innerHTML = '<i class="fas fa-envelope"></i><span>Get a Quote</span>';
    floatBtn.title = 'Get a Free Quote';
    document.body.appendChild(floatBtn);
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.id = 'consultModal';
    modal.innerHTML = `
        <div class="consult-modal-content">
            <span class="consult-close">&times;</span>
            <div class="consult-header">
                <i class="fas fa-gift"></i>
                <h3>Free Quote Request</h3>
                <p>We'll reply within 12 hours</p>
            </div>
            <form id="consultForm">
                <div class="consult-form-group">
                    <input type="text" id="consult_name" placeholder="Your Name / Company Name *" required>
                </div>
                <div class="consult-row">
                    <div class="consult-form-group half">
                        <input type="tel" id="consult_phone" placeholder="Phone Number">
                    </div>
                    <div class="consult-form-group half">
                        <input type="email" id="consult_email" placeholder="Email Address">
                    </div>
                </div>
                <div class="consult-form-group">
                    <input type="text" id="consult_quantity" placeholder="Planned Quantity (e.g., 1000 sets)">
                </div>
                <div class="consult-form-group">
                    <input type="url" id="consult_file_link" placeholder="File Sharing Link (Google Drive / Dropbox / WeTransfer)">
                    <small>Upload your design files to cloud storage and paste the link here</small>
                </div>
                <div class="consult-form-group">
                    <textarea id="consult_message" rows="4" placeholder="Other Information (size, material, special requirements...)"></textarea>
                </div>
                <div class="consult-contact-hint">
                    <i class="fas fa-info-circle"></i> Please provide either Phone or Email so we can reach you
                </div>
                <button type="submit" id="consultSubmitBtn">Send Request →</button>
            </form>
            <div id="consultStatus"></div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 样式（保持不变）
    const style = document.createElement('style');
    style.textContent = `
        #floatConsultBtn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #c9a03d, #b08a2c);
            color: white;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 6px 20px rgba(0,0,0,0.25);
            transition: all 0.3s;
            z-index: 999;
            border: none;
            animation: floatPulse 2s infinite;
        }
        #floatConsultBtn i {
            font-size: 20px;
        }
        #floatConsultBtn:hover {
            transform: scale(1.05);
            background: linear-gradient(135deg, #b08a2c, #9a7525);
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        @keyframes floatPulse {
            0% { transform: scale(1); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
            50% { transform: scale(1.03); box-shadow: 0 8px 30px rgba(0,0,0,0.35); }
            100% { transform: scale(1); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
        }
        @media (max-width: 768px) {
            #floatConsultBtn { padding: 10px 18px; font-size: 14px; }
            #floatConsultBtn span { display: inline; }
        }
        #consultModal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(3px);
        }
        .consult-modal-content {
            background: white;
            max-width: 550px;
            width: 90%;
            border-radius: 20px;
            position: relative;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .consult-close {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 28px;
            cursor: pointer;
            color: #999;
            z-index: 10;
        }
        .consult-close:hover {
            color: #333;
        }
        .consult-header {
            background: linear-gradient(135deg, #1a2a4f, #2a3a5f);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 20px 20px 0 0;
        }
        .consult-header i {
            font-size: 48px;
            margin-bottom: 15px;
            color: #c9a03d;
        }
        .consult-header h3 {
            margin: 0 0 8px 0;
            font-size: 1.5rem;
        }
        .consult-header p {
            margin: 0;
            opacity: 0.8;
            font-size: 0.9rem;
        }
        .consult-form-group {
            margin-bottom: 15px;
            padding: 0 20px;
        }
        .consult-row {
            display: flex;
            gap: 15px;
            padding: 0 20px;
        }
        .consult-form-group.half {
            flex: 1;
            padding: 0;
        }
        .consult-form-group input,
        .consult-form-group textarea,
        .consult-form-group select {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            font-size: 14px;
            transition: all 0.3s;
            box-sizing: border-box;
        }
        .consult-form-group input:focus,
        .consult-form-group textarea:focus {
            outline: none;
            border-color: #c9a03d;
            box-shadow: 0 0 0 3px rgba(201,160,61,0.1);
        }
        .consult-form-group small {
            display: block;
            color: #999;
            font-size: 11px;
            margin-top: 5px;
        }
        .consult-contact-hint {
            background: #f8f9fa;
            padding: 12px 20px;
            margin: 10px 20px;
            border-radius: 8px;
            font-size: 12px;
            color: #666;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .consult-contact-hint i {
            color: #c9a03d;
        }
        #consultSubmitBtn {
            width: calc(100% - 40px);
            margin: 10px 20px 25px 20px;
            padding: 14px;
            background: linear-gradient(135deg, #c9a03d, #b08a2c);
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        #consultSubmitBtn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(201,160,61,0.4);
        }
        @media (max-width: 550px) {
            .consult-row {
                flex-direction: column;
                gap: 0;
                padding: 0;
            }
            .consult-form-group {
                padding: 0 20px;
            }
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
        const quantity = document.getElementById('consult_quantity').value.trim();
        const fileLink = document.getElementById('consult_file_link').value.trim();
        const message = document.getElementById('consult_message').value.trim();
        const statusDiv = document.getElementById('consultStatus');
        
        if (!name) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">Please enter your name or company name</span>';
            return;
        }
        if (!phone && !email) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">Please provide either phone number or email address</span>';
            return;
        }
        
        statusDiv.innerHTML = '<span style="color: #3498db;">Sending...</span>';
        
        try {
            const fullMessage = `Quantity: ${quantity || 'Not specified'}\nFile Link: ${fileLink || 'Not provided'}\n\nOther Information:\n${message || 'Not specified'}`;
            const { error } = await window.supabaseClient
                .from('messages')
                .insert([{ name, email: email || 'Not provided', message: fullMessage, phone: phone || 'Not provided' }]);
            
            if (error) throw error;
            
            statusDiv.innerHTML = '<span style="color: #27ae60;">✓ Message sent! We will contact you soon.</span>';
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