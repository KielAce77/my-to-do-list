<<<<<<< HEAD
# 📋 TaskFlow - Modern Todo App

A modern, responsive to-do list application with advanced features including user authentication, custom categories, motivational quotes, and comprehensive task management capabilities.

## 🌟 Features Overview

### 🔐 User Authentication

- **Secure Registration & Login**: Create accounts with email and password
- **Password Hashing**: SHA-256 encryption for secure password storage
- **Session Management**: Persistent login with "Remember Me" option
- **Data Isolation**: User-specific data storage and backup systems
- **Account Recovery**: Troubleshooting tools for corrupted user data

### ✅ Task Management

- **Complete CRUD Operations**: Create, Read, Update, Delete tasks
- **Rich Task Details**: Title, description, notes, due dates, priorities
- **Subtasks Support**: Break down complex tasks into smaller parts
- **Priority Levels**: High, Medium, Low with visual indicators
- **Due Date Tracking**: DateTime picker with time remaining display
- **Overdue Detection**: Visual strikethrough and enhanced styling for overdue tasks
- **Instant Updates**: Real-time UI updates without page refresh
- **Task Timestamps**: Creation and modification date tracking

### ️ Category System

- **Default Categories**: Personal, Work, Shopping, Health, Learning
- **Custom Categories**: Create unlimited custom categories with color coding
- **Color Customization**: 8 preset colors plus custom color picker
- **Category Filtering**: Filter tasks by category including "All Tasks" view
- **Category Management**: Delete custom categories with confirmation

### 🔄 Undo & Recovery

- **Task Completion Undo**: 10-second undo option after marking tasks complete
- **Task Deletion Undo**: 10-second undo option after deleting tasks
- **Visual Feedback**: Toast notifications with clear undo buttons
- **Keyboard Shortcut**: Ctrl+Z for quick undo access

### 🔍 Search & Filter

- **Real-time Search**: Search tasks by title, description, or notes
- **Multi-level Filtering**: Filter by status (all/pending/completed)
- **Priority Filtering**: Filter by priority levels
- **Category Filtering**: Filter by specific categories
- **Combined Filters**: Use multiple filters simultaneously

### Progress Tracking

- **Visual Progress Circle**: Animated completion percentage display
- **Comprehensive Statistics**: Total, completed, pending task counts
- **Completion Rate**: Real-time calculation of task completion percentage
- **Dynamic Updates**: Statistics update automatically with task changes

### 💬 Motivational Quotes

- **50+ Inspirational Quotes**: Curated collection of motivational quotes
- **Sequential Display**: Non-random, ordered quote progression
- **Auto-rotation**: 7-second display duration with smooth transitions
- **Manual Navigation**: Previous/Next buttons for browsing
- **Touch/Swipe Support**: Mobile and touchscreen navigation
- **Smooth Animations**: Fade in/out transitions between quotes

### 🎨 User Interface

- **Modern Design**: Clean, minimalist interface with glassmorphism effects
- **Dark/Light Themes**: Toggle between themes with system preference detection
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Custom Modals**: In-app confirmation dialogs and task forms
- **Visual Feedback**: Hover effects, animations, and state indicators
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

### Profile Management

- **User Information Display**: Name and avatar in header
- **Profile Picture Support**: Upload and display custom profile pictures (UI ready)
- **Clickable Profile Elements**: Interactive name and avatar elements
- **User Session Display**: Current user identification

### Advanced Features

- **Form Validation**: Real-time validation with visual feedback
- **Unsaved Changes Detection**: Prompts before closing modals with unsaved data
- **Multiple Close Methods**: X button, Escape key, Cancel button, background click
- **Data Backup System**: Automatic daily backups with cleanup
- **Data Recovery**: Corruption detection and recovery mechanisms
- **Keyboard Shortcuts**: Various shortcuts for enhanced productivity

### 📱 Progressive Web App (PWA)

- **Offline Capability**: Service worker for caching and offline access
- **App-like Experience**: Can be installed on devices
- **Fast Loading**: Optimized resource loading and caching
- **Responsive Icons**: Multiple icon sizes for different devices

## 🛠️ Technical Implementation

### Architecture

