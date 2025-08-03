-- MySQL Schema for Eastlake Wolfpack Association Admin Panel
-- Compatible with Namecheap hosting
-- Version: 1.0

-- Create database (adjust name as needed for your hosting)
-- CREATE DATABASE IF NOT EXISTS eastlake_wolfpack_db;
-- USE eastlake_wolfpack_db;

-- Members table
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    tier ENUM('basic', 'silver', 'gold', 'diamond') NOT NULL DEFAULT 'basic',
    payment_type ENUM('recurring', 'one-time') NOT NULL DEFAULT 'one-time',
    join_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_tier (tier),
    INDEX idx_status (status),
    INDEX idx_join_date (join_date),
    INDEX idx_payment_type (payment_type)
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_name VARCHAR(100) NOT NULL,
    donor_email VARCHAR(254),
    amount DECIMAL(10,2) NOT NULL,
    tier ENUM('bronze', 'silver', 'gold', 'diamond') NOT NULL,
    payment_method ENUM('stripe', 'zelle', 'check', 'cash') NOT NULL,
    date DATE NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    booster_club VARCHAR(50),
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_donor_email (donor_email),
    INDEX idx_amount (amount),
    INDEX idx_tier (tier),
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_booster_club (booster_club),
    INDEX idx_payment_method (payment_method)
);

-- Vendors table (for 1099 reporting)
CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(200) NOT NULL,
    tax_id VARCHAR(20) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(254),
    booster_club VARCHAR(50),
    services TEXT,
    total_paid DECIMAL(10,2) DEFAULT 0.00,
    last_payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tax_id (tax_id),
    INDEX idx_booster_club (booster_club),
    INDEX idx_business_name (business_name)
);

-- Insurance table
CREATE TABLE IF NOT EXISTS insurance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booster_club VARCHAR(50) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(254) NOT NULL,
    contributions DECIMAL(10,2) DEFAULT 0.00,
    fundraising_revenue DECIMAL(10,2) DEFAULT 0.00,
    concessions_revenue DECIMAL(10,2) DEFAULT 0.00,
    fundraisers_data JSON,
    camps_data JSON,
    conditioning_data JSON,
    hosting_events_data JSON,
    banquet_events INT DEFAULT 0,
    banquet_food TEXT,
    banquet_products TEXT,
    banquet_location VARCHAR(200),
    banquet_coi_required BOOLEAN DEFAULT FALSE,
    concessions_nights INT DEFAULT 0,
    concessions_types TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_booster_club (booster_club),
    INDEX idx_contact_email (contact_email)
);

-- Booster Clubs table
CREATE TABLE IF NOT EXISTS booster_clubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    description TEXT,
    zelle_email VARCHAR(254),
    zelle_name VARCHAR(100),
    donation_appeal TEXT,
    thank_you_message TEXT,
    bronze_amount DECIMAL(10,2) DEFAULT 25.00,
    bronze_title VARCHAR(100) DEFAULT 'Bronze Supporter',
    bronze_description TEXT,
    silver_amount DECIMAL(10,2) DEFAULT 50.00,
    silver_title VARCHAR(100) DEFAULT 'Silver Supporter',
    silver_description TEXT,
    gold_amount DECIMAL(10,2) DEFAULT 100.00,
    gold_title VARCHAR(100) DEFAULT 'Gold Supporter',
    gold_description TEXT,
    diamond_amount DECIMAL(10,2) DEFAULT 250.00,
    diamond_title VARCHAR(100) DEFAULT 'Diamond Supporter',
    diamond_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_status (status)
);

-- Admin Logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    severity ENUM('info', 'warning', 'error', 'critical') NOT NULL DEFAULT 'info',
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('success', 'error', 'warning') NOT NULL DEFAULT 'success',
    
    INDEX idx_timestamp (timestamp),
    INDEX idx_user (user),
    INDEX idx_action (action),
    INDEX idx_severity (severity),
    INDEX idx_status (status)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'booster_admin', 'viewer') NOT NULL DEFAULT 'viewer',
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    booster_club VARCHAR(50),
    last_login TIMESTAMP NULL,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_booster_club (booster_club)
);

