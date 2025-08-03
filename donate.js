// Initialize Stripe for donations
const stripeDonate = Stripe('pk_test_your_publishable_key_here'); // Replace with your actual Stripe publishable key
const elementsDonate = stripeDonate.elements();

// Create card element for donations
const cardElementDonate = elementsDonate.create('card', {
    style: {
        base: {
            fontSize: '16px',
            color: '#374151',
            '::placeholder': {
                color: '#9ca3af',
            },
        },
    },
});

// Mount the card element
cardElementDonate.mount('#card-element-donate');

// Handle card element errors
cardElementDonate.on('change', ({error}) => {
    const displayError = document.getElementById('card-errors-donate');
    if (error) {
        displayError.textContent = error.message;
    } else {
        displayError.textContent = '';
    }
});

// Booster club selection functionality
document.getElementById('booster-club').addEventListener('change', function() {
    const selectedClub = this.value;
    if (selectedClub) {
        selectedBoosterClub = selectedClub;
        
        // Get the display name from the selected option
        const selectedOption = this.options[this.selectedIndex];
        const displayName = selectedOption.text;
        
        document.getElementById('selected-booster').textContent = displayName;
        
        // Show donation tiers section
        document.getElementById('donation-tiers').style.display = 'block';
        document.getElementById('donation-tiers').scrollIntoView({ behavior: 'smooth' });
        
        // Update Zelle payment info if Zelle is selected
        updateZellePaymentInfo(selectedClub);
    } else {
        selectedBoosterClub = null;
        document.getElementById('selected-booster').textContent = 'No club selected';
        document.getElementById('donation-tiers').style.display = 'none';
    }
});

// Donation selection functionality
let selectedDonationTier = null;
let selectedDonationAmount = 0;

document.querySelectorAll('.select-donation').forEach(button => {
    button.addEventListener('click', function() {
        if (!selectedBoosterClub) {
            alert('Please select a booster club first');
            return;
        }
        
        const tier = this.dataset.tier;
        const amount = parseInt(this.dataset.amount);
        
        // Update selected donation
        selectedDonationTier = tier;
        selectedDonationAmount = amount;
        
        // Update display
        document.getElementById('selected-amount').textContent = amount;
        document.getElementById('selected-tier').textContent = 
            tier.charAt(0).toUpperCase() + tier.slice(1) + ' Donor';
        
        // Scroll to form
        document.getElementById('donation-form').scrollIntoView({
            behavior: 'smooth'
        });
        
        // Update button states
        document.querySelectorAll('.select-donation').forEach(btn => {
            btn.textContent = `Donate $${btn.dataset.amount}`;
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        });
        
        // Update current button
        this.textContent = 'Selected';
        this.classList.remove('btn-primary');
        this.classList.add('btn-secondary');
    });
});

// Payment method change listener
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'zelle' && selectedBoosterClub) {
            const boosterClubKey = getBoosterClubKey(document.getElementById('selected-booster').textContent);
            updateZellePaymentInfo(boosterClubKey);
        }
    });
});

// Custom amount functionality
document.getElementById('custom-donate').addEventListener('click', function() {
    if (!selectedBoosterClub) {
        alert('Please select a booster club first');
        return;
    }
    
    const customAmount = parseInt(document.getElementById('custom-amount').value);
    
    if (!customAmount || customAmount < 1) {
        alert('Please enter a valid amount.');
        return;
    }
    
    selectedDonationTier = 'custom';
    selectedDonationAmount = customAmount;
    
    // Update display
    document.getElementById('selected-amount').textContent = customAmount;
    document.getElementById('selected-tier').textContent = 'Custom Amount';
    
    // Scroll to form
    document.getElementById('donation-form').scrollIntoView({
        behavior: 'smooth'
    });
});

// Payment method switching for donations
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const stripePayment = document.getElementById('stripe-payment-donate');
        const zellePayment = document.getElementById('zelle-payment-donate');
        
        if (this.value === 'stripe') {
            stripePayment.style.display = 'block';
            zellePayment.style.display = 'none';
        } else {
            stripePayment.style.display = 'none';
            zellePayment.style.display = 'block';
        }
    });
});

