// Admin Login Authentication
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.login-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');

    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'admin.html';
        return;
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Show loading state
        btnText.classList.add('hide');
        btnLoading.classList.add('show');
        loginBtn.disabled = true;
        
        // Simulate authentication delay
        setTimeout(() => {
            // Check credentials
            if (username === 'admin' && password === 'wolfpack2025') {
                // Success - store session and redirect
                sessionStorage.setItem('adminLoggedIn', 'true');
                sessionStorage.setItem('adminLoginTime', new Date().getTime());
                
                // Show success message briefly
                showMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                // Failed login
                showMessage('Invalid username or password. Please try again.', 'error');
                
                // Clear password field
                passwordInput.value = '';
                passwordInput.focus();
                
                // Reset button state
                btnText.classList.remove('hide');
                btnLoading.classList.remove('show');
                loginBtn.disabled = false;
            }
        }, 1000);
    });

    // Show message function
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.error-message, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message show`;
        messageDiv.textContent = message;
        
        // Insert before the form
        loginForm.insertBefore(messageDiv, loginForm.firstChild);
        
        // Auto-remove error messages after 5 seconds
        if (type === 'error') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    // Add some visual feedback for input focus
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });

    // Enter key support
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !loginBtn.disabled) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
}); 