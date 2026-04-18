// ===== 全局导航组件 =====
// 使用方法：在页面中放置 <div id="globalNav"></div>，并引入本脚本和 common.js

(function() {
    // 统一模板：蓝条 + 导航栏
    const navHTML = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-356CL711M5"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-356CL711M5');
</script>

<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "wdl5ti6rxr");
</script>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/x-icon" sizes="16x16" href="/favicon-16x16.ico">
    <link rel="icon" type="image/x-icon" sizes="32x32" href="/favicon-32x32.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.ico">
    <link rel="icon" type="image/x-icon" sizes="192x192" href="/android-chrome-192x192.ico">
        <div class="language-bar">
            <div class="container">
                <div class="language-selector" id="languageSelector"></div>
            </div>
        </div>
        <nav class="navbar">
            <div class="container">
                <div class="logo">
                    <a href="index.html" style="display: flex; align-items: center; gap: 8px;">
                        <img src="/slogo.png" alt="Yongrun" style="height: 36px; width: auto;">
                        <span>
                            <span data-i18n="logo_yongrun"style="color: #1a2a4f;">YONGRUN</span>
                            <span data-i18n="logo_printing" style="color: #c9a03d;"> Printing</span>
                        </span>
                    </a>
                </div>
                <ul class="nav-menu" id="navMenu">
                    <li><a href="index.html" data-i18n="nav_home">Home</a></li>
                    <li class="dropdown">
                        <a href="javascript:void(0)" data-i18n="nav_products">Products</a>
                        <ul class="dropdown-menu">
                            <li><a href="cards.html" data-i18n="nav_cards">Card Products</a></li>
                            <li><a href="board-games.html" data-i18n="nav_boardgames">Board Game Sets</a></li>
                            <li><a href="books.html" data-i18n="nav_books">Book Printing</a></li>
                            <li><a href="puzzles.html" data-i18n="nav_puzzles">Custom Puzzles</a></li>
                        </ul>
                    </li>
                    <li><a href="craft-options.html" data-i18n="nav_craft">Materials & Finishes</a></li>
                    <li><a href="custom-process.html" data-i18n="nav_process">Custom Process</a></li>
                    <li><a href="about.html" data-i18n="nav_about">About Us</a></li>
                    <li><a href="contact.html" data-i18n="nav_contact">Contact</a></li>
                    <li class="lang-item">
                        <select id="navLanguageSelect" class="nav-language-select">
                            <option value="en">English</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="de">Deutsch</option>
                            <option value="es">Español</option>
                            <option value="pt">Português</option>
                            <option value="ar">العربية</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                            <option value="zh-TW">繁體中文</option>
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

        // ===== 高亮当前页面导航项（统一方案 C：浅金背景 + 白色文字）=====
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const allNavLinks = document.querySelectorAll('.nav-menu a');
        const activeClass = 'active-page-bg';

        allNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.classList.add(activeClass);
            }
            // 如果匹配的是下拉子项，也高亮父级 Products
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown && (href === currentPath)) {
                const dropdownToggle = parentDropdown.querySelector(':scope > a');
                if (dropdownToggle) dropdownToggle.classList.add(activeClass);
            }
        });
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

// ===== 双栏固定 + 自适应校准 =====
(function() {
    function fixDualBars() {
        const languageBar = document.querySelector('.language-bar');
        const navbar = document.querySelector('.navbar');
        if (!languageBar || !navbar) return;

        function calibrate() {
            const langBarHeight = languageBar.offsetHeight;
            const navbarHeight = navbar.offsetHeight;
            navbar.style.top = langBarHeight + 'px';
            document.body.style.paddingTop = (langBarHeight + navbarHeight) + 'px';
        }

        calibrate();
        window.addEventListener('resize', calibrate);
        window.addEventListener('scroll', calibrate);

        let lastHeight = 0;
        setInterval(function() {
            const currentHeight = languageBar.offsetHeight + navbar.offsetHeight;
            if (currentHeight !== lastHeight) {
                calibrate();
                lastHeight = currentHeight;
            }
        }, 150);
    }

    setTimeout(fixDualBars, 80);
})();

// ===== 独立锚点补偿（消除抽搐）=====
(function() {
    function getFixedHeight() {
        const langBar = document.querySelector('.language-bar');
        const navBar = document.querySelector('.navbar');
        if (!langBar || !navBar) return 0;
        return langBar.offsetHeight + navBar.offsetHeight;
    }

    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href === '#' || href === '' || href === '#top') return;
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            e.preventDefault();
            const offset = getFixedHeight();
            const elementPosition = target.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
            history.pushState(null, null, href);
        }
    });

    if (location.hash) {
        window.addEventListener('load', function() {
            const target = document.querySelector(location.hash);
            if (target) {
                const offset = getFixedHeight();
                const elementPosition = target.getBoundingClientRect().top + window.scrollY;
                window.scrollTo(0, elementPosition - offset);
            }
        });
    }
})();