// Booster Club Admin Dashboard
// Handles all functionality for individual booster club administration

let currentClub = null;
let currentUsername = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!checkBoosterAuth()) {
        window.location.href = 'booster-login.html';
        return;
    }
    
    initializeDashboard();
    loadClubData();
    setupEventListeners();
    
    // Test QRCode library
    setTimeout(() => {
        if (typeof QRCode !== 'undefined') {
            console.log('QRCode library loaded successfully');
        } else {
            console.error('QRCode library failed to load');
            showMessage('QR Code library failed to load. Please refresh the page.', 'error');
        }
    }, 1000);
});

function checkBoosterAuth() {
    const isLoggedIn = sessionStorage.getItem('boosterLoggedIn');
    const loginTime = sessionStorage.getItem('boosterLoginTime');
    const currentTime = new Date().getTime();
    
    // Check if logged in and session is valid (8 hours)
    if (isLoggedIn === 'true' && (currentTime - loginTime) < 28800000) {
        currentClub = sessionStorage.getItem('boosterClub');
        currentUsername = sessionStorage.getItem('boosterUsername');
        return true;
    }
    
    // Clear invalid session
    sessionStorage.removeItem('boosterLoggedIn');
    sessionStorage.removeItem('boosterClub');
    sessionStorage.removeItem('boosterUsername');
    sessionStorage.removeItem('boosterLoginTime');
    
    return false;
}

function initializeDashboard() {
    // Update UI with club information
    const clubDisplayNames = {
        'cheer': 'Cheer',
        'dance': 'Dance',
        'softball': 'Softball',
        'boys-soccer': 'Boys Soccer',
        'girls-soccer': 'Girls Soccer',
        'boys-swim-dive': 'Boys Swim and Dive',
        'girls-swim-dive': 'Girls Swim and Dive',
        'wrestling': 'Wrestling',
        'robotics': 'Robotics',
        'volleyball': 'Volleyball',
        'boys-basketball': 'Boys Basketball',
        'girls-basketball': 'Girls Basketball',
        'boys-golf': 'Boys Golf',
        'girls-golf': 'Girls Golf',
        'decca': 'DECCA',
        'theater': 'Theater',
        'choir': 'Choir',
        'gymnastics': 'Gymnastics',
        'orchestra': 'Orchestra',
        'band': 'Band'
    };
    
    const clubName = clubDisplayNames[currentClub] || currentClub;
    document.getElementById('club-name').textContent = `${clubName} Dashboard`;
    document.getElementById('sidebar-club-name').textContent = `${clubName} Admin`;
    document.getElementById('username-display').textContent = currentUsername;
    
    // Load tier preview
    updateTierPreview();
}

