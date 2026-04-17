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

        // 重新绑定移动端菜单事件（因为 DOM 已刷新）
        initMobileMenu();

        // 绑定语言下拉框事件（如果 common.js 中已有全局绑定，可省略，此处做兼容）
        const langSelect = document.getElementById('navLanguageSelect');
        if (langSelect && typeof loadLanguage === 'function') {
            // 同步当前语言选中状态
            const savedLang = localStorage.getItem('preferredLanguage') || 'en';
            langSelect.value = savedLang;

            langSelect.addEventListener('change', (e) => {
                loadLanguage(e.target.value);
            });
        }
    }

    // 移动端菜单逻辑（从 common.js 移植，确保组件独立工作）
    function initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');

        if (hamburger && navMenu) {
            // 移除之前绑定的监听器，避免重复
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

    // 等待 DOM 加载完成后注入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNav);
    } else {
        injectNav();
    }

    // 如果 common.js 稍后加载，确保语言下拉框能被正确设置
    // 监听语言加载完成事件（如果有的话）
    window.addEventListener('languageLoaded', () => {
        const langSelect = document.getElementById('navLanguageSelect');
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';
        if (langSelect) langSelect.value = savedLang;
    });
})();
    // ===== 滚动时导航栏固定逻辑 =====
    function initStickyNavbar() {
        const navbar = document.querySelector('.navbar');
        const languageBar = document.querySelector('.language-bar');
        if (!navbar || !languageBar) return;

        let navbarHeight = navbar.offsetHeight;
        let languageBarHeight = languageBar.offsetHeight;
        let isFixed = false;

        function handleScroll() {
            const scrollY = window.scrollY;
            if (scrollY > languageBarHeight && !isFixed) {
                // 添加固定样式
                navbar.style.position = 'fixed';
                navbar.style.top = '0';
                navbar.style.left = '0';
                navbar.style.width = '100%';
                navbar.style.zIndex = '999';
                document.body.style.paddingTop = navbarHeight + 'px';
                isFixed = true;
            } else if (scrollY <= languageBarHeight && isFixed) {
                // 恢复原状
                navbar.style.position = '';
                navbar.style.top = '';
                navbar.style.left = '';
                navbar.style.width = '';
                navbar.style.zIndex = '';
                document.body.style.paddingTop = '';
                isFixed = false;
            }
        }

        function updateHeights() {
            navbarHeight = navbar.offsetHeight;
            languageBarHeight = languageBar.offsetHeight;
            if (isFixed) {
                document.body.style.paddingTop = navbarHeight + 'px';
            }
        }

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', updateHeights);
        // 初始执行一次
        handleScroll();
    }

    // 等待导航注入完成后再初始化
    setTimeout(initStickyNavbar, 50);