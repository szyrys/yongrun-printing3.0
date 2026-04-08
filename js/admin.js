// 管理后台脚本 - 登录和留言管理

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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('获取会话错误:', error);
            showLoginPanel();
            return;
        }
        
        if (session) {
            currentUser = session.user;
            showAdminPanel();
            loadMessages();
        } else {
            showLoginPanel();
        }
    } catch (err) {
        console.error('检查登录状态失败:', err);
        showLoginPanel();
    }
}

// 显示登录面板
function showLoginPanel() {
    if (loginPanel) loginPanel.style.display = 'block';
    if (adminPanel) adminPanel.style.display = 'none';
    if (loginError) loginError.style.display = 'none';
}

// 显示管理面板
function showAdminPanel() {
    if (loginPanel) loginPanel.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
}

// 登录
async function login() {
    const email = adminEmail.value.trim();
    const password = adminPassword.value.trim();
    
    if (!email || !password) {
        showLoginError('请输入邮箱和密码');
        return;
    }
    
    // 显示加载状态
    loginBtn.disabled = true;
    loginBtn.textContent = '登录中...';
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('登录错误:', error);
            showLoginError(getLoginErrorMessage(error.message));
            loginBtn.disabled = false;
            loginBtn.textContent = '登录';
            return;
        }
        
        if (data.user) {
            currentUser = data.user;
            showAdminPanel();
            loadMessages();
        }
        
    } catch (err) {
        console.error('登录异常:', err);
        showLoginError('网络错误，请稍后重试');
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
    }
}

// 获取登录错误信息
function getLoginErrorMessage(message) {
    if (message.includes('Invalid login credentials')) {
        return '邮箱或密码错误';
    }
    if (message.includes('Email not confirmed')) {
        return '邮箱未确认，请检查邮箱';
    }
    return '登录失败: ' + message;
}

// 显示登录错误
function showLoginError(msg) {
    if (loginError) {
        loginError.textContent = msg;
        loginError.style.display = 'block';
        setTimeout(() => {
            if (loginError) loginError.style.display = 'none';
        }, 3000);
    }
}

// 登出
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
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

// 加载留言列表
async function loadMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载留言中...</div>';
    
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无留言</p></div>';
            return;
        }
        
        // 构建表格
        let html = `
            <table class="message-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>姓名</th>
                        <th>邮箱</th>
                        <th>留言内容</th>
                        <th>提交时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleString('zh-CN');
            const shortMessage = msg.message.length > 80 ? msg.message.substring(0, 80) + '...' : msg.message;
            
            html += `
                <tr data-id="${msg.id}">
                    <td>${msg.id}</td>
                    <td>${escapeHtml(msg.name)}</td>
                    <td>${escapeHtml(msg.email)}</td>
                    <td title="${escapeHtml(msg.message)}">${escapeHtml(shortMessage)}</td>
                    <td>${date}</td>
                    <td><button class="delete-btn" data-id="${msg.id}">删除</button></td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
        container.innerHTML = html;
        
        // 绑定删除事件
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (confirm('确定要删除这条留言吗？')) {
                    await deleteMessage(id);
                    loadMessages(); // 刷新列表
                }
            });
        });
        
    } catch (err) {
        console.error('加载留言失败:', err);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>加载失败，请刷新页面重试</p></div>';
    }
}

// 删除留言
async function deleteMessage(id) {
    try {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
    } catch (err) {
        console.error('删除失败:', err);
        alert('删除失败: ' + err.message);
    }
}

// HTML转义（防止XSS）
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 绑定事件
if (loginBtn) loginBtn.addEventListener('click', login);
if (logoutBtn) logoutBtn.addEventListener('click', logout);

// 支持回车登录
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
    checkSession();
});