/**
 * Admin Panel Security Utilities
 * Comprehensive frontend security enhancements for the Eastlake Wolfpack Association admin panel
 * 
 * Features:
 * - Input sanitization and validation
 * - Safe DOM manipulation methods
 * - XSS prevention utilities
 * - Secure logging system
 * - Enhanced validation utilities
 */

// Security Configuration
const SECURITY_CONFIG = {
    // Allowed HTML tags for rich text (if needed)
    ALLOWED_HTML_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p'],
    
    // Maximum input lengths
    MAX_LENGTHS: {
        name: 100,
        email: 254,
        phone: 20,
        address: 200,
        city: 50,
        state: 2,
        zip: 10,
        description: 1000,
        message: 2000,
        password: 128
    },
    
    // Validation patterns
    PATTERNS: {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        phone: /^[\+]?[1-9][\d]{0,15}$/,
        zip: /^\d{5}(-\d{4})?$/,
        name: /^[a-zA-Z\s\-'\.]+$/,
        amount: /^\d+(\.\d{1,2})?$/,
        taxId: /^\d{2}-\d{7}$|^\d{9}$/
    },
    
    // Logging security settings
    LOGGING: {
        sanitizeLogData: true,
        maxLogEntryLength: 500,
        allowedLogActions: ['login', 'logout', 'create', 'update', 'delete', 'export', 'import', 'settings', 'booster-management'],
        sensitiveFields: ['password', 'ssn', 'credit_card', 'bank_account']
    }
};

/**
 * Input Sanitization Utilities
 */
class InputSanitizer {
    /**
     * Sanitize text input to prevent XSS
     * @param {string} input - Raw input string
     * @param {boolean} allowHtml - Whether to allow basic HTML tags
     * @returns {string} Sanitized string
     */
    static sanitizeText(input, allowHtml = false) {
        if (typeof input !== 'string') {
            return '';
        }
        
        // Remove null bytes and control characters
        let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        if (allowHtml) {
            // Allow only specific HTML tags
            const allowedTags = SECURITY_CONFIG.ALLOWED_HTML_TAGS.join('|');
            const tagRegex = new RegExp(`<(?!\/?(?:${allowedTags})\b)[^>]+>`, 'gi');
            sanitized = sanitized.replace(tagRegex, '');
        } else {
            // Remove all HTML tags
            sanitized = sanitized.replace(/<[^>]*>/g, '');
        }
        
        // Encode special characters
        sanitized = this.encodeHtmlEntities(sanitized);
        
        return sanitized.trim();
    }
    
    /**
     * Encode HTML entities to prevent XSS
     * @param {string} text - Text to encode
     * @returns {string} Encoded text
     */
    static encodeHtmlEntities(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Sanitize email address
     * @param {string} email - Email to sanitize
     * @returns {string} Sanitized email
     */
    static sanitizeEmail(email) {
        if (typeof email !== 'string') {
            return '';
        }
        
        // Remove whitespace and convert to lowercase
        let sanitized = email.trim().toLowerCase();
        
        // Remove any HTML tags
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        
        // Remove null bytes and control characters
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        return sanitized;
    }
    
    /**
     * Sanitize phone number
     * @param {string} phone - Phone number to sanitize
     * @returns {string} Sanitized phone number
     */
    static sanitizePhone(phone) {
        if (typeof phone !== 'string') {
            return '';
        }
        
        // Remove all non-digit characters except + at the beginning
        let sanitized = phone.replace(/[^\d+]/g, '');
        
        // Ensure only one + at the beginning
        if (sanitized.startsWith('+')) {
            sanitized = '+' + sanitized.substring(1).replace(/\+/g, '');
        }
        
        return sanitized;
    }
    
    /**
     * Sanitize monetary amount
     * @param {string|number} amount - Amount to sanitize
     * @returns {string} Sanitized amount
     */
    static sanitizeAmount(amount) {
        if (typeof amount === 'number') {
            return amount.toFixed(2);
        }
        
        if (typeof amount !== 'string') {
            return '0.00';
        }
        
        // Remove all characters except digits and decimal point
        let sanitized = amount.replace(/[^\d.]/g, '');
        
        // Ensure only one decimal point
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Limit to 2 decimal places
        if (parts.length === 2 && parts[1].length > 2) {
            sanitized = parts[0] + '.' + parts[1].substring(0, 2);
        }
        
        return sanitized || '0.00';
    }
    
    /**
     * Sanitize tax ID (EIN/SSN)
     * @param {string} taxId - Tax ID to sanitize
     * @returns {string} Sanitized tax ID
     */
    static sanitizeTaxId(taxId) {
        if (typeof taxId !== 'string') {
            return '';
        }
        
        // Remove all non-digit characters
        let sanitized = taxId.replace(/\D/g, '');
        
        // Format as EIN (XX-XXXXXXX) if 9 digits
        if (sanitized.length === 9) {
            return sanitized.substring(0, 2) + '-' + sanitized.substring(2);
        }
        
        return sanitized;
    }
    
    /**
     * Sanitize address information
     * @param {string} address - Address to sanitize
     * @returns {string} Sanitized address
     */
    static sanitizeAddress(address) {
        if (typeof address !== 'string') {
            return '';
        }
        
        // Remove HTML tags and control characters
        let sanitized = address.replace(/<[^>]*>/g, '');
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        // Encode HTML entities
        sanitized = this.encodeHtmlEntities(sanitized);
        
        return sanitized.trim();
    }
    
    /**
     * Sanitize log data to prevent XSS in logging
     * @param {any} data - Data to sanitize for logging
     * @returns {string} Sanitized log data
     */
    static sanitizeLogData(data) {
        if (typeof data === 'string') {
            return this.sanitizeText(data, false);
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                // Skip sensitive fields
                if (SECURITY_CONFIG.LOGGING.sensitiveFields.includes(key.toLowerCase())) {
                    sanitized[key] = '[REDACTED]';
                } else {
                    sanitized[key] = this.sanitizeLogData(value);
                }
            }
            return JSON.stringify(sanitized);
        }
        
        return String(data);
    }
}

/**
 * Validation Utilities
 */
class InputValidator {
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    static isValidEmail(email) {
        if (typeof email !== 'string' || !email.trim()) {
            return false;
        }
        
        const sanitized = InputSanitizer.sanitizeEmail(email);
        return SECURITY_CONFIG.PATTERNS.email.test(sanitized);
    }
    
    /**
     * Validate phone number
     * @param {string} phone - Phone to validate
     * @returns {boolean} True if valid
     */
    static isValidPhone(phone) {
        if (typeof phone !== 'string' || !phone.trim()) {
            return false;
        }
        
        const sanitized = InputSanitizer.sanitizePhone(phone);
        return SECURITY_CONFIG.PATTERNS.phone.test(sanitized);
    }
    
    /**
     * Validate ZIP code
     * @param {string} zip - ZIP to validate
     * @returns {boolean} True if valid
     */
    static isValidZip(zip) {
        if (typeof zip !== 'string' || !zip.trim()) {
            return false;
        }
        
        return SECURITY_CONFIG.PATTERNS.zip.test(zip.trim());
    }
    
    /**
     * Validate name (letters, spaces, hyphens, apostrophes, periods)
     * @param {string} name - Name to validate
     * @returns {boolean} True if valid
     */
    static isValidName(name) {
        if (typeof name !== 'string' || !name.trim()) {
            return false;
        }
        
        return SECURITY_CONFIG.PATTERNS.name.test(name.trim());
    }
    
    /**
     * Validate monetary amount
     * @param {string|number} amount - Amount to validate
     * @returns {boolean} True if valid
     */
    static isValidAmount(amount) {
        if (typeof amount === 'number') {
            return amount >= 0 && amount <= 999999.99;
        }
        
        if (typeof amount !== 'string' || !amount.trim()) {
            return false;
        }
        
        return SECURITY_CONFIG.PATTERNS.amount.test(amount.trim());
    }
    
    /**
     * Validate tax ID (EIN or SSN format)
     * @param {string} taxId - Tax ID to validate
     * @returns {boolean} True if valid
     */
    static isValidTaxId(taxId) {
        if (typeof taxId !== 'string' || !taxId.trim()) {
            return false;
        }
        
        return SECURITY_CONFIG.PATTERNS.taxId.test(taxId.trim());
    }
    
    /**
     * Validate input length
     * @param {string} input - Input to validate
     * @param {string} fieldType - Type of field (from MAX_LENGTHS)
     * @returns {boolean} True if valid length
     */
    static isValidLength(input, fieldType) {
        if (typeof input !== 'string') {
            return false;
        }
        
        const maxLength = SECURITY_CONFIG.MAX_LENGTHS[fieldType];
        if (!maxLength) {
            return true; // No length restriction
        }
        
        return input.length <= maxLength;
    }
    
    /**
     * Comprehensive validation for form fields
     * @param {Object} formData - Form data to validate
     * @param {Object} validationRules - Validation rules for each field
     * @returns {Object} Validation result with errors
     */
    static validateForm(formData, validationRules) {
        const errors = {};
        
        for (const [fieldName, rules] of Object.entries(validationRules)) {
            const value = formData[fieldName];
            const fieldErrors = [];
            
            // Required validation
            if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
                fieldErrors.push(`${fieldName} is required`);
            }
            
            if (value && typeof value === 'string') {
                // Length validation
                if (rules.maxLength && !this.isValidLength(value, rules.maxLength)) {
                    fieldErrors.push(`${fieldName} is too long`);
                }
                
                // Type-specific validation
                if (rules.type === 'email' && !this.isValidEmail(value)) {
                    fieldErrors.push(`${fieldName} is not a valid email address`);
                }
                
                if (rules.type === 'phone' && !this.isValidPhone(value)) {
                    fieldErrors.push(`${fieldName} is not a valid phone number`);
                }
                
                if (rules.type === 'zip' && !this.isValidZip(value)) {
                    fieldErrors.push(`${fieldName} is not a valid ZIP code`);
                }
                
                if (rules.type === 'name' && !this.isValidName(value)) {
                    fieldErrors.push(`${fieldName} contains invalid characters`);
                }
                
                if (rules.type === 'amount' && !this.isValidAmount(value)) {
                    fieldErrors.push(`${fieldName} is not a valid amount`);
                }
                
                if (rules.type === 'taxId' && !this.isValidTaxId(value)) {
                    fieldErrors.push(`${fieldName} is not a valid tax ID`);
                }
            }
            
            if (fieldErrors.length > 0) {
                errors[fieldName] = fieldErrors;
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors: errors
        };
    }
}

/**
 * Safe DOM Manipulation Utilities
 */
class SafeDOM {
    /**
     * Safely set text content of an element
     * @param {Element} element - DOM element
     * @param {string} text - Text to set
     */
    static setTextContent(element, text) {
        if (!element || !(element instanceof Element)) {
            console.warn('SafeDOM.setTextContent: Invalid element provided');
            return;
        }
        
        const sanitizedText = InputSanitizer.sanitizeText(text, false);
        element.textContent = sanitizedText;
    }
    
    /**
     * Safely set innerHTML with sanitization
     * @param {Element} element - DOM element
     * @param {string} html - HTML to set
     * @param {boolean} allowBasicHtml - Whether to allow basic HTML tags
     */
    static setInnerHTML(element, html, allowBasicHtml = false) {
        if (!element || !(element instanceof Element)) {
            console.warn('SafeDOM.setInnerHTML: Invalid element provided');
            return;
        }
        
        const sanitizedHtml = InputSanitizer.sanitizeText(html, allowBasicHtml);
        element.innerHTML = sanitizedHtml;
    }
    
    /**
     * Safely create and append a text node
     * @param {Element} parent - Parent element
     * @param {string} text - Text content
     * @returns {Text} Created text node
     */
    static createTextNode(parent, text) {
        if (!parent || !(parent instanceof Element)) {
            console.warn('SafeDOM.createTextNode: Invalid parent element provided');
            return null;
        }
        
        const sanitizedText = InputSanitizer.sanitizeText(text, false);
        const textNode = document.createTextNode(sanitizedText);
        parent.appendChild(textNode);
        return textNode;
    }
    
    /**
     * Safely create an element with attributes
     * @param {string} tagName - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string} textContent - Text content
     * @returns {Element} Created element
     */
    static createElement(tagName, attributes = {}, textContent = '') {
        const element = document.createElement(tagName);
        
        // Set attributes safely
        for (const [key, value] of Object.entries(attributes)) {
            if (typeof value === 'string') {
                const sanitizedValue = InputSanitizer.sanitizeText(value, false);
                element.setAttribute(key, sanitizedValue);
            }
        }
        
        // Set text content safely
        if (textContent) {
            SafeDOM.setTextContent(element, textContent);
        }
        
        return element;
    }
    
    /**
     * Safely update table cell content
     * @param {HTMLTableCellElement} cell - Table cell element
     * @param {string} content - Content to set
     * @param {string} type - Content type ('text', 'badge', 'button')
     */
    static updateTableCell(cell, content, type = 'text') {
        if (!cell || !(cell instanceof HTMLTableCellElement)) {
            console.warn('SafeDOM.updateTableCell: Invalid cell element provided');
            return;
        }
        
        const sanitizedContent = InputSanitizer.sanitizeText(content, false);
        
        switch (type) {
            case 'badge':
                cell.innerHTML = `<span class="badge">${sanitizedContent}</span>`;
                break;
            case 'button':
                cell.innerHTML = `<button class="btn-icon" title="${sanitizedContent}"><i class="fas fa-edit"></i></button>`;
                break;
            default:
                cell.textContent = sanitizedContent;
        }
    }
    
    /**
     * Safely populate a table with data
     * @param {HTMLTableElement} table - Table element
     * @param {Array} data - Array of data objects
     * @param {Array} columns - Column definitions
     */
    static populateTable(table, data, columns) {
        if (!table || !(table instanceof HTMLTableElement)) {
            console.warn('SafeDOM.populateTable: Invalid table element provided');
            return;
        }
        
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.warn('SafeDOM.populateTable: Table body not found');
            return;
        }
        
        // Clear existing content
        tbody.innerHTML = '';
        
        // Add rows safely
        data.forEach(rowData => {
            const row = document.createElement('tr');
            
            columns.forEach(column => {
                const cell = document.createElement('td');
                const value = rowData[column.key] || '';
                
                SafeDOM.updateTableCell(cell, value, column.type);
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
    }
}

/**
 * Secure Logging System
 */
class SecureLogger {
    constructor() {
        this.logs = [];
        this.config = SECURITY_CONFIG.LOGGING;
    }
    
    /**
     * Log an action securely
     * @param {string} action - Action being logged
     * @param {string} details - Action details
     * @param {string} severity - Log severity
     * @param {string} userId - User ID
     * @returns {Object} Log entry
     */
    log(action, details = '', severity = 'info', userId = null) {
        // Validate action
        if (!this.config.allowedLogActions.includes(action)) {
            console.warn(`SecureLogger: Invalid action "${action}"`);
            return null;
        }
        
        // Sanitize inputs
        const sanitizedAction = InputSanitizer.sanitizeText(action, false);
        const sanitizedDetails = InputSanitizer.sanitizeLogData(details);
        const sanitizedUserId = userId ? InputSanitizer.sanitizeText(userId, false) : this.getCurrentUser();
        
        // Truncate details if too long
        const truncatedDetails = sanitizedDetails.length > this.config.maxLogEntryLength 
            ? sanitizedDetails.substring(0, this.config.maxLogEntryLength) + '...'
            : sanitizedDetails;
        
        const logEntry = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            user: sanitizedUserId,
            action: sanitizedAction,
            details: truncatedDetails,
            severity: severity,
            ipAddress: this.getClientIP(),
            userAgent: this.getUserAgent(),
            status: 'success'
        };
        
        this.logs.unshift(logEntry);
        
        // Keep only recent logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(0, 1000);
        }
        
        // Save to localStorage
        this.saveLogs();
        
        return logEntry;
    }
    
    /**
     * Get current user safely
     * @returns {string} Current user identifier
     */
    getCurrentUser() {
        try {
            const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
            const boosterLoggedIn = sessionStorage.getItem('boosterLoggedIn');
            
            if (adminLoggedIn === 'true') {
                return 'admin';
            } else if (boosterLoggedIn === 'true') {
                const club = sessionStorage.getItem('boosterClub');
                return club ? `${InputSanitizer.sanitizeText(club, false)}admin` : 'booster-admin';
            }
            
            return 'unknown';
        } catch (error) {
            console.warn('SecureLogger: Error getting current user:', error);
            return 'unknown';
        }
    }
    
    /**
     * Get client IP (placeholder for frontend)
     * @returns {string} IP address
     */
    getClientIP() {
        return '127.0.0.1'; // In real implementation, this would come from server
    }
    
    /**
     * Get user agent safely
     * @returns {string} User agent string
     */
    getUserAgent() {
        try {
            return navigator.userAgent ? InputSanitizer.sanitizeText(navigator.userAgent, false) : '';
        } catch (error) {
            return '';
        }
    }
    
    /**
     * Save logs to localStorage
     */
    saveLogs() {
        try {
            localStorage.setItem('secureAdminLogs', JSON.stringify(this.logs));
        } catch (error) {
            console.warn('SecureLogger: Error saving logs:', error);
        }
    }
    
    /**
     * Load logs from localStorage
     */
    loadLogs() {
        try {
            const savedLogs = localStorage.getItem('secureAdminLogs');
            this.logs = savedLogs ? JSON.parse(savedLogs) : [];
        } catch (error) {
            console.warn('SecureLogger: Error loading logs:', error);
            this.logs = [];
        }
    }
    
    /**
     * Get filtered logs
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered logs
     */
    getFilteredLogs(filters = {}) {
        let filteredLogs = [...this.logs];
        
        if (filters.user) {
            const sanitizedUser = InputSanitizer.sanitizeText(filters.user, false);
            filteredLogs = filteredLogs.filter(log => log.user.includes(sanitizedUser));
        }
        
        if (filters.action) {
            const sanitizedAction = InputSanitizer.sanitizeText(filters.action, false);
            filteredLogs = filteredLogs.filter(log => log.action === sanitizedAction);
        }
        
        if (filters.dateFrom) {
            filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.dateFrom);
        }
        
        if (filters.dateTo) {
            filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.dateTo + 'T23:59:59.999Z');
        }
        
        return filteredLogs;
    }
    
    /**
     * Export logs safely
     * @param {string} format - Export format
     * @returns {string} Exported log data
     */
    exportLogs(format = 'json') {
        const logs = this.getFilteredLogs();
        
        switch (format) {
            case 'csv':
                return this.exportToCSV(logs);
            case 'txt':
                return this.exportToTXT(logs);
            default:
                return JSON.stringify(logs, null, 2);
        }
    }
    
    /**
     * Export to CSV format
     * @param {Array} logs - Logs to export
     * @returns {string} CSV content
     */
    exportToCSV(logs) {
        const headers = ['Timestamp', 'User', 'Action', 'Details', 'Severity', 'IP Address', 'User Agent', 'Status'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                log.timestamp,
                log.user,
                log.action,
                `"${log.details.replace(/"/g, '""')}"`,
                log.severity,
                log.ipAddress,
                `"${log.userAgent.replace(/"/g, '""')}"`,
                log.status
            ].join(','))
        ].join('\n');
        
        return csvContent;
    }
    
    /**
     * Export to TXT format
     * @param {Array} logs - Logs to export
     * @returns {string} TXT content
     */
    exportToTXT(logs) {
        return logs.map(log => 
            `[${log.timestamp}] [${log.user}] [${log.action.toUpperCase()}] [${log.severity.toUpperCase()}] ${log.details} | IP: ${log.ipAddress} | UA: ${log.userAgent}`
        ).join('\n');
    }
}

