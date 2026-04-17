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


// ===== 滚动时导航栏固定 + 蓝条平滑隐藏 =====
(function() {
    function initNavbarFixed() {
        const navbar = document.querySelector('.navbar');
        const languageBar = document.querySelector('.language-bar');
        if (!navbar || !languageBar) return;

        let navbarHeight = navbar.offsetHeight;
        let isFixed = false;

        function handleScroll() {
            const rect = languageBar.getBoundingClientRect();
            
            // 控制蓝条隐藏类（实现平滑过渡）
            if (rect.bottom <= 0) {
                languageBar.classList.add('hidden');
            } else {
                languageBar.classList.remove('hidden');
            }
            
            // 控制导航栏固定
            if (rect.bottom <= 0 && !isFixed) {
                navbar.style.position = 'fixed';
                navbar.style.top = '0';
                navbar.style.left = '0';
                navbar.style.width = '100%';
                navbar.style.zIndex = '999';
                document.body.style.paddingTop = navbarHeight + 'px';
                isFixed = true;
            } else if (rect.top >= 0 && isFixed) {
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
        handleScroll();
    }

    setTimeout(initNavbarFixed, 100);
    // ===== 固定双栏 + 自动计算高度 =====
(function() {
    function fixBars() {
        const languageBar = document.querySelector('.language-bar');
        const navbar = document.querySelector('.navbar');
        if (!languageBar || !navbar) return;

        function updatePositions() {
            const langBarHeight = languageBar.offsetHeight;
            // 导航栏紧贴蓝条下方
            navbar.style.top = langBarHeight + 'px';
            // 防止内容被遮挡
            document.body.style.paddingTop = (langBarHeight + navbar.offsetHeight) + 'px';
        }

        updatePositions();
        window.addEventListener('resize', updatePositions);

        // 监听字体或内容变化导致的高度变化（简单轮询，可靠）
        let lastHeight = languageBar.offsetHeight + navbar.offsetHeight;
        setInterval(() => {
            const newHeight = languageBar.offsetHeight + navbar.offsetHeight;
            if (newHeight !== lastHeight) {
                updatePositions();
                lastHeight = newHeight;
            }
        }, 200);
    }

    setTimeout(fixBars, 100);
})();
})();