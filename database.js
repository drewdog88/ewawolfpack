/**
 * Database Layer for Eastlake Wolfpack Association Admin Panel
 * 
 * Features:
 * - Local IndexedDB for development
 * - MySQL-compatible schema and queries
 * - Secure data handling
 * - Migration support
 * - Backup and restore functionality
 */

// Database Configuration
const DB_CONFIG = {
    name: 'EastlakeWolfpackDB',
    version: 1,
    stores: {
        // Core data
        members: { keyPath: 'id', autoIncrement: true },
        donations: { keyPath: 'id', autoIncrement: true },
        vendors: { keyPath: 'id', autoIncrement: true },
        insurance: { keyPath: 'id', autoIncrement: true },
        boosterClubs: { keyPath: 'id', autoIncrement: true },
        users: { keyPath: 'id', autoIncrement: true },
        settings: { keyPath: 'key' },
        
        // Reporting and analytics
        adminLogs: { keyPath: 'id', autoIncrement: true },
        userActivity: { keyPath: 'id', autoIncrement: true },
        financialTransactions: { keyPath: 'id', autoIncrement: true },
        reports: { keyPath: 'id', autoIncrement: true },
        analytics: { keyPath: 'id', autoIncrement: true },
        
        // Event and activity tracking
        events: { keyPath: 'id', autoIncrement: true },
        eventRegistrations: { keyPath: 'id', autoIncrement: true },
        volunteerHours: { keyPath: 'id', autoIncrement: true },
        fundraisingEvents: { keyPath: 'id', autoIncrement: true },
        
        // Communication and notifications
        communications: { keyPath: 'id', autoIncrement: true },
        emailLogs: { keyPath: 'id', autoIncrement: true },
        notifications: { keyPath: 'id', autoIncrement: true },
        
        // Inventory and resources
        inventory: { keyPath: 'id', autoIncrement: true },
        equipment: { keyPath: 'id', autoIncrement: true },
        resources: { keyPath: 'id', autoIncrement: true },
        
        // Compliance and documentation
        complianceRecords: { keyPath: 'id', autoIncrement: true },
        documents: { keyPath: 'id', autoIncrement: true },
        taxRecords: { keyPath: 'id', autoIncrement: true },
        
        // Performance and metrics
        performanceMetrics: { keyPath: 'id', autoIncrement: true },
        goals: { keyPath: 'id', autoIncrement: true },
        achievements: { keyPath: 'id', autoIncrement: true }
    }
};

/**
 * Database Manager Class
 * Handles both local IndexedDB and MySQL-compatible operations
 */
class DatabaseManager {
    constructor() {
        this.db = null;
        this.isLocal = true; // Set to false when using MySQL
        this.connectionString = null;
    }

    /**
     * Initialize database connection
     */
    async init() {
        try {
            if (this.isLocal) {
                await this.initIndexedDB();
            } else {
                await this.initMySQL();
            }
            
            // Log database initialization
            if (window.secureLogger) {
                window.secureLogger.log('database', 'Database initialized successfully', 'info');
            }
            
            return true;
        } catch (error) {
            console.error('Database initialization failed:', error);
            if (window.secureLogger) {
                window.secureLogger.log('database', `Database initialization failed: ${error.message}`, 'error');
            }
            throw error;
        }
    }