/**
 * Form Security Handler
 */
class SecureFormHandler {
    /**
     * Secure form submission
     * @param {HTMLFormElement} form - Form element
     * @param {Object} validationRules - Validation rules
     * @param {Function} onSubmit - Submit handler
     */
    static handleForm(form, validationRules, onSubmit) {
        if (!form || !(form instanceof HTMLFormElement)) {
            console.warn('SecureFormHandler: Invalid form element provided');
            return;
        }
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Validate form data
            const validation = InputValidator.validateForm(data, validationRules);
            
            if (!validation.isValid) {
                SecureFormHandler.displayValidationErrors(validation.errors);
                return;
            }
            
            // Sanitize form data
            const sanitizedData = SecureFormHandler.sanitizeFormData(data);
            
            // Call submit handler
            if (typeof onSubmit === 'function') {
                onSubmit(sanitizedData);
            }
        });
    }
    
    /**
     * Sanitize form data
     * @param {Object} data - Form data
     * @returns {Object} Sanitized data
     */
    static sanitizeFormData(data) {
        const sanitized = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                // Apply appropriate sanitization based on field type
                if (key.toLowerCase().includes('email')) {
                    sanitized[key] = InputSanitizer.sanitizeEmail(value);
                } else if (key.toLowerCase().includes('phone')) {
                    sanitized[key] = InputSanitizer.sanitizePhone(value);
                } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price')) {
                    sanitized[key] = InputSanitizer.sanitizeAmount(value);
                } else if (key.toLowerCase().includes('tax') || key.toLowerCase().includes('ein') || key.toLowerCase().includes('ssn')) {
                    sanitized[key] = InputSanitizer.sanitizeTaxId(value);
                } else if (key.toLowerCase().includes('zip')) {
                    sanitized[key] = InputSanitizer.sanitizeText(value, false);
                } else if (key.toLowerCase().includes('address')) {
                    sanitized[key] = InputSanitizer.sanitizeAddress(value);
                } else {
                    sanitized[key] = InputSanitizer.sanitizeText(value, false);
                }
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }
    
    /**
     * Display validation errors
     * @param {Object} errors - Validation errors
     */
    static displayValidationErrors(errors) {
        // Clear existing error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Display new error messages
        for (const [fieldName, fieldErrors] of Object.entries(errors)) {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = fieldErrors.join(', ');
                errorDiv.style.cssText = 'color: #dc2626; font-size: 0.875rem; margin-top: 0.25rem;';
                
                field.parentNode.appendChild(errorDiv);
            }
        }
    }
    
    /**
     * Clear validation errors
     */
    static clearValidationErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }
}

