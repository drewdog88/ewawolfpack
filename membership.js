// Initialize Stripe
const stripe = Stripe('pk_test_your_publishable_key_here'); // Replace with your actual Stripe publishable key
const elements = stripe.elements();

// Create card element
const cardElement = elements.create('card', {
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
cardElement.mount('#card-element');

// Handle card element errors
cardElement.on('change', ({error}) => {
    const displayError = document.getElementById('card-errors');
    if (error) {
        displayError.textContent = error.message;
    } else {
        displayError.textContent = '';
    }
});

// Tier selection functionality
let selectedTier = null;
let selectedPrice = 0;
let selectedPaymentType = null;

document.querySelectorAll('.select-tier').forEach(button => {
    button.addEventListener('click', function() {
        const tier = this.dataset.tier;
        const price = parseInt(this.dataset.price);
        const paymentType = this.dataset.type;
        
        // Update selected tier
        selectedTier = tier;
        selectedPrice = price;
        selectedPaymentType = paymentType;
        
        // Update display
        document.getElementById('selected-tier-name').textContent = 
            tier.charAt(0).toUpperCase() + tier.slice(1) + ' Member';
        document.getElementById('selected-tier-price').textContent = price;
        document.getElementById('selected-payment-type').textContent = 
            paymentType === 'recurring' ? '(Annual)' : '(One-time)';
        
        // Scroll to form
        document.getElementById('membership-form').scrollIntoView({
            behavior: 'smooth'
        });
        
        // Update button states
        document.querySelectorAll('.select-tier').forEach(btn => {
            const originalText = btn.dataset.type === 'recurring' 
                ? `Annual ($${btn.dataset.price}/year)` 
                : `One-time ($${btn.dataset.price})`;
            btn.textContent = originalText;
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        });
        
        // Update current button
        this.textContent = 'Selected';
        this.classList.remove('btn-primary');
        this.classList.add('btn-secondary');
    });
});

// Payment method switching
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const stripePayment = document.getElementById('stripe-payment');
        const zellePayment = document.getElementById('zelle-payment');
        
        if (this.value === 'stripe') {
            stripePayment.style.display = 'block';
            zellePayment.style.display = 'none';
        } else {
            stripePayment.style.display = 'none';
            zellePayment.style.display = 'block';
            // Update Zelle payment info when Zelle is selected
            updateMembershipZelleInfo();
        }
    });
});

// Form submission
document.getElementById('join-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!selectedTier) {
        alert('Please select a membership tier first.');
        return;
    }
    
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    
    // Show loading state
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'inline';
    
    try {
        const formData = new FormData(this);
        const paymentMethod = formData.get('paymentMethod');
        
        if (paymentMethod === 'stripe') {
            // Handle Stripe payment
            await handleStripePayment(formData);
        } else {
            // Handle Zelle payment
            await handleZellePayment(formData);
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('There was an error processing your payment. Please try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoading.style.display = 'none';
    }
});

async function handleStripePayment(formData) {
    // Create payment intent on your server
    const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: selectedPrice * 100, // Convert to cents
            tier: selectedTier,
            customerData: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode'),
                studentName: formData.get('studentName'),
                studentGrade: formData.get('studentGrade'),
                sport: formData.get('sport'),
                newsletter: formData.get('newsletter') === 'on',
                volunteer: formData.get('volunteer') === 'on'
            }
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to create payment intent');
    }
    
    const { clientSecret } = await response.json();
    
    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: cardElement,
            billing_details: {
                name: formData.get('firstName') + ' ' + formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: {
                    line1: formData.get('address'),
                    city: formData.get('city'),
                    state: formData.get('state'),
                    postal_code: formData.get('zipCode'),
                    country: 'US'
                }
            }
        }
    });
    
    if (error) {
        throw new Error(error.message);
    }
    
    if (paymentIntent.status === 'succeeded') {
        showSuccessMessage();
    }
}

async function handleZellePayment(formData) {
    // Send form data to server for Zelle processing
    const response = await fetch('/api/zelle-membership', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tier: selectedTier,
            amount: selectedPrice,
            customerData: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode'),
                studentName: formData.get('studentName'),
                studentGrade: formData.get('studentGrade'),
                sport: formData.get('sport'),
                newsletter: formData.get('newsletter') === 'on',
                volunteer: formData.get('volunteer') === 'on'
            }
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to process Zelle membership');
    }
    
    showZelleInstructions();
}

function showSuccessMessage() {
    const formContainer = document.querySelector('.form-container');
    formContainer.innerHTML = `
        <div class="success-message">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Welcome to the Wolfpack!</h2>
            <p>Thank you for joining the Eastlake Wolfpack Association. Your membership has been successfully processed.</p>
            <p>A confirmation email with your tax receipt has been sent to your email address.</p>
            <div class="success-actions">
                <button class="btn btn-primary" onclick="generateMembershipReceipt()">Download Tax Receipt</button>
                <a href="index.html" class="btn btn-outline">Return to Home</a>
            </div>
        </div>
    `;
    
    // Send confirmation email
    sendMembershipEmail();
}

