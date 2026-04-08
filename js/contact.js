// 留言表单提交功能
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('messageForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 获取表单数据
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const statusDiv = document.getElementById('formStatus');

        // 验证表单
        if (!name || !email || !message) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">' + (t('form_error_empty') || '请填写所有必填项') + '</span>';
            return;
        }
        
        if (!email.includes('@') || !email.includes('.')) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">' + (t('form_error_email') || '请输入有效的邮箱地址') + '</span>';
            return;
        }

        // 显示提交中状态
        statusDiv.innerHTML = '<span style="color: #3498db;"><i class="fas fa-spinner fa-spin"></i> ' + (t('form_submitting') || '提交中...') + '</span>';
        
        try {
            // 发送数据到 Supabase
            const { data, error } = await supabase
                .from('messages')
                .insert([
                    { 
                        name: name, 
                        email: email, 
                        message: message 
                    }
                ]);

            if (error) {
                console.error('Supabase错误:', error);
                throw error;
            }

            // 提交成功
            statusDiv.innerHTML = '<span style="color: #27ae60;"><i class="fas fa-check-circle"></i> ' + (t('form_success') || '留言已发送，我们会尽快联系您！') + '</span>';
            
            // 清空表单
            form.reset();
            
            // 5秒后清除成功消息
            setTimeout(() => {
                if (statusDiv.innerHTML) {
                    statusDiv.innerHTML = '';
                }
            }, 5000);
            
        } catch (err) {
            console.error('提交失败:', err);
            statusDiv.innerHTML = '<span style="color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i> ' + (t('form_error_submit') || '提交失败，请稍后重试') + '</span>';
            
            // 5秒后清除错误消息
            setTimeout(() => {
                if (statusDiv.innerHTML && statusDiv.innerHTML.includes('失败')) {
                    statusDiv.innerHTML = '';
                }
            }, 5000);
        }
    });
});

// 辅助函数：获取当前翻译（如果common.js中的t函数还没加载）
function t(key) {
    if (typeof window.t === 'function') {
        return window.t(key);
    }
    // 备用翻译
    const fallback = {
        'form_error_empty': 'Please fill in all required fields',
        'form_error_email': 'Please enter a valid email address',
        'form_submitting': 'Submitting...',
        'form_success': 'Message sent! We will contact you soon.',
        'form_error_submit': 'Submission failed, please try again later'
    };
    return fallback[key] || key;
}