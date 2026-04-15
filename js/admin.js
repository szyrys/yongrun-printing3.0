// 管理后台脚本 - 登录和留言/FAQ/产品管理

let currentUser = null;

const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');

// 多语言标签页切换
function initLangTabs(container) {
    const modalContent = container || document;
    const tabs = modalContent.querySelectorAll('.lang-tab');
    tabs.forEach(tab => {
        tab.removeEventListener('click', tab._handler);
        const handler = () => {
            const lang = tab.getAttribute('data-lang');
            const parentContainer = tab.closest('.modal-content');
            if (parentContainer) {
                parentContainer.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                parentContainer.querySelectorAll('.lang-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                const activePanel = parentContainer.querySelector(`.lang-panel[data-lang="${lang}"]`);
                if (activePanel) activePanel.classList.add('active');
            }
        };
        tab.addEventListener('click', handler);
        tab._handler = handler;
    });
}

async function checkSession() {
    try {
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        if (error) throw error;
        if (session) {
            currentUser = session.user;
            showAdminPanel();
            loadMessages();
            loadFaqs();
            loadProducts();
        } else {
            showLoginPanel();
        }
    } catch (err) {
        console.error(err);
        showLoginPanel();
    }
}

function showLoginPanel() {
    if (loginPanel) loginPanel.style.display = 'block';
    if (adminPanel) adminPanel.style.display = 'none';
}

function showAdminPanel() {
    if (loginPanel) loginPanel.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
}

async function login() {
    const email = adminEmail.value.trim();
    const password = adminPassword.value.trim();
    if (!email || !password) {
        showLoginError('请输入邮箱和密码');
        return;
    }
    loginBtn.disabled = true;
    loginBtn.textContent = '登录中...';
    try {
        const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showAdminPanel();
        loadMessages();
        loadFaqs();
        loadProducts();
    } catch (err) {
        showLoginError('邮箱或密码错误');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
    }
}

function showLoginError(msg) {
    if (loginError) {
        loginError.textContent = msg;
        loginError.style.display = 'block';
        setTimeout(() => loginError.style.display = 'none', 3000);
    }
}

async function logout() {
    await window.supabaseClient.auth.signOut();
    showLoginPanel();
}

// 标签页切换
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = {
        messages: document.getElementById('messagesPanel'),
        faq: document.getElementById('faqPanel'),
        products: document.getElementById('productsPanel')
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            Object.keys(panels).forEach(key => {
                if (panels[key]) panels[key].classList.remove('active');
            });
            if (panels[tabId]) panels[tabId].classList.add('active');
        });
    });
}

document.getElementById('refreshMessagesBtn')?.addEventListener('click', () => loadMessages());

// ===== 留言管理（空状态显示表头）=====
async function loadMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    try {
        const { data, error } = await window.supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        
        // 始终显示表格结构
        let html = `<table class="data-table"><thead><tr>
            <th>ID</th><th>姓名</th><th>邮箱</th><th>电话</th><th>留言内容</th><th>提交时间</th><th>操作</th>
        </tr></thead><tbody>`;
        
        if (!data || data.length === 0) {
            html += `<tr><td colspan="7" style="text-align: center;">暂无留言</td></tr>`;
        } else {
            data.forEach(msg => {
                const date = new Date(msg.created_at).toLocaleString('zh-CN');
                html += `<tr>
                    <td>${msg.id}</td>
                    <td>${escapeHtml(msg.name)}</td>
                    <td>${escapeHtml(msg.email || '-')}</td>
                    <td>${escapeHtml(msg.phone || '-')}</td>
                    <td style="white-space: normal; word-break: break-word;">${escapeHtml(msg.message || '')}</td>
                    <td>${date}</td>
                    <td><button class="delete-btn" data-id="${msg.id}" data-type="message">删除</button></td>
                </tr>`;
            });
        }
        
        html += `</tbody></table>`;
        container.innerHTML = html;
        
        document.querySelectorAll('.delete-btn[data-type="message"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('确定删除？')) {
                    await window.supabaseClient.from('messages').delete().eq('id', btn.dataset.id);
                    loadMessages();
                }
            });
        });
    } catch (err) {
        container.innerHTML = '<div class="empty-state">加载失败</div>';
    }
}

// ===== FAQ 管理（多语言）=====
let currentFaqId = null;

