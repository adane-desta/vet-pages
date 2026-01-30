// Get elements
const appointmentsNav = document.getElementById('appointmentsNav');
const questionsNav = document.getElementById('questionsNav');
const newsNav = document.getElementById('newsNav');
const resourcesNav = document.getElementById('resourcesNav');
const notificationsNav = document.getElementById('notificationsNav');
const accountNav = document.getElementById('accountNav');
const contentArea = document.getElementById('contentArea');
const headerActions = document.getElementById('headerActions');
const scrollIndicator = document.getElementById('scrollIndicator');

// Notification badges
const appointmentsBadge = document.getElementById('appointmentsBadge');
const questionsBadge = document.getElementById('questionsBadge');
const notificationsBadge = document.getElementById('notificationsBadge');
const mobileNotificationIcon = document.getElementById('mobileNotificationIcon');

// Stats elements
const todayAppointments = document.getElementById('todayAppointments');
const todayQuestions = document.getElementById('todayQuestions');
const pendingAppointmentsCount = document.getElementById('pendingAppointmentsCount');
const pendingQuestionsCount = document.getElementById('pendingQuestionsCount');

const menuToggle = document.getElementById('menuToggle');
const closeMenu = document.getElementById('closeMenu');
const sidebar = document.getElementById('sidebar');
const currentDate = document.getElementById('currentDate');

let activeSection = '';
let notifications = [];
let unreadCounts = {
    appointments: 3,
    questions: 5,
    notifications: 8
};

// Initialize current date
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Update notification badges
function updateNotificationBadges() {
    appointmentsBadge.textContent = unreadCounts.appointments > 0 ? unreadCounts.appointments : '';
    questionsBadge.textContent = unreadCounts.questions > 0 ? unreadCounts.questions : '';
    notificationsBadge.textContent = unreadCounts.notifications > 0 ? unreadCounts.notifications : '';
    
    const totalUnread = unreadCounts.appointments + unreadCounts.questions + unreadCounts.notifications;
    const notificationCount = document.querySelector('.notification-count');
    if (notificationCount) {
        notificationCount.textContent = totalUnread > 0 ? totalUnread : '';
        notificationCount.style.display = totalUnread > 0 ? 'flex' : 'none';
    }
    
    // Update today's stats
    todayAppointments.textContent = unreadCounts.appointments;
    todayQuestions.textContent = unreadCounts.questions;
    pendingAppointmentsCount.textContent = unreadCounts.appointments;
    pendingQuestionsCount.textContent = unreadCounts.questions;
}

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    sidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeMenu.addEventListener('click', () => {
    sidebar.classList.remove('active');
    document.body.style.overflow = '';
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024 && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target) && 
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
    checkScrollIndicator();
});

// Update nav items active state
function updateNavActiveState(activeNav) {
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    activeNav.classList.add('active');
}

// Scroll indicator logic
function checkScrollIndicator() {
    if (window.innerWidth > 768) {
        scrollIndicator.classList.remove('show');
        return;
    }
    
    const container = document.querySelector('.table-container') || 
                     document.querySelector('.news-grid') || 
                     document.querySelector('.resources-grid') ||
                     document.querySelector('.notifications-list');
    
    if (container) {
        const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
        const hasVerticalScroll = container.scrollHeight > container.clientHeight + 10;
        
        if (hasHorizontalScroll || hasVerticalScroll) {
            scrollIndicator.classList.add('show');
        } else {
            scrollIndicator.classList.remove('show');
        }
    } else {
        scrollIndicator.classList.remove('show');
    }
}

// Add scroll event listeners
function setupScrollListeners() {
    const containers = document.querySelectorAll('.table-container, .news-grid, .resources-grid, .notifications-list');
    
    containers.forEach(container => {
        container.addEventListener('scroll', checkScrollIndicator);
    });
}

// Remove notification badge for a specific type
function markAsRead(type) {
    if (unreadCounts[type] > 0) {
        unreadCounts[type]--;
        updateNotificationBadges();
    }
}

