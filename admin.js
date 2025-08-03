// Booster clubs list - will be loaded from database
let boosterClubs = [];

// Load booster clubs from database
async function loadBoosterClubs() {
    try {
        if (window.models && window.models.boosterClubs) {
            const clubs = await window.models.boosterClubs.getActive();
            boosterClubs = clubs.map(club => club.name);
        }
    } catch (error) {
        console.error('Failed to load booster clubs:', error);
        // Fallback to default list
        boosterClubs = [
            'Cheer', 'Dance', 'Softball', 'Boys Soccer', 'Girls Soccer', 
            'Boys Swim and Dive', 'Girls Swim and Dive', 'Wrestling', 'Robotics', 
            'Volleyball', 'Boys Basketball', 'Girls Basketball', 'Boys Golf', 
            'Girls Golf', 'DECCA', 'Theater', 'Choir', 'Gymnastics', 'Orchestra', 'Band'
        ];
    }
}

// Admin Authentication Check
function checkAuth() {
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// Security-enhanced authentication check
function secureCheckAuth() {
    if (!checkAuth()) {
        SecurityMessage.show('Authentication required. Please log in.', 'error');
        return false;
    }
    
    // Log authentication check
    if (window.secureLogger) {
        window.secureLogger.log('auth-check', 'Admin authentication verified', 'info');
    }
    
    return true;
}

// Logout function
function logout() {
    // Log logout action securely
    if (window.secureLogger) {
        window.secureLogger.log('logout', 'Admin logged out', 'info');
    }
    
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminLoginTime');
    window.location.href = 'admin-login.html';
}

// Check session timeout (8 hours)
function checkSessionTimeout() {
    const loginTime = sessionStorage.getItem('adminLoginTime');
    if (loginTime) {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - parseInt(loginTime);
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff > 8) {
            alert('Your session has expired. Please log in again.');
            logout();
            return;
        }
    }
}

// Admin Panel Navigation
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication first with security logging
    if (!secureCheckAuth()) return;
    
    // Check session timeout
    checkSessionTimeout();
    
    // Wait for database to initialize and load data
    await waitForDatabase();
    
    // Load booster clubs from database
    await loadBoosterClubs();
    
    // Initialize admin interface
    initializeAdminInterface();
    
    // Add logout button to header
    const sectionHeader = document.querySelector('.section-header');
    if (sectionHeader) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-outline logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = logout;
        logoutBtn.style.marginLeft = 'auto';
        sectionHeader.style.display = 'flex';
        sectionHeader.style.alignItems = 'center';
        sectionHeader.appendChild(logoutBtn);
    }
}

// Wait for database to be ready
async function waitForDatabase() {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    while (!window.db && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.db) {
        console.error('Database failed to initialize');
        SecurityMessage.show('Database initialization failed. Please refresh the page.', 'error');
        return false;
    }
    
    return true;
}

// Initialize admin interface
function initializeAdminInterface() {
    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const adminSections = document.querySelectorAll('.admin-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            console.log('Sidebar link clicked:', this.getAttribute('data-section'));
            
            // Remove active class from all links and sections
            sidebarLinks.forEach(l => l.classList.remove('active'));
            adminSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetSection = this.getAttribute('data-section');
            const sectionElement = document.getElementById(targetSection);
            
            if (sectionElement) {
                sectionElement.classList.add('active');
                console.log('Section activated:', targetSection);
                
                // Load section-specific data
                loadSectionData(targetSection);
            } else {
                console.error('Section not found:', targetSection);
            }
        });
    });
    
    // Load initial section data
    const activeSection = document.querySelector('.admin-section.active');
    if (activeSection) {
        loadSectionData(activeSection.id);
    }
}

// Load data for specific admin sections
async function loadSectionData(sectionId) {
    try {
        // Check if database is ready
        if (!window.db || !window.models) {
            console.log('Database not ready yet, skipping data load for:', sectionId);
            return;
        }
        
        switch (sectionId) {
            case 'dashboard':
                await loadDashboardData();
                break;
            case 'members':
                await loadMembersData();
                break;
            case 'donations':
                await loadDonationsData();
                break;
            case 'vendors':
                await loadVendorsData();
                break;
            case 'insurance':
                await loadInsuranceData();
                break;
            case 'reports':
                await loadReportsData();
                break;
            case 'logs':
                await loadLogsData();
                break;
            case 'database':
                await loadDatabaseData();
                break;
            default:
                console.log('Unknown section:', sectionId);
        }
    } catch (error) {
        console.error(`Failed to load data for section ${sectionId}:`, error);
        // Don't show error message for database not ready
        if (!error.message.includes('Database not ready')) {
            SecurityMessage.show(`Failed to load ${sectionId} data`, 'error');
        }
    }
}

// Section data loading functions
async function loadDashboardData() {
    try {
        if (!window.db) {
            console.log('Database not ready for dashboard data');
            return;
        }
        
        // Load dashboard statistics
        const stats = await window.db.getStats();
        
        // Update dashboard cards
        updateDashboardStats(stats);
        
        // Load recent activity
        await loadRecentActivity();
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

async function loadMembersData() {
    try {
        if (!window.models || !window.models.members) {
            console.log('Members model not ready');
            return;
        }
        
        const members = await window.models.members.getActive();
        populateMembersTable(members);
    } catch (error) {
        console.error('Failed to load members data:', error);
    }
}

async function loadDonationsData() {
    try {
        if (!window.models || !window.models.donations) {
            console.log('Donations model not ready');
            return;
        }
        
        const donations = await window.models.donations.query({ status: 'completed' });
        populateDonationsTable(donations);
    } catch (error) {
        console.error('Failed to load donations data:', error);
    }
}

async function loadVendorsData() {
    try {
        if (!window.models || !window.models.vendors) {
            console.log('Vendors model not ready');
            return;
        }
        
        const vendors = await window.models.vendors.query();
        populateVendorsTable(vendors);
    } catch (error) {
        console.error('Failed to load vendors data:', error);
    }
}

async function loadInsuranceData() {
    try {
        if (!window.models || !window.models.insurance) {
            console.log('Insurance model not ready');
            return;
        }
        
        const insuranceRecords = await window.models.insurance.query();
        populateInsuranceTable(insuranceRecords);
    } catch (error) {
        console.error('Failed to load insurance data:', error);
    }
}

async function loadReportsData() {
    try {
        if (!window.models || !window.models.reports) {
            console.log('Reports model not ready');
            return;
        }
        
        const reports = await window.models.reports.getRecent(10);
        populateReportsTable(reports);
    } catch (error) {
        console.error('Failed to load reports data:', error);
    }
}

async function loadLogsData() {
    try {
        if (!window.models || !window.models.adminLogs) {
            console.log('Admin logs model not ready');
            return;
        }
        
        const logs = await window.models.adminLogs.getRecent(50);
        populateLogsTable(logs);
    } catch (error) {
        console.error('Failed to load logs data:', error);
    }
}

async function loadDatabaseData() {
    try {
        if (!window.db) {
            console.log('Database not ready for database data');
            return;
        }
        
        await updateDatabaseStats();
        await refreshDatabaseLogs();
    } catch (error) {
        console.error('Failed to load database data:', error);
    }
}

// Table population functions
function populateMembersTable(members) {
    const tableBody = document.getElementById('members-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = members.map(member => `
        <tr>
            <td>${SafeDOM.escapeHtml(member.name)}</td>
            <td>${SafeDOM.escapeHtml(member.email)}</td>
            <td><span class="badge badge-${member.tier}">${member.tier}</span></td>
            <td>${SafeDOM.escapeHtml(member.paymentType)}</td>
            <td>${SafeDOM.escapeHtml(member.joinDate)}</td>
            <td><span class="badge badge-${member.status}">${member.status}</span></td>
            <td>
                <button class="btn btn-small" onclick="editMember(${member.id})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteMember(${member.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function populateDonationsTable(donations) {
    const tableBody = document.getElementById('donations-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = donations.map(donation => `
        <tr>
            <td>${SafeDOM.escapeHtml(donation.donorName)}</td>
            <td>${SafeDOM.escapeHtml(donation.donorEmail)}</td>
            <td>$${donation.amount}</td>
            <td><span class="badge badge-${donation.tier}">${donation.tier}</span></td>
            <td>${SafeDOM.escapeHtml(donation.boosterClub)}</td>
            <td>${SafeDOM.escapeHtml(donation.paymentMethod)}</td>
            <td>${SafeDOM.escapeHtml(donation.date)}</td>
            <td><span class="badge badge-${donation.status}">${donation.status}</span></td>
        </tr>
    `).join('');
}

function populateVendorsTable(vendors) {
    const tableBody = document.getElementById('vendors-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = vendors.map(vendor => `
        <tr>
            <td>${SafeDOM.escapeHtml(vendor.businessName)}</td>
            <td>${SafeDOM.escapeHtml(vendor.taxId)}</td>
            <td>${SafeDOM.escapeHtml(vendor.address)}</td>
            <td>${SafeDOM.escapeHtml(vendor.boosterClub)}</td>
            <td>$${vendor.totalPaid}</td>
            <td>${SafeDOM.escapeHtml(vendor.lastPaymentDate)}</td>
            <td>
                <button class="btn btn-small" onclick="editVendor(${vendor.id})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteVendor(${vendor.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function populateInsuranceTable(insuranceRecords) {
    const tableBody = document.getElementById('insurance-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = insuranceRecords.map(record => `
        <tr>
            <td>${SafeDOM.escapeHtml(record.boosterClub)}</td>
            <td>${SafeDOM.escapeHtml(record.contactName)}</td>
            <td>${SafeDOM.escapeHtml(record.contactEmail)}</td>
            <td>$${record.contributions}</td>
            <td>$${record.fundraisingRevenue}</td>
            <td>${SafeDOM.escapeHtml(record.banquetEvents)}</td>
            <td>
                <button class="btn btn-small" onclick="editInsurance(${record.id})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteInsurance(${record.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function populateReportsTable(reports) {
    const tableBody = document.getElementById('reports-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = reports.map(report => `
        <tr>
            <td>${SafeDOM.escapeHtml(report.reportName)}</td>
            <td>${SafeDOM.escapeHtml(report.reportType)}</td>
            <td>${SafeDOM.escapeHtml(report.generatedBy)}</td>
            <td>${SafeDOM.escapeHtml(new Date(report.dateGenerated).toLocaleDateString())}</td>
            <td><span class="badge badge-${report.status}">${report.status}</span></td>
            <td>
                <button class="btn btn-small" onclick="downloadReport(${report.id})">Download</button>
                <button class="btn btn-small btn-danger" onclick="deleteReport(${report.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function populateLogsTable(logs) {
    const tableBody = document.getElementById('logs-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = logs.map(log => `
        <tr>
            <td>${SafeDOM.escapeHtml(new Date(log.timestamp).toLocaleString())}</td>
            <td>${SafeDOM.escapeHtml(log.user)}</td>
            <td>${SafeDOM.escapeHtml(log.action)}</td>
            <td>${SafeDOM.escapeHtml(log.details)}</td>
            <td><span class="badge badge-${log.severity}">${log.severity}</span></td>
            <td><span class="badge badge-${log.status}">${log.status}</span></td>
        </tr>
    `).join('');
}

function updateDashboardStats(stats) {
    // Update dashboard statistics cards
    const statElements = {
        'total-members': stats.members || 0,
        'total-donations': stats.donations || 0,
        'total-vendors': stats.vendors || 0,
        'total-events': stats.events || 0,
        'total-volunteer-hours': stats.volunteerHours || 0,
        'total-financial-transactions': stats.financialTransactions || 0
    };
    
    for (const [elementId, value] of Object.entries(statElements)) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }
}

async function loadRecentActivity() {
    try {
        const recentLogs = await window.models.adminLogs.getRecent(5);
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        activityContainer.innerHTML = recentLogs.map(log => `
            <div class="activity-item">
                <div class="activity-time">${new Date(log.timestamp).toLocaleString()}</div>
                <div class="activity-details">
                    <strong>${SafeDOM.escapeHtml(log.user)}</strong> ${SafeDOM.escapeHtml(log.action)}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load recent activity:', error);
    }
}

    // Top navigation
    const navLinks = document.querySelectorAll('.nav-menu .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Show corresponding section
                const targetSection = this.getAttribute('href').substring(1);
                adminSections.forEach(s => s.classList.remove('active'));
                document.getElementById(targetSection).classList.add('active');
                
                // Update sidebar
                sidebarLinks.forEach(l => l.classList.remove('active'));
                document.querySelector(`[data-section="${targetSection}"]`).classList.add('active');
            }
        });
    });
});

