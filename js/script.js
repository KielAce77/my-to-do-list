// TaskFlow - Modern Todo App
// Consolidated JavaScript file with all functionality

// ===== AUTHENTICATION CHECK =====
function checkAuthentication() {
    const currentUser = localStorage.getItem('taskflow_current_user');
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ===== STORAGE CLASS =====
class Storage {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.storageKeys = {
            tasks: `taskflow_tasks_${this.currentUser?.id || 'guest'}`,
            categories: `taskflow_categories_${this.currentUser?.id || 'guest'}`,
            settings: `taskflow_settings_${this.currentUser?.id || 'guest'}`,
            theme: 'taskflow_theme'
        };
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

    async saveTasks(tasks) {
        try {
            localStorage.setItem(this.storageKeys.tasks, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            return false;
        }
    }

    async getTasks() {
        try {
            const tasks = localStorage.getItem(this.storageKeys.tasks);
            return tasks ? JSON.parse(tasks) : this.getDefaultTasks();
        } catch (error) {
            console.error('Error loading tasks:', error);
            return this.getDefaultTasks();
        }
    }

    getDefaultTasks() {
        return [
            {
                id: this.generateId(),
                title: 'Welcome to TaskFlow!',
                description: 'This is your first task. Click to edit or mark as complete.',
                priority: 'medium',
                category: 'personal',
                dueDate: null,
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                subtasks: [],
                notes: '',
                recurring: null
            }
        ];
    }

    async saveCategories(categories) {
        try {
            localStorage.setItem(this.storageKeys.categories, JSON.stringify(categories));
            return true;
        } catch (error) {
            console.error('Error saving categories:', error);
            return false;
        }
    }

    async getCategories() {
        try {
            const categories = localStorage.getItem(this.storageKeys.categories);
            return categories ? JSON.parse(categories) : this.getDefaultCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
            return this.getDefaultCategories();
        }
    }

    getDefaultCategories() {
        return [
            { id: 'personal', name: 'Personal', color: '#6366f1' },
            { id: 'work', name: 'Work', color: '#10b981' },
            { id: 'shopping', name: 'Shopping', color: '#f59e0b' },
            { id: 'health', name: 'Health', color: '#ef4444' },
            { id: 'learning', name: 'Learning', color: '#8b5cf6' }
        ];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// ===== TASK MANAGER =====
class TaskManager {
    constructor() {
        this.tasks = [];
    }

    async addTask(taskData) {
        const task = {
            id: this.generateId(),
            title: taskData.title || '',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            category: taskData.category || 'personal',
            dueDate: taskData.dueDate || null,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            subtasks: taskData.subtasks || [],
            notes: taskData.notes || '',
            recurring: taskData.recurring || null
        };

        this.tasks.push(task);
        return task;
    }

    async updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            return null;
        }

        const updatedTask = {
            ...this.tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        this.tasks[taskIndex] = updatedTask;
        return updatedTask;
    }

    async deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;

        this.tasks.splice(taskIndex, 1);
        return true;
    }

    async toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return null;

        task.completed = !task.completed;
        task.updatedAt = new Date().toISOString();
        return task;
    }

    async toggleSubtask(subtaskId) {
        for (const task of this.tasks) {
            const subtask = task.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                subtask.completed = !subtask.completed;
                task.updatedAt = new Date().toISOString();
                return { task, subtask };
            }
        }
        return null;
    }

    async duplicateTask(taskId) {
        const originalTask = this.tasks.find(t => t.id === taskId);
        if (!originalTask) return null;

        const duplicatedTask = {
            ...originalTask,
            id: this.generateId(),
            title: `${originalTask.title} (Copy)`,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks.push(duplicatedTask);
        return duplicatedTask;
    }

    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const overdue = this.tasks.filter(t => 
            !t.completed && 
            t.dueDate && 
            new Date(t.dueDate) < new Date()
        ).length;

        return {
            total,
            completed,
            pending,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    searchTasks(query) {
        if (!query.trim()) return this.tasks;
        
        const searchTerm = query.toLowerCase();
        return this.tasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.notes.toLowerCase().includes(searchTerm)
        );
    }

    sortTasks(tasks, sortBy = 'createdAt', sortOrder = 'desc') {
        return [...tasks].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    aValue = priorityOrder[a.priority] || 0;
                    bValue = priorityOrder[b.priority] || 0;
                    break;
                case 'dueDate':
                    aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                    bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                    break;
                default:
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// ===== UI CLASS =====
class UI {
    constructor() {
        this.activeModal = null;
    }

    openTaskModal(taskId = null, taskData = null) {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const modalTitle = document.getElementById('modal-title');
        
        if (taskData) {
            this.populateTaskForm(taskData);
            modalTitle.textContent = 'Edit Task';
            // Set a flag to indicate we're editing
            form.dataset.editMode = 'true';
        } else {
            this.resetTaskForm();
            modalTitle.textContent = 'Add New Task';
            // Clear the edit flag
            form.dataset.editMode = 'false';
        }

        this.showModal(modal);
        this.activeModal = modal;
        
        // Set up form change tracking
        this.setupFormChangeTracking();
        
        setTimeout(() => {
            document.getElementById('task-title').focus();
        }, 100);
    }

    setupFormChangeTracking() {
        const form = document.getElementById('task-form');
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateModalTitle();
            });
        });
    }

    updateModalTitle() {
        const modalTitle = document.getElementById('modal-title');
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        
        if (title || description) {
            const originalText = modalTitle.textContent;
            if (!originalText.includes('*')) {
                modalTitle.textContent = originalText + ' *';
            }
        } else {
            const originalText = modalTitle.textContent.replace(' *', '');
            modalTitle.textContent = originalText;
        }
    }

    closeTaskModal() {
        const modal = document.getElementById('task-modal');
        this.hideModal(modal);
        this.activeModal = null;
        // Reset the form when closing to clear any entered data
        this.resetTaskForm();
    }

    async closeTaskModalWithConfirmation() {
        const form = document.getElementById('task-form');
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        
        // Check if there are unsaved changes
        if (title || description) {
            const confirmed = await this.showConfirmation(
                'You have unsaved changes. Are you sure you want to close without saving?',
                'Unsaved Changes',
                'warning'
            );
            
            if (confirmed) {
                this.closeTaskModal();
            }
        } else {
            this.closeTaskModal();
        }
    }

    openCategoryModal() {
        const modal = document.getElementById('category-modal');
        this.resetCategoryForm();
        this.showModal(modal);
        this.activeModal = modal;
        
        setTimeout(() => {
            document.getElementById('category-name').focus();
        }, 100);
    }

    closeCategoryModal() {
        const modal = document.getElementById('category-modal');
        this.hideModal(modal);
        this.activeModal = null;
    }

    resetCategoryForm() {
        document.getElementById('category-form').reset();
        document.getElementById('category-color').value = '#6366f1';
        // Remove active class from all color presets
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.classList.remove('active');
        });
    }

    showModal(modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }

    hideModal(modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
    }

    populateTaskForm(taskData) {
        // Set the task ID first
        const taskIdField = document.getElementById('task-id');
        taskIdField.value = taskData.id || '';
        
        // Set other form fields
        document.getElementById('task-title').value = taskData.title || '';
        document.getElementById('task-description').value = taskData.description || '';
        document.getElementById('task-priority').value = taskData.priority || 'medium';
        document.getElementById('task-category').value = taskData.category || 'personal';
        document.getElementById('task-due-date').value = taskData.dueDate ? taskData.dueDate.slice(0, 16) : '';
        document.getElementById('task-notes').value = taskData.notes || '';

        const subtasksContainer = document.getElementById('subtasks-container');
        subtasksContainer.innerHTML = '';
        if (taskData.subtasks && taskData.subtasks.length > 0) {
            taskData.subtasks.forEach(subtask => {
                this.addSubtask(subtask.title, subtask.completed, subtask.id);
            });
        }
    }

    resetTaskForm() {
        // Manually clear form fields instead of using form.reset() to avoid clearing hidden fields
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-priority').value = 'medium';
        document.getElementById('task-category').value = 'personal';
        document.getElementById('task-due-date').value = '';
        document.getElementById('task-notes').value = '';
        document.getElementById('subtasks-container').innerHTML = '';
        
        // Clear the task ID
        const taskIdField = document.getElementById('task-id');
        taskIdField.value = '';
    }

    addSubtask(title = '', completed = false, id = null) {
        const subtasksContainer = document.getElementById('subtasks-container');
        const subtaskId = id || this.generateId();
        
        const subtaskItem = document.createElement('div');
        subtaskItem.className = 'subtask-item';
        subtaskItem.innerHTML = `
            <input type="checkbox" id="subtask-${subtaskId}" ${completed ? 'checked' : ''}>
            <input type="text" class="subtask-input" value="${title}" placeholder="Subtask description">
            <button type="button" class="btn-remove-subtask" onclick="ui.removeSubtask(this.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        subtasksContainer.appendChild(subtaskItem);
        return subtaskId;
    }

    removeSubtask(subtaskItem) {
        subtaskItem.remove();
    }

    showToast(message, type = 'info', duration = 3000) {
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
        }, duration);
    }

    showConfirmation(message, title = 'Confirm Action', type = 'warning') {
        console.log('showConfirmation called with:', { message, title, type });
        
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmation-modal');
            const modalContent = modal.querySelector('.confirmation-modal-content');
            const messageElement = document.getElementById('confirmation-message');
            const confirmBtn = document.getElementById('confirmation-confirm');
            const cancelBtn = document.getElementById('confirmation-cancel');
            
            console.log('Modal elements found:', { modal, modalContent, messageElement, confirmBtn, cancelBtn });

            // Set content
            messageElement.textContent = message;

            // Set modal type and update icon
            modalContent.className = `confirmation-modal-content ${type}`;
            const iconElement = modal.querySelector('.confirmation-icon i');
            if (iconElement) {
                if (type === 'danger') {
                    iconElement.className = 'fas fa-exclamation-triangle';
                } else if (type === 'warning') {
                    iconElement.className = 'fas fa-exclamation-circle';
                } else {
                    iconElement.className = 'fas fa-question-circle';
                }
            }

            // Show modal
            this.showModal(modal);
            this.activeModal = modal;

            // Handle confirm
            const handleConfirm = () => {
                this.hideModal(modal);
                cleanup();
                resolve(true);
            };

            // Handle cancel
            const handleCancel = () => {
                this.hideModal(modal);
                cleanup();
                resolve(false);
            };

            // Cleanup function
            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
            };

            // Add event listeners
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);

            // Focus on cancel button for accessibility (reduced delay)
            setTimeout(() => {
                cancelBtn.focus();
            }, 50);
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

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setupEventListeners() {
        // Close modal when clicking on modal background
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
                this.activeModal = null;
            }
        });

        // Close modal when clicking on modal close button (X)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close')) {
                e.preventDefault();
                e.stopPropagation();
                if (this.activeModal) {
                    // Check if it's the task modal and handle confirmation
                    if (this.activeModal.id === 'task-modal') {
                        this.closeTaskModalWithConfirmation();
                    } else {
                        this.hideModal(this.activeModal);
                        this.activeModal = null;
                    }
                }
            }
        });

        // Close modal when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                // Check if it's the task modal and handle confirmation
                if (this.activeModal.id === 'task-modal') {
                    this.closeTaskModalWithConfirmation();
                } else {
                    this.hideModal(this.activeModal);
                    this.activeModal = null;
                }
            }
        });
    }
}

// ===== QUOTE MANAGER =====
class QuoteManager {
    constructor() {
        this.quotes = [
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
            { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
            { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
            { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
            { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
            { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
            { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
            { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
            { text: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
            { text: "Every expert was once a beginner.", author: "Robert T. Kiyosaki" },
            { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
            { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
            { text: "The best revenge is massive success.", author: "Frank Sinatra" },
            { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
            { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
            { text: "The only way to achieve the impossible is to believe it is possible.", author: "Charles Kingsleigh" },
            { text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
            { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
            { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
            { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
            { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
            { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
            { text: "The mind is everything. What you think you become.", author: "Buddha" },
            { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
            { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
            { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
            { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
            { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
            { text: "The only person you should try to be better than is the person you were yesterday.", author: "Unknown" },
            { text: "Success is not about the destination, it's about the journey.", author: "Zig Ziglar" },
            { text: "The more you praise and celebrate your life, the more there is in life to celebrate.", author: "Oprah Winfrey" },
            { text: "Your attitude determines your direction.", author: "Unknown" },
            { text: "The only limit to your impact is your imagination and commitment.", author: "Tony Robbins" },
            { text: "Every day is a new beginning. Take a deep breath and start again.", author: "Unknown" },
            { text: "The best preparation for tomorrow is doing your best today.", author: "H. Jackson Brown Jr." },
            { text: "Don't wait for opportunity. Create it.", author: "George Bernard Shaw" },
            { text: "The only way to have a good day is to start it with a good attitude.", author: "Unknown" },
            { text: "Success is not just about making money. It's about making a difference.", author: "Unknown" },
            { text: "The greatest wealth is to live content with little.", author: "Plato" },
            { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
            { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
            { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
            { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
            { text: "Your life does not get better by chance, it gets better by change.", author: "Jim Rohn" },
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
            { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
            { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
            { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
            { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
            { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
            { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
            { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
            { text: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
            { text: "Every expert was once a beginner.", author: "Robert T. Kiyosaki" },
            { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
            { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
            { text: "The best revenge is massive success.", author: "Frank Sinatra" },
            { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
            { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
            { text: "The only way to achieve the impossible is to believe it is possible.", author: "Charles Kingsleigh" },
            { text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
            { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
            { text: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon" },
            { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
            { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
            { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
            { text: "The mind is everything. What you think you become.", author: "Buddha" },
            { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
            { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
            { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
            { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
            { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
            { text: "The only person you should try to be better than is the person you were yesterday.", author: "Unknown" },
            { text: "Success is not about the destination, it's about the journey.", author: "Zig Ziglar" },
            { text: "The more you praise and celebrate your life, the more there is in life to celebrate.", author: "Oprah Winfrey" },
            { text: "Your attitude determines your direction.", author: "Unknown" },
            { text: "The only limit to your impact is your imagination and commitment.", author: "Tony Robbins" },
            { text: "Every day is a new beginning. Take a deep breath and start again.", author: "Unknown" },
            { text: "The best preparation for tomorrow is doing your best today.", author: "H. Jackson Brown Jr." },
            { text: "Don't wait for opportunity. Create it.", author: "George Bernard Shaw" },
            { text: "The only way to have a good day is to start it with a good attitude.", author: "Unknown" },
            { text: "Success is not just about making money. It's about making a difference.", author: "Unknown" },
            { text: "The greatest wealth is to live content with little.", author: "Plato" },
            { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
            { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
            { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
            { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
            { text: "Your life does not get better by chance, it gets better by change.", author: "Jim Rohn" }
        ];
        this.currentQuoteIndex = 0;
        this.quoteElement = null;
        this.authorElement = null;
        this.interval = null;
        this.init();
    }

    init() {
        this.quoteElement = document.getElementById('motivational-quote');
        this.authorElement = document.getElementById('quote-author');
        
        if (this.quoteElement && this.authorElement) {
            this.showCurrentQuote();
            this.startQuoteRotation();
            this.setupSwipeNavigation();
        }
    }

    showCurrentQuote() {
        const quote = this.quotes[this.currentQuoteIndex];
        
        // Fade out current quote
        this.quoteElement.classList.add('fade-out');
        this.authorElement.classList.add('fade-out');
        
        // Wait for fade out, then change content and fade in
        setTimeout(() => {
            this.quoteElement.textContent = quote.text;
            this.authorElement.textContent = `— ${quote.author}`;
            
            this.quoteElement.classList.remove('fade-out');
            this.authorElement.classList.remove('fade-out');
            this.quoteElement.classList.add('fade-in');
            this.authorElement.classList.add('fade-in');
            
            // Remove fade-in class after animation
            setTimeout(() => {
                this.quoteElement.classList.remove('fade-in');
                this.authorElement.classList.remove('fade-in');
            }, 300);
            
            this.updateNavigationButtons();
        }, 300);
    }

    startQuoteRotation() {
        this.interval = setInterval(() => {
            this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
            this.showCurrentQuote();
        }, 7000); // Change every 7 seconds
    }

    stopQuoteRotation() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    showQuote(index) {
        if (index < 0 || index >= this.quotes.length) {
            return false;
        }
        
        this.currentQuoteIndex = index;
        const quote = this.quotes[this.currentQuoteIndex];
        
        // Fade out current quote
        this.quoteElement.classList.add('fade-out');
        this.authorElement.classList.add('fade-out');
        
        // Wait for fade out, then change content and fade in
        setTimeout(() => {
            this.quoteElement.textContent = quote.text;
            this.authorElement.textContent = `— ${quote.author}`;
            
            this.quoteElement.classList.remove('fade-out');
            this.authorElement.classList.remove('fade-out');
            this.quoteElement.classList.add('fade-in');
            this.authorElement.classList.add('fade-in');
            
            // Remove fade-in class after animation
            setTimeout(() => {
                this.quoteElement.classList.remove('fade-in');
                this.authorElement.classList.remove('fade-in');
            }, 300);
            
            this.updateNavigationButtons();
        }, 300);
        
        return true;
    }

    showNextQuote() {
        const nextIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
        return this.showQuote(nextIndex);
    }

    showPreviousQuote() {
        const prevIndex = this.currentQuoteIndex === 0 ? this.quotes.length - 1 : this.currentQuoteIndex - 1;
        return this.showQuote(prevIndex);
    }



    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-quote-btn');
        const nextBtn = document.getElementById('next-quote-btn');
        
        if (prevBtn && nextBtn) {
            // Both buttons are always enabled since we can navigate in a loop
            prevBtn.disabled = false;
            nextBtn.disabled = false;
        }
    }

    setupSwipeNavigation() {
        const quoteContainer = document.querySelector('.quote-container');
        if (!quoteContainer) return;

        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        let isSwiping = false;

        // Touch events for mobile and touchscreen devices
        quoteContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwiping = true;
        }, { passive: true });

        quoteContainer.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            
            endX = e.touches[0].clientX;
            endY = e.touches[0].clientY;
        }, { passive: true });

        quoteContainer.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            
            const deltaX = startX - endX;
            const deltaY = startY - endY;
            const minSwipeDistance = 50; // Minimum distance for a swipe
            
            // Check if it's a horizontal swipe (not vertical)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe left - go to next quote
                    this.showNextQuote();
                } else {
                    // Swipe right - go to previous quote
                    this.showPreviousQuote();
                }
            }
            
            isSwiping = false;
        }, { passive: true });

        // Mouse events for desktop touchscreen devices
        quoteContainer.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startY = e.clientY;
            isSwiping = true;
        });

        quoteContainer.addEventListener('mousemove', (e) => {
            if (!isSwiping) return;
            
            endX = e.clientX;
            endY = e.clientY;
        });

        quoteContainer.addEventListener('mouseup', (e) => {
            if (!isSwiping) return;
            
            const deltaX = startX - endX;
            const deltaY = startY - endY;
            const minSwipeDistance = 50; // Minimum distance for a swipe
            
            // Check if it's a horizontal swipe (not vertical)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe left - go to next quote
                    this.showNextQuote();
                } else {
                    // Swipe right - go to previous quote
                    this.showPreviousQuote();
                }
            }
            
            isSwiping = false;
        });

        // Prevent text selection during swipe
        quoteContainer.addEventListener('selectstart', (e) => {
            if (isSwiping) {
                e.preventDefault();
            }
        });

        // Add visual feedback for swipe
        quoteContainer.style.cursor = 'grab';
        quoteContainer.addEventListener('mousedown', () => {
            quoteContainer.style.cursor = 'grabbing';
        });
        quoteContainer.addEventListener('mouseup', () => {
            quoteContainer.style.cursor = 'grab';
        });
    }
}

// ===== MAIN APP CLASS =====
class App {
    constructor() {
        this.categories = [];
        this.currentFilter = 'all';
        this.currentPriority = 'all';
        this.currentStatus = 'all';
        this.searchQuery = '';
        this.isSubmitting = false;
        this.init();
    }

    async init() {
        // Check authentication first
        if (!checkAuthentication()) {
            return;
        }

        this.ui = new UI();
        this.taskManager = new TaskManager();
        this.storage = new Storage();
        this.quoteManager = new QuoteManager();
        
        await this.loadData();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.updateUserInfo();
        this.showToast('Welcome back to TaskFlow!', 'success');
    }

    async loadData() {
        this.taskManager.tasks = await this.storage.getTasks();
        this.categories = await this.storage.getCategories();
        
        this.renderTasks();
        this.updateStats();
        this.updateCategoryList();
        this.updateCategoryDropdown();
    }

    async saveData() {
        await this.storage.saveTasks(this.taskManager.tasks);
        await this.storage.saveCategories(this.categories);
    }

    setupEventListeners() {
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.ui.openTaskModal();
        });

        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleTaskSubmit();
        });

        // Also prevent multiple clicks on submit button
        const submitButton = document.querySelector('#task-form button[type="submit"]');
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                if (this.isSubmitting) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            });
        }

        // Cancel button
        document.getElementById('cancel-task-btn').addEventListener('click', () => {
            this.ui.closeTaskModalWithConfirmation();
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderTasks();
        });

        document.getElementById('filter-status').addEventListener('change', (e) => {
            this.currentStatus = e.target.value;
            this.renderTasks();
        });

        document.getElementById('filter-priority').addEventListener('change', (e) => {
            this.currentPriority = e.target.value;
            this.renderTasks();
        });

        document.getElementById('add-subtask-btn').addEventListener('click', () => {
            this.ui.addSubtask();
        });

        // Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                console.log('Logout button clicked');
                this.logout();
            });
        } else {
            console.error('Logout button not found');
        }

        // Category-related event listeners
        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.ui.openCategoryModal();
        });

        document.getElementById('task-category').addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                this.ui.openCategoryModal();
                e.target.value = 'personal'; // Reset to default
            }
        });

        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategorySubmit();
        });

        // Color preset event listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-preset')) {
                const color = e.target.dataset.color;
                document.getElementById('category-color').value = color;
                
                // Update active state
                document.querySelectorAll('.color-preset').forEach(preset => {
                    preset.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });

        this.ui.setupEventListeners();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.ui.openTaskModal();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('search-input').focus();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.toggleTheme();
            }

            // Undo shortcut (Ctrl+Z)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.triggerUndo();
            }
        });
    }

    triggerUndo() {
        // Find the most recent undo toast and trigger it
        const undoToast = document.querySelector('.undo-toast');
        if (undoToast) {
            const undoButton = undoToast.querySelector('.btn-undo');
            if (undoButton) {
                undoButton.click();
            }
        }
    }

    formatDueDateTime(dueDate) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        
        // Format time
        const timeString = dueDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        // Format date with smart labels
        let dateString;
        if (dueDateOnly.getTime() === today.getTime()) {
            dateString = 'Today';
        } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
            dateString = 'Tomorrow';
        } else {
            // Check if it's within the next 7 days
            const daysDiff = Math.ceil((dueDateOnly - today) / (1000 * 60 * 60 * 24));
            if (daysDiff > 0 && daysDiff <= 7) {
                dateString = dueDate.toLocaleDateString([], { weekday: 'long' });
            } else {
                dateString = dueDate.toLocaleDateString([], { 
                    month: 'short', 
                    day: 'numeric',
                    year: dueDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                });
            }
        }
        
        // Add time remaining for non-overdue tasks
        const timeRemaining = this.getTimeRemaining(dueDate);
        const timeRemainingText = timeRemaining ? ` (${timeRemaining})` : '';
        
        return `${dateString} at ${timeString}${timeRemainingText}`;
    }

    getTimeRemaining(dueDate) {
        const now = new Date();
        const diff = dueDate - now;
        
        if (diff <= 0) return null; // Overdue or due now
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days} day${days !== 1 ? 's' : ''} left`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m left`;
        } else if (minutes > 0) {
            return `${minutes}m left`;
        } else {
            return 'Due now';
        }
    }

    formatCreatedTime(createdAt) {
        const createdDate = new Date(createdAt);
        const now = new Date();
        const diffInHours = Math.floor((now - createdDate) / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - createdDate) / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        } else {
            return createdDate.toLocaleDateString([], { 
                month: 'short', 
                day: 'numeric',
                year: createdDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('taskflow_theme', newTheme);
    }

    async handleTaskSubmit() {
        if (this.isSubmitting) {
            return;
        }
        
        this.isSubmitting = true;
        
        try {
            const form = document.getElementById('task-form');
            const formData = new FormData(form);
            
            const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                category: formData.get('category'),
                dueDate: formData.get('dueDate') || null,
                notes: formData.get('notes'),
                subtasks: this.getSubtasksFromForm()
            };

            const taskId = formData.get('taskId');
            
            // If we have a task ID, we're editing an existing task
            if (taskId && taskId.trim() !== '') {
                // Find and update the existing task
                const taskIndex = this.taskManager.tasks.findIndex(t => t.id === taskId);
                
                if (taskIndex !== -1) {
                    // Update the existing task
                    this.taskManager.tasks[taskIndex] = {
                        ...this.taskManager.tasks[taskIndex],
                        ...taskData,
                        updatedAt: new Date().toISOString()
                    };
                    
                    this.showToast('Task updated successfully!', 'success');
                } else {
                    this.showToast('Task not found', 'error');
                    return;
                }
            } else {
                // Create a new task
                const newTask = await this.taskManager.addTask(taskData);
                if (newTask) {
                    this.showToast('Task created successfully!', 'success');
                } else {
                    this.showToast('Failed to create task', 'error');
                    return;
                }
            }

            // Save data first, then update UI
            await this.saveData();
            
            // Update UI components
            this.renderTasks();
            this.updateStats();
            this.updateCategoryList(); // Update category counts
            
            // Close modal and reset form
            this.ui.closeTaskModal();
            this.ui.resetTaskForm();
            
        } catch (error) {
            console.error('Error in handleTaskSubmit:', error);
            this.showToast('An error occurred while saving the task', 'error');
        } finally {
            this.isSubmitting = false;
        }
    }

    getSubtasksFromForm() {
        const subtaskInputs = document.querySelectorAll('.subtask-input');
        const subtasks = [];
        
        subtaskInputs.forEach(input => {
            if (input.value.trim()) {
                subtasks.push({
                    id: this.ui.generateId(),
                    title: input.value.trim(),
                    completed: input.previousElementSibling.checked
                });
            }
        });
        
        return subtasks;
    }

    renderTasks() {
        const taskContainer = document.getElementById('task-container');
        let filteredTasks = this.taskManager.tasks;
        
        // Apply search filter
        if (this.searchQuery.trim()) {
            filteredTasks = this.taskManager.searchTasks(this.searchQuery);
        }

        // Apply category filter
        if (this.currentFilter !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === this.currentFilter);
        }

        if (this.currentStatus !== 'all') {
            filteredTasks = filteredTasks.filter(task => {
                if (this.currentStatus === 'completed') return task.completed;
                if (this.currentStatus === 'pending') return !task.completed;
                return true;
            });
        }

        if (this.currentPriority !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === this.currentPriority);
        }

        filteredTasks = this.taskManager.sortTasks(filteredTasks, 'createdAt', 'desc');

        if (filteredTasks.length === 0) {
            taskContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks found</h3>
                    <p>${this.searchQuery ? 'Try adjusting your search or filters' : 'Create your first task to get started!'}</p>
                    ${!this.searchQuery ? '<button class="btn btn-primary" onclick="app.ui.openTaskModal()">Add Task</button>' : ''}
                </div>
            `;
            return;
        }

        taskContainer.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        const category = this.categories.find(c => c.id === task.category);
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !task.completed;
        
        const subtasksHTML = task.subtasks.length > 0 ? `
            <div class="task-subtasks">
                ${task.subtasks.map(subtask => `
                    <div class="subtask ${subtask.completed ? 'completed' : ''}">
                        <input type="checkbox" ${subtask.completed ? 'checked' : ''} 
                               onchange="app.toggleSubtask('${task.id}', '${subtask.id}')">
                        <span>${subtask.title}</span>
                    </div>
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" 
                 data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-header">
                        <label class="task-checkbox">
                            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                                   onchange="app.toggleTask('${task.id}')">
                            <span class="checkmark"></span>
                        </label>
                        <div class="task-info">
                            <h3 class="task-title">${task.title}</h3>
                            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                        </div>
                        <div class="task-meta">
                            <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                            ${category ? `<span class="category-badge" style="background-color: ${category.color}">${category.name}</span>` : ''}
                        </div>
                    </div>
                    ${subtasksHTML}
                    ${task.notes ? `<div class="task-notes"><i class="fas fa-sticky-note"></i> ${task.notes}</div>` : ''}
                    <div class="task-timestamps">
                        <div class="task-created">
                            <i class="fas fa-clock"></i> Created: ${this.formatCreatedTime(task.createdAt)}
                        </div>
                        ${dueDate ? `<div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i> Due: ${this.formatDueDateTime(dueDate)}
                        </div>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon" onclick="app.editTask('${task.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="app.duplicateTask('${task.id}')" title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon" onclick="app.deleteTask('${task.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    async toggleTask(taskId) {
        const updatedTask = await this.taskManager.toggleTask(taskId);
        if (updatedTask) {
            await this.saveData();
            this.renderTasks();
            this.updateStats();
            
            // Show undo option if task was completed
            if (updatedTask.completed) {
                this.showUndoOption(taskId, updatedTask);
            } else {
                this.showToast('Task marked as pending', 'success');
            }
        }
    }

    showUndoOption(taskId, task) {
        // Remove any existing undo toasts
        const existingUndoToasts = document.querySelectorAll('.undo-toast');
        existingUndoToasts.forEach(toast => toast.remove());

        // Create undo toast
        const undoToast = document.createElement('div');
        undoToast.className = 'toast toast-success undo-toast';
        undoToast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>Task completed!</span>
            </div>
            <button class="btn-undo" onclick="app.undoTaskCompletion('${taskId}')">
                <i class="fas fa-undo"></i>
                Undo
            </button>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('toast-container');
        container.appendChild(undoToast);

        // Add countdown animation
        this.startUndoCountdown(undoToast, 8);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (undoToast.parentElement) {
                undoToast.remove();
            }
        }, 8000);
    }

    startUndoCountdown(toastElement, duration) {
        const undoButton = toastElement.querySelector('.btn-undo');
        const originalText = undoButton.innerHTML;
        let timeLeft = duration;

        const countdown = setInterval(() => {
            timeLeft--;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                return;
            }

            // Update button text with countdown
            undoButton.innerHTML = `
                <i class="fas fa-undo"></i>
                Undo (${timeLeft}s)
            `;
        }, 1000);

        // Clear countdown if toast is removed manually
        const observer = new MutationObserver(() => {
            if (!toastElement.parentElement) {
                clearInterval(countdown);
                observer.disconnect();
            }
        });
        observer.observe(toastElement.parentElement, { childList: true });
    }

    async undoTaskCompletion(taskId) {
        const task = this.taskManager.tasks.find(t => t.id === taskId);
        if (task && task.completed) {
            // Toggle the task back to incomplete
            const updatedTask = await this.taskManager.toggleTask(taskId);
            if (updatedTask) {
                await this.saveData();
                this.renderTasks();
                this.updateStats();
                this.showToast('Task undone!', 'info');
                
                // Remove the undo toast
                const undoToast = document.querySelector('.undo-toast');
                if (undoToast) {
                    undoToast.remove();
                }
            }
        }
    }

    async toggleSubtask(taskId, subtaskId) {
        const result = await this.taskManager.toggleSubtask(subtaskId);
        if (result) {
            await this.saveData();
            this.renderTasks();
            this.updateStats();
        }
    }

    async editTask(taskId) {
        const task = this.taskManager.tasks.find(t => t.id === taskId);
        if (task) {
            this.ui.openTaskModal(taskId, task);
        }
    }

    async duplicateTask(taskId) {
        const duplicatedTask = await this.taskManager.duplicateTask(taskId);
        if (duplicatedTask) {
            await this.saveData();
            this.renderTasks();
            this.showToast('Task duplicated successfully!', 'success');
        }
    }

    async deleteTask(taskId) {
        try {
            // Find the task to check its status
            const taskToDelete = this.taskManager.tasks.find(t => t.id === taskId);
            
            if (!taskToDelete) {
                this.showToast('Task not found', 'error');
                return;
            }

            // Check if task is overdue and incomplete
            const now = new Date();
            const dueDate = taskToDelete.dueDate ? new Date(taskToDelete.dueDate) : null;
            const isOverdue = dueDate && dueDate < now && !taskToDelete.completed;
            
            let confirmationMessage = 'Are you sure you want to delete this task?';
            let confirmationType = 'danger';
            
            if (isOverdue) {
                confirmationMessage = 'This task is overdue and incomplete. Are you sure you want to delete it?';
                confirmationType = 'warning';
            } else if (taskToDelete.completed) {
                confirmationMessage = 'This task is already completed. Are you sure you want to delete it?';
                confirmationType = 'info';
            }

            // Use custom confirmation modal
            const confirmed = await this.ui.showConfirmation(
                confirmationMessage,
                'Delete Task',
                confirmationType
            );
            
            if (confirmed) {
                const success = await this.taskManager.deleteTask(taskId);
                
                if (success) {
                    await this.saveData();
                    this.renderTasks();
                    this.updateStats();
                    this.updateCategoryList(); // Update category counts
                    
                    // Show undo option for deletion
                    this.showDeleteUndoOption(taskToDelete);
                }
            }
        } catch (error) {
            console.error('Error in deleteTask:', error);
            this.showToast('Error deleting task', 'error');
        }
    }

    showDeleteUndoOption(deletedTask) {
        // Remove any existing undo toasts
        const existingUndoToasts = document.querySelectorAll('.undo-toast');
        existingUndoToasts.forEach(toast => toast.remove());

        // Create undo toast for deletion
        const undoToast = document.createElement('div');
        undoToast.className = 'toast toast-error undo-toast';
        undoToast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-trash"></i>
                <span>Task deleted</span>
            </div>
            <button class="btn-undo" onclick="app.undoTaskDeletion('${deletedTask.id}', '${encodeURIComponent(JSON.stringify(deletedTask))}')">
                <i class="fas fa-undo"></i>
                Undo
            </button>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        const container = document.getElementById('toast-container');
        container.appendChild(undoToast);

        // Add countdown animation
        this.startUndoCountdown(undoToast, 10);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (undoToast.parentElement) {
                undoToast.remove();
            }
        }, 10000);
    }

    async undoTaskDeletion(taskId, taskDataString) {
        try {
            const taskData = JSON.parse(decodeURIComponent(taskDataString));
            
            // Restore the task
            const restoredTask = await this.taskManager.addTask(taskData);
            if (restoredTask) {
                // Restore the original ID
                restoredTask.id = taskId;
                
                await this.saveData();
                this.renderTasks();
                this.updateStats();
                this.updateCategoryList();
                this.showToast('Task restored!', 'success');
                
                // Remove the undo toast
                const undoToast = document.querySelector('.undo-toast');
                if (undoToast) {
                    undoToast.remove();
                }
            }
        } catch (error) {
            console.error('Error restoring task:', error);
            this.showToast('Error restoring task', 'error');
        }
    }

    updateStats() {
        const stats = this.taskManager.getTaskStats();
        
        document.getElementById('total-tasks').textContent = stats.total;
        document.getElementById('completed-tasks').textContent = stats.completed;
        document.getElementById('pending-tasks').textContent = stats.pending;
        document.getElementById('completion-rate').textContent = `${stats.completionRate}%`;
        
        // Update progress circle
        const progressCircle = document.querySelector('.progress-circle .progress');
        const progressText = document.querySelector('.progress-text');
        if (progressCircle) {
            const circumference = 2 * Math.PI * 35; // r=35
            const progress = (stats.completionRate / 100) * circumference;
            progressCircle.style.strokeDasharray = `${progress} ${circumference}`;
        }
        if (progressText) {
            progressText.textContent = `${stats.completionRate}%`;
        }
    }

    updateCategoryList() {
        const categoryList = document.getElementById('category-list');
        
        // Add "All Tasks" option at the beginning
        const allTasksHTML = `
            <li class="category-item all-tasks ${this.currentFilter === 'all' ? 'active' : ''}" onclick="app.filterByCategory('all')">
                <span class="category-color" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color))"></span>
                <span class="category-name">All Tasks</span>
                <span class="category-count">${this.taskManager.tasks.length}</span>
            </li>
        `;
        
        // Add individual categories
        const categoriesHTML = this.categories.map(category => `
            <li class="category-item ${this.currentFilter === category.id ? 'active' : ''}" onclick="app.filterByCategory('${category.id}')">
                <span class="category-color" style="background-color: ${category.color}"></span>
                <span class="category-name">${category.name}</span>
                <span class="category-count">${this.taskManager.tasks.filter(t => t.category === category.id).length}</span>
                ${category.isCustom ? `
                    <button class="btn-delete-category" onclick="event.stopPropagation(); app.deleteCategory('${category.id}')" title="Delete category">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </li>
        `).join('');
        
        categoryList.innerHTML = allTasksHTML + categoriesHTML;
    }

    filterByCategory(categoryId) {
        this.currentFilter = categoryId;
        this.renderTasks();
        this.updateCategoryList(); // Update to show active state
    }

    async addCustomCategory(categoryData) {
        const newCategory = {
            id: this.generateCategoryId(),
            name: categoryData.name,
            color: categoryData.color,
            isCustom: true
        };

        this.categories.push(newCategory);
        await this.saveData();
        this.updateCategoryDropdown();
        this.updateCategoryList();
        this.showToast(`Category "${newCategory.name}" created successfully!`, 'success');
        return newCategory;
    }

    async deleteCategory(categoryId) {
        // Check if category is in use
        const tasksUsingCategory = this.taskManager.tasks.filter(task => task.category === categoryId);
        if (tasksUsingCategory.length > 0) {
            this.showToast(`Cannot delete category: ${tasksUsingCategory.length} task(s) are using it`, 'error');
            return false;
        }

        const categoryIndex = this.categories.findIndex(c => c.id === categoryId);
        if (categoryIndex === -1) return false;

        const categoryName = this.categories[categoryIndex].name;
        
        const confirmed = await this.ui.showConfirmation(
            `Are you sure you want to delete the category "${categoryName}"?`,
            'Delete Category',
            'danger'
        );
        
        if (confirmed) {
            this.categories.splice(categoryIndex, 1);
            await this.saveData();
            this.updateCategoryDropdown();
            this.updateCategoryList();
            this.showToast(`Category "${categoryName}" deleted successfully!`, 'success');
            return true;
        }
        return false;
    }

    updateCategoryDropdown() {
        const categorySelect = document.getElementById('task-category');
        const currentValue = categorySelect.value;
        
        // Keep default categories and custom option
        const defaultOptions = [
            '<option value="personal">Personal</option>',
            '<option value="work">Work</option>',
            '<option value="shopping">Shopping</option>',
            '<option value="health">Health</option>',
            '<option value="learning">Learning</option>',
            '<option value="custom">+ Add Custom Category</option>'
        ];

        // Add custom categories
        const customCategories = this.categories
            .filter(cat => cat.isCustom)
            .map(cat => `<option value="${cat.id}">${cat.name}</option>`);

        categorySelect.innerHTML = defaultOptions.join('') + customCategories.join('');
        
        // Restore previous selection if it still exists
        if (currentValue && categorySelect.querySelector(`option[value="${currentValue}"]`)) {
            categorySelect.value = currentValue;
        }
    }

    generateCategoryId() {
        return 'custom_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    updateUserInfo() {
        const currentUser = this.storage.getCurrentUser();
        if (currentUser) {
            const userName = document.getElementById('user-name');
            const userAvatar = document.getElementById('user-avatar');
            
            if (userName) {
                userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
            }
            
            if (userAvatar) {
                // Clear existing content
                userAvatar.innerHTML = '';
                
                // Check if user has a profile picture
                if (currentUser.profilePicture) {
                    const img = document.createElement('img');
                    img.src = currentUser.profilePicture;
                    img.alt = 'Profile Picture';
                    userAvatar.appendChild(img);
                } else {
                    // Show initials as fallback
                    const initials = `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
                    const span = document.createElement('span');
                    span.textContent = initials;
                    userAvatar.appendChild(span);
                }
            }
        }
    }

    async logout() {
        console.log('Logout method called');
        const confirmed = await this.ui.showConfirmation(
            'Are you sure you want to logout?',
            'Logout',
            'warning'
        );
        
        if (confirmed) {
            console.log('User confirmed logout');
            
            // Set logout flag to prevent authentication check interference
            sessionStorage.setItem('logging_out', 'true');
            
            // Clear user data immediately
            localStorage.removeItem('taskflow_current_user');
            document.cookie = 'taskflow_remember=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // Show success message
            this.showToast('Logged out successfully', 'success');
            
            // Redirect immediately without waiting for service worker unregistration
            console.log('Redirecting to login page...');
            window.location.href = 'login.html';
            
            // Unregister service worker in background (non-blocking)
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistration()
                    .then(registration => {
                        if (registration) {
                            return registration.unregister();
                        }
                    })
                    .then(() => console.log('Service worker unregistered'))
                    .catch(error => console.log('Service worker unregister failed:', error));
            }
        } else {
            console.log('User cancelled logout');
        }
    }

    // ===== QUOTE NAVIGATION METHODS =====
    showNextQuote() {
        if (this.quoteManager) {
            this.quoteManager.showNextQuote();
        }
    }

    showPreviousQuote() {
        if (this.quoteManager) {
            this.quoteManager.showPreviousQuote();
        }
    }

    async handleCategorySubmit() {
        const form = document.getElementById('category-form');
        const formData = new FormData(form);
        
        const categoryData = {
            name: formData.get('name').trim(),
            color: formData.get('color')
        };

        if (!categoryData.name) {
            this.showToast('Please enter a category name', 'error');
            return;
        }

        // Check if category name already exists
        const existingCategory = this.categories.find(cat => 
            cat.name.toLowerCase() === categoryData.name.toLowerCase()
        );
        
        if (existingCategory) {
            this.showToast('A category with this name already exists', 'error');
            return;
        }

        const newCategory = await this.addCustomCategory(categoryData);
        if (newCategory) {
            // Set the new category as selected in the task form
            const categorySelect = document.getElementById('task-category');
            categorySelect.value = newCategory.id;
        }

        this.ui.closeCategoryModal();
    }



    showToast(message, type = 'info') {
        this.ui.showToast(message, type);
    }
}

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ===== INITIALIZE APP =====
let app;
let ui;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    ui = app.ui;
    
    // Make app and ui globally available
    window.app = app;
    window.ui = ui;
});

// Cleanup when page is unloaded
window.addEventListener('beforeunload', () => {
    if (app && app.quoteManager) {
        app.quoteManager.stopQuoteRotation();
    }
});