// Donation form submission
document.getElementById('donate-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!selectedBoosterClub) {
        alert('Please select a booster club first.');
        return;
    }
    
    if (!selectedDonationAmount || selectedDonationAmount < 1) {
        alert('Please select a donation amount first.');
        return;
    }
    
    const submitBtn = document.getElementById('submit-donate-btn');
    const submitText = document.getElementById('submit-donate-text');
    const submitLoading = document.getElementById('submit-donate-loading');
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'inline';
    
    try {
        const formData = new FormData(this);
        const paymentMethod = formData.get('paymentMethod');
        
        if (paymentMethod === 'stripe') {
            // Handle Stripe payment
            await handleStripeDonation(formData);
        } else {
            // Handle Zelle payment
            await handleZelleDonation(formData);
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('There was an error processing your donation. Please try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoading.style.display = 'none';
    }
});

async function handleStripeDonation(formData) {
    // Create payment intent on your server
    const response = await fetch('/api/create-donation-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: selectedDonationAmount * 100, // Convert to cents
            tier: selectedDonationTier,
            boosterClub: selectedBoosterClub,
            donorData: {
                firstName: formData.get('donorFirstName'),
                lastName: formData.get('donorLastName'),
                email: formData.get('donorEmail'),
                phone: formData.get('donorPhone'),
                anonymous: formData.get('anonymous') === 'on',
                newsletter: formData.get('newsletter') === 'on'
            }
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to create donation intent');
    }
    
    const { clientSecret } = await response.json();
    
    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripeDonate.confirmCardPayment(clientSecret, {
        payment_method: {
            card: cardElementDonate,
            billing_details: {
                name: formData.get('donorFirstName') + ' ' + formData.get('donorLastName'),
                email: formData.get('donorEmail'),
                phone: formData.get('donorPhone')
            }
        }
    });
    
    if (error) {
        throw new Error(error.message);
    }
    
    if (paymentIntent.status === 'succeeded') {
        showDonationSuccessMessage();
    }
}

async function handleZelleDonation(formData) {
    // Send form data to server for Zelle processing
    const response = await fetch('/api/zelle-donation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tier: selectedDonationTier,
            amount: selectedDonationAmount,
            boosterClub: selectedBoosterClub,
            donorData: {
                firstName: formData.get('donorFirstName'),
                lastName: formData.get('donorLastName'),
                email: formData.get('donorEmail'),
                phone: formData.get('donorPhone'),
                anonymous: formData.get('anonymous') === 'on',
                newsletter: formData.get('newsletter') === 'on'
            }
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to process Zelle donation');
    }
    
    showZelleDonationInstructions();
}

function showDonationSuccessMessage() {
    const formContainer = document.querySelector('.form-container');
    formContainer.innerHTML = `
        <div class="success-message">
            <div class="success-icon">
                <i class="fas fa-heart"></i>
            </div>
            <h2>Thank You for Your Donation!</h2>
            <p>Your generous donation of $${selectedDonationAmount} will help support the ${document.getElementById('selected-booster').textContent} booster club and Eastlake student-athletes.</p>
            <p>A confirmation email with your tax receipt has been sent to your email address.</p>
            <div class="success-actions">
                <button class="btn btn-primary" onclick="generateReceipt()">Download Tax Receipt</button>
                <a href="index.html" class="btn btn-outline">Return to Home</a>
            </div>
        </div>
    `;
    
    // Send confirmation email
    sendDonationEmail();
}

function generateReceipt() {
    // Get donor information from the form
    const donorName = document.getElementById('donorFirstName').value + ' ' + document.getElementById('donorLastName').value || 'Anonymous';
    const donorEmail = document.getElementById('donorEmail').value || '';
    const donorAddress = document.getElementById('donorAddress').value || '';
    
    // Create receipt data
    const receiptData = {
        donorName: donorName,
        donorEmail: donorEmail,
        donorAddress: donorAddress,
        amount: selectedDonationAmount,
        type: selectedDonationTier || 'Custom Donation',
        boosterClub: document.getElementById('selected-booster').textContent,
        paymentMethod: selectedPaymentMethod,
        transactionId: 'TXN-' + Date.now(),
        receiptDate: new Date().toLocaleDateString()
    };
    
    // Open receipt in new window
    const receiptWindow = window.open('receipt-template.html', '_blank');
    
    // Wait for the receipt page to load, then populate it
    receiptWindow.onload = function() {
        receiptWindow.populateReceipt(receiptData);
    };
}

