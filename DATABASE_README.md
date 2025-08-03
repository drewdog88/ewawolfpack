# Database Documentation

## Overview

The Eastlake Wolfpack Association admin panel uses a dual-database approach:
- **Local Development**: IndexedDB for immediate functionality
- **Production**: MySQL for Namecheap hosting deployment

## Database Architecture

### Local Database (IndexedDB)

The local database uses IndexedDB with the following structure:

```
EastlakeWolfpackDB (v1.0)
├── members
├── donations
├── vendors
├── insurance
├── boosterClubs
├── adminLogs
├── settings
└── users
```

### Production Database (MySQL)

The MySQL database uses the same structure with additional features:
- Stored procedures for common operations
- Views for reporting
- Triggers for audit logging
- Optimized indexes for performance

## Database Tables

### Members Table
Stores membership information for the association.

**Fields:**
- `id` - Primary key
- `name` - Member name
- `email` - Unique email address
- `tier` - Membership tier (basic, silver, gold, diamond)
- `payment_type` - Payment frequency (recurring, one-time)
- `join_date` - Date joined
- `status` - Account status (active, inactive, suspended)
- `phone` - Contact phone
- `address` - Full address
- `city`, `state`, `zip_code` - Location details
- `notes` - Additional notes
- `created_at`, `updated_at` - Timestamps

### Donations Table
Tracks all donations and contributions.

**Fields:**
- `id` - Primary key
- `donor_name` - Donor's name
- `donor_email` - Donor's email
- `amount` - Donation amount
- `tier` - Donation tier (bronze, silver, gold, diamond)
- `payment_method` - Payment method (stripe, zelle, check, cash)
- `date` - Donation date
- `status` - Payment status (pending, completed, failed, refunded)
- `booster_club` - Associated booster club
- `transaction_id` - Payment processor transaction ID
- `notes` - Additional notes
- `created_at`, `updated_at` - Timestamps

### Vendors Table
Manages vendor information for 1099 reporting.

**Fields:**
- `id` - Primary key
- `business_name` - Vendor business name
- `tax_id` - Tax identification number
- `address` - Full address
- `city`, `state`, `zip_code` - Location details
- `phone` - Contact phone
- `email` - Contact email
- `booster_club` - Associated booster club
- `services` - Services provided
- `total_paid` - Total amount paid
- `last_payment_date` - Date of last payment
- `created_at`, `updated_at` - Timestamps

### Insurance Table
Stores insurance-related information for booster clubs.

**Fields:**
- `id` - Primary key
- `booster_club` - Associated booster club
- `contact_name` - Primary contact
- `contact_phone` - Contact phone
- `contact_email` - Contact email
- `contributions` - Total contributions
- `fundraising_revenue` - Fundraising revenue
- `concessions_revenue` - Concessions revenue
- `fundraisers_data` - JSON data for fundraisers
- `camps_data` - JSON data for camps
- `conditioning_data` - JSON data for conditioning
- `hosting_events_data` - JSON data for hosted events
- `banquet_events` - Number of banquet events
- `banquet_food` - Banquet food details
- `banquet_products` - Banquet products
- `banquet_location` - Banquet location
- `banquet_coi_required` - Certificate of insurance required
- `concessions_nights` - Number of concession nights
- `concessions_types` - Types of concessions
- `created_at`, `updated_at` - Timestamps

### Booster Clubs Table
Manages booster club information and settings.

**Fields:**
- `id` - Primary key
- `name` - Club name (unique)
- `status` - Club status (active, inactive)
- `description` - Club description
- `zelle_email` - Zelle payment email
- `zelle_name` - Zelle payment name
- `donation_appeal` - Donation appeal text
- `thank_you_message` - Thank you message
- `bronze_amount`, `bronze_title`, `bronze_description` - Bronze tier settings
- `silver_amount`, `silver_title`, `silver_description` - Silver tier settings
- `gold_amount`, `gold_title`, `gold_description` - Gold tier settings
- `diamond_amount`, `diamond_title`, `diamond_description` - Diamond tier settings
- `created_at`, `updated_at` - Timestamps

### Admin Logs Table
Audit trail for all administrative actions.

**Fields:**
- `id` - Primary key
- `timestamp` - Action timestamp
- `user` - User who performed action
- `action` - Action performed
- `details` - Action details
- `severity` - Log severity (info, warning, error, critical)
- `ip_address` - User's IP address
- `user_agent` - User's browser/device
- `status` - Action status (success, error, warning)

### Settings Table
Application configuration settings.

**Fields:**
- `key` - Setting key (primary key)
- `value` - Setting value
- `description` - Setting description
- `created_at`, `updated_at` - Timestamps

### Users Table
User authentication and authorization.

**Fields:**
- `id` - Primary key
- `email` - User email (unique)
- `password_hash` - Hashed password
- `role` - User role (admin, booster_admin, viewer)
- `status` - Account status (active, inactive, suspended)
- `booster_club` - Associated booster club
- `last_login` - Last login timestamp
- `password_reset_token` - Password reset token
- `password_reset_expires` - Token expiration
- `created_at`, `updated_at` - Timestamps

## Database Operations

### Local Database Operations

The local database provides these operations:

