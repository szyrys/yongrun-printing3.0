// 管理后台脚本 - 登录和留言/FAQ/产品管理

let currentUser = null;

// DOM 元素
const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminEmail = document.getElementById('adminEmail');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');

// 检查登录状态
async function checkSession() {
    try {
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        
        if (error) {
            console.error('获取会话错误:', error);
            showLoginPanel();
            return;
        }
        
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
        console.error('检查登录状态失败:', err);
        showLoginPanel();
    }
}

function showLoginPanel() {
    if (loginPanel) loginPanel.style.display = 'block';
    if (adminPanel) adminPanel.style.display = 'none';
    if (loginError) loginError.style.display = 'none';
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
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            showLoginError(getLoginErrorMessage(error.message));
            loginBtn.disabled = false;
            loginBtn.textContent = '登录';
            return;
        }
        
        if (data.user) {
            currentUser = data.user;
            showAdminPanel();
            loadMessages();
            loadFaqs();
            loadProducts();
        }
        
    } catch (err) {
        console.error('登录异常:', err);
        showLoginError('网络错误，请稍后重试');
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
    }
}

function getLoginErrorMessage(message) {
    if (message.includes('Invalid login credentials')) return '邮箱或密码错误';
    if (message.includes('Email not confirmed')) return '邮箱未确认，请检查邮箱';
    return '登录失败: ' + message;
}

function showLoginError(msg) {
    if (loginError) {
        loginError.textContent = msg;
        loginError.style.display = 'block';
        setTimeout(() => {
            if (loginError) loginError.style.display = 'none';
        }, 3000);
    }
}

async function logout() {
    try {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        currentUser = null;
        showLoginPanel();
        if (adminEmail) adminEmail.value = '';
        if (adminPassword) adminPassword.value = '';
    } catch (err) {
        console.error('登出错误:', err);
        alert('登出失败: ' + err.message);
    }
}

// ===== 标签页切换 =====
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
            
            // 更新按钮样式
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 显示对应面板
            Object.keys(panels).forEach(key => {
                if (panels[key]) {
                    panels[key].classList.remove('active');
                }
            });
            if (panels[tabId]) {
                panels[tabId].classList.add('active');
            }
        });
    });
}

// 刷新留言按钮
document.getElementById('refreshMessagesBtn')?.addEventListener('click', () => {
    loadMessages();
});

// ===== 留言管理 =====
async function loadMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载留言中...</div>';
    
    try {
        const { data, error } = await window.supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无留言</p></div>';
            return;
        }
        
        let html = `<table class="data-table"><thead><tr><th>ID</th><th>姓名</th><th>邮箱</th><th>电话</th><th>留言内容</th><th>提交时间</th><th>操作</th></tr></thead><tbody>`;
        
        data.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleString('zh-CN');
            const shortMessage = msg.message ? (msg.message.length > 80 ? msg.message.substring(0, 80) + '...' : msg.message) : '';
            
            html += `<tr>
                        <td>${msg.id}</td>
                        <td>${escapeHtml(msg.name)}</td>
                        <td>${escapeHtml(msg.email || '-')}</td>
                        <td>${escapeHtml(msg.phone || '-')}</td>
                        <td title="${escapeHtml(msg.message)}">${escapeHtml(shortMessage)}</td>
                        <td>${date}</td>
                        <td><button class="delete-btn" data-id="${msg.id}" data-type="message">删除</button></td>
                    </tr>`;
        });
        
        html += `</tbody></table>`;
        container.innerHTML = html;
        
        document.querySelectorAll('.delete-btn[data-type="message"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.getAttribute('data-id');
                if (confirm('确定删除这条留言吗？')) {
                    await deleteMessage(id);
                    loadMessages();
                }
            });
        });
        
    } catch (err) {
        console.error('加载留言失败:', err);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>加载失败，请刷新页面重试</p></div>';
    }
}

async function deleteMessage(id) {
    try {
        const { error } = await window.supabaseClient.from('messages').delete().eq('id', id);
        if (error) throw error;
    } catch (err) {
        console.error('删除失败:', err);
        alert('删除失败: ' + err.message);
    }
}

// ===== FAQ 管理 =====
let currentFaqId = null;