// Show appointments section
appointmentsNav.addEventListener('click', (e) => {
    e.preventDefault();
    updateNavActiveState(appointmentsNav);
    activeSection = 'appointments';
    getAppointments();
    
    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
});

const getAppointments = async () => {
    try {
        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">Appointments</h1>
                <div class="header-actions">
                    <div class="date-display">
                        <i class="fas fa-calendar-day"></i>
                        <span id="currentDate"></span>
                    </div>
                </div>
            </div>
            <div class="card">
                <h2 class="section-title">Upcoming Appointments</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Client</th>
                                <th>Contact</th>
                                <th>Date & Time</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="appointmentsTableBody">
                            <tr><td colspan="6" class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading appointments...</p></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        updateCurrentDate();

        const response = await fetch('http://localhost:5700/api/getAppointment');
        
        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }
        
        const appointments = await response.json();

        const tableBody = document.getElementById('appointmentsTableBody');
        tableBody.innerHTML = appointments.map(appointment => `
            <tr>
                <td>
                    <div class="client-info">
                        <strong>${appointment.name}</strong>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <small>${appointment.email}</small><br>
                        <small>${appointment.phone}</small>
                    </div>
                </td>
                <td>
                    <div class="datetime-info">
                        <strong>${new Date(appointment.date).toLocaleDateString()}</strong><br>
                        <small>${new Date(appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                    </div>
                </td>
                <td>${appointment.reason}</td>
                <td>
                    <span class="status-badge pending">Pending</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <a href="mailto:${appointment.email}" class="action-btn accept" onclick="markAsRead('appointments')">
                            <i class="fas fa-check"></i> Accept
                        </a>
                        <button class="action-btn reject" onclick="rejectAppointment(${appointment.appointment_id})">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        if (appointments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                        <p>No appointments scheduled</p>
                    </td>
                </tr>
            `;
        }
        
        setupScrollListeners();
        setTimeout(checkScrollIndicator, 100);
        
    } catch (error) {
        console.error('Error fetching appointments:', error);
        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">Appointments</h1>
            </div>
            <div class="card">
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load appointments</h3>
                    <p>Please check your connection and try again</p>
                    <button class="btn-outline" onclick="getAppointments()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            </div>
        `;
    }
};

// Show questions section
questionsNav.addEventListener('click', (e) => {
    e.preventDefault();
    updateNavActiveState(questionsNav);
    activeSection = 'questions';
    getQuestions();

    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
});

const getQuestions = async () => {
    try {
        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">Farmers' Questions</h1>
                <div class="date-display">
                    <i class="fas fa-calendar-day"></i>
                    <span id="currentDate"></span>
                </div>
            </div>
            <div class="card">
                <h2 class="section-title">Recent Questions</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Farmer</th>
                                <th>Contact</th>
                                <th>Question</th>
                                <th>Location</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="questionsTableBody">
                            <tr><td colspan="5" class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading questions...</p></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        updateCurrentDate();

        const response = await fetch('http://localhost:5700/api/getUserQuestion');
        
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        
        const userQuestions = await response.json();

        const tableBody = document.getElementById('questionsTableBody');
        tableBody.innerHTML = userQuestions.map(question => `
            <tr>
                <td>
                    <div class="farmer-info">
                        <strong>${question.name}</strong>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <small>${question.emailorphone}</small>
                    </div>
                </td>
                <td>
                    <div class="question-text">
                        ${question.question_text}
                    </div>
                </td>
                <td>
                    <div class="location-info">
                        <small>${question.address}</small>
                    </div>
                </td>
                <td>
                    <a href="mailto:${question.emailorphone}" class="action-btn accept" onclick="markAsRead('questions')">
                        <i class="fas fa-reply"></i> Reply
                    </a>
                </td>
            </tr>
        `).join('');
        
        if (userQuestions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-comments" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                        <p>No questions from farmers</p>
                    </td>
                </tr>
            `;
        }
        
        setupScrollListeners();
        setTimeout(checkScrollIndicator, 100);
        
    } catch (error) {
        console.error('Error fetching questions:', error);
        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">Questions</h1>
            </div>
            <div class="card">
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load questions</h3>
                    <p>Please check your connection and try again</p>
                    <button class="btn-outline" onclick="getQuestions()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            </div>
        `;
    }
};

// Show news and events section
newsNav.addEventListener('click', (e) => {
    e.preventDefault();
    updateNavActiveState(newsNav);
    activeSection = 'news';
    getNews();

    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
});

const getNews = async () => {
    try {
        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">News & Events</h1>
                <div class="header-actions">
                    <button class="btn-primary" id="addNewsBtn">
                        <i class="fas fa-plus"></i> Post News/Event
                    </button>
                    <div class="date-display">
                        <i class="fas fa-calendar-day"></i>
                        <span id="currentDate"></span>
                    </div>
                </div>
            </div>
            <div class="card">
                <h2 class="section-title">Latest News & Events</h2>
                <div class="news-grid" id="newsGrid">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading news & events...</p>
                    </div>
                </div>
            </div>
        `;
        updateCurrentDate();

        // Add event listener to the button
        document.getElementById('addNewsBtn').addEventListener('click', () => {
            openModal('addNewsModal');
        });

        const response = await fetch('http://localhost:5700/api/news-events?language_code=en');
        
        if (!response.ok) {
            throw new Error('Failed to fetch news & events');
        }
        
        const newsEvents = await response.json();

        const newsGrid = document.getElementById('newsGrid');
        newsGrid.innerHTML = newsEvents.map(newsEvent => `
            <div class="news-card">
                <div class="news-header">
                    <span class="news-type ${newsEvent.type.toLowerCase()}">${newsEvent.type}</span>
                    <span class="news-date">${new Date().toLocaleDateString()}</span>
                </div>
                <h3 class="news-title">${newsEvent.title}</h3>
                <p class="news-description">${newsEvent.description}</p>
                <div class="news-actions">
                    <button class="like_dislike_buttons like">
                        <i class="fas fa-thumbs-up"></i> Like
                    </button>
                    <button class="like_dislike_buttons dislike">
                        <i class="fas fa-thumbs-down"></i> Dislike
                    </button>
                </div>
            </div>
        `).join('');
        
        if (newsEvents.length === 0) {
            newsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>No news & events available</h3>
                    <p>Check back later for updates</p>
                </div>
            `;
        }
        
        setupScrollListeners();
        setTimeout(checkScrollIndicator, 100);
        
    } catch (error) {
        console.error('Error fetching news:', error);
        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">News & Events</h1>
            </div>
            <div class="card">
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load news & events</h3>
                    <p>Please check your connection and try again</p>
                    <button class="btn-outline" onclick="getNews()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            </div>
        `;
    }
};

