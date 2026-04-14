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
        const fileLink = document.getElementById('home_file_link').value.trim();
        const statusDiv = document.getElementById('homeFormStatus');

        if (!name) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">Please enter your name</span>';
            return;
        }
        if (!phone && !email) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">Please provide either phone number or email address</span>';
            return;
        }
        if (email && (!email.includes('@') || !email.includes('.'))) {
            statusDiv.innerHTML = '<span style="color: #e74c3c;">Please enter a valid email address</span>';
            return;
        }

        statusDiv.innerHTML = '<span style="color: #3498db;">Submitting...</span>';
        
        try {
            let fullMessage = `Product: ${product}\nQuantity: ${quantity}\nExpected Delivery: ${deadline || 'Not specified'}\nFile Link: ${fileLink || 'Not provided'}\n\nDetails:\n${message || 'Not specified'}`;
            
            const { error } = await window.supabaseClient
                .from('messages')
                .insert([{ 
                    name: name, 
                    email: email || 'Not provided', 
                    message: fullMessage,
                    phone: phone || 'Not provided'
                }]);

            if (error) throw error;
            
            statusDiv.innerHTML = '<span style="color: #27ae60;">Message sent! We will contact you soon.</span>';
            form.reset();
            setTimeout(() => statusDiv.innerHTML = '', 5000);
        } catch (err) {
            console.error('提交失败:', err);
            statusDiv.innerHTML = '<span style="color: #e74c3c;">Submission failed, please try again later.</span>';
        }
    });
});