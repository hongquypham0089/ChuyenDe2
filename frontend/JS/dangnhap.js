/* =========================
   CHUYỂN ĐỔI TAB ĐĂNG NHẬP / ĐĂNG KÝ
========================= */
function switchTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('form-hidden');
        registerForm.classList.add('form-hidden');
        // Clear messages when switching
        clearMessages('loginForm');
        clearMessages('registerForm');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('form-hidden');
        loginForm.classList.add('form-hidden');
        clearMessages('loginForm');
        clearMessages('registerForm');
    }
}

// Helper to clear messages
function clearMessages(formId) {
    const form = document.getElementById(formId);
    const messageDiv = form.querySelector('.form-message');
    if (messageDiv) {
        messageDiv.remove();
    }
}

// Helper to show message
function showMessage(formId, message, type) {
    const form = document.getElementById(formId);
    let messageDiv = form.querySelector('.form-message');
    
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'form-message';
        form.insertBefore(messageDiv, form.firstChild);
    }
    
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }, 3000);
}

// Helper to set loading state
function setLoading(button, isLoading, originalText = null) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        if (!originalText) {
            button.setAttribute('data-original-text', button.innerHTML);
        }
        button.innerHTML = '<i class="fas fa-spinner"></i> Đang xử lý...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        const original = button.getAttribute('data-original-text');
        if (original) {
            button.innerHTML = original;
        }
    }
}

/* =========================
   XỬ LÝ ĐĂNG NHẬP (GỌI API)
========================= */
async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const loginBtn = document.querySelector('#loginForm .btn-auth');

    if (!email || !password) {
        showMessage('loginForm', 'Vui lòng nhập email và mật khẩu!', 'error');
        return;
    }

    setLoading(loginBtn, true);

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('loginForm', data.message || 'Đăng nhập thành công!', 'success');
            
            const userInfo = {
                isLoggedIn: true,
                token: data.token,
                id: data.user_id,
                code: data.user_code,
                name: data.name,
                avatar: data.avatar,
                role: data.role
            };
            localStorage.setItem('currentUser', JSON.stringify(userInfo));

            setTimeout(() => {
                if (data.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }
            }, 1000);
        } else {
            showMessage('loginForm', `Lỗi: ${data.message}`, 'error');
            setLoading(loginBtn, false);
        }
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        showMessage('loginForm', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng!', 'error');
        setLoading(loginBtn, false);
    }
}

/* =========================
   XỬ LÝ ĐĂNG KÝ (GỌI API)
========================= */
async function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const dob = document.getElementById('regDob').value;
    const gender = document.querySelector('input[name="regGender"]:checked').value;
    const password = document.getElementById('regPassword').value.trim();
    const confirm = document.getElementById('regConfirm').value.trim();
    const agree = document.getElementById('agreeTerms').checked;
    const registerBtn = document.querySelector('#registerForm .btn-auth');

    if (!name || !email || !dob || !password || !confirm) {
        showMessage('registerForm', 'Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }

    if (name.length < 2) {
        showMessage('registerForm', 'Họ và tên quá ngắn!', 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('registerForm', 'Email không đúng định dạng!', 'error');
        return;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 16 || age > 100) {
        showMessage('registerForm', `Tuổi không hợp lệ (${age} tuổi). Bạn phải từ 16 đến 100 tuổi!`, 'error');
        return;
    }

    if (password !== confirm) {
        showMessage('registerForm', 'Mật khẩu xác nhận không khớp!', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('registerForm', 'Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }

    if (!agree) {
        showMessage('registerForm', 'Bạn cần đồng ý với điều khoản dịch vụ!', 'error');
        return;
    }

    setLoading(registerBtn, true);

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                name: name, 
                email: email, 
                password: password,
                dob: dob,
                gender: gender 
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('registerForm', 'Đăng ký thành công! Chuyển sang đăng nhập...', 'success');
            
            setTimeout(() => {
                switchTab('login');
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').value = '';
                setLoading(registerBtn, false);
                
                document.getElementById('regName').value = '';
                document.getElementById('regEmail').value = '';
                document.getElementById('regDob').value = '';
                document.getElementById('regPassword').value = '';
                document.getElementById('regConfirm').value = '';
                document.getElementById('agreeTerms').checked = false;
            }, 1500);
        } else {
            showMessage('registerForm', `Lỗi: ${data.message}`, 'error');
            setLoading(registerBtn, false);
        }
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        showMessage('registerForm', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng!', 'error');
        setLoading(registerBtn, false);
    }
}

// Enter key support
document.addEventListener('DOMContentLoaded', function() {
    const loginPassword = document.getElementById('loginPassword');
    const regConfirm = document.getElementById('regConfirm');
    
    if (loginPassword) {
        loginPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleLogin();
        });
    }
    
    if (regConfirm) {
        regConfirm.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleRegister();
        });
    }
});

// Check if already logged in
window.onload = function() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            if (user.isLoggedIn) {
                // Optional: redirect to home
                // window.location.href = '/';
            }
        } catch(e) {}
    }
};