-- User Activity Tracking
CREATE TABLE IF NOT EXISTS user_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    page VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action),
    INDEX idx_page (page),
    INDEX idx_session_id (session_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Financial Transactions
CREATE TABLE IF NOT EXISTS financial_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('donation', 'membership', 'expense', 'refund', 'transfer') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('stripe', 'zelle', 'check', 'cash', 'paypal') NOT NULL,
    booster_club VARCHAR(50),
    description TEXT,
    status ENUM('pending', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_date (date),
    INDEX idx_type (type),
    INDEX idx_amount (amount),
    INDEX idx_status (status),
    INDEX idx_booster_club (booster_club),
    INDEX idx_payment_method (payment_method)
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL,
    report_name VARCHAR(200) NOT NULL,
    generated_by INT,
    date_generated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parameters JSON,
    file_path VARCHAR(500),
    status ENUM('generated', 'processing', 'failed') NOT NULL DEFAULT 'generated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_report_type (report_type),
    INDEX idx_generated_by (generated_by),
    INDEX idx_date_generated (date_generated),
    INDEX idx_status (status),
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Analytics
CREATE TABLE IF NOT EXISTS analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    category VARCHAR(50),
    booster_club VARCHAR(50),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_metric_name (metric_name),
    INDEX idx_date (date),
    INDEX idx_booster_club (booster_club),
    INDEX idx_category (category)
);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    event_type ENUM('sports', 'competition', 'tournament', 'meeting', 'fundraiser', 'social') NOT NULL,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR(200),
    booster_club VARCHAR(50),
    description TEXT,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_event_type (event_type),
    INDEX idx_date (date),
    INDEX idx_booster_club (booster_club),
    INDEX idx_status (status),
    INDEX idx_location (location)
);

-- Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'confirmed', 'cancelled', 'no_show') NOT NULL DEFAULT 'registered',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_registration_date (registration_date),
    INDEX idx_status (status),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Volunteer Hours
CREATE TABLE IF NOT EXISTS volunteer_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id INT,
    volunteer_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    hours DECIMAL(4,2) NOT NULL,
    event_id INT,
    booster_club VARCHAR(50),
    description TEXT,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_volunteer_id (volunteer_id),
    INDEX idx_date (date),
    INDEX idx_booster_club (booster_club),
    INDEX idx_event_id (event_id),
    INDEX idx_status (status),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Fundraising Events
CREATE TABLE IF NOT EXISTS fundraising_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    booster_club VARCHAR(50),
    goal_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    description TEXT,
    status ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_event_name (event_name),
    INDEX idx_date (date),
    INDEX idx_booster_club (booster_club),
    INDEX idx_status (status),
    INDEX idx_goal_amount (goal_amount)
);

-- Communications
CREATE TABLE IF NOT EXISTS communications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('email', 'sms', 'letter', 'announcement') NOT NULL,
    recipient VARCHAR(254),
    subject VARCHAR(200),
    message TEXT,
    date_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'delivered', 'failed', 'pending') NOT NULL DEFAULT 'sent',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_recipient (recipient),
    INDEX idx_date_sent (date_sent),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);

-- Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(254) NOT NULL,
    subject VARCHAR(200),
    template VARCHAR(100),
    date_sent TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'delivered', 'bounced', 'failed') NOT NULL DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_recipient (recipient),
    INDEX idx_date_sent (date_sent),
    INDEX idx_status (status),
    INDEX idx_template (template)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_date_created (date_created),
    INDEX idx_read (read),
    INDEX idx_priority (priority),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    quantity INT NOT NULL DEFAULT 0,
    booster_club VARCHAR(50),
    location VARCHAR(200),
    status ENUM('available', 'low_stock', 'out_of_stock', 'discontinued') NOT NULL DEFAULT 'available',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_item_name (item_name),
    INDEX idx_category (category),
    INDEX idx_booster_club (booster_club),
    INDEX idx_status (status),
    INDEX idx_location (location)
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    booster_club VARCHAR(50),
    location VARCHAR(200),
    status ENUM('operational', 'maintenance', 'repair', 'retired') NOT NULL DEFAULT 'operational',
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_equipment_name (equipment_name),
    INDEX idx_category (category),
    INDEX idx_booster_club (booster_club),
    INDEX idx_status (status),
    INDEX idx_last_maintenance (last_maintenance)
);

-- Resources
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_name VARCHAR(200) NOT NULL,
    type VARCHAR(100),
    booster_club VARCHAR(50),
    description TEXT,
    status ENUM('available', 'in_use', 'maintenance', 'retired') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_resource_name (resource_name),
    INDEX idx_type (type),
    INDEX idx_booster_club (booster_club),
    INDEX idx_status (status)
);