- **Modular JavaScript**: Organized into classes (Storage, TaskManager, UI, App, AuthManager, QuoteManager)
- **Single Page Application**: Dynamic content loading without page refreshes
- **Local Storage**: Client-side data persistence with backup systems
- **Event-driven**: Comprehensive event handling for user interactions

### Data Management

- **User-specific Storage**: Isolated data storage per user account
- **Automatic Backups**: Daily backup creation with old backup cleanup
- **Data Validation**: Input validation and corruption detection
- **Atomic Operations**: Consistent data updates across operations

### User Experience

- **Immediate Feedback**: Instant UI updates for all operations
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Visual feedback during operations
- **Confirmation Dialogs**: Custom styled confirmation for destructive actions

## 📁 File Structure

```
TaskFlow/
├── index.html              # Main application interface
├── login.html              # Authentication page
├── landing.html            # Loading/welcome page
├── css/
│   ├── style.css           # Main application styles
│   └── auth.css            # Authentication styles
├── js/
│   ├── script.js           # Core application logic
│   └── auth.js             # Authentication management
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── icons/                  # PWA icons (various sizes)
```

## Getting Started

1. **Open the Application**: Navigate to `login.html` in your web browser
2. **Create Account**: Register with email, first name, last name, and password
3. **Login**: Enter your credentials to access the main application
4. **Start Managing Tasks**: Begin creating and organizing your tasks

## 🎯 Key User Interactions

### Task Operations

- **Add Task**: Click "Add Task" button to open task creation modal
- **Edit Task**: Click pencil icon on any task to modify
- **Complete Task**: Click checkbox to mark complete (with undo option)
- **Delete Task**: Click trash icon with confirmation (with undo option)
- **Search**: Type in search box for real-time filtering

### Category Management

- **Create Category**: Select "Add Custom Category" from dropdown
- **Choose Colors**: Use preset colors or custom color picker
- **Filter by Category**: Click category names in sidebar
- **Delete Categories**: Use delete button on custom categories

### Navigation

- **Quote Navigation**: Use Previous/Next buttons or swipe on quotes
- **Theme Toggle**: Click moon/sun icon to switch themes
- **Logout**: Click logout icon with confirmation
- **Profile**: Click user name or avatar (profile modal ready)

## 🔒 Security Features

- **Password Hashing**: SHA-256 encryption for all passwords
- **Session Management**: Secure login state management
- **Data Isolation**: User data completely separated by email
- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Sanitized input handling

## 📱 Mobile Support

- **Touch Interactions**: Optimized for touch devices
- **Swipe Gestures**: Swipe left/right on quotes
- **Responsive Design**: Adapts to all screen sizes
- **Mobile-first**: Progressive enhancement from mobile base

## 🎨 Customization

- **Theme System**: CSS custom properties for easy theming
- **Color Schemes**: Light and dark mode support
- **Category Colors**: Unlimited color customization
- **Layout Flexibility**: Responsive grid system

## 🚧 Future Enhancements

- **Profile Picture Upload**: Complete implementation of image handling
- **Data Export/Import**: Backup and restore functionality
- **Task Sharing**: Collaborative features
- **Recurring Tasks**: Scheduled task repetition
- **Task Dependencies**: Link related tasks
- **Advanced Analytics**: Detailed productivity insights

## 💡 Usage Tips

1. **Use Categories**: Organize tasks by area of life or project
2. **Set Due Dates**: Track deadlines and time-sensitive tasks
3. **Break Down Tasks**: Use subtasks for complex projects
4. **Regular Reviews**: Check overdue tasks (marked with strikethrough)
5. **Motivational Boost**: Read daily quotes for inspiration
6. **Undo Feature**: Don't worry about accidental actions - undo is available
7. **Search Efficiently**: Use search to quickly find specific tasks
8. **Theme Preference**: Choose light or dark theme for comfort

---

**TaskFlow** - Streamline your productivity with modern task management! 🎯✨
=======
📋 TaskFlow - Modern Todo App

A modern, responsive to-do list application with advanced features including user authentication, custom categories, motivational quotes, and comprehensive task management capabilities.

🌟 Features Overview
🔐 User Authentication
- Secure Registration & Login: Create accounts with email and password
- Password Hashing: SHA-256 encryption for secure password storage
- Session Management: Persistent login with "Remember Me" option
- Data Isolation: User-specific data storage and backup systems
- Account Recovery: Troubleshooting tools for corrupted user data

