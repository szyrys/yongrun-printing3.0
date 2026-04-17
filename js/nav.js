// ===== 全局导航组件 =====
// 使用方法：在页面中放置 <div id="globalNav"></div>，并引入本脚本和 common.js

(function() {
    // 导航 HTML 模板（支持多语言 data-i18n）
    const navHTML = `
        <nav class="navbar">
            <div class="container">
                <div class="logo">
                    <a href="index.html">YONGRUN<span> Printing</span></a>
                </div>
                <ul class="nav-menu" id="navMenu">
                    <li><a href="index.html" data-i18n="nav_home">Home</a></li>
                    <li class="dropdown">
                        <a href="javascript:void(0)" data-i18n="nav_products">Products</a>
                        <ul class="dropdown-menu">
                            <li><a href="cards.html">Cards</a></li>
                            <li><a href="books.html">Books</a></li>
                            <li><a href="board-games.html">Board Games</a></li>
                            <li><a href="puzzles.html">Puzzles</a></li>
                        </ul>
                    </li>
                    <li><a href="custom-process.html" data-i18n="nav_process">Custom Process</a></li>
                    <li><a href="craft-options.html" data-i18n="nav_craft">Materials & Finishes</a></li>
                    <li><a href="about.html" data-i18n="nav_about">About Us</a></li>
                    <li><a href="contact.html" data-i18n="nav_contact">Contact</a></li>
                    <li class="lang-item">
                        <select id="navLanguageSelect" class="nav-language-select">
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
                    </li>
                </ul>
                <div class="hamburger" id="hamburger">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </nav>
    `;

    // 注入导航到容器
    function injectNav() {
        const container = document.getElementById('globalNav');
        if (!container) return;

        container.innerHTML = navHTML;

        // 重新绑定移动端菜单事件
        initMobileMenu();

        // 绑定语言下拉框事件
        const langSelect = document.getElementById('navLanguageSelect');
        if (langSelect && typeof loadLanguage === 'function') {
            const savedLang = localStorage.getItem('preferredLanguage') || 'en';
            langSelect.value = savedLang;
            langSelect.addEventListener('change', (e) => {
                loadLanguage(e.target.value);
            });
        }

        // 初始化导航固定效果
        setTimeout(initStickyNavbar, 50);
    }
    // ===== 滚动时导航栏固定逻辑（终极稳定版）=====
function initStickyNavbar() {
    const navbar = document.querySelector('.navbar');
    const languageBar = document.querySelector('.language-bar');
    if (!navbar || !languageBar) return;

    let navbarHeight = navbar.offsetHeight;
    let isFixed = false;

    function handleScroll() {
        const rect = languageBar.getBoundingClientRect();
        // 蓝条底部滚出视口顶部（完全不可见）时固定导航栏
        if (rect.bottom <= 0 && !isFixed) {
            navbar.style.position = 'fixed';
            navbar.style.top = '0';
            navbar.style.left = '0';
            navbar.style.width = '100%';
            navbar.style.zIndex = '999';
            document.body.style.paddingTop = navbarHeight + 'px';
            isFixed = true;
        } 
        // 蓝条顶部重新进入视口时恢复导航栏
        else if (rect.top >= 0 && isFixed) {
            navbar.style.position = '';
            navbar.style.top = '';
            navbar.style.left = '';
            navbar.style.width = '';
            navbar.style.zIndex = '';
            document.body.style.paddingTop = '';
            isFixed = false;
        }
    }

    function updateNavbarHeight() {
        navbarHeight = navbar.offsetHeight;
        if (isFixed) {
            document.body.style.paddingTop = navbarHeight + 'px';
        }
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateNavbarHeight);
    handleScroll(); // 初始校准
}

    // 移动端菜单逻辑
    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');

        if (hamburger && navMenu) {
            hamburger.removeEventListener('click', toggleMenu);
            hamburger.addEventListener('click', toggleMenu);
        }

        function toggleMenu() {
            navMenu.classList.toggle('active');
        }

        // 移动端下拉菜单点击处理
        const dropdowns = document.querySelectorAll('.dropdown > a');
        dropdowns.forEach(trigger => {
            trigger.removeEventListener('click', dropdownHandler);
            trigger.addEventListener('click', dropdownHandler);
        });

        function dropdownHandler(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = this.parentElement;
                parent.classList.toggle('open');
            }
        }
    }

// ===== 蓝条自然隐藏控制（无动画闪动）=====
function initLanguageBarFade() {
    const languageBar = document.querySelector('.language-bar');
    if (!languageBar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function update() {
        const currentScrollY = window.scrollY;
        // 向下滚动超过50px后开始降低透明度，到底部完全透明
        const opacity = Math.max(0, 1 - currentScrollY / 150);
        languageBar.style.opacity = opacity;
        // 完全透明时禁止点击
        languageBar.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    });
}

// 在导航注入后调用
setTimeout(initLanguageBarFade, 100);

    // 等待 DOM 加载完成后注入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNav);
    } else {
        injectNav();
    }

    // 监听语言加载完成事件
    window.addEventListener('languageLoaded', () => {
        const langSelect = document.getElementById('navLanguageSelect');
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        if (langSelect) langSelect.value = savedLang;
    });
})();