    /**
     * Initialize IndexedDB for local development
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                Object.entries(DB_CONFIG.stores).forEach(([storeName, config]) => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, config);
                        
                        // Create indexes for common queries
                        this.createIndexes(store, storeName);
                    }
                });
            };
        });
    }

    /**
     * Create indexes for efficient querying
     */
    createIndexes(store, storeName) {
        switch (storeName) {
            // Core data indexes
            case 'members':
                store.createIndex('email', 'email', { unique: true });
                store.createIndex('tier', 'tier', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('joinDate', 'joinDate', { unique: false });
                store.createIndex('paymentType', 'paymentType', { unique: false });
                store.createIndex('city', 'city', { unique: false });
                store.createIndex('state', 'state', { unique: false });
                break;
                
            case 'donations':
                store.createIndex('donorEmail', 'donorEmail', { unique: false });
                store.createIndex('amount', 'amount', { unique: false });
                store.createIndex('tier', 'tier', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('paymentMethod', 'paymentMethod', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                break;
                
            case 'vendors':
                store.createIndex('taxId', 'taxId', { unique: true });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('businessName', 'businessName', { unique: false });
                store.createIndex('totalPaid', 'totalPaid', { unique: false });
                break;
                
            case 'insurance':
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('contactEmail', 'contactEmail', { unique: false });
                store.createIndex('contributions', 'contributions', { unique: false });
                break;
                
            case 'boosterClubs':
                store.createIndex('name', 'name', { unique: true });
                store.createIndex('status', 'status', { unique: false });
                break;
                
            case 'users':
                store.createIndex('email', 'email', { unique: true });
                store.createIndex('role', 'role', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('lastLogin', 'lastLogin', { unique: false });
                break;
                
            // Reporting and analytics indexes
            case 'adminLogs':
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('user', 'user', { unique: false });
                store.createIndex('action', 'action', { unique: false });
                store.createIndex('severity', 'severity', { unique: false });
                store.createIndex('ipAddress', 'ipAddress', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                break;
                
            case 'userActivity':
                store.createIndex('userId', 'userId', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('action', 'action', { unique: false });
                store.createIndex('page', 'page', { unique: false });
                store.createIndex('sessionId', 'sessionId', { unique: false });
                break;
                
            case 'financialTransactions':
                store.createIndex('transactionId', 'transactionId', { unique: true });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('amount', 'amount', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('paymentMethod', 'paymentMethod', { unique: false });
                break;
                
            case 'reports':
                store.createIndex('reportType', 'reportType', { unique: false });
                store.createIndex('generatedBy', 'generatedBy', { unique: false });
                store.createIndex('dateGenerated', 'dateGenerated', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                break;
                
            case 'analytics':
                store.createIndex('metricName', 'metricName', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                break;
                
            // Event and activity tracking indexes
            case 'events':
                store.createIndex('eventType', 'eventType', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('location', 'location', { unique: false });
                break;
                
            case 'eventRegistrations':
                store.createIndex('eventId', 'eventId', { unique: false });
                store.createIndex('userId', 'userId', { unique: false });
                store.createIndex('registrationDate', 'registrationDate', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                break;
                
            case 'volunteerHours':
                store.createIndex('volunteerId', 'volunteerId', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('eventId', 'eventId', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                break;
                
            case 'fundraisingEvents':
                store.createIndex('eventName', 'eventName', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('goalAmount', 'goalAmount', { unique: false });
                break;
                
            // Communication indexes
            case 'communications':
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('recipient', 'recipient', { unique: false });
                store.createIndex('dateSent', 'dateSent', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('priority', 'priority', { unique: false });
                break;
                
            case 'emailLogs':
                store.createIndex('recipient', 'recipient', { unique: false });
                store.createIndex('dateSent', 'dateSent', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('template', 'template', { unique: false });
                break;
                
            case 'notifications':
                store.createIndex('userId', 'userId', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('dateCreated', 'dateCreated', { unique: false });
                store.createIndex('read', 'read', { unique: false });
                store.createIndex('priority', 'priority', { unique: false });
                break;
                
            // Inventory and resources indexes
            case 'inventory':
                store.createIndex('itemName', 'itemName', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('location', 'location', { unique: false });
                break;
                
            case 'equipment':
                store.createIndex('equipmentName', 'equipmentName', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('lastMaintenance', 'lastMaintenance', { unique: false });
                break;
                
            case 'resources':
                store.createIndex('resourceName', 'resourceName', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                break;
                
            // Compliance and documentation indexes
            case 'complianceRecords':
                store.createIndex('recordType', 'recordType', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('expiryDate', 'expiryDate', { unique: false });
                break;
                
            case 'documents':
                store.createIndex('documentType', 'documentType', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('dateCreated', 'dateCreated', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                break;
                
            case 'taxRecords':
                store.createIndex('taxYear', 'taxYear', { unique: false });
                store.createIndex('recordType', 'recordType', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                break;
                
            // Performance and metrics indexes
            case 'performanceMetrics':
                store.createIndex('metricName', 'metricName', { unique: false });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                break;
                
            case 'goals':
                store.createIndex('goalType', 'goalType', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('targetDate', 'targetDate', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('priority', 'priority', { unique: false });
                break;
                
            case 'achievements':
                store.createIndex('achievementType', 'achievementType', { unique: false });
                store.createIndex('boosterClub', 'boosterClub', { unique: false });
                store.createIndex('dateAchieved', 'dateAchieved', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                break;
        }
    }

    /**
     * Initialize MySQL connection (for production)
     */
    async initMySQL() {
        // This would be implemented when connecting to MySQL on Namecheap
        // For now, we'll use a placeholder
        throw new Error('MySQL connection not yet implemented');
    }

    /**
     * Generic CRUD operations
     */
    async create(storeName, data) {
        try {
            // Sanitize data before storage
            const sanitizedData = this.sanitizeData(data);
            
            if (this.isLocal) {
                return await this.createLocal(storeName, sanitizedData);
            } else {
                return await this.createMySQL(storeName, sanitizedData);
            }
        } catch (error) {
            console.error(`Error creating ${storeName}:`, error);
            throw error;
        }
    }

    async read(storeName, id) {
        try {
            if (this.isLocal) {
                return await this.readLocal(storeName, id);
            } else {
                return await this.readMySQL(storeName, id);
            }
        } catch (error) {
            console.error(`Error reading ${storeName}:`, error);
            throw error;
        }
    }

    async update(storeName, id, data) {
        try {
            // Sanitize data before storage
            const sanitizedData = this.sanitizeData(data);
            
            if (this.isLocal) {
                return await this.updateLocal(storeName, id, sanitizedData);
            } else {
                return await this.updateMySQL(storeName, id, sanitizedData);
            }
        } catch (error) {
            console.error(`Error updating ${storeName}:`, error);
            throw error;
        }
    }

    async delete(storeName, id) {
        try {
            if (this.isLocal) {
                return await this.deleteLocal(storeName, id);
            } else {
                return await this.deleteMySQL(storeName, id);
            }
        } catch (error) {
            console.error(`Error deleting ${storeName}:`, error);
            throw error;
        }
    }

    async query(storeName, filters = {}, sort = null, limit = null) {
        try {
            if (this.isLocal) {
                return await this.queryLocal(storeName, filters, sort, limit);
            } else {
                return await this.queryMySQL(storeName, filters, sort, limit);
            }
        } catch (error) {
            console.error(`Error querying ${storeName}:`, error);
            throw error;
        }
    }

    /**
     * Local IndexedDB operations
     */
    async createLocal(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Failed to create ${storeName} record`));
            };
        });
    }

    async readLocal(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error(`Failed to read ${storeName} record`));
            };
        });
    }

    async updateLocal(storeName, id, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            // Get existing record first
            const getRequest = store.get(id);
            
            getRequest.onsuccess = () => {
                const existingData = getRequest.result;
                if (!existingData) {
                    reject(new Error(`Record not found in ${storeName}`));
                    return;
                }
                
                // Merge with existing data
                const updatedData = { ...existingData, ...data, id: id };
                const putRequest = store.put(updatedData);
                
                putRequest.onsuccess = () => {
                    resolve(putRequest.result);
                };
                
                putRequest.onerror = () => {
                    reject(new Error(`Failed to update ${storeName} record`));
                };
            };
            
            getRequest.onerror = () => {
                reject(new Error(`Failed to read ${storeName} record for update`));
            };
        });
    }

    async deleteLocal(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = () => {
                reject(new Error(`Failed to delete ${storeName} record`));
            };
        });
    }

    async queryLocal(storeName, filters = {}, sort = null, limit = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                let results = request.result;
                
                // Apply filters
                if (Object.keys(filters).length > 0) {
                    results = results.filter(item => {
                        return Object.entries(filters).every(([key, value]) => {
                            if (typeof value === 'object' && value.operator) {
                                switch (value.operator) {
                                    case 'contains':
                                        return item[key] && item[key].toLowerCase().includes(value.value.toLowerCase());
                                    case 'startsWith':
                                        return item[key] && item[key].toLowerCase().startsWith(value.value.toLowerCase());
                                    case 'endsWith':
                                        return item[key] && item[key].toLowerCase().endsWith(value.value.toLowerCase());
                                    case 'gt':
                                        return item[key] > value.value;
                                    case 'gte':
                                        return item[key] >= value.value;
                                    case 'lt':
                                        return item[key] < value.value;
                                    case 'lte':
                                        return item[key] <= value.value;
                                    default:
                                        return item[key] === value.value;
                                }
                            }
                            return item[key] === value;
                        });
                    });
                }
                
                // Apply sorting
                if (sort) {
                    results.sort((a, b) => {
                        const aVal = a[sort.field];
                        const bVal = b[sort.field];
                        
                        if (sort.direction === 'desc') {
                            return bVal > aVal ? 1 : -1;
                        }
                        return aVal > bVal ? 1 : -1;
                    });
                }
                
                // Apply limit
                if (limit) {
                    results = results.slice(0, limit);
                }
                
                resolve(results);
            };

            request.onerror = () => {
                reject(new Error(`Failed to query ${storeName}`));
            };
        });
    }

    /**
     * MySQL operations (placeholders for production)
     */
    async createMySQL(storeName, data) {
        // This would be implemented when connecting to MySQL
        throw new Error('MySQL operations not yet implemented');
    }

    async readMySQL(storeName, id) {
        throw new Error('MySQL operations not yet implemented');
    }

    async updateMySQL(storeName, id, data) {
        throw new Error('MySQL operations not yet implemented');
    }

    async deleteMySQL(storeName, id) {
        throw new Error('MySQL operations not yet implemented');
    }

    async queryMySQL(storeName, filters, sort, limit) {
        throw new Error('MySQL operations not yet implemented');
    }

    /**
     * Data sanitization
     */
    sanitizeData(data) {
        if (typeof data !== 'object' || data === null) {
            return data;
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                // Use the security utilities for sanitization
                if (window.SecurityUtils && window.SecurityUtils.InputSanitizer) {
                    sanitized[key] = window.SecurityUtils.InputSanitizer.sanitizeText(value, false);
                } else {
                    // Fallback sanitization
                    sanitized[key] = value.replace(/<[^>]*>/g, '').trim();
                }
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeData(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    /**
     * Database utilities
     */
    async backup() {
        try {
            const backup = {};
            
            for (const storeName of Object.keys(DB_CONFIG.stores)) {
                backup[storeName] = await this.query(storeName);
            }
            
            const backupData = {
                timestamp: new Date().toISOString(),
                version: DB_CONFIG.version,
                data: backup
            };
            
            // Create downloadable backup file
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `eastlake_wolfpack_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (window.secureLogger) {
                window.secureLogger.log('database', 'Database backup created', 'info');
            }
            
            return backupData;
        } catch (error) {
            console.error('Backup failed:', error);
            throw error;
        }
    }

    async restore(backupData) {
        try {
            // Validate backup data
            if (!backupData.data || !backupData.version) {
                throw new Error('Invalid backup data format');
            }
            
            // Clear existing data
            for (const storeName of Object.keys(DB_CONFIG.stores)) {
                const allRecords = await this.query(storeName);
                for (const record of allRecords) {
                    await this.delete(storeName, record.id);
                }
            }
            
            // Restore data
            for (const [storeName, records] of Object.entries(backupData.data)) {
                for (const record of records) {
                    const { id, ...data } = record;
                    await this.create(storeName, data);
                }
            }
            
            if (window.secureLogger) {
                window.secureLogger.log('database', 'Database restored from backup', 'info');
            }
            
            return true;
        } catch (error) {
            console.error('Restore failed:', error);
            throw error;
        }
    }

    async getStats() {
        try {
            const stats = {};
            
            for (const storeName of Object.keys(DB_CONFIG.stores)) {
                const records = await this.query(storeName);
                stats[storeName] = records.length;
            }
            
            return stats;
        } catch (error) {
            console.error('Failed to get database stats:', error);
            throw error;
        }
    }

    /**
     * Switch between local and MySQL modes
     */
    setMode(isLocal) {
        this.isLocal = isLocal;
        if (window.secureLogger) {
            window.secureLogger.log('database', `Database mode switched to ${isLocal ? 'local' : 'MySQL'}`, 'info');
        }
    }

    /**
     * Set MySQL connection string
     */
    setConnectionString(connectionString) {
        this.connectionString = connectionString;
    }
}

/**
 * Database Models
 * Provide specific methods for each data type
 */
class MemberModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'members';
    }

    async create(memberData) {
        const defaultData = {
            joinDate: new Date().toISOString(),
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...memberData });
    }

    async update(id, memberData) {
        const updateData = {
            ...memberData,
            updatedAt: new Date().toISOString()
        };
        
        return await this.db.update(this.storeName, id, updateData);
    }

    async getByEmail(email) {
        const results = await this.db.query(this.storeName, { email: email });
        return results.length > 0 ? results[0] : null;
    }

    async getByTier(tier) {
        return await this.db.query(this.storeName, { tier: tier });
    }

    async getActive() {
        return await this.db.query(this.storeName, { status: 'active' });
    }

    async search(searchTerm) {
        return await this.db.query(this.storeName, {
            name: { operator: 'contains', value: searchTerm }
        });
    }
}

class DonationModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'donations';
    }

    async create(donationData) {
        const defaultData = {
            date: new Date().toISOString(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...donationData });
    }

    async update(id, donationData) {
        const updateData = {
            ...donationData,
            updatedAt: new Date().toISOString()
        };
        
        return await this.db.update(this.storeName, id, updateData);
    }

    async getByDonor(email) {
        return await this.db.query(this.storeName, { donorEmail: email });
    }

    async getByTier(tier) {
        return await this.db.query(this.storeName, { tier: tier });
    }

    async getByStatus(status) {
        return await this.db.query(this.storeName, { status: status });
    }

    async getTotalAmount(startDate = null, endDate = null) {
        const donations = await this.db.query(this.storeName);
        
        let filtered = donations;
        if (startDate || endDate) {
            filtered = donations.filter(donation => {
                const donationDate = new Date(donation.date);
                if (startDate && donationDate < new Date(startDate)) return false;
                if (endDate && donationDate > new Date(endDate)) return false;
                return true;
            });
        }
        
        return filtered.reduce((total, donation) => total + parseFloat(donation.amount || 0), 0);
    }
}

class VendorModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'vendors';
    }

    async create(vendorData) {
        const defaultData = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...vendorData });
    }

    async update(id, vendorData) {
        const updateData = {
            ...vendorData,
            updatedAt: new Date().toISOString()
        };
        
        return await this.db.update(this.storeName, id, updateData);
    }

    async getByTaxId(taxId) {
        const results = await this.db.query(this.storeName, { taxId: taxId });
        return results.length > 0 ? results[0] : null;
    }

    async getByBoosterClub(boosterClub) {
        return await this.db.query(this.storeName, { boosterClub: boosterClub });
    }
}

class InsuranceModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'insurance';
    }

    async create(insuranceData) {
        const defaultData = {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...insuranceData });
    }

    async update(id, insuranceData) {
        const updateData = {
            ...insuranceData,
            updatedAt: new Date().toISOString()
        };
        
        return await this.db.update(this.storeName, id, updateData);
    }

    async getByBoosterClub(boosterClub) {
        const results = await this.db.query(this.storeName, { boosterClub: boosterClub });
        return results.length > 0 ? results[0] : null;
    }
}

class BoosterClubModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'boosterClubs';
    }

    async create(clubData) {
        const defaultData = {
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...clubData });
    }

    async update(id, clubData) {
        const updateData = {
            ...clubData,
            updatedAt: new Date().toISOString()
        };
        
        return await this.db.update(this.storeName, id, updateData);
    }

    async getByName(name) {
        const results = await this.db.query(this.storeName, { name: name });
        return results.length > 0 ? results[0] : null;
    }

    async getActive() {
        return await this.db.query(this.storeName, { status: 'active' });
    }
}

class AdminLogModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'adminLogs';
    }

    async create(logData) {
        const defaultData = {
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...logData });
    }

    async getByUser(user) {
        return await this.db.query(this.storeName, { user: user });
    }

    async getByAction(action) {
        return await this.db.query(this.storeName, { action: action });
    }

    async getByDateRange(startDate, endDate) {
        return await this.db.query(this.storeName, {
            timestamp: { operator: 'gte', value: startDate }
        }).then(logs => 
            logs.filter(log => log.timestamp <= endDate)
        );
    }

    async getRecent(limit = 100) {
        return await this.db.query(this.storeName, {}, 
            { field: 'timestamp', direction: 'desc' }, limit);
    }
}

// User Activity Tracking Model
class UserActivityModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'userActivity';
    }

    async create(activityData) {
        const defaultData = {
            timestamp: new Date().toISOString(),
            sessionId: this.generateSessionId(),
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...activityData });
    }

    async getByUser(userId) {
        return await this.db.query(this.storeName, { userId: userId });
    }

    async getBySession(sessionId) {
        return await this.db.query(this.storeName, { sessionId: sessionId });
    }

    async getByDateRange(startDate, endDate) {
        return await this.db.query(this.storeName, {
            timestamp: { operator: 'gte', value: startDate }
        }).then(activities => 
            activities.filter(activity => activity.timestamp <= endDate)
        );
    }

    async getPageViews(page) {
        return await this.db.query(this.storeName, { page: page });
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Financial Transactions Model
class FinancialTransactionModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'financialTransactions';
    }

    async create(transactionData) {
        const defaultData = {
            transactionId: this.generateTransactionId(),
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...transactionData });
    }

    async getByTransactionId(transactionId) {
        const results = await this.db.query(this.storeName, { transactionId: transactionId });
        return results.length > 0 ? results[0] : null;
    }

    async getByType(type) {
        return await this.db.query(this.storeName, { type: type });
    }

    async getByDateRange(startDate, endDate) {
        return await this.db.query(this.storeName, {
            date: { operator: 'gte', value: startDate }
        }).then(transactions => 
            transactions.filter(transaction => transaction.date <= endDate)
        );
    }

    async getTotalAmount(startDate = null, endDate = null) {
        const transactions = await this.db.query(this.storeName);
        
        let filtered = transactions;
        if (startDate || endDate) {
            filtered = transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                if (startDate && transactionDate < new Date(startDate)) return false;
                if (endDate && transactionDate > new Date(endDate)) return false;
                return true;
            });
        }
        
        return filtered.reduce((total, transaction) => total + parseFloat(transaction.amount || 0), 0);
    }

    generateTransactionId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Reports Model
class ReportModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'reports';
    }

    async create(reportData) {
        const defaultData = {
            dateGenerated: new Date().toISOString(),
            status: 'generated',
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...reportData });
    }