// Show resources section
resourcesNav.addEventListener('click', async (e) => {
    e.preventDefault();
    updateNavActiveState(resourcesNav);
    
    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }

    try {
        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">Resources</h1>
                <div class="header-actions">
                    <button class="btn-primary" id="addResourceBtn">
                        <i class="fas fa-plus"></i> Add Resource
                    </button>
                    <div class="date-display">
                        <i class="fas fa-calendar-day"></i>
                        <span id="currentDate"></span>
                    </div>
                </div>
            </div>
            <div class="card">
                <h2 class="section-title">Available Resources</h2>
                <div class="resources-grid" id="resourcesGrid">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading resources...</p>
                    </div>
                </div>
            </div>
        `;
        updateCurrentDate();

        // Add event listener to the button
        document.getElementById('addResourceBtn').addEventListener('click', () => {
            openModal('addResourceModal');
        });

        const response = await fetch('http://localhost:5700/api/resources?language_code=en');
        
        if (!response.ok) {
            throw new Error('Failed to fetch resources');
        }
        
        const resources = await response.json();

        const resourcesGrid = document.getElementById('resourcesGrid');
        resourcesGrid.innerHTML = resources.map(resource => `
            <div class="resource-card">
                <div class="resource-icon">
                    <i class="fas fa-${getResourceIcon(resource.type)}"></i>
                </div>
                <div class="resource-content">
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-description">${resource.description}</p>
                    <div class="resource-meta">
                        <span class="resource-type">${resource.type}</span>
                        <button class="btn-outline">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (resources.length === 0) {
            resourcesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-medical"></i>
                    <h3>No resources available</h3>
                    <p>Resources will be added soon</p>
                </div>
            `;
        }
        
        activeSection = 'resources';
        setupScrollListeners();
        setTimeout(checkScrollIndicator, 100);
        
    } catch (error) {
        console.error('Error fetching resources:', error);
        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">Resources</h1>
            </div>
            <div class="card">
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load resources</h3>
                    <p>Please check your connection and try again</p>
                    <button class="btn-outline" onclick="resourcesNav.click()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            </div>
        `;
    }
});