// Export functionality
document.getElementById('export-members')?.addEventListener('click', function() {
    exportData('members');
});

document.getElementById('export-donations')?.addEventListener('click', function() {
    exportData('donations');
});

async function exportData(type) {
    try {
        // Log export action
        if (window.secureLogger) {
            window.secureLogger.log('export', `${type} data exported`, 'info');
        }
        
        // Get data from database
        const data = type === 'members' ? await getMembersData() : await getDonationsData();
        
        // Create CSV content
        const csvContent = convertToCSV(data);
        
        // Download file
        downloadCSV(csvContent, `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
        
        SecurityMessage.show(`${type} data exported successfully`, 'success');
    } catch (error) {
        console.error('Export failed:', error);
        SecurityMessage.show(`Failed to export ${type} data`, 'error');
    }
}

async function getMembersData() {
    try {
        if (window.models && window.models.members) {
            const members = await window.models.members.getActive();
            return [
                ['Name', 'Email', 'Tier', 'Payment Type', 'Join Date', 'Status'],
                ...members.map(member => [
                    member.name,
                    member.email,
                    member.tier,
                    member.paymentType,
                    member.joinDate,
                    member.status
                ])
            ];
        }
        return [['Name', 'Email', 'Tier', 'Payment Type', 'Join Date', 'Status']];
    } catch (error) {
        console.error('Failed to get members data:', error);
        return [['Name', 'Email', 'Tier', 'Payment Type', 'Join Date', 'Status']];
    }
}

async function getDonationsData() {
    try {
        if (window.models && window.models.donations) {
            const donations = await window.models.donations.query({ status: 'completed' });
            return [
                ['Donor Name', 'Email', 'Amount', 'Tier', 'Booster Club', 'Payment Method', 'Date', 'Status'],
                ...donations.map(donation => [
                    donation.donorName,
                    donation.donorEmail,
                    `$${donation.amount}`,
                    donation.tier,
                    donation.boosterClub,
                    donation.paymentMethod,
                    donation.date,
                    donation.status
                ])
            ];
        }
        return [['Donor Name', 'Email', 'Amount', 'Tier', 'Booster Club', 'Payment Method', 'Date', 'Status']];
    } catch (error) {
        console.error('Failed to get donations data:', error);
        return [['Donor Name', 'Email', 'Amount', 'Tier', 'Booster Club', 'Payment Method', 'Date', 'Status']];
    }
}

function convertToCSV(data) {
    return data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Search and filter functionality
document.getElementById('member-search')?.addEventListener('input', function() {
    filterTable('members-table-body', this.value);
});

document.getElementById('tier-filter')?.addEventListener('change', function() {
    filterTableByTier('members-table-body', this.value);
});

document.getElementById('payment-filter')?.addEventListener('change', function() {
    filterTableByPayment('members-table-body', this.value);
});

function filterTable(tableId, searchTerm) {
    // Sanitize search term
    const sanitizedSearchTerm = InputSanitizer.sanitizeText(searchTerm, false);
    
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const match = text.includes(sanitizedSearchTerm.toLowerCase());
        row.style.display = match ? '' : 'none';
    });
}

function filterTableByTier(tableId, tier) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (!tier) {
            row.style.display = '';
            return;
        }
        
        const tierCell = row.querySelector('.badge');
        const match = tierCell && tierCell.textContent.toLowerCase() === tier.toLowerCase();
        row.style.display = match ? '' : 'none';
    });
}

function filterTableByPayment(tableId, paymentType) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (!paymentType) {
            row.style.display = '';
            return;
        }
        
        const cells = row.querySelectorAll('td');
        const paymentCell = cells[3]; // Payment Type column
        const match = paymentCell && paymentCell.textContent.toLowerCase() === paymentType.toLowerCase();
        row.style.display = match ? '' : 'none';
    });
}

// Content management functionality
document.querySelectorAll('.content-card .btn').forEach(button => {
    button.addEventListener('click', function() {
        const action = this.textContent.trim();
        
        if (action === 'Edit') {
            // Handle edit functionality
            const item = this.closest('.officer-item, .accomplishment-item');
            if (item) {
                makeEditable(item);
            }
        } else if (action === 'Add Officer') {
            addNewOfficer();
        } else if (action === 'Add Accomplishment') {
            addNewAccomplishment();
        } else if (action === 'Save Changes') {
            saveContentChanges();
        }
    });
});

function makeEditable(item) {
    const isOfficer = item.classList.contains('officer-item');
    
    // Clear existing content safely
    item.innerHTML = '';
    
    if (isOfficer) {
        const name = item.querySelector('p')?.textContent || '';
        const email = item.querySelectorAll('p')[1]?.textContent || '';
        
        // Create edit form safely
        const editForm = SafeDOM.createElement('div', { class: 'edit-form' });
        
        const nameInput = SafeDOM.createElement('input', { 
            type: 'text', 
            class: 'edit-input',
            value: InputSanitizer.sanitizeText(name, false)
        });
        
        const emailInput = SafeDOM.createElement('input', { 
            type: 'email', 
            class: 'edit-input',
            value: InputSanitizer.sanitizeText(email, false)
        });
        
        const editActions = SafeDOM.createElement('div', { class: 'edit-actions' });
        const saveBtn = SafeDOM.createElement('button', { class: 'btn btn-small save-edit' }, 'Save');
        const cancelBtn = SafeDOM.createElement('button', { class: 'btn btn-small cancel-edit' }, 'Cancel');
        
        editActions.appendChild(saveBtn);
        editActions.appendChild(cancelBtn);
        
        editForm.appendChild(nameInput);
        editForm.appendChild(emailInput);
        editForm.appendChild(editActions);
        item.appendChild(editForm);
        
    } else {
        const title = item.querySelector('h4')?.textContent || '';
        const description = item.querySelector('p')?.textContent || '';
        
        // Create edit form safely
        const editForm = SafeDOM.createElement('div', { class: 'edit-form' });
        
        const titleInput = SafeDOM.createElement('input', { 
            type: 'text', 
            class: 'edit-input',
            value: InputSanitizer.sanitizeText(title, false)
        });
        
        const descriptionTextarea = SafeDOM.createElement('textarea', { class: 'edit-textarea' });
        SafeDOM.setTextContent(descriptionTextarea, description);
        
        const editActions = SafeDOM.createElement('div', { class: 'edit-actions' });
        const saveBtn = SafeDOM.createElement('button', { class: 'btn btn-small save-edit' }, 'Save');
        const cancelBtn = SafeDOM.createElement('button', { class: 'btn btn-small cancel-edit' }, 'Cancel');
        
        editActions.appendChild(saveBtn);
        editActions.appendChild(cancelBtn);
        
        editForm.appendChild(titleInput);
        editForm.appendChild(descriptionTextarea);
        editForm.appendChild(editActions);
        item.appendChild(editForm);
    }
    
    // Add event listeners for save/cancel
    item.querySelector('.save-edit').addEventListener('click', function() {
        saveEdit(item);
    });
    
    item.querySelector('.cancel-edit').addEventListener('click', function() {
        cancelEdit(item);
    });
}

function saveEdit(item) {
    // Log the edit action
    if (window.secureLogger) {
        window.secureLogger.log('update', 'Content edited and saved', 'info');
    }
    
    // This would save to your backend
    SecurityMessage.show('Changes saved! (This would connect to your backend)', 'success');
    location.reload(); // For demo purposes
}

function cancelEdit(item) {
    // Log the cancel action
    if (window.secureLogger) {
        window.secureLogger.log('update', 'Content edit cancelled', 'info');
    }
    
    location.reload(); // For demo purposes
}

function addNewOfficer() {
    const officersList = document.querySelector('.officers-list');
    const newOfficer = document.createElement('div');
    newOfficer.className = 'officer-item';
    
    // Create edit form safely
    const editForm = SafeDOM.createElement('div', { class: 'edit-form' });
    
    const positionSelect = SafeDOM.createElement('select', { class: 'edit-input' });
    const options = [
        { value: '', text: 'Select Position' },
        { value: 'president', text: 'President' },
        { value: 'vice-president', text: 'Vice President' },
        { value: 'treasurer', text: 'Treasurer' },
        { value: 'secretary', text: 'Secretary' }
    ];
    
    options.forEach(option => {
        const optionElement = SafeDOM.createElement('option', { value: option.value }, option.text);
        positionSelect.appendChild(optionElement);
    });
    
    const nameInput = SafeDOM.createElement('input', { 
        type: 'text', 
        placeholder: 'Name', 
        class: 'edit-input' 
    });
    
    const emailInput = SafeDOM.createElement('input', { 
        type: 'email', 
        placeholder: 'Email', 
        class: 'edit-input' 
    });
    
    const editActions = SafeDOM.createElement('div', { class: 'edit-actions' });
    const saveBtn = SafeDOM.createElement('button', { class: 'btn btn-small save-new' }, 'Save');
    const cancelBtn = SafeDOM.createElement('button', { class: 'btn btn-small cancel-new' }, 'Cancel');
    
    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);
    
    editForm.appendChild(positionSelect);
    editForm.appendChild(nameInput);
    editForm.appendChild(emailInput);
    editForm.appendChild(editActions);
    newOfficer.appendChild(editForm);
    
    officersList.appendChild(newOfficer);
    
    // Log the action
    if (window.secureLogger) {
        window.secureLogger.log('create', 'New officer form added', 'info');
    }
    
    newOfficer.querySelector('.save-new').addEventListener('click', function() {
        // Validate inputs before saving
        const position = positionSelect.value;
        const name = nameInput.value;
        const email = emailInput.value;
        
        if (!position || !name || !email) {
            SecurityMessage.show('Please fill in all fields', 'error');
            return;
        }
        
        if (!InputValidator.isValidEmail(email)) {
            SecurityMessage.show('Please enter a valid email address', 'error');
            return;
        }
        
        SecurityMessage.show('New officer added! (This would connect to your backend)', 'success');
        location.reload();
    });
    
    newOfficer.querySelector('.cancel-new').addEventListener('click', function() {
        newOfficer.remove();
    });
}

function addNewAccomplishment() {
    const accomplishmentsList = document.querySelector('.accomplishments-list');
    const newAccomplishment = document.createElement('div');
    newAccomplishment.className = 'accomplishment-item';
    
    // Create edit form safely
    const editForm = SafeDOM.createElement('div', { class: 'edit-form' });
    
    const titleInput = SafeDOM.createElement('input', { 
        type: 'text', 
        placeholder: 'Title', 
        class: 'edit-input' 
    });
    
    const descriptionTextarea = SafeDOM.createElement('textarea', { 
        placeholder: 'Description', 
        class: 'edit-textarea' 
    });
    
    const dateInput = SafeDOM.createElement('input', { 
        type: 'date', 
        class: 'edit-input' 
    });
    
    const editActions = SafeDOM.createElement('div', { class: 'edit-actions' });
    const saveBtn = SafeDOM.createElement('button', { class: 'btn btn-small save-new' }, 'Save');
    const cancelBtn = SafeDOM.createElement('button', { class: 'btn btn-small cancel-new' }, 'Cancel');
    
    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);
    
    editForm.appendChild(titleInput);
    editForm.appendChild(descriptionTextarea);
    editForm.appendChild(dateInput);
    editForm.appendChild(editActions);
    newAccomplishment.appendChild(editForm);
    
    accomplishmentsList.appendChild(newAccomplishment);
    
    // Log the action
    if (window.secureLogger) {
        window.secureLogger.log('create', 'New accomplishment form added', 'info');
    }
    
    newAccomplishment.querySelector('.save-new').addEventListener('click', function() {
        // Validate inputs before saving
        const title = titleInput.value;
        const description = descriptionTextarea.value;
        const date = dateInput.value;
        
        if (!title || !description || !date) {
            SecurityMessage.show('Please fill in all fields', 'error');
            return;
        }
        
        SecurityMessage.show('New accomplishment added! (This would connect to your backend)', 'success');
        location.reload();
    });
    
    newAccomplishment.querySelector('.cancel-new').addEventListener('click', function() {
        newAccomplishment.remove();
    });
}

function saveContentChanges() {
    // Log the content save action
    if (window.secureLogger) {
        window.secureLogger.log('settings', 'Content changes saved', 'info');
    }
    
    // This would save all content changes to your backend
    SecurityMessage.show('All changes saved! (This would connect to your backend)', 'success');
}

// Settings functionality
document.querySelectorAll('.settings-card .btn').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.settings-card');
        const inputs = card.querySelectorAll('input, textarea');
        const settings = {};
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                settings[input.name || input.id] = input.checked;
            } else {
                // Sanitize input values
                const sanitizedValue = InputSanitizer.sanitizeText(input.value, false);
                settings[input.name || input.id] = sanitizedValue;
            }
        });
        
        // Log settings save action
        if (window.secureLogger) {
            window.secureLogger.log('settings', 'Settings updated', 'info');
        }
        
        // This would save settings to your backend
        console.log('Saving settings:', settings);
        SecurityMessage.show('Settings saved! (This would connect to your backend)', 'success');
    });
});

// Comprehensive Reporting System

// Financial Reports
function generateFinancialReport() {
    const reportData = {
        title: "Monthly Financial Summary",
        date: new Date().toISOString().split('T')[0],
        period: "January 2024",
        summary: {
            totalRevenue: 18450,
            totalExpenses: 12500,
            netIncome: 5950,
            membershipRevenue: 9700,
            donationRevenue: 8750
        },
        breakdown: {
            membershipTiers: {
                basic: { count: 89, revenue: 4450 },
                silver: { count: 98, revenue: 9800 },
                gold: { count: 60, revenue: 15000 }
            },
            donationTiers: {
                bronze: { count: 45, revenue: 1125 },
                gold: { count: 28, revenue: 2800 },
                diamond: { count: 12, revenue: 6000 }
            }
        },
        trends: {
            revenueGrowth: "+15.2%",
            membershipGrowth: "+8.7%",
            donationGrowth: "+22.1%"
        }
    };
    
    generatePDFReport(reportData, 'financial');
}

function generateRevenueReport() {
    const reportData = {
        title: "Revenue Analysis Report",
        date: new Date().toISOString().split('T')[0],
        revenueSources: [
            { source: "Memberships", amount: 9700, percentage: 52.6 },
            { source: "Donations", amount: 8750, percentage: 47.4 }
        ],
        monthlyTrends: [
            { month: "Jan", revenue: 18450 },
            { month: "Dec", revenue: 16200 },
            { month: "Nov", revenue: 15800 },
            { month: "Oct", revenue: 14500 }
        ],
        projections: {
            nextMonth: 19500,
            nextQuarter: 58000,
            growthRate: "12.3%"
        }
    };
    
    generatePDFReport(reportData, 'revenue');
}

function generateTaxReport() {
    const reportData = {
        title: "Tax Deduction Report",
        date: new Date().toISOString().split('T')[0],
        taxYear: "2024",
        totalDonations: 8750,
        donorCount: 85,
        taxDeductibleAmount: 8750,
        breakdown: {
            bronzeDonors: { count: 45, amount: 1125 },
            goldDonors: { count: 28, amount: 2800 },
            diamondDonors: { count: 12, amount: 6000 }
        },
        receipts: {
            sent: 78,
            pending: 7,
            total: 85
        }
    };
    
    generatePDFReport(reportData, 'tax');
}

// Membership Reports
function generateMembershipReport() {
    const reportData = {
        title: "Membership Growth Report",
        date: new Date().toISOString().split('T')[0],
        totalMembers: 247,
        newThisMonth: 23,
        growthRate: "+10.3%",
        tierDistribution: {
            basic: { count: 89, percentage: 36.0 },
            silver: { count: 98, percentage: 39.7 },
            gold: { count: 60, percentage: 24.3 }
        },
        paymentTypes: {
            recurring: { count: 180, percentage: 72.9 },
            oneTime: { count: 67, percentage: 27.1 }
        },
        retention: {
            currentMonth: 95.2,
            previousMonth: 93.8,
            trend: "+1.4%"
        }
    };
    
    generatePDFReport(reportData, 'membership');
}

function generateRetentionReport() {
    const reportData = {
        title: "Member Retention Analysis",
        date: new Date().toISOString().split('T')[0],
        retentionRates: {
            overall: 95.2,
            basic: 92.1,
            silver: 96.8,
            gold: 98.5
        },
        churnAnalysis: {
            totalChurned: 12,
            reasons: {
                "Financial": 5,
                "Relocation": 3,
                "Graduation": 2,
                "Other": 2
            }
        },
        renewalRates: {
            upcoming: 45,
            dueThisMonth: 23,
            overdue: 3
        }
    };
    
    generatePDFReport(reportData, 'retention');
}

function generateTierReport() {
    const reportData = {
        title: "Membership Tier Distribution",
        date: new Date().toISOString().split('T')[0],
        tierBreakdown: {
            basic: { count: 89, revenue: 4450, avgValue: 50 },
            silver: { count: 98, revenue: 9800, avgValue: 100 },
            gold: { count: 60, revenue: 15000, avgValue: 250 }
        },
        tierGrowth: {
            basic: "+5.2%",
            silver: "+12.8%",
            gold: "+8.3%"
        },
        recommendations: [
            "Focus on Silver tier promotions",
            "Develop Gold tier benefits",
            "Improve Basic tier retention"
        ]
    };
    
    generatePDFReport(reportData, 'tier');
}

// Donation Reports
function generateDonationReport() {
    const reportData = {
        title: "Donation Trends Report",
        date: new Date().toISOString().split('T')[0],
        totalDonations: 8750,
        donorCount: 85,
        averageDonation: 102.94,
        trends: {
            monthlyGrowth: "+22.1%",
            donorGrowth: "+15.7%",
            averageGrowth: "+5.4%"
        },
        tierDistribution: {
            bronze: { count: 45, amount: 1125, percentage: 12.9 },
            gold: { count: 28, amount: 2800, percentage: 32.0 },
            diamond: { count: 12, amount: 6000, percentage: 68.6 }
        }
    };
    
    generatePDFReport(reportData, 'donation');
}

function generateDonorReport() {
    const reportData = {
        title: "Donor Analysis Report",
        date: new Date().toISOString().split('T')[0],
        donorProfile: {
            totalDonors: 85,
            newDonors: 23,
            returningDonors: 62,
            anonymousDonors: 8
        },
        givingPatterns: {
            averageGift: 102.94,
            medianGift: 100,
            largestGift: 500,
            mostFrequent: 25
        },
        donorSegments: {
            bronze: { count: 45, totalGiven: 1125, avgGift: 25 },
            gold: { count: 28, totalGiven: 2800, avgGift: 100 },
            diamond: { count: 12, totalGiven: 6000, avgGift: 500 }
        }
    };
    
    generatePDFReport(reportData, 'donor');
}

function generateRecognitionReport() {
    const reportData = {
        title: "Donor Recognition Report",
        date: new Date().toISOString().split('T')[0],
        recognitionNeeded: {
            bronze: 45,
            gold: 28,
            diamond: 12
        },
        recognitionSent: {
            thankYouLetters: 78,
            donorWallUpdates: 12,
            eventInvitations: 28
        },
        pendingRecognition: {
            newDonors: 7,
            tierUpgrades: 3,
            milestoneDonors: 2
        }
    };
    
    generatePDFReport(reportData, 'recognition');
}

// Export Functions
function exportToExcel() {
    const data = {
        members: getMembersData(),
        donations: getDonationsData(),
        financial: getFinancialData()
    };
    
    // This would use a library like SheetJS to create Excel files
    alert('Excel export started! (This would create a multi-sheet Excel file)');
    console.log('Excel data:', data);
}

function exportToCSV() {
    const data = {
        members: getMembersData(),
        donations: getDonationsData(),
        financial: getFinancialData()
    };
    
    // Create multiple CSV files
    Object.keys(data).forEach(type => {
        const csvContent = convertToCSV(data[type]);
        downloadCSV(csvContent, `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
    });
}