async function loadFaqs() {
    const container = document.getElementById('faqContainer');
    if (!container) return;
    
    try {
        const { data, error } = await window.supabaseClient.from('faq').select('*').order('sort_order');
        if (error) throw error;
        
        let html = `<table class="data-table"><thead><tr><th>ID</th><th>问题(EN)</th><th>回答(EN)</th><th>操作</th></tr></thead><tbody>`;
        
        if (!data || data.length === 0) {
            html += `<tr><td colspan="4" style="text-align: center;">暂无 FAQ</td></tr>`;
        } else {
            data.forEach(faq => {
                html += `<tr>
                    <td>${faq.id}</td>
                    <td>${escapeHtml(faq.question_en || '-')}</td>
                    <td>${escapeHtml((faq.answer_en || '').substring(0, 80))}${(faq.answer_en || '').length > 80 ? '...' : ''}</td>
                    <td><button class="edit-faq-btn" data-id="${faq.id}">编辑</button><button class="delete-faq-btn" data-id="${faq.id}">删除</button></td>
                </tr>`;
            });
        }
        
        html += `</tbody></table>`;
        container.innerHTML = html;
        
        document.querySelectorAll('.edit-faq-btn').forEach(btn => btn.addEventListener('click', () => editFaq(btn.dataset.id)));
        document.querySelectorAll('.delete-faq-btn').forEach(btn => btn.addEventListener('click', () => deleteFaq(btn.dataset.id)));
    } catch (err) {
        container.innerHTML = '<div class="empty-state">加载失败</div>';
    }
}

async function editFaq(id) {
    const { data } = await window.supabaseClient.from('faq').select('*').eq('id', id).single();
    
    document.getElementById('faqQuestion_en').value = data.question_en || '';
    document.getElementById('faqAnswer_en').value = data.answer_en || '';
    document.getElementById('faqQuestion_zh').value = data.question_zh || '';
    document.getElementById('faqAnswer_zh').value = data.answer_zh || '';
    document.getElementById('faqQuestion_zh_tw').value = data.question_zh_tw || '';
    document.getElementById('faqAnswer_zh_tw').value = data.answer_zh_tw || '';
    document.getElementById('faqQuestion_es').value = data.question_es || '';
    document.getElementById('faqAnswer_es').value = data.answer_es || '';
    document.getElementById('faqQuestion_de').value = data.question_de || '';
    document.getElementById('faqAnswer_de').value = data.answer_de || '';
    document.getElementById('faqQuestion_pt').value = data.question_pt || '';
    document.getElementById('faqAnswer_pt').value = data.answer_pt || '';
    document.getElementById('faqQuestion_ar').value = data.question_ar || '';
    document.getElementById('faqAnswer_ar').value = data.answer_ar || '';
    document.getElementById('faqQuestion_ja').value = data.question_ja || '';
    document.getElementById('faqAnswer_ja').value = data.answer_ja || '';
    document.getElementById('faqQuestion_ko').value = data.question_ko || '';
    document.getElementById('faqAnswer_ko').value = data.answer_ko || '';
    
    document.getElementById('faqId').value = data.id;
    document.getElementById('faqModalTitle').innerText = '编辑 FAQ';
    document.getElementById('faqModal').style.display = 'flex';
    currentFaqId = id;
    initLangTabs(document.getElementById('faqModal'));
}

async function deleteFaq(id) {
    if (confirm('确定删除？')) {
        await window.supabaseClient.from('faq').delete().eq('id', id);
        loadFaqs();
    }
}

document.getElementById('addFaqBtn')?.addEventListener('click', () => {
    document.getElementById('faqQuestion_en').value = '';
    document.getElementById('faqAnswer_en').value = '';
    document.getElementById('faqQuestion_zh').value = '';
    document.getElementById('faqAnswer_zh').value = '';
    document.getElementById('faqQuestion_zh_tw').value = '';
    document.getElementById('faqAnswer_zh_tw').value = '';
    document.getElementById('faqQuestion_es').value = '';
    document.getElementById('faqAnswer_es').value = '';
    document.getElementById('faqQuestion_de').value = '';
    document.getElementById('faqAnswer_de').value = '';
    document.getElementById('faqQuestion_pt').value = '';
    document.getElementById('faqAnswer_pt').value = '';
    document.getElementById('faqQuestion_ar').value = '';
    document.getElementById('faqAnswer_ar').value = '';
    document.getElementById('faqQuestion_ja').value = '';
    document.getElementById('faqAnswer_ja').value = '';
    document.getElementById('faqQuestion_ko').value = '';
    document.getElementById('faqAnswer_ko').value = '';
    document.getElementById('faqId').value = '';
    document.getElementById('faqModalTitle').innerText = '添加 FAQ';
    document.getElementById('faqModal').style.display = 'flex';
    currentFaqId = null;
    initLangTabs(document.getElementById('faqModal'));
});