// Show notifications section
notificationsNav.addEventListener('click', (e) => {
    e.preventDefault();
    updateNavActiveState(notificationsNav);
    activeSection = 'notifications';
    getNotifications();

    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
});

const getNotifications = () => {
    // Mock notifications data
    notifications = [
        {
            id: 1,
            type: 'appointment',
            title: 'New Appointment Request',
            message: 'John Doe requested an appointment for his cow on March 15',
            time: '10 minutes ago',
            read: false
        },
        {
            id: 2,
            type: 'question',
            title: 'New Question Received',
            message: 'Sarah Smith asked about chicken vaccination schedule',
            time: '1 hour ago',
            read: false
        },
        {
            id: 3,
            type: 'appointment',
            title: 'Appointment Confirmed',
            message: 'Michael Brown confirmed his appointment for tomorrow',
            time: '2 hours ago',
            read: true
        },
        {
            id: 4,
            type: 'news',
            title: 'New Resource Added',
            message: 'New guide on dairy cattle management has been published',
            time: '5 hours ago',
            read: true
        },
        {
            id: 5,
            type: 'question',
            title: 'Question Answered',
            message: 'You answered a question about pig nutrition',
            time: '1 day ago',
            read: true
        }
    ];

    contentArea.innerHTML = `
        <div class="content-header">
            <h1 class="page-title">Notifications</h1>
            <div class="header-actions">
                <button class="btn-secondary" id="markAllReadBtn">
                    <i class="fas fa-check-double"></i> Mark All as Read
                </button>
                <div class="date-display">
                    <i class="fas fa-calendar-day"></i>
                    <span id="currentDate"></span>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="notifications-list" id="notificationsList">
                ${notifications.map(notification => `
                    <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                        <div class="notification-icon ${notification.type}">
                            <i class="fas fa-${notification.type === 'appointment' ? 'calendar-check' : notification.type === 'question' ? 'question-circle' : 'newspaper'}"></i>
                        </div>
                        <div class="notification-content">
                            <h4 class="notification-title">${notification.title}</h4>
                            <p class="notification-message">${notification.message}</p>
                            <span class="notification-time">${notification.time}</span>
                        </div>
                        <div class="notification-actions">
                            ${!notification.read ? `
                                <button class="action-btn accept mark-read-btn" data-id="${notification.id}">
                                    <i class="fas fa-check"></i> Mark Read
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    updateCurrentDate();

    // Add event listeners
    document.getElementById('markAllReadBtn').addEventListener('click', markAllNotificationsAsRead);
    
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const notificationId = parseInt(btn.dataset.id);
            markNotificationAsRead(notificationId);
        });
    });
    
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', () => {
            const notificationId = parseInt(item.dataset.id);
            markNotificationAsRead(notificationId);
        });
    });
    
    setupScrollListeners();
    setTimeout(checkScrollIndicator, 100);
};

// Show account section
accountNav.addEventListener('click', (e) => {
    e.preventDefault();
    updateNavActiveState(accountNav);
    activeSection = 'account';
    getAccount();

    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
});

const getAccount = () => {
    contentArea.innerHTML = `
        <div class="content-header">
            <h1 class="page-title">Account Settings</h1>
            <div class="date-display">
                <i class="fas fa-calendar-day"></i>
                <span id="currentDate"></span>
            </div>
        </div>
        <div class="card">
            <div class="account-sections">
                <!-- Personal Information Section -->
                <div class="account-section">
                    <h3><i class="fas fa-user"></i> Personal Information</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Full Name</label>
                            <p class="account-info">Dr. Thomas</p>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <p class="account-info">dr.thomas@vetclinic.com</p>
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <p class="account-info">+1234567890</p>
                        </div>
                        <div class="form-group">
                            <label>Specialty</label>
                            <p class="account-info">Large Animal Veterinarian</p>
                        </div>
                        <div class="form-group">
                            <label>Clinic/Hospital</label>
                            <p class="account-info">Animal Health Center</p>
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <p class="account-info">123 Veterinary Street, City, Country</p>
                        </div>
                    </div>
                    <button class="btn-primary" id="editAccountBtn">
                        <i class="fas fa-edit"></i> Edit Information
                    </button>
                </div>

                <!-- Security Section -->
                <div class="account-section">
                    <h3><i class="fas fa-shield-alt"></i> Security & Privacy</h3>
                    <div class="privacy-options">
                        <div class="option-item">
                            <div class="option-info">
                                <h4>Two-Factor Authentication</h4>
                                <p>Add an extra layer of security to your account</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="option-item">
                            <div class="option-info">
                                <h4>Login Notifications</h4>
                                <p>Get notified when someone logs into your account</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                        <div class="option-item">
                            <div class="option-info">
                                <h4>Email Notifications</h4>
                                <p>Receive email notifications for important updates</p>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" checked>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button class="btn-primary" id="changePasswordBtn">
                            <i class="fas fa-key"></i> Change Password
                        </button>
                    </div>
                </div>

                <!-- Preferences Section -->
                <div class="account-section">
                    <h3><i class="fas fa-cog"></i> Preferences</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Default Language</label>
                            <select class="form-control">
                                <option value="en" selected>English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Time Zone</label>
                            <select class="form-control">
                                <option value="UTC-5" selected>Eastern Time (ET)</option>
                                <option value="UTC-6">Central Time (CT)</option>
                                <option value="UTC-7">Mountain Time (MT)</option>
                                <option value="UTC-8">Pacific Time (PT)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Date Format</label>
                            <select class="form-control">
                                <option value="MM/DD/YYYY" selected>MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    updateCurrentDate();

    // Add event listeners
    document.getElementById('editAccountBtn').addEventListener('click', () => {
        openModal('editAccountModal');
    });

    document.getElementById('changePasswordBtn').addEventListener('click', () => {
        openModal('changePasswordModal');
    });

    setupScrollListeners();
    setTimeout(checkScrollIndicator, 100);
};

// Helper function to get resource icon
function getResourceIcon(type) {
    const icons = {
        'pdf': 'file-pdf',
        'video': 'video',
        'guide': 'book',
        'manual': 'book-open',
        'article': 'newspaper',
        'template': 'file-alt'
    };
    return icons[type.toLowerCase()] || 'file';
}

// Handle rejecting an appointment
async function rejectAppointment(appointment_id) {
    if (!confirm('Are you sure you want to reject this appointment?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5700/api/delete_appointment/${appointment_id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Appointment rejected successfully', 'success');
            markAsRead('appointments');
            getAppointments();
        } else {
            throw new Error('Failed to delete appointment');
        }
    } catch (error) {
        console.error('Error rejecting appointment:', error);
        showNotification('Failed to reject appointment', 'error');
    }
}

