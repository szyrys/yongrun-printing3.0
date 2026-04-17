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

    // ===== 使用 Intersection Observer 实现导航固定（蓝条自然消失）=====
    function initObserverSticky() {
        const navbar = document.querySelector('.navbar');
        const languageBar = document.querySelector('.language-bar');
        if (!navbar || !languageBar) return;

        let navbarHeight = navbar.offsetHeight;

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry.isIntersecting) {
                // 蓝条已滚出视口，固定导航栏
                navbar.style.position = 'fixed';
                navbar.style.top = '0';
                navbar.style.left = '0';
                navbar.style.width = '100%';
                navbar.style.zIndex = '999';
                document.body.style.paddingTop = navbarHeight + 'px';
            } else {
                // 蓝条重新进入视口，恢复导航栏
                navbar.style.position = '';
                navbar.style.top = '';
                navbar.style.left = '';
                navbar.style.width = '';
                navbar.style.zIndex = '';
                document.body.style.paddingTop = '';
            }
        }, {
            threshold: 0  // 只要蓝条有任何部分不可见就触发
        });

        observer.observe(languageBar);

        // 窗口大小变化时更新导航栏高度
        window.addEventListener('resize', () => {
            navbarHeight = navbar.offsetHeight;
            if (navbar.style.position === 'fixed') {
                document.body.style.paddingTop = navbarHeight + 'px';
            }
        });
    }

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