✅ Task Management
- Complete CRUD Operations: Create, Read, Update, Delete tasks
- Rich Task Details: Title, description, notes, due dates, priorities
- Subtasks Support: Break down complex tasks into smaller parts
- Priority Levels: High, Medium, Low with visual indicators
- Due Date Tracking: DateTime picker with time remaining display
- Overdue Detection: Visual strikethrough and enhanced styling for overdue tasks
- Instant Updates: Real-time UI updates without page refresh
- Task Timestamps: Creation and modification date tracking

Category System
- Default Categories: Personal, Work, Shopping, Health, Learning
- Custom Categories: Create unlimited custom categories with color coding
- Color Customization: 8 preset colors plus custom color picker
- Category Filtering: Filter tasks by category including "All Tasks" view
- Category Management: Delete custom categories with confirmation

🔄 Undo & Recovery
- Task Completion Undo: 10-second undo option after marking tasks complete
- Task Deletion Undo: 10-second undo option after deleting tasks
- Visual Feedback: Toast notifications with clear undo buttons
- Keyboard Shortcut: Ctrl+Z for quick undo access

🔍 Search & Filter
- Real-time Search: Search tasks by title, description, or notes
- Multi-level Filtering: Filter by status (all/pending/completed)
- Priority Filtering: Filter by priority levels
- Category Filtering: Filter by specific categories
- Combined Filters: Use multiple filters simultaneously

Progress Tracking
- Visual Progress Circle: Animated completion percentage display
- Comprehensive Statistics: Total, completed, pending task counts
- Completion Rate: Real-time calculation of task completion percentage
- Dynamic Updates: Statistics update automatically with task changes

💬 Motivational Quotes
- 50+ Inspirational Quotes: Curated collection of motivational quotes
- Sequential Display: Non-random, ordered quote progression
- Auto-rotation: 7-second display duration with smooth transitions
- Manual Navigation: Previous/Next buttons for browsing
- Touch/Swipe Support: Mobile and touchscreen navigation
- Smooth Animations: Fade in/out transitions between quotes

🎨 User Interface
- Modern Design: Clean, minimalist interface with glassmorphism effects
- Dark/Light Themes: Toggle between themes with system preference detection
- Responsive Layout: Optimized for desktop, tablet, and mobile devices
- Custom Modals: In-app confirmation dialogs and task forms
- Visual Feedback: Hover effects, animations, and state indicators
- Accessibility: ARIA labels, keyboard navigation, and screen reader support

Profile Management
- User Information Display: Name and avatar in header
- Profile Picture Support: Upload and display custom profile pictures (UI ready)
- Clickable Profile Elements: Interactive name and avatar elements
- User Session Display: Current user identification

Advanced Features
- Form Validation: Real-time validation with visual feedback
- Unsaved Changes Detection: Prompts before closing modals with unsaved data
- Multiple Close Methods: X button, Escape key, Cancel button, background click
- Data Backup System: Automatic daily backups with cleanup
- Data Recovery: Corruption detection and recovery mechanisms
- Keyboard Shortcuts: Various shortcuts for enhanced productivity

📱 Progressive Web App (PWA)
- Offline Capability: Service worker for caching and offline access
- App-like Experience: Can be installed on devices
- Fast Loading: Optimized resource loading and caching
- Responsive Icons: Multiple icon sizes for different devices

🛠 Technical Implementation
Architecture
- Modular JavaScript: Organized into classes (Storage, TaskManager, UI, App, AuthManager, QuoteManager)
- Single Page Application: Dynamic content loading without page refreshes
- Local Storage: Client-side data persistence with backup systems
- Event-driven: Comprehensive event handling for user interactions

Data Management
- User-specific Storage: Isolated data storage per user account
- Automatic Backups: Daily backup creation with old backup cleanup
- Data Validation: Input validation and corruption detection
- Atomic Operations: Consistent data updates across operations

User Experience
- Immediate Feedback: Instant UI updates for all operations
- Error Handling: Graceful error handling with user-friendly messages
- Loading States: Visual feedback during operations
- Confirmation Dialogs: Custom styled confirmation for destructive actions

📁 File Structure
TaskFlow/
>>>>>>> 6b349154bce0e190031760b80b376ba3865b86c2