    async getByType(reportType) {
        return await this.db.query(this.storeName, { reportType: reportType });
    }

    async getByUser(generatedBy) {
        return await this.db.query(this.storeName, { generatedBy: generatedBy });
    }

    async getRecent(limit = 50) {
        return await this.db.query(this.storeName, {}, 
            { field: 'dateGenerated', direction: 'desc' }, limit);
    }
}

// Analytics Model
class AnalyticsModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'analytics';
    }

    async create(analyticsData) {
        const defaultData = {
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...analyticsData });
    }

    async getByMetric(metricName) {
        return await this.db.query(this.storeName, { metricName: metricName });
    }

    async getByCategory(category) {
        return await this.db.query(this.storeName, { category: category });
    }

    async getByDateRange(startDate, endDate) {
        return await this.db.query(this.storeName, {
            date: { operator: 'gte', value: startDate }
        }).then(analytics => 
            analytics.filter(analytic => analytic.date <= endDate)
        );
    }

    async getMetricsByDate(date) {
        return await this.db.query(this.storeName, { date: date });
    }
}

// Events Model
class EventModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'events';
    }

    async create(eventData) {
        const defaultData = {
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...eventData });
    }

    async getByType(eventType) {
        return await this.db.query(this.storeName, { eventType: eventType });
    }

    async getByDateRange(startDate, endDate) {
        return await this.db.query(this.storeName, {
            date: { operator: 'gte', value: startDate }
        }).then(events => 
            events.filter(event => event.date <= endDate)
        );
    }

    async getUpcoming() {
        const today = new Date().toISOString().split('T')[0];
        return await this.db.query(this.storeName, {
            date: { operator: 'gte', value: today }
        });
    }
}

