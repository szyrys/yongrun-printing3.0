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
        // 立即计算并设置 body 的 padding-top，减少页面跳转时的布局抖动--新加 可删
const langBar = document.querySelector('.language-bar');
const navBar = document.querySelector('.navbar');
if (langBar && navBar) {
    const totalHeight = langBar.offsetHeight + navBar.offsetHeight;
    document.body.style.paddingTop = totalHeight + 'px';
}

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
// ===== 双栏固定 + 自适应校准（加强版）=====
(function() {
    function fixDualBars() {
        const languageBar = document.querySelector('.language-bar');
        const navbar = document.querySelector('.navbar');
        if (!languageBar || !navbar) return;

        // 核心校准函数
        function calibrate() {
            // 获取实时高度
            const langBarHeight = languageBar.offsetHeight;
            const navbarHeight = navbar.offsetHeight;
            
            // 设置导航栏紧贴蓝条下方
            navbar.style.top = langBarHeight + 'px';
            
            // 设置 body 顶部内边距 = 蓝条高度 + 导航栏高度
            const totalHeight = langBarHeight + navbarHeight;
            document.body.style.paddingTop = totalHeight + 'px';
            
            // 如果当前滚动位置为0，确保不被固定栏遮挡（强制滚动到顶部？不需要，但需处理锚点）
            // 解决刷新时可能出现的偏移
            if (window.scrollY < totalHeight) {
                // 不强制滚动，仅校准
            }
        }

        // 立即校准
        calibrate();

        // 监听窗口大小变化
        window.addEventListener('resize', calibrate);

        // 监听页面滚动（解决刷新后滚动位置导致的计算偏差）
        window.addEventListener('scroll', function() {
            // 滚动时也实时校准（确保 fixed 元素位置绝对正确）
            calibrate();
        });

        // 监听字体加载、内容变化等导致的高度变化（后备轮询）
        let lastHeight = 0;
        setInterval(function() {
            const currentHeight = languageBar.offsetHeight + navbar.offsetHeight;
            if (currentHeight !== lastHeight) {
                calibrate();
                lastHeight = currentHeight;
            }
        }, 150);

        // 处理锚点链接（如页面内跳转），避免被固定栏遮挡标题
        // 这个逻辑放在这里可以改善用户体验
        if (location.hash) {
            setTimeout(function() {
                const target = document.querySelector(location.hash);
                if (target) {
                    const offset = languageBar.offsetHeight + navbar.offsetHeight;
                    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
                    window.scrollTo({
                        top: elementPosition - offset,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }

    // 确保导航组件已完全注入
    setTimeout(fixDualBars, 80);
})();
})();
// ===== 独立锚点补偿（消除抽搐）=====
(function() {
    function getFixedHeight() {
        const langBar = document.querySelector('.language-bar');
        const navBar = document.querySelector('.navbar');
        if (!langBar || !navBar) return 0;
        return langBar.offsetHeight + navBar.offsetHeight;
    }

    // 接管所有锚点链接点击
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        
        const href = link.getAttribute('href');
        // 忽略空锚点或仅 "#" 的链接（由浏览器默认处理回到顶部）
        if (href === '#' || href === '' || href === '#top') return;
        
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            e.preventDefault();
            const offset = getFixedHeight();
            const elementPosition = target.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth'
            });
            // 更新地址栏，但不触发默认跳转
            history.pushState(null, null, href);
        }
    });

    // 处理页面初始加载时的 hash（例如从其他页面带锚点跳转过来）
    if (location.hash) {
        window.addEventListener('load', function() {
            const target = document.querySelector(location.hash);
            if (target) {
                const offset = getFixedHeight();
                const elementPosition = target.getBoundingClientRect().top + window.scrollY;
                // 注意：这里使用瞬时跳转，避免与浏览器默认行为叠加导致抽搐
                window.scrollTo(0, elementPosition - offset);
            }
        });
    }
    // 微小延迟校准（确保字体/图标加载后高度准确-可删）
setTimeout(() => {
    const langBar = document.querySelector('.language-bar');
    const navBar = document.querySelector('.navbar');
    if (langBar && navBar) {
        const totalHeight = langBar.offsetHeight + navBar.offsetHeight;
        document.body.style.paddingTop = totalHeight + 'px';
    }
}, 50);
})();