```javascript
// Create a new record
await window.db.create('members', memberData);

// Read a record by ID
const member = await window.db.read('members', memberId);

// Update a record
await window.db.update('members', memberId, updatedData);

// Delete a record
await window.db.delete('members', memberId);

// Query records with filters
const activeMembers = await window.db.query('members', { status: 'active' });

// Query with sorting and limits
const recentDonations = await window.db.query('donations', {}, 
    { field: 'date', direction: 'desc' }, 10);
```

### Database Models

Specialized models provide domain-specific operations:

```javascript
// Member operations
const member = await window.models.members.getByEmail('user@example.com');
const goldMembers = await window.models.members.getByTier('gold');
const searchResults = await window.models.members.search('John');

// Donation operations
const donorDonations = await window.models.donations.getByDonor('donor@example.com');
const totalAmount = await window.models.donations.getTotalAmount('2024-01-01', '2024-12-31');

// Vendor operations
const vendor = await window.models.vendors.getByTaxId('12-3456789');
const clubVendors = await window.models.vendors.getByBoosterClub('Cheer');
```

## Database Management

### Backup and Restore

```javascript
// Create a backup
const backup = await window.db.backup();

// Restore from backup
await window.db.restore(backupData);
```

### Statistics

```javascript
// Get database statistics
const stats = await window.db.getStats();
console.log(`Total members: ${stats.members}`);
console.log(`Total donations: ${stats.donations}`);
```

### Sample Data

The database automatically loads sample data when first initialized:

- 3 sample members (different tiers)
- 3 sample donations (different amounts and statuses)
- 20 booster clubs
- 1 sample vendor

## Migration to MySQL

### Step 1: Export Current Data

1. Go to the Database Management section in the admin panel
2. Click "Export for Migration"
3. Save the exported JSON file

### Step 2: Set Up MySQL Database

1. Log into your Namecheap hosting control panel
2. Access phpMyAdmin or MySQL management
3. Create a new database
4. Import the `mysql-schema.sql` file

### Step 3: Import Your Data

1. Use the migration tools in phpMyAdmin
2. Import your exported JSON data
3. Verify data integrity

### Step 4: Update Configuration

1. Update database connection settings
2. Test the connection
3. Switch to MySQL mode

## MySQL Features

### Stored Procedures

The MySQL database includes these stored procedures:

- `GetMemberStats()` - Get member statistics
- `GetDonationStats(start_date, end_date)` - Get donation statistics
- `SearchMembers(search_term)` - Search members
- `GetVendor1099Data(tax_year)` - Get vendor 1099 data
- `BackupData()` - Create JSON backup

### Views

- `member_summary` - Member statistics by tier
- `donation_summary` - Donation statistics by tier
- `revenue_summary` - Combined revenue statistics

### Triggers

- `log_member_changes` - Log member updates
- `log_donation_changes` - Log donation status changes
- `log_vendor_changes` - Log vendor additions

## Security Considerations

### Data Sanitization

All data is sanitized before storage:

```javascript
// Automatic sanitization in database operations
const sanitizedData = window.db.sanitizeData(userInput);
```

### Input Validation

Use the security utilities for validation:

```javascript
// Validate email
if (!InputValidator.isValidEmail(email)) {
    throw new Error('Invalid email address');
}

// Sanitize text input
const cleanText = InputSanitizer.sanitizeText(userInput, false);
```

### Audit Logging

All database operations are logged:

```javascript
// Automatic logging in database operations
if (window.secureLogger) {
    window.secureLogger.log('database', 'Operation performed', 'info');
}
```

## Performance Optimization

### Indexes

The database includes optimized indexes for common queries:

- Email addresses (unique)
- Status fields
- Date fields
- Composite indexes for complex queries

### Query Optimization

- Use specific filters to reduce result sets
- Implement pagination for large datasets
- Use appropriate sorting for performance

### Maintenance

Regular maintenance tasks:

- Backup data regularly
- Monitor database size
- Clean up old logs
- Optimize indexes

## Troubleshooting

### Common Issues

1. **Database not initialized**
   - Check browser console for errors
   - Ensure IndexedDB is supported
   - Clear browser data if needed

2. **Data not loading**
   - Check database connection
   - Verify data integrity
   - Review error logs

3. **Migration issues**
   - Verify MySQL schema compatibility
   - Check data format
   - Test connection settings

### Debug Tools

```javascript
// Check database status
console.log('Database status:', window.db);

// View database statistics
const stats = await window.db.getStats();
console.log('Database stats:', stats);

// Check specific table
const members = await window.db.query('members');
console.log('Members:', members);
```

## Best Practices

1. **Regular Backups**: Create backups before major changes
2. **Data Validation**: Always validate input before storage
3. **Error Handling**: Implement proper error handling
4. **Logging**: Log all important operations
5. **Testing**: Test database operations thoroughly
6. **Documentation**: Keep documentation updated

## Support

For database-related issues:

1. Check the browser console for errors
2. Review the admin logs
3. Verify data integrity
4. Contact technical support if needed

## Future Enhancements

Planned database improvements:

- Real-time synchronization
- Advanced reporting features
- Data analytics dashboard
- Automated backup scheduling
- Performance monitoring tools 