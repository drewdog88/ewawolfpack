// Contact Protection System
// This script protects contact information from scrapers and bots

class ContactProtector {
    constructor() {
        this.contactData = {
            email: 'info@eastlakewolfpack.org',
            phone: '(425) 123-4567',
            address: '400 228th Ave NE, Sammamish, WA 98074',
            zelle: 'treasurer@eastlakewolfpack.org'
        };
        this.init();
    }

    init() {
        this.createContactImages();
        this.addAntiScrapingMeasures();
        this.addHoneypotFields();
    }

    // Convert text to canvas image to prevent scraping
    textToImage(text, fontSize = 16, color = '#1a365d') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set font
        ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
        ctx.fillStyle = color;
        
        // Measure text
        const metrics = ctx.measureText(text);
        const width = metrics.width + 10;
        const height = fontSize + 10;
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Redraw with proper positioning
        ctx.font = `${fontSize}px Inter, Arial, sans-serif`;
        ctx.fillStyle = color;
        ctx.fillText(text, 5, fontSize);
        
        return canvas.toDataURL();
    }

    createContactImages() {
        // Replace email addresses with images
        const emailElements = document.querySelectorAll('[data-protect-email]');
        emailElements.forEach(element => {
            const email = element.getAttribute('data-protect-email');
            const img = document.createElement('img');
            img.src = this.textToImage(email, 14, '#1a365d');
            img.alt = 'Email address';
            img.style.border = 'none';
            img.style.verticalAlign = 'middle';
            img.style.marginLeft = '5px';
            element.innerHTML = '';
            element.appendChild(img);
        });

        // Replace phone numbers with images
        const phoneElements = document.querySelectorAll('[data-protect-phone]');
        phoneElements.forEach(element => {
            const phone = element.getAttribute('data-protect-phone');
            const img = document.createElement('img');
            img.src = this.textToImage(phone, 14, '#1a365d');
            img.alt = 'Phone number';
            img.style.border = 'none';
            img.style.verticalAlign = 'middle';
            img.style.marginLeft = '5px';
            element.innerHTML = '';
            element.appendChild(img);
        });
    }

    addAntiScrapingMeasures() {
        // Add invisible elements that scrapers might target
        const fakeElements = [
            '<span style="display:none">info@fake-email.com</span>',
            '<span style="display:none">(555) 123-4567</span>',
            '<span style="display:none">fake@eastlakewolfpack.org</span>'
        ];

        fakeElements.forEach(element => {
            const div = document.createElement('div');
            div.innerHTML = element;
            div.style.position = 'absolute';
            div.style.left = '-9999px';
            div.style.top = '-9999px';
            document.body.appendChild(div);
        });

        // Add mouse tracking to detect automated behavior
        let mouseMoves = 0;
        let lastMove = Date.now();
        
        document.addEventListener('mousemove', () => {
            mouseMoves++;
            lastMove = Date.now();
        });

        // Check for suspicious behavior
        setInterval(() => {
            const timeSinceLastMove = Date.now() - lastMove;
            if (mouseMoves < 5 && timeSinceLastMove > 10000) {
                // Likely a bot - hide sensitive information
                this.hideSensitiveInfo();
            }
        }, 5000);
    }

    addHoneypotFields() {
        // Add invisible honeypot fields to catch bots
        const honeypotFields = [
            { name: 'website', type: 'text' },
            { name: 'company', type: 'text' },
            { name: 'phone_number', type: 'tel' }
        ];

        honeypotFields.forEach(field => {
            const input = document.createElement('input');
            input.type = field.type;
            input.name = field.name;
            input.style.display = 'none';
            input.style.position = 'absolute';
            input.style.left = '-9999px';
            input.setAttribute('tabindex', '-1');
            input.setAttribute('autocomplete', 'off');
            
            // Add to forms
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.appendChild(input.cloneNode(true));
            });
        });

        // Check honeypot fields on form submission
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const honeypotFields = form.querySelectorAll('input[name="website"], input[name="company"], input[name="phone_number"]');
            
            honeypotFields.forEach(field => {
                if (field.value.trim() !== '') {
                    e.preventDefault();
                    console.log('Bot detected via honeypot field');
                    return false;
                }
            });
        });
    }

    hideSensitiveInfo() {
        // Hide sensitive information if bot behavior is detected
        const sensitiveElements = document.querySelectorAll('.sensitive-info');
        sensitiveElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    // Method to get contact info for legitimate users
    getContactInfo(type) {
        // Only return contact info if user has interacted naturally
        if (this.isLegitimateUser()) {
            return this.contactData[type] || '';
        }
        return '';
    }

    isLegitimateUser() {
        // Check for natural user behavior
        const mouseMoves = window.mouseMoves || 0;
        const timeOnPage = Date.now() - window.pageLoadTime;
        
        return mouseMoves > 10 && timeOnPage > 5000;
    }
}

// Initialize contact protection
document.addEventListener('DOMContentLoaded', () => {
    window.pageLoadTime = Date.now();
    window.contactProtector = new ContactProtector();
});

// Additional anti-scraping measures
document.addEventListener('contextmenu', (e) => {
    // Prevent right-click on sensitive areas
    if (e.target.closest('.sensitive-info')) {
        e.preventDefault();
    }
});

// Disable text selection on sensitive information
document.addEventListener('selectstart', (e) => {
    if (e.target.closest('.sensitive-info')) {
        e.preventDefault();
    }
});

// Add CSS to prevent text selection
const antiScrapingCSS = `
    .sensitive-info {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
    }
    
    .sensitive-info img {
        pointer-events: none;
    }
`;

const style = document.createElement('style');
style.textContent = antiScrapingCSS;
document.head.appendChild(style); 