// Mark notification as read
function markNotificationAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        
        // Update unread counts
        if (unreadCounts.notifications > 0) {
            unreadCounts.notifications--;
            updateNotificationBadges();
        }
        
        // Update UI
        const notificationElement = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
        if (notificationElement) {
            notificationElement.classList.remove('unread');
            const markReadBtn = notificationElement.querySelector('.mark-read-btn');
            if (markReadBtn) {
                markReadBtn.remove();
            }
        }
        
        showNotification('Notification marked as read', 'success');
    }
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
    notifications.forEach(notification => {
        notification.read = true;
    });
    
    unreadCounts.notifications = 0;
    updateNotificationBadges();
    getNotifications();
    showNotification('All notifications marked as read', 'success');
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (e.target === modal) {
            closeModal(modal.id);
        }
    });
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="display: flex"]');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
});

// File upload handling
document.addEventListener('DOMContentLoaded', () => {
    const resourceFile = document.getElementById('resourceFile');
    const fileName = document.getElementById('fileName');
    
    if (resourceFile) {
        resourceFile.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileName.textContent = this.files[0].name;
            } else {
                fileName.textContent = 'No file chosen';
            }
        });
    }
    
    // Form submissions
    const addNewsForm = document.getElementById('addNewsForm');
    if (addNewsForm) {
        addNewsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would typically send data to your backend
            showNotification('News/Event posted successfully!', 'success');
            closeModal('addNewsModal');
            getNews(); // Refresh the news list
        });
    }
    
    const addResourceForm = document.getElementById('addResourceForm');
    if (addResourceForm) {
        addResourceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would typically send data to your backend
            showNotification('Resource added successfully!', 'success');
            closeModal('addResourceModal');
            resourcesNav.click(); // Refresh the resources list
        });
    }
    
    const editAccountForm = document.getElementById('editAccountForm');
    if (editAccountForm) {
        editAccountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Account information updated successfully!', 'success');
            closeModal('editAccountModal');
            accountNav.click(); // Refresh the account page
        });
    }
    
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Password changed successfully!', 'success');
            closeModal('changePasswordModal');
        });
    }
    
    // Password strength checker
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
});