document.getElementById('saveFaqBtn')?.addEventListener('click', async () => {
    const question_en = document.getElementById('faqQuestion_en').value.trim();
    if (!question_en) {
        alert('请填写英文问题');
        return;
    }
    
    const faqData = {
        question_en: question_en,
        answer_en: document.getElementById('faqAnswer_en').value.trim(),
        question_zh: document.getElementById('faqQuestion_zh').value.trim(),
        answer_zh: document.getElementById('faqAnswer_zh').value.trim(),
        question_zh_tw: document.getElementById('faqQuestion_zh_tw').value.trim(),
        answer_zh_tw: document.getElementById('faqAnswer_zh_tw').value.trim(),
        question_es: document.getElementById('faqQuestion_es').value.trim(),
        answer_es: document.getElementById('faqAnswer_es').value.trim(),
        question_de: document.getElementById('faqQuestion_de').value.trim(),
        answer_de: document.getElementById('faqAnswer_de').value.trim(),
        question_pt: document.getElementById('faqQuestion_pt').value.trim(),
        answer_pt: document.getElementById('faqAnswer_pt').value.trim(),
        question_ar: document.getElementById('faqQuestion_ar').value.trim(),
        answer_ar: document.getElementById('faqAnswer_ar').value.trim(),
        question_ja: document.getElementById('faqQuestion_ja').value.trim(),
        answer_ja: document.getElementById('faqAnswer_ja').value.trim(),
        question_ko: document.getElementById('faqQuestion_ko').value.trim(),
        answer_ko: document.getElementById('faqAnswer_ko').value.trim()
    };
    
    if (currentFaqId) {
        await window.supabaseClient.from('faq').update(faqData).eq('id', currentFaqId);
    } else {
        await window.supabaseClient.from('faq').insert([{ ...faqData, sort_order: 0 }]);
    }
    document.getElementById('faqModal').style.display = 'none';
    loadFaqs();
});

document.getElementById('cancelFaqBtn')?.addEventListener('click', () => {
    document.getElementById('faqModal').style.display = 'none';
});

// ===== 产品管理（多语言，空状态显示表头）=====
let currentProductId = null;

async function loadProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    try {
        const { data, error } = await window.supabaseClient
            .from('products')
            .select('*')
            .order('category', { ascending: true });
        if (error) throw error;
        
        let html = `<table class="data-table"><thead><tr>
            <th>ID</th><th>分类</th><th>名称(EN)</th><th>标识(slug)</th><th>置顶</th><th>操作</th>
        </tr></thead><tbody>`;
        
        if (!data || data.length === 0) {
            html += `<tr><td colspan="6" style="text-align: center;">暂无产品</td></tr>`;
        } else {
            data.forEach(p => {
                html += `<tr>
                    <td>${p.id}</td>
                    <td>${p.category}</td>
                    <td>${escapeHtml(p.name_en || '-')}</td>
                    <td>${p.slug}</td>
                    <td>${p.is_featured ? '⭐' : '-'}</td>
                    <td><button class="edit-product-btn" data-id="${p.id}">编辑</button><button class="delete-product-btn" data-id="${p.id}">删除</button></td>
                </tr>`;
            });
        }
        
        html += `</tbody></table>`;
        container.innerHTML = html;
        
        document.querySelectorAll('.edit-product-btn').forEach(btn => btn.addEventListener('click', () => editProduct(btn.dataset.id)));
        document.querySelectorAll('.delete-product-btn').forEach(btn => btn.addEventListener('click', () => deleteProduct(btn.dataset.id)));
    } catch (err) {
        container.innerHTML = '<div class="empty-state">加载失败</div>';
    }
}

async function editProduct(id) {
    const { data } = await window.supabaseClient.from('products').select('*').eq('id', id).single();
    
    document.getElementById('productCategory').value = data.category || 'cards';
    document.getElementById('productSlug').value = data.slug || '';
    document.getElementById('productImageUrl').value = data.image_url || '';
    document.getElementById('productIsFeatured').checked = data.is_featured || false;
    document.getElementById('productId').value = data.id;
    
    document.getElementById('productName_en').value = data.name_en || '';
    document.getElementById('productDesc_en').value = data.desc_en || '';
    document.getElementById('productName_zh').value = data.name_zh || '';
    document.getElementById('productDesc_zh').value = data.desc_zh || '';
    document.getElementById('productName_zh_TW').value = data.name_zh_tw || '';
    document.getElementById('productDesc_zh_TW').value = data.desc_zh_tw || '';
    document.getElementById('productName_es').value = data.name_es || '';
    document.getElementById('productDesc_es').value = data.desc_es || '';
    document.getElementById('productName_de').value = data.name_de || '';
    document.getElementById('productDesc_de').value = data.desc_de || '';
    document.getElementById('productName_pt').value = data.name_pt || '';
    document.getElementById('productDesc_pt').value = data.desc_pt || '';
    document.getElementById('productName_ar').value = data.name_ar || '';
    document.getElementById('productDesc_ar').value = data.desc_ar || '';
    document.getElementById('productName_ja').value = data.name_ja || '';
    document.getElementById('productDesc_ja').value = data.desc_ja || '';
    document.getElementById('productName_ko').value = data.name_ko || '';
    document.getElementById('productDesc_ko').value = data.desc_ko || '';
    
    document.getElementById('productModalTitle').innerText = '编辑产品';
    document.getElementById('productModal').style.display = 'flex';
    currentProductId = id;
    initLangTabs(document.getElementById('productModal'));
}

