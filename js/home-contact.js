// 首页留言表单提交
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('homeMessageForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('home_name').value.trim();
        const email = document.getElementById('home_email').value.trim();
        const message = document.getElementById('home_message').value.trim();
        const statusDiv = document.getElementById('homeFormStatus');

        if (!name || !email || !message) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">请填写所有必填项</span>';
            return;
        }
        
        if (!email.includes('@') || !email.includes('.')) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">请输入有效的邮箱地址</span>';
            return;
        }

        statusDiv.innerHTML = '<span style="color: #3498db;">提交中...</span>';
        
        try {
            const { error } = await window.supabaseClient
                .from('messages')
                .insert([{ name, email, message }]);

            if (error) throw error;
            
            statusDiv.innerHTML = '<span style="color: #27ae60;">留言已发送，我们会尽快联系您！</span>';
            form.reset();
            setTimeout(() => statusDiv.innerHTML = '', 5000);
        } catch (err) {
            console.error('提交失败:', err);
            statusDiv.innerHTML = '<span style="color: #e74c3c;">提交失败，请稍后重试</span>';
        }
    });
});