// Event Registrations Model
class EventRegistrationModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'eventRegistrations';
    }

    async create(registrationData) {
        const defaultData = {
            registrationDate: new Date().toISOString(),
            status: 'registered',
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...registrationData });
    }

    async getByEvent(eventId) {
        return await this.db.query(this.storeName, { eventId: eventId });
    }

    async getByUser(userId) {
        return await this.db.query(this.storeName, { userId: userId });
    }

    async getByStatus(status) {
        return await this.db.query(this.storeName, { status: status });
    }
}

// Volunteer Hours Model
class VolunteerHoursModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'volunteerHours';
    }

    async create(hoursData) {
        const defaultData = {
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...hoursData });
    }

    async getByVolunteer(volunteerId) {
        return await this.db.query(this.storeName, { volunteerId: volunteerId });
    }

    async getByEvent(eventId) {
        return await this.db.query(this.storeName, { eventId: eventId });
    }

    async getTotalHours(volunteerId, startDate = null, endDate = null) {
        const hours = await this.db.query(this.storeName, { volunteerId: volunteerId });
        
        let filtered = hours;
        if (startDate || endDate) {
            filtered = hours.filter(hour => {
                const hourDate = new Date(hour.date);
                if (startDate && hourDate < new Date(startDate)) return false;
                if (endDate && hourDate > new Date(endDate)) return false;
                return true;
            });
        }
        
        return filtered.reduce((total, hour) => total + parseFloat(hour.hours || 0), 0);
    }
}