function loadClubData() {
    // Load sample data for demonstration
    loadDashboardStats();
    loadDonationsData();
    loadVendorsData();
    loadContentData();
    loadPaymentData();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Tier form
    document.getElementById('tiers-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTiers();
    });
    
    // Vendor form
    document.getElementById('vendor-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addVendor();
    });
    
    // Insurance form
    document.getElementById('insurance-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveInsuranceInfo();
    });
    
    // Search and filter
    document.getElementById('donation-search').addEventListener('input', function() {
        filterDonations();
    });
    
    document.getElementById('donation-filter').addEventListener('change', function() {
        filterDonations();
    });
    
    // Tier preview updates
    document.querySelectorAll('#tiers-form input, #tiers-form textarea').forEach(input => {
        input.addEventListener('input', updateTierPreview);
    });
    
    // Zelle email input for QR code generation
    document.getElementById('zelle-email').addEventListener('input', function() {
        const email = this.value.trim();
        const generateBtn = document.getElementById('generate-qr-btn');
        const downloadBtn = document.getElementById('download-qr-btn');
        
        if (email && isValidEmail(email)) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
            downloadBtn.disabled = true;
        }
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked link
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

function loadDashboardStats() {
    // Sample data - in real implementation, this would come from the backend
    const stats = {
        totalDonations: 12500,
        totalDonors: 45,
        eventsCount: 3,
        growthPercent: 12
    };
    
    document.getElementById('total-donations').textContent = `$${stats.totalDonations.toLocaleString()}`;
    document.getElementById('total-donors').textContent = stats.totalDonors;
    document.getElementById('events-count').textContent = stats.eventsCount;
    document.getElementById('growth-percent').textContent = `${stats.growthPercent}%`;
}

function loadDonationsData() {
    // Sample donations data
    const donations = [
        { date: '2024-12-15', donor: 'John Smith', amount: 250, tier: 'Gold', payment: 'Stripe', status: 'Completed' },
        { date: '2024-12-14', donor: 'Jane Doe', amount: 100, tier: 'Silver', payment: 'Zelle', status: 'Pending' },
        { date: '2024-12-13', donor: 'Bob Johnson', amount: 500, tier: 'Diamond', payment: 'Stripe', status: 'Completed' }
    ];
    
    const tbody = document.getElementById('donations-tbody');
    tbody.innerHTML = '';
    
    if (donations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No donations found</td></tr>';
        return;
    }
    
    donations.forEach(donation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(donation.date).toLocaleDateString()}</td>
            <td>${donation.donor}</td>
            <td>$${donation.amount}</td>
            <td><span class="badge">${donation.tier}</span></td>
            <td>${donation.payment}</td>
            <td><span class="status ${donation.status.toLowerCase()}">${donation.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function loadVendorsData() {
    // Sample vendors data
    const vendors = [
        { name: 'ABC Training', taxId: '12-3456789', address: '123 Main St, Sammamish, WA', services: 'Strength Training' }
    ];
    
    const tbody = document.getElementById('vendors-tbody');
    tbody.innerHTML = '';
    
    if (vendors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No vendors found</td></tr>';
        return;
    }
    
    vendors.forEach(vendor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vendor.name}</td>
            <td>${vendor.taxId}</td>
            <td>${vendor.address}</td>
            <td>${vendor.services}</td>
            <td>
                <button class="btn-icon" onclick="editVendor(this)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteVendor(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadContentData() {
    // Load saved content from localStorage (in real implementation, this would be from backend)
    const savedContent = JSON.parse(localStorage.getItem(`club_content_${currentClub}`)) || {};
    
    document.getElementById('club-description').value = savedContent.description || '';
    document.getElementById('donation-appeal').value = savedContent.appeal || '';
    document.getElementById('thank-you-message').value = savedContent.thankYou || '';
}

function updateTierPreview() {
    const preview = document.getElementById('tier-preview');
    const tiers = ['bronze', 'silver', 'gold', 'diamond'];
    
    let previewHTML = '<div class="tier-preview-grid">';
    
    tiers.forEach(tier => {
        const amount = document.getElementById(`${tier}-amount`).value;
        const title = document.getElementById(`${tier}-title`).value;
        const description = document.getElementById(`${tier}-description`).value;
        
        previewHTML += `
            <div class="preview-tier ${tier}">
                <div class="preview-tier-header">
                    <h4>${title}</h4>
                    <span class="preview-amount">$${amount}</span>
                </div>
                <p>${description}</p>
            </div>
        `;
    });
    
    previewHTML += '</div>';
    preview.innerHTML = previewHTML;
}

function saveTiers() {
    const formData = new FormData(document.getElementById('tiers-form'));
    const tiers = {};
    
    ['bronze', 'silver', 'gold', 'diamond'].forEach(tier => {
        tiers[tier] = {
            amount: formData.get(`${tier}Amount`),
            title: formData.get(`${tier}Title`),
            description: formData.get(`${tier}Description`)
        };
    });
    
    // Save to localStorage (in real implementation, this would be sent to backend)
    localStorage.setItem(`club_tiers_${currentClub}`, JSON.stringify(tiers));
    
    showMessage('Tiers saved successfully!', 'success');
}

function resetTiers() {
    if (confirm('Are you sure you want to reset all tiers to default values?')) {
        // Reset form to default values
        document.getElementById('bronze-amount').value = 25;
        document.getElementById('bronze-title').value = 'Bronze Supporter';
        document.getElementById('bronze-description').value = 'Support our student-athletes with a Bronze level donation. Your contribution helps provide essential equipment and resources.';
        
        document.getElementById('silver-amount').value = 100;
        document.getElementById('silver-title').value = 'Silver Supporter';
        document.getElementById('silver-description').value = 'Make a significant impact with a Silver level donation. Your support helps fund training programs and competition expenses.';
        
        document.getElementById('gold-amount').value = 250;
        document.getElementById('gold-title').value = 'Gold Supporter';
        document.getElementById('gold-description').value = 'Join our Gold level supporters and help provide premium resources, advanced training, and championship opportunities.';
        
        document.getElementById('diamond-amount').value = 500;
        document.getElementById('diamond-title').value = 'Diamond Supporter';
        document.getElementById('diamond-description').value = 'Our highest level of support. Diamond donors provide transformative resources that create lasting impact on our student-athletes\' success.';
        
        updateTierPreview();
        showMessage('Tiers reset to default values.', 'success');
    }
}

function saveClubDescription() {
    const description = document.getElementById('club-description').value;
    saveContent('description', description);
}

function saveDonationAppeal() {
    const appeal = document.getElementById('donation-appeal').value;
    saveContent('appeal', appeal);
}

function saveThankYouMessage() {
    const thankYou = document.getElementById('thank-you-message').value;
    saveContent('thankYou', thankYou);
}

function saveContent(type, content) {
    const savedContent = JSON.parse(localStorage.getItem(`club_content_${currentClub}`)) || {};
    savedContent[type] = content;
    localStorage.setItem(`club_content_${currentClub}`, JSON.stringify(savedContent));
    
    showMessage('Content saved successfully!', 'success');
}

function savePaymentSettings() {
    const zelleEmail = document.getElementById('zelle-email').value.trim();
    const zelleName = document.getElementById('zelle-name').value.trim();
    
    if (!zelleEmail || !isValidEmail(zelleEmail)) {
        showMessage('Please enter a valid email address for Zelle payments.', 'error');
        return;
    }
    
    const paymentSettings = {
        zelleEmail: zelleEmail,
        zelleName: zelleName
    };
    
    localStorage.setItem(`club_payment_${currentClub}`, JSON.stringify(paymentSettings));
    showMessage('Payment settings saved successfully!', 'success');
}

function generateZelleQR() {
    const zelleEmail = document.getElementById('zelle-email').value.trim();
    const zelleName = document.getElementById('zelle-name').value.trim();
    
    if (!zelleEmail || !isValidEmail(zelleEmail)) {
        showMessage('Please enter a valid email address for Zelle payments.', 'error');
        return;
    }
    
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        showMessage('QR Code library not loaded. Please refresh the page and try again.', 'error');
        console.error('QRCode library not available');
        return;
    }
    
    console.log('Generating QR code for:', zelleEmail);
    
    // Create Zelle payment URL
    const zelleURL = `https://enroll.zellepay.com/qr-codes?data=${encodeURIComponent(zelleEmail)}`;
    
    // Generate QR code using a QR code library (using a simple approach)
    generateQRCode(zelleURL, zelleEmail, zelleName);
}

function generateQRCode(url, email, name) {
    console.log('generateQRCode called with:', { url, email, name });
    
    const container = document.getElementById('zelle-qr-container');
    const downloadBtn = document.getElementById('download-qr-btn');
    
    if (!container) {
        console.error('zelle-qr-container not found');
        showMessage('QR code container not found. Please refresh the page.', 'error');
        return;
    }
    
    if (!downloadBtn) {
        console.error('download-qr-btn not found');
        showMessage('Download button not found. Please refresh the page.', 'error');
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Create QR code using QRCode library
    const canvas = document.createElement('canvas');
    canvas.id = 'zelle-qr-canvas';
    
    console.log('About to generate QR code for email:', email);
    
    // Generate QR code for Zelle payment
    QRCode.toCanvas(canvas, email, {
        width: 200,
        height: 200,
        margin: 2,
        color: {
            dark: '#1a365d',
            light: '#ffffff'
        }
    }, function (error) {
        if (error) {
            console.error('QR Code generation error:', error);
            showMessage('Error generating QR code. Please try again.', 'error');
            return;
        }
        
        console.log('QR code generated successfully');
        
        // Add Zelle branding overlay
        const ctx = canvas.getContext('2d');
        
        // Add a semi-transparent overlay for branding
        ctx.fillStyle = 'rgba(26, 54, 93, 0.9)';
        ctx.fillRect(0, 0, 200, 40);
        
        // Add Zelle text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ZELLE PAYMENT', 100, 25);
        
        container.appendChild(canvas);
        downloadBtn.disabled = false;
        
        showMessage('Zelle QR code generated successfully!', 'success');
    });
}

function downloadQRCode() {
    const canvas = document.getElementById('zelle-qr-canvas');
    if (!canvas) {
        showMessage('No QR code to download. Please generate one first.', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.download = `zelle-qr-${currentClub}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    showMessage('QR code downloaded successfully!', 'success');
}

function testQRCode() {
    console.log('Testing QR code generation...');
    
    // Check if QRCode library is available
    if (typeof QRCode === 'undefined') {
        showMessage('QRCode library not available. Please refresh the page.', 'error');
        return;
    }
    
    // Test with a simple email
    const testEmail = 'test@example.com';
    const container = document.getElementById('zelle-qr-container');
    
    if (!container) {
        showMessage('QR container not found.', 'error');
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Create test canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'test-qr-canvas';
    
    console.log('Generating test QR code for:', testEmail);
    
    QRCode.toCanvas(canvas, testEmail, {
        width: 200,
        height: 200,
        margin: 2,
        color: {
            dark: '#1a365d',
            light: '#ffffff'
        }
    }, function (error) {
        if (error) {
            console.error('Test QR Code generation error:', error);
            showMessage('Test QR code generation failed: ' + error.message, 'error');
            return;
        }
        
        console.log('Test QR code generated successfully');
        container.appendChild(canvas);
        showMessage('Test QR code generated successfully!', 'success');
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function loadPaymentData() {
    const savedSettings = JSON.parse(localStorage.getItem(`club_payment_${currentClub}`)) || {};
    
    document.getElementById('zelle-email').value = savedSettings.zelleEmail || '';
    document.getElementById('zelle-name').value = savedSettings.zelleName || '';
    
    // Enable generate button if email is already set
    if (savedSettings.zelleEmail && isValidEmail(savedSettings.zelleEmail)) {
        document.getElementById('generate-qr-btn').disabled = false;
    }
}

function addVendor() {
    const formData = new FormData(document.getElementById('vendor-form'));
    const vendor = {
        name: formData.get('vendorName'),
        taxId: formData.get('vendorTIN'),
        address: formData.get('vendorAddress'),
        services: formData.get('vendorServices')
    };
    
    // In real implementation, this would be sent to backend
    console.log('Adding vendor:', vendor);
    
    // Clear form
    document.getElementById('vendor-form').reset();
    
    showMessage('Vendor added successfully!', 'success');
    loadVendorsData(); // Reload the table
}

function saveInsuranceInfo() {
    const formData = new FormData(document.getElementById('insurance-form'));
    const insuranceData = {
        contact: formData.get('insuranceContact'),
        phone: formData.get('insurancePhone'),
        email: formData.get('insuranceEmail'),
        contributions: formData.get('insuranceContributions'),
        fundraising: formData.get('insuranceFundraising')
    };
    
    // Save to localStorage (in real implementation, this would be sent to backend)
    localStorage.setItem(`club_insurance_${currentClub}`, JSON.stringify(insuranceData));
    
    showMessage('Insurance information saved successfully!', 'success');
}

function filterDonations() {
    const searchTerm = document.getElementById('donation-search').value.toLowerCase();
    const filterTier = document.getElementById('donation-filter').value;
    
    // In real implementation, this would filter the actual data
    console.log('Filtering donations:', { searchTerm, filterTier });
}

function exportDonations() {
    // In real implementation, this would generate and download a CSV file
    alert('Exporting donations data... (This would connect to your backend)');
}

function generateDonationReport() {
    alert('Generating donation report... (This would connect to your backend)');
}

function generateDonorReport() {
    alert('Generating donor report... (This would connect to your backend)');
}

function generateTierReport() {
    alert('Generating tier performance report... (This would connect to your backend)');
}

function exportToCSV() {
    alert('Exporting to CSV... (This would connect to your backend)');
}

function exportToExcel() {
    alert('Exporting to Excel... (This would connect to your backend)');
}

function exportToPDF() {
    alert('Exporting to PDF... (This would connect to your backend)');
}

function editVendor(button) {
    alert('Edit vendor functionality would be implemented here');
}

function deleteVendor(button) {
    if (confirm('Are you sure you want to delete this vendor?')) {
        alert('Vendor deleted! (This would connect to your backend)');
    }
}

function logout() {
    sessionStorage.removeItem('boosterLoggedIn');
    sessionStorage.removeItem('boosterClub');
    sessionStorage.removeItem('boosterUsername');
    sessionStorage.removeItem('boosterLoginTime');
    window.location.href = 'booster-login.html';
}

function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="message-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}

// Add message styles
const messageStyles = document.createElement('style');
messageStyles.textContent = `
    .message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
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
    
    .message-close {
        background: none;
        border: none;
        cursor: pointer;
        color: inherit;
        margin-left: auto;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .tier-preview-grid {
        display: grid;
        gap: 20px;
    }
    
    .preview-tier {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        background: white;
    }
    
    .preview-tier-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .preview-amount {
        font-weight: 600;
        color: #1a365d;
        font-size: 1.2rem;
    }
    
    .tier-group {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        background: #f9fafb;
    }
    
    .tier-group h4 {
        color: #1a365d;
        margin-bottom: 15px;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 8px;
    }
    
    .full-width {
        grid-column: 1 / -1;
    }
    
    .no-data {
        text-align: center;
        color: #6b7280;
        font-style: italic;
        padding: 20px;
    }
    
    .status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status.completed {
        background: #d1fae5;
        color: #065f46;
    }
    
    .status.pending {
        background: #fef3c7;
        color: #92400e;
    }
    
    .zelle-qr-section {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
    }
    
    .zelle-qr-section h4 {
        color: #1a365d;
        margin-bottom: 15px;
    }
    
    .qr-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        margin-bottom: 15px;
        background: #f9fafb;
    }
    
    .qr-placeholder {
        color: #6b7280;
        text-align: center;
        font-style: italic;
    }
    
    .form-help {
        color: #6b7280;
        font-size: 0.875rem;
        margin-top: 4px;
        display: block;
    }
    
    #zelle-qr-canvas {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(messageStyles); 