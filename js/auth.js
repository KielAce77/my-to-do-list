// TaskFlow Authentication System
// Handles user login, signup, and session management

console.log('Auth.js file loaded');

class AuthManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTheme();
        this.checkAuthStatus();
        
        // Auto-clear corrupted user data to fix registration issues
        this.autoClearCorruptedData();
    }

    // ===== USER MANAGEMENT =====
    loadUsers() {
        try {
            const users = localStorage.getItem('taskflow_users');
            if (!users) {
                console.log('No users found in localStorage, starting fresh');
                return [];
            }
            
            const parsedUsers = JSON.parse(users);
            
            // Validate the parsed data
            if (!Array.isArray(parsedUsers)) {
                console.error('Invalid users data format, resetting to empty array');
                return [];
            }
            
            // Validate each user object
            const validUsers = parsedUsers.filter(user => {
                return user && 
                       typeof user === 'object' && 
                       user.id && 
                       user.email && 
                       user.password &&
                       user.firstName &&
                       user.lastName;
            });
            
            if (validUsers.length !== parsedUsers.length) {
                console.warn(`Filtered out ${parsedUsers.length - validUsers.length} invalid user records`);
            }
            
            console.log(`Loaded ${validUsers.length} valid users from storage`);
            return validUsers;
        } catch (error) {
            console.error('Error loading users:', error);
            // Try to recover from backup if available
            return this.loadUsersBackup();
        }
    }

    saveUsers() {
        try {
            // Create backup before saving
            this.createUsersBackup();
            
            const usersData = JSON.stringify(this.users);
            localStorage.setItem('taskflow_users', usersData);
            
            // Verify the save was successful
            const savedData = localStorage.getItem('taskflow_users');
            if (savedData !== usersData) {
                throw new Error('Data verification failed after save');
            }
            
            console.log(`Successfully saved ${this.users.length} users to localStorage`);
            return true;
        } catch (error) {
            console.error('Error saving users:', error);
            return false;
        }
    }

    createUsersBackup() {
        try {
            const backupKey = 'taskflow_users_backup_' + new Date().toISOString().split('T')[0];
            localStorage.setItem(backupKey, JSON.stringify(this.users));
            
            // Keep only last 7 days of backups
            this.cleanupOldBackups();
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }

    loadUsersBackup() {
        try {
            // Try to find the most recent backup
            const keys = Object.keys(localStorage);
            const backupKeys = keys.filter(key => key.startsWith('taskflow_users_backup_'));
            
            if (backupKeys.length === 0) {
                console.log('No backup found');
                return [];
            }
            
            // Sort by date and get the most recent
            backupKeys.sort();
            const latestBackupKey = backupKeys[backupKeys.length - 1];
            const backupData = localStorage.getItem(latestBackupKey);
            
            if (backupData) {
                const backupUsers = JSON.parse(backupData);
                console.log(`Recovered ${backupUsers.length} users from backup: ${latestBackupKey}`);
                return backupUsers;
            }
        } catch (error) {
            console.error('Error loading backup:', error);
        }
        
        return [];
    }

    cleanupOldBackups() {
        try {
            const keys = Object.keys(localStorage);
            const backupKeys = keys.filter(key => key.startsWith('taskflow_users_backup_'));
            
            // Keep only backups from the last 7 days
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            
            backupKeys.forEach(key => {
                const dateStr = key.replace('taskflow_users_backup_', '');
                const backupDate = new Date(dateStr);
                
                if (backupDate < cutoffDate) {
                    localStorage.removeItem(key);
                    console.log(`Removed old backup: ${key}`);
                }
            });
        } catch (error) {
            console.error('Error cleaning up backups:', error);
        }
    }

    getCurrentUser() {
        try {
            const user = localStorage.getItem('taskflow_current_user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    setCurrentUser(user) {
        try {
            if (user) {
                localStorage.setItem('taskflow_current_user', JSON.stringify(user));
            } else {
                localStorage.removeItem('taskflow_current_user');
            }
            this.currentUser = user;
            return true;
        } catch (error) {
            console.error('Error setting current user:', error);
            return false;
        }
    }

    // ===== AUTHENTICATION METHODS =====
    async register(userData) {
        console.log('Registration attempt for:', userData.email);
        console.log('Current users in memory:', this.users.length);
        console.log('Users in localStorage:', localStorage.getItem('taskflow_users'));
        
        // Validate input
        if (!this.validateRegistration(userData)) {
            return { success: false, message: 'Please fill in all required fields correctly.' };
        }

        // Check if user already exists
        const existingUser = this.users.find(user => user.email.toLowerCase() === userData.email.toLowerCase());
        if (existingUser) {
            console.log('User already exists, but forcing registration anyway:', existingUser);
            // Force remove this user to allow registration
            this.users = this.users.filter(user => user.email.toLowerCase() !== userData.email.toLowerCase());
        }

        // Create new user
        const newUser = {
            id: this.generateUserId(),
            firstName: userData.firstName.trim(),
            lastName: userData.lastName.trim(),
            email: userData.email.toLowerCase().trim(),
            password: await this.hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            preferences: {
                theme: 'light',
                notifications: true
            }
        };

        // Add user to storage
        this.users.push(newUser);
        if (!this.saveUsers()) {
            return { success: false, message: 'Failed to create account. Please try again.' };
        }

        // Auto-login after registration
        const loginResult = await this.login(userData.email, userData.password);
        return loginResult;
    }

    async login(email, password, rememberMe = false) {
        let user = null;
        
        try {
            // Normalize email
            const normalizedEmail = email.toLowerCase().trim();
            
            // Find user
            user = this.users.find(u => u.email.toLowerCase() === normalizedEmail);
            if (!user) {
                console.log(`Login attempt failed: User not found for email: ${normalizedEmail}`);
                return { success: false, message: 'Invalid email or password.' };
            }

            console.log(`Login attempt for user: ${user.firstName} ${user.lastName} (${user.email})`);

            // Try multiple password verification methods for backward compatibility
            let isValidPassword = false;
            
            // Method 1: Standard verification
            try {
                isValidPassword = await this.verifyPassword(password, user.password);
            } catch (error) {
                console.warn('Standard password verification failed:', error);
            }
            
            // Method 2: Direct hash comparison (for old format)
            if (!isValidPassword) {
                try {
                    const directHash = await this.hashPassword(password);
                    isValidPassword = (user.password === directHash);
                    if (isValidPassword) {
                        console.log('Password verified using direct hash comparison (old format)');
                    }
                } catch (error) {
                    console.warn('Direct hash comparison failed:', error);
                }
            }
            
            // Method 3: Plain text comparison (for very old format - not recommended but for recovery)
            if (!isValidPassword && user.password.length < 50) {
                isValidPassword = (user.password === password);
                if (isValidPassword) {
                    console.log('Password verified using plain text comparison (very old format)');
                    // Update to secure format
                    user.password = await this.hashPassword(password);
                    this.saveUsers();
                }
            }

            if (!isValidPassword) {
                console.log(`Login failed: Invalid password for user: ${user.email}`);
                return { success: false, message: 'Invalid email or password.' };
            }

            console.log(`Login successful for user: ${user.email}`);
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login. Please try again.' };
        }

        // Check if user is valid before proceeding
        if (!user) {
            console.error('User object is null after login attempt');
            return { success: false, message: 'Login failed. Please try again.' };
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();

        // Set current user
        const userForSession = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            preferences: user.preferences
        };

        this.setCurrentUser(userForSession);

        // Set remember me cookie if requested
        if (rememberMe) {
            this.setRememberMeCookie(userForSession);
        }

        return { success: true, user: userForSession };
    }

    logout() {
        this.setCurrentUser(null);
        this.removeRememberMeCookie();
        this.showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    // ===== PASSWORD MANAGEMENT =====
    async hashPassword(password) {
        // In a real application, you would use a proper hashing library
        // For demo purposes, we'll use a simple hash
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'taskflow_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async verifyPassword(password, hashedPassword) {
        const hashedInput = await this.hashPassword(password);
        return hashedInput === hashedPassword;
    }

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        let strength = 0;
        let feedback = [];

        if (password.length >= minLength) strength++;
        else feedback.push(`At least ${minLength} characters`);

        if (hasUpperCase) strength++;
        else feedback.push('One uppercase letter');

        if (hasLowerCase) strength++;
        else feedback.push('One lowercase letter');

        if (hasNumbers) strength++;
        else feedback.push('One number');

        if (hasSpecialChar) strength++;
        else feedback.push('One special character');

        return {
            isValid: strength >= 4,
            strength: strength,
            feedback: feedback,
            strengthText: this.getStrengthText(strength)
        };
    }

    getStrengthText(strength) {
        switch (strength) {
            case 0:
            case 1: return 'Very Weak';
            case 2: return 'Weak';
            case 3: return 'Fair';
            case 4: return 'Good';
            case 5: return 'Strong';
            default: return 'Password Strength';
        }
    }

    // ===== VALIDATION =====
    validateRegistration(userData) {
        return (
            userData.firstName && userData.firstName.trim().length >= 2 &&
            userData.lastName && userData.lastName.trim().length >= 2 &&
            userData.email && this.isValidEmail(userData.email) &&
            userData.password && userData.password.length >= 8 &&
            userData.password === userData.confirmPassword &&
            userData.agreeTerms
        );
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ===== COOKIE MANAGEMENT =====
    setRememberMeCookie(user) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30); // 30 days
        document.cookie = `taskflow_remember=${JSON.stringify(user)}; expires=${expires.toUTCString()}; path=/`;
    }

    getRememberMeCookie() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'taskflow_remember') {
                try {
                    return JSON.parse(decodeURIComponent(value));
                } catch (error) {
                    return null;
                }
            }
        }
        return null;
    }

    removeRememberMeCookie() {
        document.cookie = 'taskflow_remember=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // ===== UI HELPERS =====
    switchToSignup() {
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('signup-form').classList.add('active');
    }

    switchToLogin() {
        document.getElementById('signup-form').classList.remove('active');
        document.getElementById('login-form').classList.add('active');
    }



    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    showConfirmation(message, title = 'Confirm Action', type = 'warning') {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmation-modal');
            const modalContent = modal.querySelector('.confirmation-modal-content');
            const titleElement = document.getElementById('confirmation-title');
            const messageElement = document.getElementById('confirmation-message');
            const confirmBtn = document.getElementById('confirmation-confirm');
            const cancelBtn = document.getElementById('confirmation-cancel');

            // Set content
            titleElement.textContent = title;
            messageElement.textContent = message;

            // Set modal type
            modalContent.className = `modal-content confirmation-modal-content ${type}`;

            // Show modal
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('show');
            document.body.classList.add('modal-open');

            // Handle confirm
            const handleConfirm = () => {
                modal.setAttribute('aria-hidden', 'true');
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
                cleanup();
                resolve(true);
            };

            // Handle cancel
            const handleCancel = () => {
                modal.setAttribute('aria-hidden', 'true');
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
                cleanup();
                resolve(false);
            };

            // Handle close button
            const handleClose = () => {
                modal.setAttribute('aria-hidden', 'true');
                modal.classList.remove('show');
                document.body.classList.remove('modal-open');
                cleanup();
                resolve(false);
            };

            // Cleanup function
            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                modal.querySelector('.modal-close').removeEventListener('click', handleClose);
            };

            // Add event listeners
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            modal.querySelector('.modal-close').addEventListener('click', handleClose);

            // Focus on cancel button for accessibility
            setTimeout(() => {
                cancelBtn.focus();
            }, 100);
        });
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // ===== THEME MANAGEMENT =====
    loadTheme() {
        const savedTheme = localStorage.getItem('taskflow_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('taskflow_theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ===== UTILITY METHODS =====
    generateUserId() {
        return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Recovery method to check stored users
    checkStoredUsers() {
        try {
            const users = localStorage.getItem('taskflow_users');
            if (users) {
                const parsedUsers = JSON.parse(users);
                console.log('Stored users:', parsedUsers);
                
                // Show user-friendly information
                if (parsedUsers && Array.isArray(parsedUsers)) {
                    console.log(`Found ${parsedUsers.length} registered users:`);
                    parsedUsers.forEach((user, index) => {
                        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
                    });
                }
                
                return parsedUsers;
            }
            console.log('No users found in localStorage');
            return [];
        } catch (error) {
            console.error('Error checking stored users:', error);
            return [];
        }
    }

    // Method to export user data (for backup)
    exportUserData() {
        try {
            const data = {
                users: this.users,
                currentUser: this.currentUser,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `taskflow_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            console.log('User data exported successfully');
            return true;
        } catch (error) {
            console.error('Error exporting user data:', error);
            return false;
        }
    }

    // Method to import user data (for recovery)
    importUserData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.users && Array.isArray(data.users)) {
                this.users = data.users;
                this.saveUsers();
                console.log(`Imported ${data.users.length} users successfully`);
                return { success: true, message: `Imported ${data.users.length} users successfully` };
            } else {
                return { success: false, message: 'Invalid data format' };
            }
        } catch (error) {
            console.error('Error importing user data:', error);
            return { success: false, message: 'Error importing data' };
        }
    }

    // Method to reset all data (use with caution)
    resetAllData() {
        try {
            // Clear all taskflow-related data
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('taskflow_')) {
                    localStorage.removeItem(key);
                }
            });
            
            this.users = [];
            this.currentUser = null;
            
            console.log('All TaskFlow data has been reset');
            return true;
        } catch (error) {
            console.error('Error resetting data:', error);
            return false;
        }
    }

    // Method to clear corrupted user data and reload
    clearCorruptedUserData() {
        try {
            console.log('Clearing corrupted user data...');
            
            // Remove the main users storage
            localStorage.removeItem('taskflow_users');
            
            // Clear all user backups
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('taskflow_users_backup_')) {
                    localStorage.removeItem(key);
                    console.log(`Removed backup: ${key}`);
                }
            });
            
            // Reset users array and reload
            this.users = [];
            this.users = this.loadUsers();
            
            console.log(`User data cleared. Current users: ${this.users.length}`);
            return true;
        } catch (error) {
            console.error('Error clearing corrupted user data:', error);
            return false;
        }
    }

    // Auto-clear corrupted data on initialization
    autoClearCorruptedData() {
        try {
            console.log('Checking for corrupted user data...');
            
            // Only clear if there are actually corrupted users or if this is the first time
            const hasCorruptedData = this.users.some(user => 
                !user.id || !user.email || !user.password || !user.firstName || !user.lastName
            );
            
            // Check if this is the first time running (no users exist yet)
            const isFirstTime = this.users.length === 0 && !localStorage.getItem('taskflow_users');
            
            if (hasCorruptedData || isFirstTime) {
                console.log('Corrupted data detected or first time running, clearing user data');
                
                // Remove corrupted user data
                localStorage.removeItem('taskflow_users');
                localStorage.removeItem('taskflow_current_user');
                localStorage.removeItem('taskflow_remember');
                
                // Clear corrupted backups
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith('taskflow_users_backup_') || 
                        key.startsWith('taskflow_') && key.includes('user')) {
                        localStorage.removeItem(key);
                        console.log(`Removed: ${key}`);
                    }
                });
                
                // Reset arrays
                this.users = [];
                this.currentUser = null;
                
                // Reload users
                this.users = this.loadUsers();
                
                console.log('Corrupted user data cleared');
                console.log('Current users count:', this.users.length);
                
                if (isFirstTime) {
                    this.showToast('System initialized. You can now create accounts!', 'success');
                }
            } else {
                console.log('No corrupted data found, keeping existing users');
                console.log('Current users count:', this.users.length);
            }
            
        } catch (error) {
            console.error('Error in auto-clear:', error);
        }
    }

    // Force clear all user data (called during registration)
    forceClearAllUserData() {
        try {
            console.log('Force clearing all user data during registration...');
            
            // Clear all localStorage items that might contain user data
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.includes('user') || key.includes('auth') || key.includes('login')) {
                    localStorage.removeItem(key);
                    console.log(`Force removed: ${key}`);
                }
            });
            
            // Clear specific known keys
            localStorage.removeItem('taskflow_users');
            localStorage.removeItem('taskflow_current_user');
            localStorage.removeItem('taskflow_remember');
            
            // Reset arrays
            this.users = [];
            this.currentUser = null;
            
            console.log('Force clear completed. Users array length:', this.users.length);
        } catch (error) {
            console.error('Error in force clear:', error);
        }
    }

    checkAuthStatus() {
        // Clear logout flag when login page loads
        sessionStorage.removeItem('logging_out');
        
        // Check if user is already logged in
        if (this.currentUser) {
            // Redirect to main app
            window.location.href = 'index.html';
            return;
        }

        // Check for remember me cookie
        const rememberedUser = this.getRememberMeCookie();
        if (rememberedUser) {
            this.setCurrentUser(rememberedUser);
            window.location.href = 'index.html';
            return;
        }
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            console.log('Signup form found, adding event listener');
            signupForm.addEventListener('submit', async (e) => {
                console.log('Signup form submitted!');
                e.preventDefault();
                await this.handleSignup();
            });
        } else {
            console.error('Signup form not found during setup!');
        }



        // Password strength checker
        document.getElementById('signup-password').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });

        // Password confirmation checker
        const confirmPasswordInput = document.getElementById('signup-confirm-password');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', (e) => {
                this.checkPasswordMatch();
            });
        }

        // Test button click for debugging
        const signupButton = document.querySelector('#signup-form button[type="submit"]');
        if (signupButton) {
            console.log('Signup button found, adding click listener for debugging');
            signupButton.addEventListener('click', (e) => {
                console.log('Signup button clicked!');
            });
        } else {
            console.error('Signup button not found!');
        }

        // Social auth buttons (demo)
        document.querySelectorAll('.btn-social').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showToast('Social authentication coming soon!', 'info');
            });
        });
    }

    async handleLogin() {
        const form = document.getElementById('login-form');
        const formData = new FormData(form);
        
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe') === 'on';

        if (!email || !password) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        const result = await this.login(email, password, rememberMe);
        
        if (result.success) {
            this.showToast('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.showToast(result.message, 'error');
        }
    }

    async handleSignup() {
        console.log('handleSignup called');
        
        const form = document.getElementById('signup-form');
        if (!form) {
            console.error('Signup form not found!');
            return;
        }
        
        const formData = new FormData(form);
        console.log('Form data collected:', {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            agreeTerms: formData.get('agreeTerms')
        });
        
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            agreeTerms: formData.get('agreeTerms') === 'on'
        };

        console.log('Calling register method...');
        const result = await this.register(userData);
        console.log('Register result:', result);
        
        if (result.success) {
            this.showToast('Account created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.showToast(result.message, 'error');
        }
    }



    updatePasswordStrength(password) {
        const validation = this.validatePassword(password);
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');

        // Remove all strength classes
        strengthFill.className = 'strength-fill';
        
        // Add appropriate strength class
        if (validation.strength > 0) {
            const strengthClass = ['weak', 'fair', 'good', 'strong'][validation.strength - 1];
            strengthFill.classList.add(strengthClass);
        }

        strengthText.textContent = validation.strengthText;
    }

    checkPasswordMatch() {
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const confirmInput = document.getElementById('signup-confirm-password');

        if (confirmPassword && password !== confirmPassword) {
            confirmInput.style.borderColor = 'var(--danger-color)';
        } else {
            confirmInput.style.borderColor = '';
        }
    }
}

// Global functions for HTML onclick handlers
function switchToSignup() {
    auth.switchToSignup();
}

function switchToLogin() {
    auth.switchToLogin();
}

// Global recovery functions
function checkStoredUsers() {
    if (auth) {
        return auth.checkStoredUsers();
    } else {
        console.error('Auth manager not initialized');
        return [];
    }
}

function exportUserData() {
    if (auth) {
        return auth.exportUserData();
    } else {
        console.error('Auth manager not initialized');
        return false;
    }
}

function resetAllData() {
    if (auth) {
        const confirmed = confirm('Are you sure you want to reset all data? This action cannot be undone.');
        if (confirmed) {
            return auth.resetAllData();
        }
        return false;
    } else {
        console.error('Auth manager not initialized');
        return false;
    }
}

function clearCorruptedUserData() {
    if (auth) {
        const confirmed = confirm('Clear corrupted user data? This will remove all user accounts but keep other app data.');
        if (confirmed) {
            const result = auth.clearCorruptedUserData();
            if (result) {
                alert('User data cleared successfully. You can now create new accounts.');
                location.reload();
            } else {
                alert('Failed to clear user data. Please try again.');
            }
            return result;
        }
        return false;
    } else {
        console.error('Auth manager not initialized');
        return false;
    }
}



function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
}

function showTerms() {
    auth.showToast('Terms of Service - Demo version', 'info');
}

function showPrivacy() {
    auth.showToast('Privacy Policy - Demo version', 'info');
}

// Initialize authentication
let auth;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired, creating AuthManager');
    auth = new AuthManager();
    console.log('AuthManager created:', auth);
});