// Fundraising Events Model
class FundraisingEventModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'fundraisingEvents';
    }

    async create(eventData) {
        const defaultData = {
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...eventData });
    }

    async getByBoosterClub(boosterClub) {
        return await this.db.query(this.storeName, { boosterClub: boosterClub });
    }

    async getByStatus(status) {
        return await this.db.query(this.storeName, { status: status });
    }

    async getUpcoming() {
        const today = new Date().toISOString().split('T')[0];
        return await this.db.query(this.storeName, {
            date: { operator: 'gte', value: today }
        });
    }
}

// Communications Model
class CommunicationModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'communications';
    }

    async create(communicationData) {
        const defaultData = {
            dateSent: new Date().toISOString(),
            status: 'sent',
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...communicationData });
    }

    async getByType(type) {
        return await this.db.query(this.storeName, { type: type });
    }

    async getByRecipient(recipient) {
        return await this.db.query(this.storeName, { recipient: recipient });
    }

    async getByDateRange(startDate, endDate) {
        return await this.db.query(this.storeName, {
            dateSent: { operator: 'gte', value: startDate }
        }).then(communications => 
            communications.filter(comm => comm.dateSent <= endDate)
        );
    }
}

// Email Logs Model
class EmailLogModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'emailLogs';
    }

    async create(emailData) {
        const defaultData = {
            dateSent: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...emailData });
    }

    async getByRecipient(recipient) {
        return await this.db.query(this.storeName, { recipient: recipient });
    }

    async getByTemplate(template) {
        return await this.db.query(this.storeName, { template: template });
    }

    async getByStatus(status) {
        return await this.db.query(this.storeName, { status: status });
    }
}

// Notifications Model
class NotificationModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'notifications';
    }

    async create(notificationData) {
        const defaultData = {
            dateCreated: new Date().toISOString(),
            read: false,
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...notificationData });
    }

    async getByUser(userId) {
        return await this.db.query(this.storeName, { userId: userId });
    }

    async getUnread(userId) {
        return await this.db.query(this.storeName, { userId: userId, read: false });
    }

    async markAsRead(notificationId) {
        const notification = await this.db.read(this.storeName, notificationId);
        if (notification) {
            return await this.db.update(this.storeName, notificationId, { read: true });
        }
    }
}

// Inventory Model
class InventoryModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'inventory';
    }

    async create(inventoryData) {
        const defaultData = {
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...inventoryData });
    }

    async getByCategory(category) {
        return await this.db.query(this.storeName, { category: category });
    }

    async getByBoosterClub(boosterClub) {
        return await this.db.query(this.storeName, { boosterClub: boosterClub });
    }

    async getLowStock(threshold = 10) {
        return await this.db.query(this.storeName, {
            quantity: { operator: 'lte', value: threshold }
        });
    }
}

// Equipment Model
class EquipmentModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'equipment';
    }

    async create(equipmentData) {
        const defaultData = {
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...equipmentData });
    }

    async getByCategory(category) {
        return await this.db.query(this.storeName, { category: category });
    }

    async getByBoosterClub(boosterClub) {
        return await this.db.query(this.storeName, { boosterClub: boosterClub });
    }

    async getNeedsMaintenance() {
        const today = new Date().toISOString().split('T')[0];
        return await this.db.query(this.storeName, {
            lastMaintenance: { operator: 'lte', value: today }
        });
    }
}

// Resources Model
class ResourceModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'resources';
    }

    async create(resourceData) {
        const defaultData = {
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...resourceData });
    }

    async getByType(type) {
        return await this.db.query(this.storeName, { type: type });
    }

    async getByBoosterClub(boosterClub) {
        return await this.db.query(this.storeName, { boosterClub: boosterClub });
    }

    async getByStatus(status) {
        return await this.db.query(this.storeName, { status: status });
    }
}

// Compliance Records Model
class ComplianceRecordModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'complianceRecords';
    }

    async create(recordData) {
        const defaultData = {
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...recordData });
    }

    async getByType(recordType) {
        return await this.db.query(this.storeName, { recordType: recordType });
    }

    async getByBoosterClub(boosterClub) {
        return await this.db.query(this.storeName, { boosterClub: boosterClub });
    }

    async getExpiringSoon(days = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return await this.db.query(this.storeName, {
            expiryDate: { operator: 'lte', value: futureDate.toISOString() }
        });
    }
}

// Documents Model
class DocumentModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'documents';
    }

    async create(documentData) {
        const defaultData = {
            dateCreated: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...documentData });
    }

    async getByType(documentType) {
        return await this.db.query(this.storeName, { documentType: documentType });
    }

    async getByBoosterClub(boosterClub) {
        return await this.db.query(this.storeName, { boosterClub: boosterClub });
    }

    async getByCategory(category) {
        return await this.db.query(this.storeName, { category: category });
    }
}

// Tax Records Model
class TaxRecordModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'taxRecords';
    }

    async create(recordData) {
        const defaultData = {
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...recordData });
    }

    async getByTaxYear(taxYear) {
        return await this.db.query(this.storeName, { taxYear: taxYear });
    }

    async getByType(recordType) {
        return await this.db.query(this.storeName, { recordType: recordType });
    }

    async getByBoosterClub(boosterClub) {
        return await this.db.query(this.storeName, { boosterClub: boosterClub });
    }
}

// Performance Metrics Model
class PerformanceMetricModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'performanceMetrics';
    }

    async create(metricData) {
        const defaultData = {
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...metricData });
    }

    async getByMetric(metricName) {
        return await this.db.query(this.storeName, { metricName: metricName });
    }

    async getByCategory(category) {
        return await this.db.query(this.storeName, { category: category });
    }

    async getByDateRange(startDate, endDate) {
        return await this.db.query(this.storeName, {
            date: { operator: 'gte', value: startDate }
        }).then(metrics => 
            metrics.filter(metric => metric.date <= endDate)
        );
    }
}