-- Compliance Records
CREATE TABLE IF NOT EXISTS compliance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_type VARCHAR(100) NOT NULL,
    booster_club VARCHAR(50),
    document_name VARCHAR(200) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    status ENUM('active', 'expired', 'expiring_soon', 'pending') NOT NULL DEFAULT 'active',
    document_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_record_type (record_type),
    INDEX idx_booster_club (booster_club),
    INDEX idx_date (issue_date),
    INDEX idx_status (status),
    INDEX idx_expiry_date (expiry_date)
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_type VARCHAR(100) NOT NULL,
    booster_club VARCHAR(50),
    document_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    file_path VARCHAR(500),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'archived', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_document_type (document_type),
    INDEX idx_booster_club (booster_club),
    INDEX idx_date_created (date_created),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- Tax Records
CREATE TABLE IF NOT EXISTS tax_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tax_year INT NOT NULL,
    record_type VARCHAR(100) NOT NULL,
    booster_club VARCHAR(50),
    amount DECIMAL(10,2),
    date DATE,
    status ENUM('pending', 'filed', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tax_year (tax_year),
    INDEX idx_record_type (record_type),
    INDEX idx_booster_club (booster_club),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- Performance Metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    category VARCHAR(50),
    booster_club VARCHAR(50),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_metric_name (metric_name),
    INDEX idx_date (date),
    INDEX idx_booster_club (booster_club),
    INDEX idx_category (category)
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goal_type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2),
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    target_date DATE,
    booster_club VARCHAR(50),
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status ENUM('not_started', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_goal_type (goal_type),
    INDEX idx_booster_club (booster_club),
    INDEX idx_target_date (target_date),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    achievement_type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    booster_club VARCHAR(50),
    category VARCHAR(100),
    date_achieved DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_achievement_type (achievement_type),
    INDEX idx_booster_club (booster_club),
    INDEX idx_date_achieved (date_achieved),
    INDEX idx_category (category)
);

-- Insert default settings
INSERT IGNORE INTO settings (`key`, value, description) VALUES
('organization_name', 'Eastlake Wolfpack Association', 'Organization display name'),
('contact_email', 'info@eastlakewolfpack.org', 'Primary contact email'),
('tax_id', '12-3456789', 'Organization tax ID'),
('default_currency', 'USD', 'Default currency for transactions'),
('session_timeout_hours', '8', 'Admin session timeout in hours'),
('max_login_attempts', '5', 'Maximum login attempts before lockout'),
('backup_frequency_days', '7', 'Automatic backup frequency in days'),
('log_retention_days', '90', 'How long to keep admin logs');

-- Insert default admin user (change password in production!)
INSERT IGNORE INTO users (email, password_hash, role, status) VALUES
('admin@eastlakewolfpack.org', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active');

-- Insert default booster clubs
INSERT IGNORE INTO booster_clubs (name, status) VALUES
('Cheer', 'active'),
('Dance', 'active'),
('Softball', 'active'),
('Boys Soccer', 'active'),
('Girls Soccer', 'active'),
('Boys Swim and Dive', 'active'),
('Girls Swim and Dive', 'active'),
('Wrestling', 'active'),
('Robotics', 'active'),
('Volleyball', 'active'),
('Boys Basketball', 'active'),
('Girls Basketball', 'active'),
('Boys Golf', 'active'),
('Girls Golf', 'active'),
('DECCA', 'active'),
('Theater', 'active'),
('Choir', 'active'),
('Gymnastics', 'active'),
('Orchestra', 'active'),
('Band', 'active');

-- Create views for common queries
CREATE OR REPLACE VIEW member_summary AS
SELECT 
    tier,
    COUNT(*) as count,
    SUM(CASE WHEN payment_type = 'recurring' THEN 1 ELSE 0 END) as recurring_count,
    SUM(CASE WHEN payment_type = 'one-time' THEN 1 ELSE 0 END) as one_time_count
FROM members 
WHERE status = 'active'
GROUP BY tier;

CREATE OR REPLACE VIEW donation_summary AS
SELECT 
    tier,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM donations 
WHERE status = 'completed'
GROUP BY tier;

CREATE OR REPLACE VIEW revenue_summary AS
SELECT 
    'memberships' as source,
    COUNT(*) as count,
    SUM(CASE 
        WHEN tier = 'basic' THEN 25
        WHEN tier = 'silver' THEN 50
        WHEN tier = 'gold' THEN 100
        WHEN tier = 'diamond' THEN 250
        ELSE 0
    END) as total_revenue
FROM members 
WHERE status = 'active'
UNION ALL
SELECT 
    'donations' as source,
    COUNT(*) as count,
    SUM(amount) as total_revenue
FROM donations 
WHERE status = 'completed';

-- Create stored procedures for common operations

DELIMITER //

-- Procedure to get member statistics
CREATE PROCEDURE GetMemberStats()
BEGIN
    SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_members,
        COUNT(CASE WHEN tier = 'gold' THEN 1 END) as gold_members,
        COUNT(CASE WHEN tier = 'silver' THEN 1 END) as silver_members,
        COUNT(CASE WHEN tier = 'basic' THEN 1 END) as basic_members,
        COUNT(CASE WHEN tier = 'diamond' THEN 1 END) as diamond_members
    FROM members;
END //

-- Procedure to get donation statistics
CREATE PROCEDURE GetDonationStats(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        COUNT(*) as total_donations,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_donations,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_amount
    FROM donations 
    WHERE date BETWEEN start_date AND end_date;
END //

-- Procedure to search members
CREATE PROCEDURE SearchMembers(IN search_term VARCHAR(100))
BEGIN
    SELECT * FROM members 
    WHERE name LIKE CONCAT('%', search_term, '%')
       OR email LIKE CONCAT('%', search_term, '%')
    ORDER BY name;
END //

-- Procedure to get vendor 1099 data
CREATE PROCEDURE GetVendor1099Data(IN tax_year INT)
BEGIN
    SELECT 
        business_name,
        tax_id,
        address,
        city,
        state,
        zip_code,
        total_paid,
        COUNT(*) as payment_count
    FROM vendors 
    WHERE YEAR(last_payment_date) = tax_year
      AND total_paid > 0
    ORDER BY business_name;
END //

-- Procedure to backup data (creates JSON export)
CREATE PROCEDURE BackupData()
BEGIN
    SELECT 
        'members' as table_name,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', id,
                'name', name,
                'email', email,
                'tier', tier,
                'payment_type', payment_type,
                'join_date', join_date,
                'status', status
            )
        ) as data
    FROM members
    UNION ALL
    SELECT 
        'donations' as table_name,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', id,
                'donor_name', donor_name,
                'donor_email', donor_email,
                'amount', amount,
                'tier', tier,
                'payment_method', payment_method,
                'date', date,
                'status', status
            )
        ) as data
    FROM donations;
