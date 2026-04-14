// 管理后台脚本 - 登录和留言/FAQ/产品管理

let currentUser = null;

const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');

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
            Object.values(panels).forEach(p => p.classList.remove('active'));
            if (panels[tabId]) panels[tabId].classList.add('active');
        });
    });
}

document.getElementById('refreshMessagesBtn')?.addEventListener('click', () => loadMessages());

async function loadMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    container.innerHTML = '<div class="loading">加载留言中...</div>';
    try {
        const { data, error } = await window.supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无留言</div>';
            return;
        }
        let html = `<table class="data-table"><thead><tr>
            <th>ID</th><th>姓名</th><th>邮箱</th><th>电话</th><th>留言内容</th><th>提交时间</th><th>操作</th>
        </tr></thead><tbody>`;
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

async function loadFaqs() {
    const container = document.getElementById('faqContainer');
    if (!container) return;
    container.innerHTML = '<div class="loading">加载 FAQ 中...</div>';
    try {
        const { data, error } = await window.supabaseClient.from('faq').select('*').order('sort_order');
        if (error) throw error;
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无 FAQ</div>';
            return;
        }
        let html = `<table class="data-table"><thead><tr><th>ID</th><th>问题</th><th>回答</th><th>操作</th></tr></thead><tbody>`;
        data.forEach(faq => {
            html += `<tr>
                <td>${faq.id}</td>
                <td>${escapeHtml(faq.question)}</td>
                <td>${escapeHtml(faq.answer.substring(0, 80))}${faq.answer.length > 80 ? '...' : ''}</td>
                <td><button class="edit-faq-btn" data-id="${faq.id}">编辑</button><button class="delete-faq-btn" data-id="${faq.id}">删除</button></td>
            </tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;
        document.querySelectorAll('.edit-faq-btn').forEach(btn => btn.addEventListener('click', () => editFaq(btn.dataset.id)));
        document.querySelectorAll('.delete-faq-btn').forEach(btn => btn.addEventListener('click', () => deleteFaq(btn.dataset.id)));
    } catch (err) {
        container.innerHTML = '<div class="empty-state">加载失败</div>';
    }
}

let currentFaqId = null;
async function editFaq(id) {
    const { data } = await window.supabaseClient.from('faq').select('*').eq('id', id).single();
    document.getElementById('faqQuestion').value = data.question;
    document.getElementById('faqAnswer').value = data.answer;
    document.getElementById('faqId').value = data.id;
    document.getElementById('faqModalTitle').innerText = '编辑 FAQ';
    document.getElementById('faqModal').style.display = 'flex';
    currentFaqId = id;
}
async function deleteFaq(id) {
    if (confirm('确定删除？')) {
        await window.supabaseClient.from('faq').delete().eq('id', id);
        loadFaqs();
    }
}
document.getElementById('addFaqBtn')?.addEventListener('click', () => {
    document.getElementById('faqQuestion').value = '';
    document.getElementById('faqAnswer').value = '';
    document.getElementById('faqId').value = '';
    document.getElementById('faqModalTitle').innerText = '添加 FAQ';
    document.getElementById('faqModal').style.display = 'flex';
    currentFaqId = null;
});
document.getElementById('saveFaqBtn')?.addEventListener('click', async () => {
    const question = document.getElementById('faqQuestion').value.trim();
    const answer = document.getElementById('faqAnswer').value.trim();
    if (!question || !answer) return alert('请填写完整');
    if (currentFaqId) {
        await window.supabaseClient.from('faq').update({ question, answer }).eq('id', currentFaqId);
    } else {
        await window.supabaseClient.from('faq').insert([{ question, answer, sort_order: 0 }]);
    }
    document.getElementById('faqModal').style.display = 'none';
    loadFaqs();
});
document.getElementById('cancelFaqBtn')?.addEventListener('click', () => {
    document.getElementById('faqModal').style.display = 'none';
});

let currentProductId = null;
async function loadProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    container.innerHTML = '<div class="loading">加载产品中...</div>';
    try {
        const { data, error } = await window.supabaseClient.from('products').select('*').order('category');
        if (error) throw error;
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无产品</div>';
            return;
        }
        let html = `<table class="data-table"><thead><tr><th>ID</th><th>分类</th><th>名称</th><th>标识</th><th>置顶</th><th>操作</th></tr></thead><tbody>`;
        data.forEach(p => {
            html += `<tr>
                <td>${p.id}</td>
                <td>${p.category}</td>
                <td>${escapeHtml(p.name)}</td>
                <td>${p.slug}</td>
                <td>${p.is_featured ? '⭐' : '-'}</td>
                <td><button class="edit-product-btn" data-id="${p.id}">编辑</button><button class="delete-product-btn" data-id="${p.id}">删除</button></td>
            </tr>`;
        });
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
    document.getElementById('productCategory').value = data.category;
    document.getElementById('productName').value = data.name;
    document.getElementById('productSlug').value = data.slug;
    document.getElementById('productShortDesc').value = data.short_desc || '';
    document.getElementById('productFullDesc').value = data.full_desc || '';
    document.getElementById('productFeatures').value = data.features || '';
    document.getElementById('productImageUrl').value = data.image_url || '';
    document.getElementById('productIsFeatured').checked = data.is_featured || false;
    document.getElementById('productId').value = data.id;
    document.getElementById('productModalTitle').innerText = '编辑产品';
    document.getElementById('productModal').style.display = 'flex';
    currentProductId = id;
}
async function deleteProduct(id) {
    if (confirm('确定删除？')) {
        await window.supabaseClient.from('products').delete().eq('id', id);
        loadProducts();
    }
}
document.getElementById('addProductBtn')?.addEventListener('click', () => {
    document.getElementById('productCategory').value = 'cards';
    document.getElementById('productName').value = '';
    document.getElementById('productSlug').value = '';
    document.getElementById('productShortDesc').value = '';
    document.getElementById('productFullDesc').value = '';
    document.getElementById('productFeatures').value = '';
    document.getElementById('productImageUrl').value = '';
    document.getElementById('productIsFeatured').checked = false;
    document.getElementById('productId').value = '';
    document.getElementById('productModalTitle').innerText = '添加产品';
    document.getElementById('productModal').style.display = 'flex';
    currentProductId = null;
});
document.getElementById('saveProductBtn')?.addEventListener('click', async () => {
    const category = document.getElementById('productCategory').value;
    const name = document.getElementById('productName').value.trim();
    const slug = document.getElementById('productSlug').value.trim();
    if (!name || !slug) return alert('请填写名称和标识');
    const data = {
        category, name, slug,
        short_desc: document.getElementById('productShortDesc').value.trim(),
        full_desc: document.getElementById('productFullDesc').value.trim(),
        features: document.getElementById('productFeatures').value.trim(),
        image_url: document.getElementById('productImageUrl').value.trim(),
        is_featured: document.getElementById('productIsFeatured').checked
    };
    if (currentProductId) {
        await window.supabaseClient.from('products').update(data).eq('id', currentProductId);
    } else {
        await window.supabaseClient.from('products').insert([{ ...data, sort_order: 0 }]);
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

if (loginBtn) loginBtn.addEventListener('click', login);
if (logoutBtn) logoutBtn.addEventListener('click', logout);
[adminEmail, adminPassword].forEach(el => el?.addEventListener('keypress', e => e.key === 'Enter' && login()));

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    checkSession();
});