async function deleteProduct(id) {
    if (confirm('确定删除？')) {
        await window.supabaseClient.from('products').delete().eq('id', id);
        loadProducts();
    }
}

document.getElementById('addProductBtn')?.addEventListener('click', () => {
    document.getElementById('productCategory').value = 'cards';
    document.getElementById('productSlug').value = '';
    document.getElementById('productImageUrl').value = '';
    document.getElementById('productIsFeatured').checked = false;
    document.getElementById('productId').value = '';
    
    document.getElementById('productName_en').value = '';
    document.getElementById('productDesc_en').value = '';
    document.getElementById('productName_zh').value = '';
    document.getElementById('productDesc_zh').value = '';
    document.getElementById('productName_zh_TW').value = '';
    document.getElementById('productDesc_zh_TW').value = '';
    document.getElementById('productName_es').value = '';
    document.getElementById('productDesc_es').value = '';
    document.getElementById('productName_de').value = '';
    document.getElementById('productDesc_de').value = '';
    document.getElementById('productName_pt').value = '';
    document.getElementById('productDesc_pt').value = '';
    document.getElementById('productName_ar').value = '';
    document.getElementById('productDesc_ar').value = '';
    document.getElementById('productName_ja').value = '';
    document.getElementById('productDesc_ja').value = '';
    document.getElementById('productName_ko').value = '';
    document.getElementById('productDesc_ko').value = '';
    
    document.getElementById('productModalTitle').innerText = '添加产品';
    document.getElementById('productModal').style.display = 'flex';
    currentProductId = null;
    initLangTabs(document.getElementById('productModal'));
});

document.getElementById('saveProductBtn')?.addEventListener('click', async () => {
    const category = document.getElementById('productCategory').value;
    const slug = document.getElementById('productSlug').value.trim();
    const image_url = document.getElementById('productImageUrl').value.trim();
    const is_featured = document.getElementById('productIsFeatured').checked;
    
    if (!slug) {
        alert('请填写 URL 标识(slug)');
        return;
    }
    
    const productData = {
        category,
        slug,
        image_url,
        is_featured,
        name_en: document.getElementById('productName_en').value.trim(),
        desc_en: document.getElementById('productDesc_en').value.trim(),
        name_zh: document.getElementById('productName_zh').value.trim(),
        desc_zh: document.getElementById('productDesc_zh').value.trim(),
        name_zh_tw: document.getElementById('productName_zh_TW').value.trim(),
        desc_zh_tw: document.getElementById('productDesc_zh_TW').value.trim(),
        name_es: document.getElementById('productName_es').value.trim(),
        desc_es: document.getElementById('productDesc_es').value.trim(),
        name_de: document.getElementById('productName_de').value.trim(),
        desc_de: document.getElementById('productDesc_de').value.trim(),
        name_pt: document.getElementById('productName_pt').value.trim(),
        desc_pt: document.getElementById('productDesc_pt').value.trim(),
        name_ar: document.getElementById('productName_ar').value.trim(),
        desc_ar: document.getElementById('productDesc_ar').value.trim(),
        name_ja: document.getElementById('productName_ja').value.trim(),
        desc_ja: document.getElementById('productDesc_ja').value.trim(),
        name_ko: document.getElementById('productName_ko').value.trim(),
        desc_ko: document.getElementById('productDesc_ko').value.trim()
    };
    
    if (!productData.name_en) {
        alert('请填写英文名称');
        return;
    }
    
    if (currentProductId) {
        await window.supabaseClient.from('products').update(productData).eq('id', currentProductId);
    } else {
        await window.supabaseClient.from('products').insert([{ ...productData, sort_order: 0 }]);
    }
    document.getElementById('productModal').style.display = 'none';
    loadProducts();
});

document.getElementById('cancelProductBtn')?.addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

// 绑定登录事件
if (loginBtn) loginBtn.addEventListener('click', login);
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (adminPassword) adminPassword.addEventListener('keypress', e => e.key === 'Enter' && login());
if (adminEmail) adminEmail.addEventListener('keypress', e => e.key === 'Enter' && login());

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    checkSession();
});