// Goals Model
class GoalModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'goals';
    }

    async create(goalData) {
        const defaultData = {
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...goalData });
    }

    async getByType(goalType) {
        return await this.db.query(this.storeName, { goalType: goalType });
    }

    async getByBoosterClub(boosterClub) {
        return await this.db.query(this.storeName, { boosterClub: boosterClub });
    }

    async getByStatus(status) {
        return await this.db.query(this.storeName, { status: status });
    }

    async getOverdue() {
        const today = new Date().toISOString().split('T')[0];
        return await this.db.query(this.storeName, {
            targetDate: { operator: 'lt', value: today },
            status: { operator: 'ne', value: 'completed' }
        });
    }
}

// Achievements Model
class AchievementModel {
    constructor(dbManager) {
        this.db = dbManager;
        this.storeName = 'achievements';
    }

    async create(achievementData) {
        const defaultData = {
            dateAchieved: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        return await this.db.create(this.storeName, { ...defaultData, ...achievementData });
    }

    async getByType(achievementType) {
        return await this.db.query(this.storeName, { achievementType: achievementType });
    }

    async getByBoosterClub(boosterClub) {
        return await this.db.query(this.storeName, { boosterClub: boosterClub });
    }

    async getByCategory(category) {
        return await this.db.query(this.storeName, { category: category });
    }

    async getRecent(limit = 20) {
        return await this.db.query(this.storeName, {}, 
            { field: 'dateAchieved', direction: 'desc' }, limit);
    }
}

/**
 * Database initialization and setup
 */
class DatabaseSetup {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.models = {};
    }

    async initialize() {
        try {
            await this.dbManager.init();
            
            // Initialize core models
            this.models.members = new MemberModel(this.dbManager);
            this.models.donations = new DonationModel(this.dbManager);
            this.models.vendors = new VendorModel(this.dbManager);
            this.models.insurance = new InsuranceModel(this.dbManager);
            this.models.boosterClubs = new BoosterClubModel(this.dbManager);
            this.models.users = new UserModel(this.dbManager);
            
            // Initialize reporting and analytics models
            this.models.adminLogs = new AdminLogModel(this.dbManager);
            this.models.userActivity = new UserActivityModel(this.dbManager);
            this.models.financialTransactions = new FinancialTransactionModel(this.dbManager);
            this.models.reports = new ReportModel(this.dbManager);
            this.models.analytics = new AnalyticsModel(this.dbManager);
            
            // Initialize event and activity tracking models
            this.models.events = new EventModel(this.dbManager);
            this.models.eventRegistrations = new EventRegistrationModel(this.dbManager);
            this.models.volunteerHours = new VolunteerHoursModel(this.dbManager);
            this.models.fundraisingEvents = new FundraisingEventModel(this.dbManager);
            
            // Initialize communication models
            this.models.communications = new CommunicationModel(this.dbManager);
            this.models.emailLogs = new EmailLogModel(this.dbManager);
            this.models.notifications = new NotificationModel(this.dbManager);
            
            // Initialize inventory and resources models
            this.models.inventory = new InventoryModel(this.dbManager);
            this.models.equipment = new EquipmentModel(this.dbManager);
            this.models.resources = new ResourceModel(this.dbManager);
            
            // Initialize compliance and documentation models
            this.models.complianceRecords = new ComplianceRecordModel(this.dbManager);
            this.models.documents = new DocumentModel(this.dbManager);
            this.models.taxRecords = new TaxRecordModel(this.dbManager);
            
            // Initialize performance and metrics models
            this.models.performanceMetrics = new PerformanceMetricModel(this.dbManager);
            this.models.goals = new GoalModel(this.dbManager);
            this.models.achievements = new AchievementModel(this.dbManager);
            
            // Load sample data if database is empty
            await this.loadSampleData();
            
            if (window.secureLogger) {
                window.secureLogger.log('database', 'Database setup completed', 'info');
            }
            
            return true;
        } catch (error) {
            console.error('Database setup failed:', error);
            throw error;
        }
    }

    async loadSampleData() {
        try {
            const stats = await this.dbManager.getStats();
            
            // Only load sample data if database is empty
            if (stats.members === 0) {
                await this.loadSampleMembers();
            }
            
            if (stats.donations === 0) {
                await this.loadSampleDonations();
            }
            
            if (stats.boosterClubs === 0) {
                await this.loadSampleBoosterClubs();
            }
            
            if (stats.vendors === 0) {
                await this.loadSampleVendors();
            }
            
            if (stats.users === 0) {
                await this.loadSampleUsers();
            }
            
            if (stats.events === 0) {
                await this.loadSampleEvents();
            }
            
            if (stats.fundraisingEvents === 0) {
                await this.loadSampleFundraisingEvents();
            }
            
            if (stats.volunteerHours === 0) {
                await this.loadSampleVolunteerHours();
            }
            
            if (stats.financialTransactions === 0) {
                await this.loadSampleFinancialTransactions();
            }
            
            if (stats.analytics === 0) {
                await this.loadSampleAnalytics();
            }
            
            if (stats.goals === 0) {
                await this.loadSampleGoals();
            }
            
            if (stats.achievements === 0) {
                await this.loadSampleAchievements();
            }
            
            if (stats.inventory === 0) {
                await this.loadSampleInventory();
            }
            
            if (stats.equipment === 0) {
                await this.loadSampleEquipment();
            }
            
            if (stats.complianceRecords === 0) {
                await this.loadSampleComplianceRecords();
            }
            
        } catch (error) {
            console.error('Failed to load sample data:', error);
        }
    }

    async loadSampleMembers() {
        const sampleMembers = [
            {
                name: 'John Smith',
                email: 'john.smith@email.com',
                tier: 'gold',
                paymentType: 'recurring',
                joinDate: '2024-01-15',
                status: 'active'
            },
            {
                name: 'Sarah Johnson',
                email: 'sarah.j@email.com',
                tier: 'silver',
                paymentType: 'one-time',
                joinDate: '2024-01-10',
                status: 'active'
            },
            {
                name: 'Mike Davis',
                email: 'mike.davis@email.com',
                tier: 'basic',
                paymentType: 'recurring',
                joinDate: '2024-01-08',
                status: 'active'
            }
        ];

        for (const member of sampleMembers) {
            await this.models.members.create(member);
        }
    }