function sendDonationEmail() {
    // Get donor information
    const donorName = document.getElementById('donorFirstName').value + ' ' + document.getElementById('donorLastName').value;
    const donorEmail = document.getElementById('donorEmail').value;
    
    // Create email data
    const emailData = {
        to: donorEmail,
        subject: 'Thank you for your donation to Eastlake Wolfpack Association',
        body: `
            Dear ${donorName},
            
            Thank you for your generous donation of $${selectedDonationAmount} to the ${document.getElementById('selected-booster').textContent} booster club through the Eastlake Wolfpack Association.
            
            Your donation will help support Eastlake student-athletes and their programs. As a 501(c)(3) non-profit organization (EIN: 77-0616862), your contribution is tax-deductible to the extent allowed by law.
            
            A detailed tax receipt has been attached to this email for your records.
            
            Thank you for your support!
            
            Best regards,
            Eastlake Wolfpack Association
            400 228th Ave NE, Sammamish, WA 98074
            info@eastlakewolfpack.org
        `
    };
    
    // Simulate email sending (replace with actual backend call)
    console.log('Sending donation confirmation email:', emailData);
    
    // In a real implementation, this would be:
    // fetch('/api/send-donation-email', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(emailData)
    // });
}

function showZelleDonationInstructions() {
    const selectedBoosterClub = document.getElementById('selected-booster').textContent;
    const boosterClubKey = getBoosterClubKey(selectedBoosterClub);
    
    // Get club-specific Zelle information
    const clubPaymentSettings = JSON.parse(localStorage.getItem(`club_payment_${boosterClubKey}`)) || {};
    const zelleEmail = clubPaymentSettings.zelleEmail || 'treasurer@eastlakewolfpack.org';
    const zelleName = clubPaymentSettings.zelleName || 'Eastlake Wolfpack Association';
    
    const formContainer = document.querySelector('.form-container');
    formContainer.innerHTML = `
        <div class="zelle-instructions">
            <div class="zelle-icon">
                <i class="fas fa-money-bill-wave"></i>
            </div>
            <h2>Zelle Donation Instructions</h2>
            <p>Thank you for choosing to donate via Zelle. Please complete the following steps:</p>
            
            <div class="zelle-payment-details">
                <h3>Payment Details for ${selectedBoosterClub}</h3>
                <div class="zelle-info-grid">
                    <div class="zelle-detail">
                        <strong>Send to:</strong> ${zelleEmail}
                    </div>
                    <div class="zelle-detail">
                        <strong>Recipient:</strong> ${zelleName}
                    </div>
                    <div class="zelle-detail">
                        <strong>Amount:</strong> $${selectedDonationAmount}
                    </div>
                </div>
                
                <div class="zelle-qr-section">
                    <h4>Quick Payment QR Code</h4>
                    <div id="donation-qr-container" class="qr-container">
                        <p class="qr-placeholder">Loading QR code...</p>
                    </div>
                    <p class="qr-instruction">Scan with your phone's camera or Zelle app</p>
                </div>
            </div>
            
            <div class="zelle-steps">
                <div class="step">
                    <span class="step-number">1</span>
                    <p>Open your Zelle app or online banking</p>
                </div>
                <div class="step">
                    <span class="step-number">2</span>
                    <p>Send $${selectedDonationAmount} to: <strong>${zelleEmail}</strong></p>
                </div>
                <div class="step">
                    <span class="step-number">3</span>
                    <p>Include in memo: <strong>${document.getElementById('donorFirstName').value} ${document.getElementById('donorLastName').value} - ${selectedBoosterClub}</strong></p>
                </div>
                <div class="step">
                    <span class="step-number">4</span>
                    <p>Your donation will be processed within 24 hours of payment confirmation.</p>
                </div>
            </div>
            <p class="zelle-note">You will receive a confirmation email and tax receipt once your donation is processed.</p>
            <div class="zelle-actions">
                <button class="btn btn-primary" onclick="showDonationSuccessMessage()">I've Completed Payment</button>
                <a href="index.html" class="btn btn-outline">Return to Home</a>
            </div>
        </div>
    `;
    
    // Generate QR code for the club's Zelle email
    generateDonationQRCode(zelleEmail, selectedBoosterClub);
}

