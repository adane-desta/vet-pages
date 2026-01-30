// Get elements
const appointmentsNav = document.getElementById('appointmentsNav');
const questionsNav = document.getElementById('questionsNav');
const newsNav = document.getElementById('newsNav');
const resourcesNav = document.getElementById('resourcesNav');
const contentArea = document.getElementById('contentArea');
const modal = document.getElementById('modal');
const menuToggle = document.getElementById('menuToggle');
const closeMenu = document.getElementById('closeMenu');
const sidebar = document.getElementById('sidebar');
const currentDate = document.getElementById('currentDate');

let activeSection = '';

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

// Update nav items active state
function updateNavActiveState(activeNav) {
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    activeNav.classList.add('active');
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
        // Show loading state
        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">Appointments</h1>
                <div class="header-actions">
                    <button class="btn-primary" id="addAppointmentBtn">
                        <i class="fas fa-plus"></i> Add Appointment
                    </button>
                    <div class="date-display">
                        <i class="fas fa-calendar-day"></i>
                        <span id="currentDate"></span>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading appointments...</p>
                </div>
            </div>
        `;
        updateCurrentDate();

        const response = await fetch('http://localhost:5700/api/getAppointment');
        
        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }
        
        const appointments = await response.json();

        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">Appointments</h1>
                <div class="header-actions">
                    <button class="btn-primary" id="addAppointmentBtn">
                        <i class="fas fa-plus"></i> Add Appointment
                    </button>
                    <div class="date-display">
                        <i class="fas fa-calendar-day"></i>
                        <span id="currentDate"></span>
                    </div>
                </div>
            </div>
            <div class="card">
                <h2 class="section-title">Upcoming Appointments</h2>
                <div class="table-responsive">
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
                        <tbody>
                            ${appointments.map(appointment => `
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
                                            <a href="mailto:${appointment.email}" class="action-btn accept">
                                                <i class="fas fa-check"></i> Accept
                                            </a>
                                            <button class="action-btn reject" onclick="rejectAppointment(${appointment.appointment_id})">
                                                <i class="fas fa-times"></i> Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                            ${appointments.length === 0 ? `
                                <tr>
                                    <td colspan="6" style="text-align: center; padding: 3rem;">
                                        <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                                        <p>No appointments scheduled</p>
                                    </td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        updateCurrentDate();
        
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
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading questions...</p>
                </div>
            </div>
        `;
        updateCurrentDate();

        const response = await fetch('http://localhost:5700/api/getUserQuestion');
        
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        
        const userQuestions = await response.json();

        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">Farmers' Questions</h1>
                <div class="date-display">
                    <i class="fas fa-calendar-day"></i>
                    <span id="currentDate"></span>
                </div>
            </div>
            <div class="card">
                <div class="table-responsive">
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
                        <tbody>
                            ${userQuestions.map(question => `
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
                                        <a href="mailto:${question.emailorphone}" class="action-btn accept">
                                            <i class="fas fa-reply"></i> Reply
                                        </a>
                                    </td>
                                </tr>
                            `).join('')}
                            ${userQuestions.length === 0 ? `
                                <tr>
                                    <td colspan="5" style="text-align: center; padding: 3rem;">
                                        <i class="fas fa-comments" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                                        <p>No questions from farmers</p>
                                    </td>
                                </tr>
                            ` : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        updateCurrentDate();
        
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
                <div class="date-display">
                    <i class="fas fa-calendar-day"></i>
                    <span id="currentDate"></span>
                </div>
            </div>
            <div class="card">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading news & events...</p>
                </div>
            </div>
        `;
        updateCurrentDate();

        const response = await fetch('http://localhost:5700/api/news-events?language_code=en');
        
        if (!response.ok) {
            throw new Error('Failed to fetch news & events');
        }
        
        const newsEvents = await response.json();

        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">News & Events</h1>
                <div class="date-display">
                    <i class="fas fa-calendar-day"></i>
                    <span id="currentDate"></span>
                </div>
            </div>
            <div class="card">
                <div class="news-grid">
                    ${newsEvents.map(newsEvent => `
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
                    `).join('')}
                    ${newsEvents.length === 0 ? `
                        <div class="empty-state">
                            <i class="fas fa-newspaper"></i>
                            <h3>No news & events available</h3>
                            <p>Check back later for updates</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        updateCurrentDate();
        
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
                <div class="date-display">
                    <i class="fas fa-calendar-day"></i>
                    <span id="currentDate"></span>
                </div>
            </div>
            <div class="card">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading resources...</p>
                </div>
            </div>
        `;
        updateCurrentDate();

        const response = await fetch('http://localhost:5700/api/resources?language_code=en');
        
        if (!response.ok) {
            throw new Error('Failed to fetch resources');
        }
        
        const resources = await response.json();

        contentArea.innerHTML = `
            <div class="content-header">
                <h1 class="page-title">Resources</h1>
                <div class="date-display">
                    <i class="fas fa-calendar-day"></i>
                    <span id="currentDate"></span>
                </div>
            </div>
            <div class="card">
                <div class="resources-grid">
                    ${resources.map(resource => `
                        <div class="resource-card">
                            <div class="resource-icon">
                                <i class="fas fa-${resource.type === 'video' ? 'video' : resource.type === 'pdf' ? 'file-pdf' : 'book'}"></i>
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
                    `).join('')}
                    ${resources.length === 0 ? `
                        <div class="empty-state">
                            <i class="fas fa-book-medical"></i>
                            <h3>No resources available</h3>
                            <p>Resources will be added soon</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        updateCurrentDate();
        activeSection = 'resources';
        
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
            // Show success notification
            showNotification('Appointment rejected successfully', 'success');
            getAppointments();
        } else {
            throw new Error('Failed to delete appointment');
        }
    } catch (error) {
        console.error('Error rejecting appointment:', error);
        showNotification('Failed to reject appointment', 'error');
    }
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

// Modal functions
function openModal(title, content) {
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
    }
});

// Add loading spinner and error state CSS
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        color: var(--text-secondary);
    }
    
    .loading-spinner i {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
    
    .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
    }
    
    .error-state i {
        font-size: 3rem;
        color: var(--danger-color);
        margin-bottom: 1rem;
    }
    
    .error-state h3 {
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .error-state p {
        color: var(--text-secondary);
        margin-bottom: 1.5rem;
    }
    
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
        color: var(--text-secondary);
    }
    
    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    
    .news-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .news-card {
        background-color: var(--body-bg);
        border-radius: var(--radius-lg);
        padding: 1.5rem;
        border: 1px solid var(--border-color);
    }
    
    .news-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .news-type {
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-md);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .news-type.event {
        background-color: rgba(139, 92, 246, 0.1);
        color: var(--accent-color);
    }
    
    .news-type.news {
        background-color: rgba(37, 99, 235, 0.1);
        color: var(--primary-color);
    }
    
    .news-date {
        font-size: 0.875rem;
        color: var(--text-secondary);
    }
    
    .news-title {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
        color: var(--text-primary);
    }
    
    .news-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    
    .resources-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
    }
    
    .resource-card {
        display: flex;
        gap: 1rem;
        padding: 1.5rem;
        background-color: var(--body-bg);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-color);
        transition: transform var(--transition-base);
    }
    
    .resource-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .resource-icon {
        font-size: 1.5rem;
        color: var(--primary-color);
    }
    
    .resource-title {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    
    .resource-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
        line-height: 1.4;
    }
    
    .resource-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .resource-type {
        padding: 0.25rem 0.75rem;
        background-color: rgba(37, 99, 235, 0.1);
        color: var(--primary-color);
        border-radius: var(--radius-md);
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    @media (max-width: 640px) {
        .news-grid,
        .resources-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(additionalStyles);

// Initialize the dashboard
updateCurrentDate();

// Set default active section
window.addEventListener('DOMContentLoaded', () => {
    appointmentsNav.click();
});