async function loadFaqs() {
    const container = document.getElementById('faqContainer');
    if (!container) return;
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载 FAQ 中...</div>';
    
    try {
        const { data, error } = await window.supabaseClient
            .from('faq')
            .select('*')
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无 FAQ，点击“添加 FAQ”创建。</div>';
            return;
        }
        
        let html = `<table class="data-table"><thead><tr><th>ID</th><th>问题</th><th>回答</th><th>操作</th></tr></thead><tbody>`;
        data.forEach(faq => {
            html += `<tr>
                        <td>${faq.id}</td>
                        <td>${escapeHtml(faq.question)}</td>
                        <td>${escapeHtml(faq.answer.substring(0, 80))}${faq.answer.length > 80 ? '...' : ''}</td>
                        <td>
                            <button class="edit-faq-btn" data-id="${faq.id}">编辑</button>
                            <button class="delete-faq-btn" data-id="${faq.id}">删除</button>
                        </td>
                    </tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;
        
        document.querySelectorAll('.edit-faq-btn').forEach(btn => {
            btn.addEventListener('click', () => editFaq(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.delete-faq-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteFaq(btn.getAttribute('data-id')));
        });
    } catch (err) {
        container.innerHTML = '<div class="empty-state">加载失败，请重试</div>';
    }
}

async function editFaq(id) {
    const { data, error } = await window.supabaseClient.from('faq').select('*').eq('id', id).single();
    if (error) return alert('加载失败');
    document.getElementById('faqQuestion').value = data.question;
    document.getElementById('faqAnswer').value = data.answer;
    document.getElementById('faqId').value = data.id;
    document.getElementById('faqModalTitle').innerText = '编辑 FAQ';
    document.getElementById('faqModal').style.display = 'flex';
    currentFaqId = id;
}

async function deleteFaq(id) {
    if (!confirm('确定删除这条 FAQ 吗？')) return;
    const { error } = await window.supabaseClient.from('faq').delete().eq('id', id);
    if (error) alert('删除失败');
    else loadFaqs();
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
    if (!question || !answer) return alert('请填写问题和回答');
    
    if (currentFaqId) {
        const { error } = await window.supabaseClient.from('faq').update({ question, answer }).eq('id', currentFaqId);
        if (error) alert('更新失败');
    } else {
        const { error } = await window.supabaseClient.from('faq').insert([{ question, answer, sort_order: 0 }]);
        if (error) alert('添加失败');
    }
    document.getElementById('faqModal').style.display = 'none';
    loadFaqs();
});

document.getElementById('cancelFaqBtn')?.addEventListener('click', () => {
    document.getElementById('faqModal').style.display = 'none';
});

// ===== 产品管理 =====
let currentProductId = null;

async function loadProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载产品中...</div>';
    
    try {
        const { data, error } = await window.supabaseClient
            .from('products')
            .select('*')
            .order('category', { ascending: true })
            .order('sort_order', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无产品，点击“添加产品”创建。</div>';
            return;
        }
        
        let html = `<table class="data-table"><thead><tr><th>ID</th><th>分类</th><th>名称</th><th>标识(slug)</th><th>置顶</th><th>操作</th></tr></thead><tbody>`;
        data.forEach(product => {
            html += `<tr>
                        <td>${product.id}</td>
                        <td>${escapeHtml(product.category)}</td>
                        <td>${escapeHtml(product.name)}</td>
                        <td>${escapeHtml(product.slug)}</td>
                        <td>${product.is_featured ? '⭐ 是' : '-'}</td>
                        <td>
                            <button class="edit-product-btn" data-id="${product.id}">编辑</button>
                            <button class="delete-product-btn" data-id="${product.id}">删除</button>
                        </td>
                    </tr>`;
        });
        html += `</tbody></table>`;
        container.innerHTML = html;
        
        document.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', () => editProduct(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-id')));
        });
    } catch (err) {
        container.innerHTML = '<div class="empty-state">加载失败，请重试</div>';
    }
}

async function editProduct(id) {
    const { data, error } = await window.supabaseClient.from('products').select('*').eq('id', id).single();
    if (error) return alert('加载失败');
    
    document.getElementById('productCategory').value = data.category || 'cards';
    document.getElementById('productName').value = data.name || '';
    document.getElementById('productSlug').value = data.slug || '';
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
    if (!confirm('确定删除这个产品吗？删除后首页轮播图也会受影响。')) return;
    const { error } = await window.supabaseClient.from('products').delete().eq('id', id);
    if (error) alert('删除失败');
    else loadProducts();
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
    const short_desc = document.getElementById('productShortDesc').value.trim();
    const full_desc = document.getElementById('productFullDesc').value.trim();
    const features = document.getElementById('productFeatures').value.trim();
    const image_url = document.getElementById('productImageUrl').value.trim();
    const is_featured = document.getElementById('productIsFeatured').checked;
    
    if (!name || !slug) {
        alert('请填写产品名称和 URL 标识(slug)');
        return;
    }
    
    if (currentProductId) {
        const { error } = await window.supabaseClient
            .from('products')
            .update({ category, name, slug, short_desc, full_desc, features, image_url, is_featured })
            .eq('id', currentProductId);
        if (error) alert('更新失败: ' + error.message);
    } else {
        const { error } = await window.supabaseClient
            .from('products')
            .insert([{ category, name, slug, short_desc, full_desc, features, image_url, is_featured, sort_order: 0 }]);
        if (error) alert('添加失败: ' + error.message);
    }
    document.getElementById('productModal').style.display = 'none';
    loadProducts();
});

document.getElementById('cancelProductBtn')?.addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// 绑定事件
if (loginBtn) loginBtn.addEventListener('click', login);
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (adminPassword) {
    adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
}
if (adminEmail) {
    adminEmail.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    checkSession();
});