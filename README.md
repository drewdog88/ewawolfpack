# Eastlake Wolfpack Association Website

A comprehensive website for the Eastlake Wolfpack Association, featuring an admin panel with database management, member tracking, donation processing, and reporting capabilities.

## 🌟 Features

### Public Website
- **Homepage**: Information about the Eastlake Wolfpack Association
- **About**: Association history and mission
- **Membership**: Join the association with tier-based membership options
- **Donations**: Support the association with secure donation processing
- **Officers**: Meet the current board members
- **Contact**: Get in touch with the association

### Admin Panel
- **Dashboard**: Real-time statistics and recent activity
- **Member Management**: Track members, tiers, and payment status
- **Donation Tracking**: Monitor donations and donor information
- **Vendor Management**: 1099 vendor tracking and reporting
- **Insurance Compliance**: Insurance documentation and reporting
- **Content Management**: Update website content dynamically
- **Reporting**: Generate comprehensive reports and analytics
- **Database Management**: Full database operations and backup
- **Admin Logs**: Activity tracking and audit trails

### Database Features
- **Local Development**: IndexedDB for local development
- **Production Ready**: MySQL-compatible schema for hosting
- **Comprehensive Data**: 25+ data tables for complete tracking
- **Backup & Restore**: Full database backup and restore capabilities
- **Sample Data**: Pre-loaded sample data for testing

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: IndexedDB (local) / MySQL (production)
- **Security**: XSS prevention, input sanitization, secure logging
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean, professional design

## 📁 Project Structure

```
AndrewBrill/
├── index.html              # Main website homepage
├── about.html              # About page
├── membership.html         # Membership information
├── donate.html            # Donation page
├── officers.html          # Board officers page
├── admin.html             # Admin panel
├── admin-login.html       # Admin login
├── booster-admin.html     # Booster club admin
├── booster-login.html     # Booster club login
├── styles.css             # Main stylesheet
├── admin.css              # Admin panel styles
├── script.js              # Main website JavaScript
├── admin.js               # Admin panel functionality
├── admin-security.js      # Security utilities
├── database.js            # Database management
├── mysql-schema.sql       # MySQL database schema
├── images/                # Website images
├── test-database.html     # Database testing interface
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/drewdog88/ewawolfpack.git
   cd ewawolfpack
   ```

2. Start a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have it installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open your browser and navigate to:
   - Main website: `http://localhost:8000`
   - Admin panel: `http://localhost:8000/admin.html`
   - Database test: `http://localhost:8000/test-database.html`

### Database Setup
1. Open the database test page: `http://localhost:8000/test-database.html`
2. Click "Test Connection" to verify database initialization
3. Click "Load Sample Data" to populate with sample data
4. Test various database operations

## 🔧 Configuration

### Admin Access
- Default admin credentials are set in the database
- Use the admin login page to access the admin panel
- All admin actions are logged for security

### Database Configuration
- **Local Development**: Uses IndexedDB automatically
- **Production**: Update database connection in `database.js`
- **MySQL Migration**: Use `mysql-schema.sql` for production setup

## 📊 Database Schema

The application includes comprehensive data tables:

### Core Tables
- **members**: Member information and tier tracking
- **donations**: Donation records and donor information
- **vendors**: 1099 vendor tracking
- **insurance**: Insurance compliance records
- **booster_clubs**: Booster club information
- **admin_logs**: Admin activity logging

### Extended Tables
- **users**: User accounts and authentication
- **events**: Event management and tracking
- **financial_transactions**: Financial record keeping
- **reports**: Generated reports and analytics
- **communications**: Communication tracking
- **inventory**: Equipment and resource management
- **compliance_records**: Compliance documentation
- **performance_metrics**: Performance tracking
- **goals**: Goal setting and achievement tracking

## 🔒 Security Features

- **XSS Prevention**: All user inputs are sanitized
- **Input Validation**: Comprehensive input validation
- **Secure Logging**: Safe logging without sensitive data exposure
- **Authentication**: Secure admin authentication
- **Session Management**: Proper session handling
- **Data Sanitization**: All data is sanitized before storage

## 📈 Reporting & Analytics

### Available Reports
- **Financial Reports**: Revenue and expense tracking
- **Membership Reports**: Member statistics and trends
- **Donation Reports**: Donor analysis and contribution tracking
- **Tax Reports**: 1099 and tax compliance reporting
- **Retention Reports**: Member retention analysis
- **Tier Reports**: Membership tier distribution
- **Recognition Reports**: Donor recognition tracking

### Export Options
- **CSV Export**: Data export in CSV format
- **PDF Reports**: Professional PDF report generation
- **JSON Export**: Data export in JSON format
- **Excel Export**: Spreadsheet-compatible exports

## 🌐 Deployment

### Local Development
- Use any local web server
- Database runs in browser (IndexedDB)
- No server-side dependencies

### Production Deployment
1. **Namecheap Hosting** (Recommended):
   - Upload files to web hosting
   - Import `mysql-schema.sql` to MySQL database
   - Update database connection settings
   - Configure domain and SSL

2. **Other Hosting Options**:
   - Any web hosting with MySQL support
   - Update database configuration
   - Ensure HTTPS for security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is for the Eastlake Wolfpack Association. All rights reserved.

## 📞 Support

For support or questions:
- Contact the Eastlake Wolfpack Association
- Check the admin panel for system status
- Review the database test page for troubleshooting

## 🔄 Version History

- **v1.0.0**: Initial release with comprehensive admin panel and database
- Complete member management system
- Donation tracking and processing
- Vendor management and 1099 reporting
- Insurance compliance tracking
- Comprehensive reporting system
- Database backup and restore functionality
- Security enhancements and XSS prevention

---

**Eastlake Wolfpack Association** - Supporting student athletes and building community spirit! 