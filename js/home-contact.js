// 首页留言表单提交
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('homeMessageForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('home_name').value.trim();
        const phone = document.getElementById('home_phone').value.trim();
        const email = document.getElementById('home_email').value.trim();
        const product = document.getElementById('home_product').value;
        const quantity = document.getElementById('home_quantity').value;
        const deadline = document.getElementById('home_deadline').value.trim();
        const message = document.getElementById('home_message').value.trim();
        const fileInput = document.getElementById('home_file');
        const statusDiv = document.getElementById('homeFormStatus');

        // 验证姓名
        if (!name) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">请填写姓名</span>';
            return;
        }
        
        // 验证电话或邮箱至少一个
        if (!phone && !email) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">请填写电话或邮箱（至少一项）</span>';
            return;
        }
        
        // 验证邮箱格式（如果填写了）
        if (email && (!email.includes('@') || !email.includes('.'))) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">请输入有效的邮箱地址</span>';
            return;
        }

        statusDiv.innerHTML = '<span style="color: #3498db;">提交中...</span>';
        
        try {
            // 构建留言内容
            let fullMessage = `产品类型: ${product}\n数量范围: ${quantity}\n期望交货: ${deadline || '未填写'}\n\n详细需求:\n${message}`;
            
            const { error } = await window.supabaseClient
                .from('messages')
                .insert([{ 
                    name: name, 
                    email: email || '未提供', 
                    message: fullMessage,
                    phone: phone || '未提供'
                }]);

            if (error) throw error;
            
            // 处理文件上传（如果有）
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                // 这里可以添加文件上传到 Supabase Storage 的逻辑
                // 暂时只提示，不实际存储
                console.log('文件待上传:', file.name);
            }
            
            statusDiv.innerHTML = '<span style="color: #27ae60;">留言已发送，我们会尽快联系您！</span>';
            form.reset();
            setTimeout(() => statusDiv.innerHTML = '', 5000);
        } catch (err) {
            console.error('提交失败:', err);
            statusDiv.innerHTML = '<span style="color: #e74c3c;">提交失败，请稍后重试</span>';
        }
    });
});
        // 验证 reCAPTCHA
        const captchaResponse = grecaptcha.getResponse();
        if (!captchaResponse) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">请完成人机验证（勾选“我不是机器人”）</span>';
            return;
        }