    async loadSampleDonations() {
        const sampleDonations = [
            {
                donorName: 'Anonymous',
                donorEmail: 'anonymous@email.com',
                amount: 500,
                tier: 'diamond',
                paymentMethod: 'Stripe',
                date: '2024-01-15',
                status: 'completed'
            },
            {
                donorName: 'Lisa Wilson',
                donorEmail: 'lisa.wilson@email.com',
                amount: 100,
                tier: 'gold',
                paymentMethod: 'Zelle',
                date: '2024-01-14',
                status: 'pending'
            },
            {
                donorName: 'Robert Brown',
                donorEmail: 'robert.brown@email.com',
                amount: 25,
                tier: 'bronze',
                paymentMethod: 'Stripe',
                date: '2024-01-13',
                status: 'completed'
            }
        ];

        for (const donation of sampleDonations) {
            await this.models.donations.create(donation);
        }
    }

    async loadSampleBoosterClubs() {
        const sampleClubs = [
            { name: 'Cheer', status: 'active' },
            { name: 'Dance', status: 'active' },
            { name: 'Softball', status: 'active' },
            { name: 'Boys Soccer', status: 'active' },
            { name: 'Girls Soccer', status: 'active' },
            { name: 'Boys Swim and Dive', status: 'active' },
            { name: 'Girls Swim and Dive', status: 'active' },
            { name: 'Wrestling', status: 'active' },
            { name: 'Robotics', status: 'active' },
            { name: 'Volleyball', status: 'active' },
            { name: 'Boys Basketball', status: 'active' },
            { name: 'Girls Basketball', status: 'active' },
            { name: 'Boys Golf', status: 'active' },
            { name: 'Girls Golf', status: 'active' },
            { name: 'DECCA', status: 'active' },
            { name: 'Theater', status: 'active' },
            { name: 'Choir', status: 'active' },
            { name: 'Gymnastics', status: 'active' },
            { name: 'Orchestra', status: 'active' },
            { name: 'Band', status: 'active' }
        ];

        for (const club of sampleClubs) {
            await this.models.boosterClubs.create(club);
        }
    }

    async loadSampleVendors() {
        const sampleVendors = [
            {
                businessName: 'Dirk Huebner Training',
                taxId: '12-3456789',
                address: '123 Main St, Sammamish, WA 98074',
                boosterClub: 'Cross Country',
                services: 'Strength Training'
            }
        ];

        for (const vendor of sampleVendors) {
            await this.models.vendors.create(vendor);
        }
    }

    async loadSampleUsers() {
        const sampleUsers = [
            {
                email: 'admin@eastlakewolfpack.org',
                passwordHash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                role: 'admin',
                status: 'active',
                lastLogin: new Date().toISOString()
            },
            {
                email: 'cheer.admin@eastlakewolfpack.org',
                passwordHash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                role: 'booster_admin',
                status: 'active',
                boosterClub: 'Cheer',
                lastLogin: new Date().toISOString()
            },
            {
                email: 'soccer.admin@eastlakewolfpack.org',
                passwordHash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                role: 'booster_admin',
                status: 'active',
                boosterClub: 'Boys Soccer',
                lastLogin: new Date().toISOString()
            }
        ];

        for (const user of sampleUsers) {
            await this.models.users.create(user);
        }
    }

    async loadSampleEvents() {
        const sampleEvents = [
            {
                eventName: 'Homecoming Game',
                eventType: 'sports',
                date: '2024-10-15',
                time: '19:00',
                location: 'Eastlake Stadium',
                boosterClub: 'Football',
                description: 'Annual homecoming football game',
                status: 'upcoming'
            },
            {
                eventName: 'Cheer Competition',
                eventType: 'competition',
                date: '2024-11-20',
                time: '14:00',
                location: 'Sammamish High School',
                boosterClub: 'Cheer',
                description: 'Regional cheerleading competition',
                status: 'upcoming'
            },
            {
                eventName: 'Basketball Tournament',
                eventType: 'tournament',
                date: '2024-12-05',
                time: '09:00',
                location: 'Eastlake Gymnasium',
                boosterClub: 'Boys Basketball',
                description: 'Holiday basketball tournament',
                status: 'upcoming'
            }
        ];

        for (const event of sampleEvents) {
            await this.models.events.create(event);
        }
    }

    async loadSampleFundraisingEvents() {
        const sampleFundraisingEvents = [
            {
                eventName: 'Car Wash Fundraiser',
                date: '2024-09-30',
                boosterClub: 'Cheer',
                goalAmount: 2000,
                currentAmount: 1500,
                description: 'Annual car wash fundraiser',
                status: 'active'
            },
            {
                eventName: 'Silent Auction',
                date: '2024-11-15',
                boosterClub: 'Band',
                goalAmount: 5000,
                currentAmount: 3200,
                description: 'Silent auction fundraiser',
                status: 'active'
            },
            {
                eventName: 'Bake Sale',
                date: '2024-10-25',
                boosterClub: 'Softball',
                goalAmount: 800,
                currentAmount: 650,
                description: 'Bake sale fundraiser',
                status: 'active'
            }
        ];

        for (const event of sampleFundraisingEvents) {
            await this.models.fundraisingEvents.create(event);
        }
    }

    async loadSampleVolunteerHours() {
        const sampleVolunteerHours = [
            {
                volunteerId: 1,
                volunteerName: 'Sarah Johnson',
                date: '2024-09-15',
                hours: 4,
                eventId: 1,
                boosterClub: 'Cheer',
                description: 'Car wash fundraiser',
                status: 'approved'
            },
            {
                volunteerId: 2,
                volunteerName: 'Mike Davis',
                date: '2024-09-20',
                hours: 6,
                eventId: 2,
                boosterClub: 'Band',
                description: 'Silent auction setup',
                status: 'approved'
            },
            {
                volunteerId: 3,
                volunteerName: 'Lisa Wilson',
                date: '2024-09-25',
                hours: 3,
                eventId: 3,
                boosterClub: 'Softball',
                description: 'Bake sale',
                status: 'pending'
            }
        ];

        for (const hours of sampleVolunteerHours) {
            await this.models.volunteerHours.create(hours);
        }
    }

    async loadSampleFinancialTransactions() {
        const sampleTransactions = [
            {
                transactionId: 'TXN_001',
                type: 'donation',
                amount: 100,
                paymentMethod: 'stripe',
                boosterClub: 'Cheer',
                description: 'Donation from John Smith',
                status: 'completed',
                date: '2024-09-15'
            },
            {
                transactionId: 'TXN_002',
                type: 'membership',
                amount: 50,
                paymentMethod: 'zelle',
                boosterClub: 'Band',
                description: 'Silver membership payment',
                status: 'completed',
                date: '2024-09-16'
            },
            {
                transactionId: 'TXN_003',
                type: 'expense',
                amount: -25,
                paymentMethod: 'check',
                boosterClub: 'Football',
                description: 'Equipment purchase',
                status: 'completed',
                date: '2024-09-17'
            }
        ];

        for (const transaction of sampleTransactions) {
            await this.models.financialTransactions.create(transaction);
        }
    }