END //

DELIMITER ;

-- Create triggers for audit logging

DELIMITER //

-- Trigger to log member changes
CREATE TRIGGER log_member_changes
AFTER UPDATE ON members
FOR EACH ROW
BEGIN
    IF OLD.name != NEW.name OR OLD.email != NEW.email OR OLD.tier != NEW.tier OR OLD.status != NEW.status THEN
        INSERT INTO admin_logs (user, action, details, severity)
        VALUES (
            USER(),
            'update',
            CONCAT('Member updated: ', NEW.name, ' (ID: ', NEW.id, ')'),
            'info'
        );
    END IF;
END //

-- Trigger to log donation changes
CREATE TRIGGER log_donation_changes
AFTER UPDATE ON donations
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO admin_logs (user, action, details, severity)
        VALUES (
            USER(),
            'update',
            CONCAT('Donation status changed: ', NEW.donor_name, ' - ', OLD.status, ' to ', NEW.status),
            'info'
        );
    END IF;
END //

-- Trigger to log vendor changes
CREATE TRIGGER log_vendor_changes
AFTER INSERT ON vendors
FOR EACH ROW
BEGIN
    INSERT INTO admin_logs (user, action, details, severity)
    VALUES (
        USER(),
        'create',
        CONCAT('Vendor added: ', NEW.business_name),
        'info'
    );
END //

DELIMITER ;

-- Create indexes for performance
CREATE INDEX idx_members_composite ON members(status, tier, join_date);
CREATE INDEX idx_donations_composite ON donations(status, date, tier);
CREATE INDEX idx_admin_logs_composite ON admin_logs(timestamp, user, action);
CREATE INDEX idx_vendors_composite ON vendors(booster_club, total_paid);

-- Grant permissions (adjust as needed for your hosting)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON eastlake_wolfpack_db.* TO 'your_username'@'localhost';
-- FLUSH PRIVILEGES;

-- Comments for maintenance
/*
Database Maintenance Notes:

1. Regular backups: Use mysqldump or hosting panel backup tools
2. Index optimization: Run OPTIMIZE TABLE periodically
3. Log cleanup: Consider archiving old admin_logs entries
4. Security: Regularly update passwords and review user permissions
5. Performance: Monitor slow query log and optimize as needed

Migration from IndexedDB:
1. Export data from IndexedDB using the backup function
2. Import JSON data into MySQL using appropriate tools
3. Verify data integrity after migration
4. Update application configuration to use MySQL mode
*/ 