/**
 * Security Message Display
 */
class SecurityMessage {
    /**
     * Show security message
     * @param {string} message - Message to display
     * @param {string} type - Message type
     * @param {number} duration - Display duration in milliseconds
     */
    static show(message, type = 'info', duration = 3000) {
        const sanitizedMessage = InputSanitizer.sanitizeText(message, false);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `security-message security-message-${type}`;
        messageDiv.textContent = sanitizedMessage;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                messageDiv.style.backgroundColor = '#10b981';
                break;
            case 'error':
                messageDiv.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                messageDiv.style.backgroundColor = '#f59e0b';
                break;
            default:
                messageDiv.style.backgroundColor = '#3b82f6';
        }
        
        // Add to page
        document.body.appendChild(messageDiv);
        
        // Remove after duration
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, duration);
    }
}

// Add CSS animations for security messages
const securityMessageStyles = document.createElement('style');
securityMessageStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .error {
        border-color: #ef4444 !important;
    }
    
    .error-message {
        color: #dc2626;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
`;
document.head.appendChild(securityMessageStyles);

// Export security utilities for use in other files
window.SecurityUtils = {
    InputSanitizer,
    InputValidator,
    SafeDOM,
    SecureLogger,
    SecureFormHandler,
    SecurityMessage,
    SECURITY_CONFIG
};

// Initialize secure logger
window.secureLogger = new SecureLogger();
window.secureLogger.loadLogs();

// Log security utilities initialization
window.secureLogger.log('security-init', 'Security utilities initialized', 'info'); 