// Helper function to get booster club key from display name
function getBoosterClubKey(displayName) {
    const clubMapping = {
        'Cheer': 'cheer',
        'Dance': 'dance',
        'Softball': 'softball',
        'Boys Soccer': 'boyssoccer',
        'Girls Soccer': 'girlssoccer',
        'Boys Swim and Dive': 'boysswim',
        'Girls Swim and Dive': 'girlsswim',
        'Wrestling': 'wrestling',
        'Robotics': 'robotics',
        'Volleyball': 'volleyball',
        'Boys Basketball': 'boysbasketball',
        'Girls Basketball': 'girlsbasketball',
        'Boys Golf': 'boysgolf',
        'Girls Golf': 'girlsgolf',
        'DECCA': 'decca',
        'Theater': 'theater',
        'Choir': 'choir',
        'Gymnastics': 'gymnastics',
        'Orchestra': 'orchestra',
        'Band': 'band'
    };
    return clubMapping[displayName] || displayName.toLowerCase().replace(/\s+/g, '');
}

// Function to update Zelle payment info when booster club is selected
function updateZellePaymentInfo(boosterClubKey) {
    const clubPaymentSettings = JSON.parse(localStorage.getItem(`club_payment_${boosterClubKey}`)) || {};
    const zelleEmail = clubPaymentSettings.zelleEmail || 'treasurer@eastlakewolfpack.org';
    const zelleName = clubPaymentSettings.zelleName || 'Eastlake Wolfpack Association';
    
    document.getElementById('zelle-email-display').textContent = zelleEmail;
    document.getElementById('zelle-name-display').textContent = zelleName;
    
    // Show QR code section if Zelle is selected
    const zellePaymentSection = document.getElementById('zelle-payment-donate');
    if (zellePaymentSection.style.display !== 'none') {
        showZelleQRCode(zelleEmail, zelleName);
    }
}

// Function to generate QR code for donation page
function generateDonationQRCode(email, clubName) {
    const container = document.getElementById('donation-qr-container');
    
    // Clear container
    container.innerHTML = '';
    
    // Create QR code using QRCode library
    const canvas = document.createElement('canvas');
    canvas.id = 'donation-qr-canvas';
    
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
            container.innerHTML = '<p class="qr-error">Error generating QR code</p>';
            return;
        }
        
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
    });
}

// Function to show Zelle QR code in payment section
function showZelleQRCode(email, name) {
    const qrSection = document.getElementById('zelle-qr-section');
    const container = document.getElementById('zelle-qr-container');
    
    if (email && email !== 'treasurer@eastlakewolfpack.org') {
        qrSection.style.display = 'block';
        generateDonationQRCode(email, name);
    } else {
        qrSection.style.display = 'none';
    }
}

// Add success message styles
const donateStyle = document.createElement('style');
donateStyle.textContent = `
    .success-message, .zelle-instructions {
        text-align: center;
        padding: 40px 20px;
    }
    
    .success-icon, .zelle-icon {
        font-size: 4rem;
        color: #10b981;
        margin-bottom: 20px;
    }
    
    .zelle-icon {
        color: #f59e0b;
    }
    
    .success-message h2, .zelle-instructions h2 {
        color: #1e3a8a;
        margin-bottom: 20px;
    }
    
    .success-message p, .zelle-instructions p {
        color: #64748b;
        margin-bottom: 15px;
        line-height: 1.6;
    }
    
    .zelle-steps {
        margin: 30px 0;
        text-align: left;
    }
    
    .step {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 20px;
        padding: 15px;
        background: white;
        border-radius: 8px;
        border-left: 4px solid #f59e0b;
    }
    
    .step-number {
        background: #f59e0b;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        flex-shrink: 0;
    }
    
    .step p {
        margin: 0;
        color: #374151;
    }
    
    .zelle-note {
        background: #fef3c7;
        padding: 15px;
        border-radius: 8px;
        color: #92400e;
        font-style: italic;
    }
    
    .success-actions, .zelle-actions {
        margin-top: 30px;
    }
    
    .zelle-payment-details {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        border: 1px solid #e2e8f0;
    }
    
    .zelle-payment-details h3 {
        color: #1a365d;
        margin-bottom: 15px;
        text-align: center;
    }
    
    .zelle-info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .zelle-detail {
        background: white;
        padding: 12px;
        border-radius: 6px;
        border-left: 4px solid #1a365d;
        font-size: 14px;
    }
    
    .zelle-qr-section {
        text-align: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
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
    
    .qr-instruction {
        color: #6b7280;
        font-size: 0.875rem;
        margin-top: 10px;
    }
    
    .qr-error {
        color: #dc2626;
        text-align: center;
        font-style: italic;
    }
    
    #donation-qr-canvas {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(donateStyle); 