function generateMembershipReceipt() {
    // Get member information from the form
    const memberName = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
    const memberEmail = document.getElementById('email').value || '';
    const memberAddress = document.getElementById('address').value || '';
    
    // Create receipt data
    const receiptData = {
        donorName: memberName,
        donorEmail: memberEmail,
        donorAddress: memberAddress,
        amount: selectedPrice,
        type: `${selectedTier} Membership - ${selectedPaymentType === 'recurring' ? 'Annual (Recurring)' : 'One-time'}`,
        boosterClub: 'General Membership',
        paymentMethod: selectedPaymentMethod,
        transactionId: 'MEM-' + Date.now(),
        receiptDate: new Date().toLocaleDateString()
    };
    
    // Open receipt in new window
    const receiptWindow = window.open('receipt-template.html', '_blank');
    
    // Wait for the receipt page to load, then populate it
    receiptWindow.onload = function() {
        receiptWindow.populateReceipt(receiptData);
    };
}

function sendMembershipEmail() {
    // Get member information
    const memberName = document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
    const memberEmail = document.getElementById('email').value;
    
    // Create email data
    const emailData = {
        to: memberEmail,
        subject: 'Welcome to Eastlake Wolfpack Association - Membership Confirmation',
        body: `
            Dear ${memberName},
            
            Welcome to the Eastlake Wolfpack Association! Thank you for joining as a ${selectedTier} member.
            
            Your membership details:
            - Membership Type: ${selectedTier}
            - Payment Type: ${selectedPaymentType === 'recurring' ? 'Annual (Recurring)' : 'One-time'}
            - Amount: $${selectedPrice}
            
            Your membership will help support Eastlake student-athletes and their programs. As a 501(c)(3) non-profit organization (EIN: 77-0616862), your contribution is tax-deductible to the extent allowed by law.
            
            A detailed tax receipt has been attached to this email for your records.
            
            Thank you for your support!
            
            Best regards,
            Eastlake Wolfpack Association
            400 228th Ave NE, Sammamish, WA 98074
            info@eastlakewolfpack.org
        `
    };
    
    // Simulate email sending (replace with actual backend call)
    console.log('Sending membership confirmation email:', emailData);
    
    // In a real implementation, this would be:
    // fetch('/api/send-membership-email', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(emailData)
    // });
}

function showZelleInstructions() {
    // Get the default Zelle information for membership
    const zelleEmail = 'treasurer@eastlakewolfpack.org';
    const zelleName = 'Eastlake Wolfpack Association';
    
    const formContainer = document.querySelector('.form-container');
    formContainer.innerHTML = `
        <div class="zelle-instructions">
            <div class="zelle-icon">
                <i class="fas fa-money-bill-wave"></i>
            </div>
            <h2>Zelle Payment Instructions</h2>
            <p>Thank you for choosing to pay via Zelle. Please complete the following steps:</p>
            
            <div class="zelle-payment-details">
                <h3>Membership Payment Details</h3>
                <div class="zelle-info-grid">
                    <div class="zelle-detail">
                        <strong>Send to:</strong> ${zelleEmail}
                    </div>
                    <div class="zelle-detail">
                        <strong>Recipient:</strong> ${zelleName}
                    </div>
                    <div class="zelle-detail">
                        <strong>Amount:</strong> $${selectedPrice}
                    </div>
                    <div class="zelle-detail">
                        <strong>Membership:</strong> ${selectedTier} ${selectedPaymentType === 'recurring' ? '(Annual)' : '(One-time)'}
                    </div>
                </div>
                
                <div class="zelle-qr-section">
                    <h4>Quick Payment QR Code</h4>
                    <div id="membership-qr-container" class="qr-container">
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
                    <p>Send $${selectedPrice} to: <strong>${zelleEmail}</strong></p>
                </div>
                <div class="step">
                    <span class="step-number">3</span>
                    <p>Include in memo: <strong>${document.getElementById('firstName').value} ${document.getElementById('lastName').value} - Membership</strong></p>
                </div>
                <div class="step">
                    <span class="step-number">4</span>
                    <p>Your membership will be activated within 24 hours of payment confirmation.</p>
                </div>
            </div>
            <p class="zelle-note">You will receive a confirmation email once your payment is processed.</p>
            <div class="zelle-actions">
                <button class="btn btn-primary" onclick="showSuccessMessage()">I've Completed Payment</button>
                <a href="index.html" class="btn btn-outline">Return to Home</a>
            </div>
        </div>
    `;
    
    // Generate QR code for membership payment
    generateMembershipQRCode(zelleEmail, 'Membership');
}

// Function to update Zelle payment info for membership
function updateMembershipZelleInfo() {
    const zelleEmail = 'treasurer@eastlakewolfpack.org';
    const zelleName = 'Eastlake Wolfpack Association';
    
    document.getElementById('zelle-email-display-membership').textContent = zelleEmail;
    document.getElementById('zelle-name-display-membership').textContent = zelleName;
    
    // Show QR code section
    showMembershipZelleQRCode(zelleEmail, zelleName);
}

// Function to generate QR code for membership page
function generateMembershipQRCode(email, type) {
    const container = document.getElementById('membership-qr-container');
    
    // Clear container
    container.innerHTML = '';
    
    // Create QR code using QRCode library
    const canvas = document.createElement('canvas');
    canvas.id = 'membership-qr-canvas';
    
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

// Function to show Zelle QR code in membership payment section
function showMembershipZelleQRCode(email, name) {
    const qrSection = document.getElementById('zelle-qr-section-membership');
    const container = document.getElementById('zelle-qr-container-membership');
    
    if (email) {
        qrSection.style.display = 'block';
        generateMembershipQRCode(email, name);
    } else {
        qrSection.style.display = 'none';
    }
}

// Add success message styles
const style = document.createElement('style');
style.textContent = `
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
    
    #membership-qr-canvas {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
`;
document.head.appendChild(style); 