// ===== 全局导航组件 =====
// 使用方法：在页面中放置 <div id="globalNav"></div>，并引入本脚本和 common.js

(function() {
    // 统一模板：蓝条 + 导航栏
    const navHTML = `
        <div class="language-bar">
            <div class="container">
                <div class="language-selector" id="languageSelector"></div>
            </div>
        </div>
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

    // 注入到容器
    function injectNav() {
        const container = document.getElementById('globalNav');
        if (!container) return;

        container.innerHTML = navHTML;

        // 绑定移动端菜单
        initMobileMenu();

        // 绑定语言下拉框
        const langSelect = document.getElementById('navLanguageSelect');
        if (langSelect && typeof loadLanguage === 'function') {
            const savedLang = localStorage.getItem('preferredLanguage') || 'en';
            langSelect.value = savedLang;
            langSelect.addEventListener('change', (e) => {
                loadLanguage(e.target.value);
            });
        }
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

    // 启动注入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNav);
    } else {
        injectNav();
    }

    // 语言加载后同步下拉框选中值
    window.addEventListener('languageLoaded', () => {
        const langSelect = document.getElementById('navLanguageSelect');
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        if (langSelect) langSelect.value = savedLang;
    });
})();