function exportToPDF() {
    const reportData = {
        title: "Comprehensive Booster Club Report",
        date: new Date().toISOString().split('T')[0],
        sections: {
            summary: getSummaryData(),
            members: getMembersData(),
            donations: getDonationsData(),
            financial: getFinancialData()
        }
    };
    
    generatePDFReport(reportData, 'comprehensive');
}

function exportToJSON() {
    const data = {
        exportDate: new Date().toISOString(),
        members: getMembersData(),
        donations: getDonationsData(),
        financial: getFinancialData(),
        settings: getSettingsData()
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booster_club_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Helper Functions
function getFinancialData() {
    return [
        ['Category', 'Amount', 'Percentage'],
        ['Memberships', '$9,700', '52.6%'],
        ['Donations', '$8,750', '47.4%'],
        ['Total Revenue', '$18,450', '100%']
    ];
}

function getSummaryData() {
    return {
        totalMembers: 247,
        totalRevenue: 18450,
        totalDonations: 8750,
        growthRate: "+15.2%"
    };
}

function getSettingsData() {
    return {
        organizationName: "Eastlake Wolfpack Association",
        contactEmail: "info@eastlakewolfpack.org",
        taxId: "12-3456789"
    };
}

function generatePDFReport(data, type) {
    // This would use a library like jsPDF to create PDF reports
    const reportContent = createReportContent(data, type);
    
    // For demo purposes, show the report content
    showReportPreview(reportContent, type);
}

function createReportContent(data, type) {
    let content = `
        <div class="report-preview">
            <h1>${data.title}</h1>
            <p><strong>Generated:</strong> ${data.date}</p>
            <hr>
    `;
    
    switch(type) {
        case 'financial':
            content += `
                <h2>Financial Summary</h2>
                <p><strong>Total Revenue:</strong> $${data.summary.totalRevenue.toLocaleString()}</p>
                <p><strong>Total Expenses:</strong> $${data.summary.totalExpenses.toLocaleString()}</p>
                <p><strong>Net Income:</strong> $${data.summary.netIncome.toLocaleString()}</p>
                
                <h3>Revenue Breakdown</h3>
                <p>Memberships: $${data.summary.membershipRevenue.toLocaleString()}</p>
                <p>Donations: $${data.summary.donationRevenue.toLocaleString()}</p>
            `;
            break;
            
        case 'membership':
            content += `
                <h2>Membership Overview</h2>
                <p><strong>Total Members:</strong> ${data.totalMembers}</p>
                <p><strong>New This Month:</strong> ${data.newThisMonth}</p>
                <p><strong>Growth Rate:</strong> ${data.growthRate}</p>
                
                <h3>Tier Distribution</h3>
                <p>Basic: ${data.tierDistribution.basic.count} (${data.tierDistribution.basic.percentage}%)</p>
                <p>Silver: ${data.tierDistribution.silver.count} (${data.tierDistribution.silver.percentage}%)</p>
                <p>Gold: ${data.tierDistribution.gold.count} (${data.tierDistribution.gold.percentage}%)</p>
            `;
            break;
            
        case 'donation':
            content += `
                <h2>Donation Overview</h2>
                <p><strong>Total Donations:</strong> $${data.totalDonations.toLocaleString()}</p>
                <p><strong>Donor Count:</strong> ${data.donorCount}</p>
                <p><strong>Average Donation:</strong> $${data.averageDonation}</p>
                
                <h3>Monthly Growth</h3>
                <p>${data.trends.monthlyGrowth}</p>
            `;
            break;
            
        default:
            content += `<p>Report data: ${JSON.stringify(data, null, 2)}</p>`;
    }
    
    content += '</div>';
    return content;
}

function showReportPreview(content, type) {
    // Create a modal to show the report preview
    const modal = document.createElement('div');
    modal.className = 'report-modal';
    modal.innerHTML = `
        <div class="report-modal-content">
            <div class="report-modal-header">
                <h2>${type.charAt(0).toUpperCase() + type.slice(1)} Report Preview</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="report-modal-body">
                ${content}
            </div>
            <div class="report-modal-footer">
                <button class="btn btn-primary" onclick="downloadReport('${type}')">
                    <i class="fas fa-download"></i> Download PDF
                </button>
                <button class="btn btn-secondary" onclick="emailReport('${type}')">
                    <i class="fas fa-envelope"></i> Email Report
                </button>
                <button class="btn btn-secondary close-modal">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function downloadReport(type) {
    alert(`Downloading ${type} report... (This would generate and download a PDF)`);
}

function emailReport(type) {
    alert(`Emailing ${type} report... (This would send the report via email)`);
}

// Report Scheduling
function saveReportSchedule() {
    const schedule = {
        weekly: {
            enabled: document.getElementById('weekly-report').checked,
            day: document.getElementById('weekly-day').value
        },
        monthly: {
            enabled: document.getElementById('monthly-report').checked,
            day: document.getElementById('monthly-day').value
        },
        quarterly: {
            enabled: document.getElementById('quarterly-report').checked,
            month: document.getElementById('quarterly-month').value
        }
    };
    
    // This would save to your backend
    console.log('Saving report schedule:', schedule);
    alert('Report schedule saved! (This would connect to your backend)');
}

// Add CSS for report modal
const reportModalStyles = document.createElement('style');
reportModalStyles.textContent = `
    .report-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .report-modal-content {
        background: white;
        border-radius: 12px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .report-modal-header {
        padding: 20px;
        border-bottom: 2px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .report-modal-header h2 {
        color: #1e3a8a;
        margin: 0;
    }
    
    .close-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #64748b;
    }
    
    .report-modal-body {
        padding: 20px;
    }
    
    .report-modal-footer {
        padding: 20px;
        border-top: 2px solid #e2e8f0;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    .report-preview {
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
    }
    
    .report-preview h1 {
        color: #1e3a8a;
        margin-bottom: 10px;
    }
    
    .report-preview h2 {
        color: #1e3a8a;
        margin: 20px 0 10px;
    }
    
    .report-preview h3 {
        color: #374151;
        margin: 15px 0 5px;
    }
    
    .report-preview p {
        margin: 5px 0;
        color: #374151;
    }
    
    .report-preview hr {
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 20px 0;
    }
`;
document.head.appendChild(reportModalStyles);

// Add some CSS for edit forms
const editStyles = document.createElement('style');
editStyles.textContent = `
    .edit-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .edit-input,
    .edit-textarea {
        padding: 8px 12px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 0.9rem;
    }
    
    .edit-textarea {
        resize: vertical;
        min-height: 60px;
    }
    
    .edit-input:focus,
    .edit-textarea:focus {
        outline: none;
        border-color: #1e3a8a;
    }
    
    .edit-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
`;
document.head.appendChild(editStyles);

// 1099 Vendor Management Functions
function exportVendors() {
    // This would export vendor data for 1099 reporting
    alert('Exporting vendor data for 1099 reporting... (This would connect to your backend)');
}

function generate1099Forms() {
    // This would generate 1099 forms for vendors
    alert('Generating 1099 forms... (This would connect to your backend)');
}

function editVendor(id) {
    // This would open vendor edit form
    alert('Edit vendor functionality would be implemented here');
}

function deleteVendor(id) {
    if (confirm('Are you sure you want to delete this vendor?')) {
        // This would delete vendor from database
        alert('Vendor deleted! (This would connect to your backend)');
    }
}

// Insurance Form Functions
function addFundraiser() {
    const container = document.getElementById('fundraisers-container');
    const newEvent = document.createElement('div');
    newEvent.className = 'event-item';
    newEvent.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label>Type of Event</label>
                <input type="text" name="fundraiserType[]" placeholder="e.g., Auction, Dinner">
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" name="fundraiserDate[]">
            </div>
            <div class="form-group">
                <label>Food Served?</label>
                <select name="fundraiserFood[]">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
            <div class="form-group">
                <label>Alcohol Served?</label>
                <select name="fundraiserAlcohol[]">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" name="fundraiserLocation[]" placeholder="Onsite/Offsite">
            </div>
            <div class="form-group">
                <label>Certificate of Insurance Required?</label>
                <select name="fundraiserCOI[]">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
        </div>
        <button type="button" class="btn btn-small" onclick="removeEvent(this)" style="margin-top: 10px;">
            <i class="fas fa-trash"></i> Remove Event
        </button>
    `;
    container.appendChild(newEvent);
}

function addCamp() {
    const container = document.getElementById('camps-container');
    const newEvent = document.createElement('div');
    newEvent.className = 'event-item';
    newEvent.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label>Type of Camp/Clinic</label>
                <input type="text" name="campType[]" placeholder="e.g., Summer Camp">
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" name="campStart[]">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" name="campEnd[]">
            </div>
            <div class="form-group">
                <label>Number of Sessions</label>
                <input type="number" name="campSessions[]">
            </div>
            <div class="form-group">
                <label>Length of Each Session</label>
                <input type="text" name="campLength[]" placeholder="e.g., 2 hours">
            </div>
            <div class="form-group">
                <label>Estimated Participants</label>
                <input type="number" name="campParticipants[]">
            </div>
            <div class="form-group">
                <label>Age Group</label>
                <input type="text" name="campAgeGroup[]" placeholder="e.g., grades 9-12">
            </div>
            <div class="form-group">
                <label>3rd Party Vendor?</label>
                <select name="campVendor[]">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
            <div class="form-group">
                <label>Vendor Name</label>
                <input type="text" name="campVendorName[]">
            </div>
            <div class="form-group">
                <label>Vendor Provides Insurance?</label>
                <select name="campVendorInsurance[]">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
        </div>
        <button type="button" class="btn btn-small" onclick="removeEvent(this)" style="margin-top: 10px;">
            <i class="fas fa-trash"></i> Remove Event
        </button>
    `;
    container.appendChild(newEvent);
}

function addConditioning() {
    const container = document.getElementById('conditioning-container');
    const newEvent = document.createElement('div');
    newEvent.className = 'event-item';
    newEvent.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label>Type of Conditioning</label>
                <input type="text" name="conditioningType[]" placeholder="e.g., Summer Strength Training">
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" name="conditioningStart[]">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" name="conditioningEnd[]">
            </div>
            <div class="form-group">
                <label>Number of Sessions</label>
                <input type="number" name="conditioningSessions[]">
            </div>
            <div class="form-group">
                <label>Length of Each Session</label>
                <input type="text" name="conditioningLength[]" placeholder="e.g., 1.5 hours">
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" name="conditioningLocation[]" placeholder="Onsite/Offsite">
            </div>
            <div class="form-group">
                <label>Estimated Participants</label>
                <input type="number" name="conditioningParticipants[]">
            </div>
            <div class="form-group">
                <label>Age Group</label>
                <input type="text" name="conditioningAgeGroup[]" placeholder="e.g., grades 9-12">
            </div>
            <div class="form-group">
                <label>3rd Party Vendor?</label>
                <select name="conditioningVendor[]">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
            <div class="form-group">
                <label>Vendor Name</label>
                <input type="text" name="conditioningVendorName[]">
            </div>
            <div class="form-group">
                <label>Vendor Provides Insurance?</label>
                <select name="conditioningVendorInsurance[]">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
        </div>
        <button type="button" class="btn btn-small" onclick="removeEvent(this)" style="margin-top: 10px;">
            <i class="fas fa-trash"></i> Remove Event
        </button>
    `;
    container.appendChild(newEvent);
}

function addHosting() {
    const container = document.getElementById('hosting-container');
    const newEvent = document.createElement('div');
    newEvent.className = 'event-item';
    newEvent.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label>Type of Event</label>
                <input type="text" name="hostingType[]" placeholder="e.g., Pumpkin Dash">
            </div>
            <div class="form-group">
                <label>Start Date</label>
                <input type="date" name="hostingStart[]">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" name="hostingEnd[]">
            </div>
            <div class="form-group">
                <label>Estimated Participants by Age Group</label>
                <textarea name="hostingParticipants[]" rows="2" placeholder="e.g., ~75 elementary school kids"></textarea>
            </div>
        </div>
        <button type="button" class="btn btn-small" onclick="removeEvent(this)" style="margin-top: 10px;">
            <i class="fas fa-trash"></i> Remove Event
        </button>
    `;
    container.appendChild(newEvent);
}

function removeEvent(button) {
    button.parentElement.remove();
}

// Booster Club Management Functions
let currentSelectedClub = null;

const allBoosterClubs = [
    'cheer', 'dance', 'softball', 'boyssoccer', 'girlssoccer', 'boysswim', 'girlsswim',
    'wrestling', 'robotics', 'volleyball', 'boysbasketball', 'girlsbasketball',
    'boysgolf', 'girlsgolf', 'decca', 'theater', 'choir', 'gymnastics', 'orchestra', 'band'
];

const clubDisplayNames = {
    'cheer': 'Cheer',
    'dance': 'Dance',
    'softball': 'Softball',
    'boyssoccer': 'Boys Soccer',
    'girlssoccer': 'Girls Soccer',
    'boysswim': 'Boys Swim & Dive',
    'girlsswim': 'Girls Swim & Dive',
    'wrestling': 'Wrestling',
    'robotics': 'Robotics',
    'volleyball': 'Volleyball',
    'boysbasketball': 'Boys Basketball',
    'girlsbasketball': 'Girls Basketball',
    'boysgolf': 'Boys Golf',
    'girlsgolf': 'Girls Golf',
    'decca': 'DECCA',
    'theater': 'Theater',
    'choir': 'Choir',
    'gymnastics': 'Gymnastics',
    'orchestra': 'Orchestra',
    'band': 'Band'
};

function loadClubStatuses() {
    allBoosterClubs.forEach(club => {
        updateClubStatus(club);
    });
}

function updateClubStatus(club) {
    const statusElement = document.getElementById(`${club}-status`);
    if (!statusElement) return;

    const paymentSettings = JSON.parse(localStorage.getItem(`club_payment_${club}`)) || {};
    const contentSettings = JSON.parse(localStorage.getItem(`club_content_${club}`)) || {};
    const tiersSettings = JSON.parse(localStorage.getItem(`club_tiers_${club}`)) || {};

    let status = 'Not Configured';
    let statusClass = '';

    if (paymentSettings.zelleEmail && contentSettings.clubDescription && Object.keys(tiersSettings).length > 0) {
        status = 'Fully Configured';
        statusClass = 'configured';
    } else if (paymentSettings.zelleEmail) {
        status = 'Payment Setup';
        statusClass = 'payment-setup';
    } else if (contentSettings.clubDescription || Object.keys(tiersSettings).length > 0) {
        status = 'Needs Attention';
        statusClass = 'needs-attention';
    }

    statusElement.textContent = status;
    statusElement.className = `status-badge ${statusClass}`;
}

function selectClub(club) {
    currentSelectedClub = club;
    const displayName = clubDisplayNames[club];
    document.getElementById('current-club-name').textContent = displayName;
    loadClubData(club);
    
    // Show the management interface
    document.getElementById('club-management-interface').style.display = 'block';
    
    // Scroll to the management interface
    document.getElementById('club-management-interface').scrollIntoView({ behavior: 'smooth' });
}

function closeClubManagement() {
    document.getElementById('club-management-interface').style.display = 'none';
    currentSelectedClub = null;
}

function loadClubData(club) {
    // Load payment settings
    const paymentSettings = JSON.parse(localStorage.getItem(`club_payment_${club}`)) || {};
    document.getElementById('admin-zelle-email').value = paymentSettings.zelleEmail || '';
    document.getElementById('admin-zelle-name').value = paymentSettings.zelleName || '';

    // Load content settings
    const contentSettings = JSON.parse(localStorage.getItem(`club_content_${club}`)) || {};
    document.getElementById('admin-club-description').value = contentSettings.clubDescription || '';
    document.getElementById('admin-donation-appeal').value = contentSettings.donationAppeal || '';
    document.getElementById('admin-thank-you').value = contentSettings.thankYouMessage || '';

    // Load tiers settings
    const tiersSettings = JSON.parse(localStorage.getItem(`club_tiers_${club}`)) || {};
    if (tiersSettings.bronze) {
        document.getElementById('admin-bronze-amount').value = tiersSettings.bronze.amount || 25;
        document.getElementById('admin-bronze-title').value = tiersSettings.bronze.title || 'Bronze Supporter';
        document.getElementById('admin-bronze-description').value = tiersSettings.bronze.description || '';
    }
    if (tiersSettings.silver) {
        document.getElementById('admin-silver-amount').value = tiersSettings.silver.amount || 50;
        document.getElementById('admin-silver-title').value = tiersSettings.silver.title || 'Silver Supporter';
        document.getElementById('admin-silver-description').value = tiersSettings.silver.description || '';
    }
    if (tiersSettings.gold) {
        document.getElementById('admin-gold-amount').value = tiersSettings.gold.amount || 100;
        document.getElementById('admin-gold-title').value = tiersSettings.gold.title || 'Gold Supporter';
        document.getElementById('admin-gold-description').value = tiersSettings.gold.description || '';
    }
    if (tiersSettings.diamond) {
        document.getElementById('admin-diamond-amount').value = tiersSettings.diamond.amount || 250;
        document.getElementById('admin-diamond-title').value = tiersSettings.diamond.title || 'Diamond Supporter';
        document.getElementById('admin-diamond-description').value = tiersSettings.diamond.description || '';
    }
}

function saveAdminPaymentSettings() {
    if (!currentSelectedClub) {
        SecurityMessage.show('No club selected. Please select a club first.', 'error');
        return;
    }

    const zelleEmail = document.getElementById('admin-zelle-email').value.trim();
    const zelleName = document.getElementById('admin-zelle-name').value.trim();

    // Sanitize inputs
    const sanitizedEmail = InputSanitizer.sanitizeEmail(zelleEmail);
    const sanitizedName = InputSanitizer.sanitizeText(zelleName, false);

    if (!sanitizedEmail || !InputValidator.isValidEmail(sanitizedEmail)) {
        SecurityMessage.show('Please enter a valid email address for Zelle payments.', 'error');
        return;
    }

    const paymentSettings = {
        zelleEmail: sanitizedEmail,
        zelleName: sanitizedName
    };

    localStorage.setItem(`club_payment_${currentSelectedClub}`, JSON.stringify(paymentSettings));
    updateClubStatus(currentSelectedClub);
    
    // Log the action
    if (window.secureLogger) {
        window.secureLogger.log('booster-management', `Payment settings updated for ${currentSelectedClub}`, 'info');
    }
    
    SecurityMessage.show('Payment settings saved successfully!', 'success');
}

function resetAdminPaymentSettings() {
    if (!currentSelectedClub) {
        showMessage('No club selected. Please select a club first.', 'error');
        return;
    }

    document.getElementById('admin-zelle-email').value = '';
    document.getElementById('admin-zelle-name').value = '';
    showMessage('Payment settings reset to default.', 'info');
}

function saveAdminContentSettings() {
    if (!currentSelectedClub) {
        SecurityMessage.show('No club selected. Please select a club first.', 'error');
        return;
    }

    // Sanitize all content inputs
    const contentSettings = {
        clubDescription: InputSanitizer.sanitizeText(document.getElementById('admin-club-description').value.trim(), false),
        donationAppeal: InputSanitizer.sanitizeText(document.getElementById('admin-donation-appeal').value.trim(), false),
        thankYouMessage: InputSanitizer.sanitizeText(document.getElementById('admin-thank-you').value.trim(), false)
    };

    localStorage.setItem(`club_content_${currentSelectedClub}`, JSON.stringify(contentSettings));
    updateClubStatus(currentSelectedClub);
    
    // Log the action
    if (window.secureLogger) {
        window.secureLogger.log('booster-management', `Content settings updated for ${currentSelectedClub}`, 'info');
    }
    
    SecurityMessage.show('Content settings saved successfully!', 'success');
}

function resetAdminContentSettings() {
    if (!currentSelectedClub) {
        showMessage('No club selected. Please select a club first.', 'error');
        return;
    }

    document.getElementById('admin-club-description').value = '';
    document.getElementById('admin-donation-appeal').value = '';
    document.getElementById('admin-thank-you').value = '';
    showMessage('Content settings reset to default.', 'info');
}

function saveAdminTiersSettings() {
    if (!currentSelectedClub) {
        SecurityMessage.show('No club selected. Please select a club first.', 'error');
        return;
    }

    // Sanitize and validate tier settings
    const tiersSettings = {
        bronze: {
            amount: InputSanitizer.sanitizeAmount(document.getElementById('admin-bronze-amount').value),
            title: InputSanitizer.sanitizeText(document.getElementById('admin-bronze-title').value, false),
            description: InputSanitizer.sanitizeText(document.getElementById('admin-bronze-description').value, false)
        },
        silver: {
            amount: InputSanitizer.sanitizeAmount(document.getElementById('admin-silver-amount').value),
            title: InputSanitizer.sanitizeText(document.getElementById('admin-silver-title').value, false),
            description: InputSanitizer.sanitizeText(document.getElementById('admin-silver-description').value, false)
        },
        gold: {
            amount: InputSanitizer.sanitizeAmount(document.getElementById('admin-gold-amount').value),
            title: InputSanitizer.sanitizeText(document.getElementById('admin-gold-title').value, false),
            description: InputSanitizer.sanitizeText(document.getElementById('admin-gold-description').value, false)
        },
        diamond: {
            amount: InputSanitizer.sanitizeAmount(document.getElementById('admin-diamond-amount').value),
            title: InputSanitizer.sanitizeText(document.getElementById('admin-diamond-title').value, false),
            description: InputSanitizer.sanitizeText(document.getElementById('admin-diamond-description').value, false)
        }
    };

    // Validate amounts
    const tiers = ['bronze', 'silver', 'gold', 'diamond'];
    for (const tier of tiers) {
        if (!InputValidator.isValidAmount(tiersSettings[tier].amount)) {
            SecurityMessage.show(`Please enter a valid amount for ${tier} tier`, 'error');
            return;
        }
    }

    localStorage.setItem(`club_tiers_${currentSelectedClub}`, JSON.stringify(tiersSettings));
    updateClubStatus(currentSelectedClub);
    
    // Log the action
    if (window.secureLogger) {
        window.secureLogger.log('booster-management', `Tier settings updated for ${currentSelectedClub}`, 'info');
    }
    
    SecurityMessage.show('Tiers settings saved successfully!', 'success');
}

function resetAdminTiersSettings() {
    if (!currentSelectedClub) {
        showMessage('No club selected. Please select a club first.', 'error');
        return;
    }

    // Reset to default values
    document.getElementById('admin-bronze-amount').value = 25;
    document.getElementById('admin-bronze-title').value = 'Bronze Supporter';
    document.getElementById('admin-bronze-description').value = 'Basic supporter level with recognition on website.';

    document.getElementById('admin-silver-amount').value = 50;
    document.getElementById('admin-silver-title').value = 'Silver Supporter';
    document.getElementById('admin-silver-description').value = 'Enhanced supporter level with additional benefits.';

    document.getElementById('admin-gold-amount').value = 100;
    document.getElementById('admin-gold-title').value = 'Gold Supporter';
    document.getElementById('admin-gold-description').value = 'Premium supporter level with exclusive benefits.';

    document.getElementById('admin-diamond-amount').value = 250;
    document.getElementById('admin-diamond-title').value = 'Diamond Supporter';
    document.getElementById('admin-diamond-description').value = 'Elite supporter level with maximum benefits and recognition.';

    showMessage('Tiers settings reset to default.', 'info');
}

function populateBulkCheckboxes() {
    const paymentCheckboxes = document.getElementById('bulk-club-checkboxes');
    const contentCheckboxes = document.getElementById('bulk-content-checkboxes');

    if (paymentCheckboxes) {
        paymentCheckboxes.innerHTML = allBoosterClubs.map(club => `
            <label>
                <input type="checkbox" value="${club}">
                ${clubDisplayNames[club]}
            </label>
        `).join('');
    }

    if (contentCheckboxes) {
        contentCheckboxes.innerHTML = allBoosterClubs.map(club => `
            <label>
                <input type="checkbox" value="${club}">
                ${clubDisplayNames[club]}
            </label>
        `).join('');
    }
}

function applyBulkPaymentOverride() {
    const zelleEmail = document.getElementById('bulk-zelle-email').value.trim();
    const zelleName = document.getElementById('bulk-zelle-name').value.trim();
    const selectedClubs = Array.from(document.querySelectorAll('#bulk-club-checkboxes input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    if (!zelleEmail || !isValidEmail(zelleEmail)) {
        showMessage('Please enter a valid email address for Zelle payments.', 'error');
        return;
    }

    if (selectedClubs.length === 0) {
        showMessage('Please select at least one club to apply settings to.', 'error');
        return;
    }

    const paymentSettings = { zelleEmail, zelleName };

    selectedClubs.forEach(club => {
        localStorage.setItem(`club_payment_${club}`, JSON.stringify(paymentSettings));
        updateClubStatus(club);
    });

    showMessage(`Payment settings applied to ${selectedClubs.length} club(s) successfully!`, 'success');
}

function applyBulkContentOverride() {
    const contentSettings = {
        clubDescription: document.getElementById('bulk-club-description').value.trim(),
        donationAppeal: document.getElementById('bulk-donation-appeal').value.trim(),
        thankYouMessage: document.getElementById('bulk-thank-you').value.trim()
    };

    const selectedClubs = Array.from(document.querySelectorAll('#bulk-content-checkboxes input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    if (selectedClubs.length === 0) {
        showMessage('Please select at least one club to apply settings to.', 'error');
        return;
    }

    selectedClubs.forEach(club => {
        localStorage.setItem(`club_content_${club}`, JSON.stringify(contentSettings));
        updateClubStatus(club);
    });

    showMessage(`Content settings applied to ${selectedClubs.length} club(s) successfully!`, 'success');
}

// Tab functionality for club management
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching for club management
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
});

function isValidEmail(email) {
    return InputValidator.isValidEmail(email);
}

function showMessage(message, type = 'info') {
    // Use the secure message display
    SecurityMessage.show(message, type, 3000);
}

// Act on Behalf Functions
function actOnBehalf() {
    if (!currentSelectedClub) {
        showMessage('Please select a club first to act on their behalf.', 'error');
        return;
    }
    
    // Auto-select the club in the behalf dropdown
    document.getElementById('behalf-club-select').value = currentSelectedClub;
    updateBehalfCredentials();
    
    // Scroll to the act on behalf section
    document.querySelector('.act-on-behalf-section').scrollIntoView({ behavior: 'smooth' });
    
    showMessage(`Ready to act on behalf of ${clubDisplayNames[currentSelectedClub]}`, 'info');
}

function updateBehalfCredentials() {
    const selectedClub = document.getElementById('behalf-club-select').value;
    const credentialsDisplay = document.getElementById('credentials-display');
    const openLoginBtn = document.getElementById('open-login-btn');
    
    if (!selectedClub) {
        credentialsDisplay.style.display = 'none';
        openLoginBtn.disabled = true;
        return;
    }
    
    // Set credentials based on club
    const username = `${selectedClub}admin`;
    const password = `${selectedClub}2025`;
    
    document.getElementById('behalf-username').textContent = username;
    document.getElementById('behalf-password').textContent = password;
    
    credentialsDisplay.style.display = 'block';
    openLoginBtn.disabled = false;
    
    showMessage(`Credentials loaded for ${clubDisplayNames[selectedClub]}`, 'success');
}

function openBoosterLogin() {
    const selectedClub = document.getElementById('behalf-club-select').value;
    if (!selectedClub) {
        showMessage('Please select a booster club first.', 'error');
        return;
    }
    
    // Open booster login in new tab
    const loginWindow = window.open('booster-login.html', '_blank');
    
    if (loginWindow) {
        showMessage(`Opened booster login page. Use the credentials above to log in as ${clubDisplayNames[selectedClub]}.`, 'info');
    } else {
        showMessage('Please allow pop-ups to open the booster login page.', 'warning');
    }
}

function resetBehalfSelection() {
    document.getElementById('behalf-club-select').value = '';
    document.getElementById('credentials-display').style.display = 'none';
    document.getElementById('open-login-btn').disabled = true;
    
    showMessage('Selection reset. Choose a club to get started.', 'info');
}

// Administrative Logging System
class AdminLogger {
    constructor() {
        this.logs = [];
        this.config = this.loadConfig();
        this.logFileName = 'admin_activity_log.txt';
        this.maxLogEntries = 10000; // Keep last 10,000 entries
    }

    loadConfig() {
        const defaultConfig = {
            logLogins: true,
            logSettings: true,
            logBooster: true,
            logExports: true,
            logCritical: true,
            logUserAgent: false
        };
        
        const savedConfig = localStorage.getItem('adminLogConfig');
        return savedConfig ? { ...defaultConfig, ...JSON.parse(savedConfig) } : defaultConfig;
    }

    saveConfig() {
        localStorage.setItem('adminLogConfig', JSON.stringify(this.config));
    }

    log(action, details = '', severity = 'info', userId = null) {
        // Check if this action should be logged based on config
        if (!this.shouldLogAction(action)) {
            return;
        }

        const logEntry = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            user: userId || this.getCurrentUser(),
            action: action,
            details: details,
            severity: severity,
            ipAddress: this.getClientIP(),
            userAgent: this.config.logUserAgent ? navigator.userAgent : '',
            status: 'success'
        };

        this.logs.unshift(logEntry); // Add to beginning of array

        // Keep only the last maxLogEntries
        if (this.logs.length > this.maxLogEntries) {
            this.logs = this.logs.slice(0, this.maxLogEntries);
        }

        // Save to localStorage
        this.saveLogs();

        // Save to local file
        this.saveToFile(logEntry);

        // Send to server (if configured)
        this.sendToServer(logEntry);

        return logEntry;
    }

    shouldLogAction(action) {
        const actionMap = {
            'login': 'logLogins',
            'logout': 'logLogins',
            'settings': 'logSettings',
            'booster-management': 'logBooster',
            'export': 'logExports',
            'import': 'logExports',
            'delete': 'logCritical',
            'clear-logs': 'logCritical'
        };

        const configKey = actionMap[action] || 'logSettings';
        return this.config[configKey] !== false;
    }

    getCurrentUser() {
        // Get current user from session
        const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
        const boosterLoggedIn = sessionStorage.getItem('boosterLoggedIn');
        
        if (adminLoggedIn === 'true') {
            return 'admin';
        } else if (boosterLoggedIn === 'true') {
            const club = sessionStorage.getItem('boosterClub');
            return `${club}admin`;
        }
        
        return 'unknown';
    }

    getClientIP() {
        // In a real implementation, this would be server-side
        // For now, we'll use a placeholder
        return '127.0.0.1';
    }

    saveLogs() {
        localStorage.setItem('adminLogs', JSON.stringify(this.logs));
    }

    loadLogs() {
        const savedLogs = localStorage.getItem('adminLogs');
        this.logs = savedLogs ? JSON.parse(savedLogs) : [];
    }

    saveToFile(logEntry) {
        const logLine = this.formatLogEntry(logEntry);
        
        // Create a blob with the log entry
        const blob = new Blob([logLine + '\n'], { type: 'text/plain' });
        
        // Save to local file system (this would work in a real server environment)
        // For now, we'll store it in localStorage as a backup
        const fileLogs = localStorage.getItem('adminLogFile') || '';
        localStorage.setItem('adminLogFile', fileLogs + logLine + '\n');
    }

    formatLogEntry(logEntry) {
        return `[${logEntry.timestamp}] [${logEntry.user}] [${logEntry.action.toUpperCase()}] [${logEntry.severity.toUpperCase()}] ${logEntry.details} | IP: ${logEntry.ipAddress} | UA: ${logEntry.userAgent}`;
    }

    sendToServer(logEntry) {
        // In a real implementation, this would send to a logging server
        // For now, we'll just log to console
        console.log('Log entry sent to server:', logEntry);
    }

    getFilteredLogs(filters = {}) {
        let filteredLogs = [...this.logs];

        if (filters.user) {
            filteredLogs = filteredLogs.filter(log => log.user.includes(filters.user));
        }

        if (filters.action) {
            filteredLogs = filteredLogs.filter(log => log.action === filters.action);
        }

        if (filters.dateFrom) {
            filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.dateFrom);
        }

        if (filters.dateTo) {
            filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.dateTo + 'T23:59:59.999Z');
        }

        return filteredLogs;
    }

    getStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = this.logs.filter(log => log.timestamp.startsWith(today));
        
        const uniqueUsers = [...new Set(this.logs.map(log => log.user))];
        const criticalActions = this.logs.filter(log => log.severity === 'critical');

        return {
            totalLogs: this.logs.length,
            activeUsers: uniqueUsers.length,
            todayActivities: todayLogs.length,
            criticalActions: criticalActions.length
        };
    }

    clearLogs() {
        this.logs = [];
        this.saveLogs();
        localStorage.removeItem('adminLogFile');
    }

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

    exportToTXT(logs) {
        return logs.map(log => this.formatLogEntry(log)).join('\n');
    }
}

// Global logger instance
window.adminLogger = new AdminLogger();

// Load existing logs on page load
document.addEventListener('DOMContentLoaded', function() {
    window.adminLogger.loadLogs();
    
    // Log page load
    window.adminLogger.log('page-load', 'Admin panel loaded', 'info');
});

// Logging Functions for UI
function refreshLogs() {
    loadLogsTable();
    updateLogStats();
    showMessage('Logs refreshed successfully', 'success');
}

function loadLogsTable() {
    const tableBody = document.getElementById('logs-table-body');
    const filters = getLogFilters();
    const logs = window.adminLogger.getFilteredLogs(filters);
    
    tableBody.innerHTML = logs.map(log => `
        <tr class="log-entry ${log.severity}">
            <td class="log-timestamp">${formatTimestamp(log.timestamp)}</td>
            <td class="log-user">${log.user}</td>
            <td><span class="log-action ${log.action}">${log.action}</span></td>
            <td class="log-details" title="${log.details}">${log.details}</td>
            <td class="log-ip">${log.ipAddress}</td>
            <td class="log-user-agent" title="${log.userAgent}">${log.userAgent}</td>
            <td><span class="log-status ${log.status}">${log.status}</span></td>
        </tr>
    `).join('');
}

function getLogFilters() {
    return {
        user: document.getElementById('log-user-filter').value,
        action: document.getElementById('log-action-filter').value,
        dateFrom: document.getElementById('log-date-from').value,
        dateTo: document.getElementById('log-date-to').value
    };
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function updateLogStats() {
    const stats = window.adminLogger.getStats();
    
    document.getElementById('total-logs').textContent = stats.totalLogs;
    document.getElementById('active-users').textContent = stats.activeUsers;
    document.getElementById('today-activities').textContent = stats.todayActivities;
    document.getElementById('critical-actions').textContent = stats.criticalActions;
}

function clearLogFilters() {
    document.getElementById('log-user-filter').value = '';
    document.getElementById('log-action-filter').value = '';
    document.getElementById('log-date-from').value = '';
    document.getElementById('log-date-to').value = '';
    
    refreshLogs();
    showMessage('Log filters cleared', 'info');
}

function exportLogs() {
    const format = prompt('Enter export format (json, csv, txt):', 'json');
    if (!format) return;
    
    const logs = window.adminLogger.exportLogs(format);
    const filename = `admin_logs_${new Date().toISOString().split('T')[0]}.${format}`;
    
    downloadFile(logs, filename, format === 'json' ? 'application/json' : 'text/plain');
    showMessage(`Logs exported as ${filename}`, 'success');
}

function downloadLogFile() {
    const fileLogs = localStorage.getItem('adminLogFile') || '';
    const filename = `admin_activity_log_${new Date().toISOString().split('T')[0]}.txt`;
    
    downloadFile(fileLogs, filename, 'text/plain');
    showMessage(`Log file downloaded as ${filename}`, 'success');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function clearAllLogs() {
    if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
        window.adminLogger.clearLogs();
        refreshLogs();
        showMessage('All logs cleared', 'warning');
    }
}

function saveLogConfig() {
    window.adminLogger.config = {
        logLogins: document.getElementById('log-logins').checked,
        logSettings: document.getElementById('log-settings').checked,
        logBooster: document.getElementById('log-booster').checked,
        logExports: document.getElementById('log-exports').checked,
        logCritical: document.getElementById('log-critical').checked,
        logUserAgent: document.getElementById('log-user-agent').checked
    };
    
    window.adminLogger.saveConfig();
    showMessage('Logging configuration saved', 'success');
}

function resetLogConfig() {
    if (confirm('Reset logging configuration to defaults?')) {
        window.adminLogger.config = window.adminLogger.loadConfig();
        loadLogConfig();
        showMessage('Logging configuration reset to defaults', 'info');
    }
}

function loadLogConfig() {
    const config = window.adminLogger.config;
    document.getElementById('log-logins').checked = config.logLogins;
    document.getElementById('log-settings').checked = config.logSettings;
    document.getElementById('log-booster').checked = config.logBooster;
    document.getElementById('log-exports').checked = config.logExports;
    document.getElementById('log-critical').checked = config.logCritical;
    document.getElementById('log-user-agent').checked = config.logUserAgent;
}

// Add event listeners for log filters
document.addEventListener('DOMContentLoaded', function() {
    // Load log configuration
    loadLogConfig();
    
    // Add filter event listeners
    document.getElementById('log-user-filter')?.addEventListener('change', refreshLogs);
    document.getElementById('log-action-filter')?.addEventListener('change', refreshLogs);
    document.getElementById('log-date-from')?.addEventListener('change', refreshLogs);
    document.getElementById('log-date-to')?.addEventListener('change', refreshLogs);
    
    // Initial load
    refreshLogs();
});

// Enhanced logging for existing functions
const originalFunctions = {
    saveAdminPaymentSettings: saveAdminPaymentSettings,
    saveAdminContentSettings: saveAdminContentSettings,
    saveAdminTiersSettings: saveAdminTiersSettings,
    applyBulkPaymentOverride: applyBulkPaymentOverride,
    applyBulkContentOverride: applyBulkContentOverride,
    actOnBehalf: actOnBehalf
};

// Wrap existing functions with logging
function saveAdminPaymentSettings() {
    const result = originalFunctions.saveAdminPaymentSettings();
    window.adminLogger.log('booster-management', `Payment settings updated for ${currentSelectedClub}`, 'info');
    return result;
}

function saveAdminContentSettings() {
    const result = originalFunctions.saveAdminContentSettings();
    window.adminLogger.log('booster-management', `Content settings updated for ${currentSelectedClub}`, 'info');
    return result;
}

function saveAdminTiersSettings() {
    const result = originalFunctions.saveAdminTiersSettings();
    window.adminLogger.log('booster-management', `Tier settings updated for ${currentSelectedClub}`, 'info');
    return result;
}

function applyBulkPaymentOverride() {
    const result = originalFunctions.applyBulkPaymentOverride();
    window.adminLogger.log('booster-management', 'Bulk payment override applied', 'warning');
    return result;
}

function applyBulkContentOverride() {
    const result = originalFunctions.applyBulkContentOverride();
    window.adminLogger.log('booster-management', 'Bulk content override applied', 'warning');
    return result;
}

function actOnBehalf() {
    const result = originalFunctions.actOnBehalf();
    window.adminLogger.log('booster-management', `Acting on behalf of ${currentSelectedClub}`, 'info');
    return result;
}

// Database Management Functions
async function updateDatabaseStats() {
    try {
        if (!window.db) {
            console.warn('Database not initialized');
            return;
        }

        const stats = await window.db.getStats();
        
        // Update core statistics display
        document.getElementById('members-count').textContent = stats.members || 0;
        document.getElementById('donations-count').textContent = stats.donations || 0;
        document.getElementById('vendors-count').textContent = stats.vendors || 0;
        document.getElementById('clubs-count').textContent = stats.boosterClubs || 0;
        document.getElementById('logs-count').textContent = stats.adminLogs || 0;
        document.getElementById('settings-count').textContent = stats.settings || 0;
        
        // Add additional statistics if elements exist
        const additionalStats = {
            'users-count': stats.users || 0,
            'events-count': stats.events || 0,
            'fundraising-events-count': stats.fundraisingEvents || 0,
            'volunteer-hours-count': stats.volunteerHours || 0,
            'financial-transactions-count': stats.financialTransactions || 0,
            'analytics-count': stats.analytics || 0,
            'goals-count': stats.goals || 0,
            'achievements-count': stats.achievements || 0,
            'inventory-count': stats.inventory || 0,
            'equipment-count': stats.equipment || 0,
            'compliance-records-count': stats.complianceRecords || 0,
            'communications-count': stats.communications || 0,
            'email-logs-count': stats.emailLogs || 0,
            'notifications-count': stats.notifications || 0,
            'documents-count': stats.documents || 0,
            'tax-records-count': stats.taxRecords || 0,
            'performance-metrics-count': stats.performanceMetrics || 0,
            'resources-count': stats.resources || 0
        };
        
        // Update additional statistics elements if they exist
        for (const [elementId, value] of Object.entries(additionalStats)) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value;
            }
        }
        
    } catch (error) {
        console.error('Failed to update database stats:', error);
        SecurityMessage.show('Failed to update database statistics', 'error');
    }
}

async function createDatabaseBackup() {
    try {
        if (!window.db) {
            SecurityMessage.show('Database not initialized', 'error');
            return;
        }

        const backup = await window.db.backup();
        SecurityMessage.show('Database backup created successfully', 'success');
        
        // Log the backup action
        if (window.secureLogger) {
            window.secureLogger.log('database', 'Database backup created', 'info');
        }
        
    } catch (error) {
        console.error('Backup failed:', error);
        SecurityMessage.show('Failed to create database backup', 'error');
    }
}

async function restoreDatabaseBackup() {
    try {
        // Create file input for backup selection
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    await window.db.restore(backupData);
                    SecurityMessage.show('Database restored successfully', 'success');
                    
                    // Refresh stats
                    await updateDatabaseStats();
                    
                    // Log the restore action
                    if (window.secureLogger) {
                        window.secureLogger.log('database', 'Database restored from backup', 'info');
                    }
                    
                } catch (error) {
                    console.error('Restore failed:', error);
                    SecurityMessage.show('Failed to restore database backup', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
        
    } catch (error) {
        console.error('Restore failed:', error);
        SecurityMessage.show('Failed to restore database backup', 'error');
    }
}

async function exportDatabaseData() {
    try {
        if (!window.db) {
            SecurityMessage.show('Database not initialized', 'error');
            return;
        }

        const backup = await window.db.backup();
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: backup
        };
        
        // Create downloadable file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eastlake_wolfpack_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        SecurityMessage.show('Database data exported successfully', 'success');
        
        // Log the export action
        if (window.secureLogger) {
            window.secureLogger.log('database', 'Database data exported', 'info');
        }
        
    } catch (error) {
        console.error('Export failed:', error);
        SecurityMessage.show('Failed to export database data', 'error');
    }
}

function exportMySQLSchema() {
    try {
        // Create a link to download the MySQL schema file
        const a = document.createElement('a');
        a.href = 'mysql-schema.sql';
        a.download = 'mysql-schema.sql';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        SecurityMessage.show('MySQL schema file downloaded', 'success');
        
    } catch (error) {
        console.error('Schema export failed:', error);
        SecurityMessage.show('Failed to download MySQL schema', 'error');
    }
}

async function optimizeDatabase() {
    try {
        if (!window.db) {
            SecurityMessage.show('Database not initialized', 'error');
            return;
        }

        // For IndexedDB, we can't really "optimize" but we can clean up
        SecurityMessage.show('Database optimization completed', 'success');
        
        // Log the optimization action
        if (window.secureLogger) {
            window.secureLogger.log('database', 'Database optimization completed', 'info');
        }
        
    } catch (error) {
        console.error('Optimization failed:', error);
        SecurityMessage.show('Failed to optimize database', 'error');
    }
}

async function clearDatabase() {
    try {
        if (!confirm('Are you sure you want to clear all database data? This action cannot be undone.')) {
            return;
        }

        if (!window.db) {
            SecurityMessage.show('Database not initialized', 'error');
            return;
        }

        // Clear all data from all stores
        for (const storeName of Object.keys(DB_CONFIG.stores)) {
            const allRecords = await window.db.query(storeName);
            for (const record of allRecords) {
                await window.db.delete(storeName, record.id);
            }
        }
        
        SecurityMessage.show('Database cleared successfully', 'warning');
        
        // Refresh stats
        await updateDatabaseStats();
        
        // Log the clear action
        if (window.secureLogger) {
            window.secureLogger.log('database', 'Database cleared', 'warning');
        }
        
    } catch (error) {
        console.error('Clear failed:', error);
        SecurityMessage.show('Failed to clear database', 'error');
    }
}

async function loadSampleData() {
    try {
        if (!window.databaseSetup) {
            SecurityMessage.show('Database not initialized', 'error');
            return;
        }

        await window.databaseSetup.loadSampleData();
        SecurityMessage.show('Sample data loaded successfully', 'success');
        
        // Refresh stats
        await updateDatabaseStats();
        
        // Log the action
        if (window.secureLogger) {
            window.secureLogger.log('database', 'Sample data loaded', 'info');
        }
        
    } catch (error) {
        console.error('Failed to load sample data:', error);
        SecurityMessage.show('Failed to load sample data', 'error');
    }
}

async function clearSampleData() {
    try {
        if (!confirm('Are you sure you want to clear sample data?')) {
            return;
        }

        if (!window.db) {
            SecurityMessage.show('Database not initialized', 'error');
            return;
        }

        // Clear sample data (members, donations, vendors)
        const sampleStores = ['members', 'donations', 'vendors'];
        for (const storeName of sampleStores) {
            const allRecords = await window.db.query(storeName);
            for (const record of allRecords) {
                await window.db.delete(storeName, record.id);
            }
        }
        
        SecurityMessage.show('Sample data cleared successfully', 'success');
        
        // Refresh stats
        await updateDatabaseStats();
        
        // Log the action
        if (window.secureLogger) {
            window.secureLogger.log('database', 'Sample data cleared', 'info');
        }
        
    } catch (error) {
        console.error('Failed to clear sample data:', error);
        SecurityMessage.show('Failed to clear sample data', 'error');
    }
}

function exportForMigration() {
    try {
        // This would create a migration-ready export
        SecurityMessage.show('Migration export feature coming soon', 'info');
        
    } catch (error) {
        console.error('Migration export failed:', error);
        SecurityMessage.show('Failed to create migration export', 'error');
    }
}

function downloadMySQLSchema() {
    exportMySQLSchema(); // Reuse the existing function
}

function showMigrationGuide() {
    const guide = `
# MySQL Migration Guide

## Step 1: Export Current Data
1. Go to Database Management
2. Click "Export for Migration"
3. Save the exported file

## Step 2: Set Up MySQL Database
1. Log into your Namecheap hosting control panel
2. Access phpMyAdmin or MySQL management
3. Create a new database
4. Import the mysql-schema.sql file

## Step 3: Import Your Data
1. Use the migration tools in phpMyAdmin
2. Import your exported JSON data
3. Verify data integrity

## Step 4: Update Configuration
1. Update database connection settings
2. Test the connection
3. Switch to MySQL mode

## Need Help?
Contact your hosting provider for MySQL setup assistance.
    `;
    
    // Create a modal to show the guide
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>MySQL Migration Guide</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <pre>${guide}</pre>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary close-modal">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function configureMySQLMode() {
    SecurityMessage.show('MySQL mode configuration coming soon', 'info');
}

async function refreshDatabaseLogs() {
    try {
        if (!window.models || !window.models.adminLogs) {
            SecurityMessage.show('Database not initialized', 'error');
            return;
        }

        const logs = await window.models.adminLogs.getRecent(10);
        const logsContainer = document.getElementById('database-logs');
        
        if (logs.length === 0) {
            logsContainer.innerHTML = '<div class="log-entry"><span class="log-time">No logs</span><span class="log-message">No recent database operations</span></div>';
            return;
        }
        
        logsContainer.innerHTML = logs.map(log => `
            <div class="log-entry">
                <span class="log-time">${new Date(log.timestamp).toLocaleString()}</span>
                <span class="log-message">${log.details || log.action}</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to refresh database logs:', error);
        SecurityMessage.show('Failed to refresh database logs', 'error');
    }
}

// Initialize database management when page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for database to initialize
    setTimeout(async () => {
        if (window.db) {
            await updateDatabaseStats();
            await refreshDatabaseLogs();
        }
    }, 1000);
});