// Password strength checker
function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };
    
    let strength = 0;
    Object.values(requirements).forEach(req => {
        if (req) strength++;
    });
    
    let width = (strength / 5) * 100;
    let color = '#ef4444'; // Red for weak
    let text = 'Weak';
    
    if (strength >= 4) {
        color = '#10b981'; // Green for strong
        text = 'Strong';
    } else if (strength >= 2) {
        color = '#f59e0b'; // Yellow for medium
        text = 'Medium';
    }
    
    strengthBar.style.width = `${width}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
    
    // Update requirement list
    Object.keys(requirements).forEach(key => {
        const element = document.getElementById(`req${key.charAt(0).toUpperCase() + key.slice(1)}`);
        if (element) {
            if (requirements[key]) {
                element.classList.add('valid');
            } else {
                element.classList.remove('valid');
            }
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: var(--shadow-lg);
        transform: translateX(100%);
        opacity: 0;
        transition: transform var(--transition-base), opacity var(--transition-base);
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification-success {
        background-color: var(--success-color);
        color: white;
    }
    
    .notification-error {
        background-color: var(--danger-color);
        color: white;
    }
    
    .notification-info {
        background-color: var(--primary-color);
        color: white;
    }
    
    .notification button {
        margin-left: auto;
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: var(--radius-sm);
    }
    
    .notification button:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;
document.head.appendChild(notificationStyles);

// Initialize the dashboard
updateCurrentDate();
updateNotificationBadges();

// Set default active section
window.addEventListener('DOMContentLoaded', () => {
    appointmentsNav.click();
    
    // Add scroll indicator check on load
    setTimeout(checkScrollIndicator, 500);
});