    async loadSampleAnalytics() {
        const sampleAnalytics = [
            {
                metricName: 'total_members',
                value: 150,
                category: 'membership',
                boosterClub: 'all',
                date: '2024-09-01'
            },
            {
                metricName: 'total_donations',
                value: 5000,
                category: 'financial',
                boosterClub: 'all',
                date: '2024-09-01'
            },
            {
                metricName: 'active_volunteers',
                value: 45,
                category: 'volunteer',
                boosterClub: 'all',
                date: '2024-09-01'
            },
            {
                metricName: 'website_visits',
                value: 1200,
                category: 'engagement',
                boosterClub: 'all',
                date: '2024-09-01'
            }
        ];

        for (const analytic of sampleAnalytics) {
            await this.models.analytics.create(analytic);
        }
    }

    async loadSampleGoals() {
        const sampleGoals = [
            {
                goalType: 'fundraising',
                title: 'Increase Annual Donations',
                description: 'Increase total donations by 20%',
                targetAmount: 6000,
                currentAmount: 5000,
                targetDate: '2024-12-31',
                boosterClub: 'all',
                priority: 'high',
                status: 'in_progress'
            },
            {
                goalType: 'membership',
                title: 'Grow Membership',
                description: 'Increase membership by 50 members',
                targetAmount: 200,
                currentAmount: 150,
                targetDate: '2024-12-31',
                boosterClub: 'all',
                priority: 'medium',
                status: 'in_progress'
            },
            {
                goalType: 'volunteer',
                title: 'Volunteer Hours',
                description: 'Log 1000 volunteer hours',
                targetAmount: 1000,
                currentAmount: 750,
                targetDate: '2024-12-31',
                boosterClub: 'all',
                priority: 'medium',
                status: 'in_progress'
            }
        ];

        for (const goal of sampleGoals) {
            await this.models.goals.create(goal);
        }
    }

    async loadSampleAchievements() {
        const sampleAchievements = [
            {
                achievementType: 'fundraising',
                title: 'Fundraising Goal Met',
                description: 'Reached $5000 fundraising goal',
                boosterClub: 'Cheer',
                category: 'financial',
                dateAchieved: '2024-08-15'
            },
            {
                achievementType: 'membership',
                title: 'Membership Milestone',
                description: 'Reached 100 active members',
                boosterClub: 'all',
                category: 'membership',
                dateAchieved: '2024-08-20'
            },
            {
                achievementType: 'volunteer',
                title: 'Volunteer Recognition',
                description: '500 volunteer hours logged',
                boosterClub: 'all',
                category: 'volunteer',
                dateAchieved: '2024-08-25'
            }
        ];

        for (const achievement of sampleAchievements) {
            await this.models.achievements.create(achievement);
        }
    }

    async loadSampleInventory() {
        const sampleInventory = [
            {
                itemName: 'Cheer Uniforms',
                category: 'uniforms',
                quantity: 25,
                boosterClub: 'Cheer',
                location: 'Equipment Room A',
                status: 'available',
                lastUpdated: new Date().toISOString()
            },
            {
                itemName: 'Basketballs',
                category: 'equipment',
                quantity: 15,
                boosterClub: 'Boys Basketball',
                location: 'Gym Storage',
                status: 'available',
                lastUpdated: new Date().toISOString()
            },
            {
                itemName: 'Soccer Balls',
                category: 'equipment',
                quantity: 8,
                boosterClub: 'Boys Soccer',
                location: 'Equipment Room B',
                status: 'low_stock',
                lastUpdated: new Date().toISOString()
            }
        ];

        for (const item of sampleInventory) {
            await this.models.inventory.create(item);
        }
    }

    async loadSampleEquipment() {
        const sampleEquipment = [
            {
                equipmentName: 'Sound System',
                category: 'audio',
                boosterClub: 'Band',
                location: 'Band Room',
                status: 'operational',
                lastMaintenance: '2024-08-01',
                nextMaintenance: '2024-11-01'
            },
            {
                equipmentName: 'Scoreboard',
                category: 'electronics',
                boosterClub: 'Football',
                location: 'Stadium',
                status: 'operational',
                lastMaintenance: '2024-07-15',
                nextMaintenance: '2024-10-15'
            },
            {
                equipmentName: 'Tackling Dummies',
                category: 'training',
                boosterClub: 'Football',
                location: 'Practice Field',
                status: 'needs_maintenance',
                lastMaintenance: '2024-06-01',
                nextMaintenance: '2024-09-01'
            }
        ];

        for (const equipment of sampleEquipment) {
            await this.models.equipment.create(equipment);
        }
    }

    async loadSampleComplianceRecords() {
        const sampleComplianceRecords = [
            {
                recordType: 'insurance_certificate',
                boosterClub: 'Cheer',
                documentName: 'Cheer Insurance Certificate 2024',
                issueDate: '2024-01-01',
                expiryDate: '2024-12-31',
                status: 'active',
                documentUrl: '/documents/cheer-insurance-2024.pdf'
            },
            {
                recordType: 'background_check',
                boosterClub: 'Football',
                documentName: 'Coach Background Check',
                issueDate: '2024-08-01',
                expiryDate: '2025-08-01',
                status: 'active',
                documentUrl: '/documents/coach-background-check.pdf'
            },
            {
                recordType: 'safety_certification',
                boosterClub: 'Swimming',
                documentName: 'Lifeguard Certification',
                issueDate: '2024-06-01',
                expiryDate: '2024-12-01',
                status: 'expiring_soon',
                documentUrl: '/documents/lifeguard-cert.pdf'
            }
        ];

        for (const record of sampleComplianceRecords) {
            await this.models.complianceRecords.create(record);
        }
    }
}

// Export database utilities
window.DatabaseManager = DatabaseManager;
window.DatabaseSetup = DatabaseSetup;
window.MemberModel = MemberModel;
window.DonationModel = DonationModel;
window.VendorModel = VendorModel;
window.InsuranceModel = InsuranceModel;
window.BoosterClubModel = BoosterClubModel;
window.AdminLogModel = AdminLogModel;

// Initialize database when script loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        window.databaseSetup = new DatabaseSetup();
        await window.databaseSetup.initialize();
        
        // Make database models globally available
        window.db = window.databaseSetup.dbManager;
        window.models = window.databaseSetup.models;
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
}); 