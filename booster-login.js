// Booster Club Login System
// Handles authentication for individual booster clubs

// Booster club credentials (in real implementation, this would be server-side)
const boosterCredentials = {
    'cheer': { username: 'cheeradmin', password: 'cheer2025' },
    'dance': { username: 'danceadmin', password: 'dance2025' },
    'softball': { username: 'softballadmin', password: 'softball2025' },
    'boys-soccer': { username: 'boyssocceradmin', password: 'boyssoccer2025' },
    'girls-soccer': { username: 'girlssocceradmin', password: 'girlssoccer2025' },
    'boys-swim-dive': { username: 'boysswimadmin', password: 'boysswim2025' },
    'girls-swim-dive': { username: 'girlsswimadmin', password: 'girlsswim2025' },
    'wrestling': { username: 'wrestlingadmin', password: 'wrestling2025' },
    'robotics': { username: 'roboticsadmin', password: 'robotics2025' },
    'volleyball': { username: 'volleyballadmin', password: 'volleyball2025' },
    'boys-basketball': { username: 'boysbasketballadmin', password: 'boysbasketball2025' },
    'girls-basketball': { username: 'girlsbasketballadmin', password: 'girlsbasketball2025' },
    'boys-golf': { username: 'boysgolfadmin', password: 'boysgolf2025' },
    'girls-golf': { username: 'girlsgolfadmin', password: 'girlsgolf2025' },
    'decca': { username: 'deccaadmin', password: 'decca2025' },
    'theater': { username: 'theateradmin', password: 'theater2025' },
    'choir': { username: 'choiradmin', password: 'choir2025' },
    'gymnastics': { username: 'gymnasticsadmin', password: 'gymnastics2025' },
    'orchestra': { username: 'orchestraadmin', password: 'orchestra2025' },
    'band': { username: 'bandadmin', password: 'band2025' }
};

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('booster-login-form');
    const boosterClubSelect = document.getElementById('booster-club');
    const usernameInput = document.getElementById('booster-username');
    const passwordInput = document.getElementById('booster-password');
    const loginBtn = document.getElementById('booster-login-form').querySelector('.login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');

    // Auto-fill username when booster club is selected
    boosterClubSelect.addEventListener('change', function() {
        const selectedClub = this.value;
        if (selectedClub && boosterCredentials[selectedClub]) {
            usernameInput.value = boosterCredentials[selectedClub].username;
            usernameInput.focus();
        } else {
            usernameInput.value = '';
        }
    });

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const selectedClub = boosterClubSelect.value;
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validate inputs
        if (!selectedClub) {
            showMessage('Please select your booster club.', 'error');
            return;
        }

        if (!username || !password) {
            showMessage('Please enter both username and password.', 'error');
            return;
        }

        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        loginBtn.disabled = true;

        // Simulate authentication delay
        setTimeout(() => {
            authenticateBoosterClub(selectedClub, username, password);
        }, 1000);
    });

    // Authentication function
    function authenticateBoosterClub(club, username, password) {
        const credentials = boosterCredentials[club];
        
        if (credentials && credentials.username === username && credentials.password === password) {
            // Store session data
            sessionStorage.setItem('boosterLoggedIn', 'true');
            sessionStorage.setItem('boosterClub', club);
            sessionStorage.setItem('boosterUsername', username);
            sessionStorage.setItem('boosterLoginTime', new Date().getTime());
            
            showMessage('Login successful! Redirecting to your dashboard...', 'success');
            
            // Redirect to booster dashboard
            setTimeout(() => {
                window.location.href = 'booster-admin.html';
            }, 1500);
        } else {
            showMessage('Invalid credentials. Please try again.', 'error');
            passwordInput.value = '';
            passwordInput.focus();
            
            // Reset button state
            btnText.style.display = 'inline-block';
            btnLoading.style.display = 'none';
            loginBtn.disabled = false;
        }
    }

    // Message display function
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Insert message before form
        loginForm.parentNode.insertBefore(messageDiv, loginForm);

        // Auto-remove success messages
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }

    // Add message styles
    const messageStyles = document.createElement('style');
    messageStyles.textContent = `
        .message {
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
        }
        
        .message.success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .message.error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
        
        .message i {
            font-size: 1.1rem;
        }
    `;
    document.head.appendChild(messageStyles);

    // Focus on first input
    boosterClubSelect.focus();
}); 