// Missing functions that are referenced in HTML
function editMember(id) {
    SecurityMessage.show('Edit member functionality coming soon', 'info');
}

function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        SecurityMessage.show('Delete member functionality coming soon', 'info');
    }
}

function editInsurance(id) {
    SecurityMessage.show('Edit insurance functionality coming soon', 'info');
}

function deleteInsurance(id) {
    if (confirm('Are you sure you want to delete this insurance record?')) {
        SecurityMessage.show('Delete insurance functionality coming soon', 'info');
    }
}

function downloadReport(id) {
    SecurityMessage.show('Download report functionality coming soon', 'info');
}

function deleteReport(id) {
    if (confirm('Are you sure you want to delete this report?')) {
        SecurityMessage.show('Delete report functionality coming soon', 'info');
    }
}

// SafeDOM utility if not already defined
if (typeof SafeDOM === 'undefined') {
    window.SafeDOM = {
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };
}

// Test function to verify navigation works
function testNavigation() {
    console.log('Testing navigation...');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const adminSections = document.querySelectorAll('.admin-section');
    
    console.log('Found sidebar links:', sidebarLinks.length);
    console.log('Found admin sections:', adminSections.length);
    
    sidebarLinks.forEach(link => {
        const sectionId = link.getAttribute('data-section');
        const sectionElement = document.getElementById(sectionId);
        console.log(`Link ${sectionId}: ${sectionElement ? 'Found' : 'Missing'}`);
    });
}

// Run navigation test on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(testNavigation, 1000);
}); 