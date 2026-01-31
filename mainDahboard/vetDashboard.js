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
const dashboardOverview = document.getElementById('dashboardOverview');

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

// State management
let activeSection = '';
let notifications = [];
let unreadCounts = {
    appointments: 3,
    questions: 5,
    notifications: 8
};

// Track form dirty states
let formDirtyStates = {
    addNewsForm: false,
    addResourceForm: false,
    editAccountForm: false,
    changePasswordForm: false,
    emailForm: false,
    rejectQuestionForm: false
};

// Store pending data for forms when clicking outside modal
let pendingFormData = {
    addNewsForm: null,
    addResourceForm: null,
    editAccountForm: null,
    changePasswordForm: null,
    emailForm: null,
    rejectQuestionForm: null
};

// Email data storage
let currentEmailData = {
    to: '',
    type: '', // 'appointment' or 'question'
    appointmentId: null,
    questionId: null
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

// ==================== MODAL MANAGEMENT ====================

// Show confirmation modal
function showConfirmModal(title, message, parentModalId = null) {
    return new Promise((resolve) => {
        document.getElementById('confirmModalTitle').textContent = title;
        document.getElementById('confirmModalMessage').textContent = message;
        
        const confirmModal = document.getElementById('confirmModal');
        
        // Set higher z-index if there's a parent modal
        if (parentModalId) {
            confirmModal.style.zIndex = '20000';
        } else {
            confirmModal.style.zIndex = '10000';
        }
        
        confirmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const confirmBtn = document.getElementById('confirmModalConfirm');
        const cancelBtn = document.getElementById('confirmModalCancel');
        
        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };
        
        const handleCancel = () => {
            cleanup();
            resolve(false);
        };
        
        const cleanup = () => {
            confirmModal.style.display = 'none';
            document.body.style.overflow = '';
            confirmModal.style.zIndex = '';
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        
        // Close on escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Remove event listener after modal closes
        setTimeout(() => {
            document.removeEventListener('keydown', handleEscape);
        }, 100);
    });
}

// Show alert modal
function showAlertModal(title, message, parentModalId = null) {
    return new Promise((resolve) => {
        document.getElementById('alertModalTitle').textContent = title;
        document.getElementById('alertModalMessage').textContent = message;
        
        const alertModal = document.getElementById('alertModal');
        
        // Set higher z-index if there's a parent modal
        if (parentModalId) {
            alertModal.style.zIndex = '20000';
        } else {
            alertModal.style.zIndex = '10000';
        }
        
        alertModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const okBtn = document.getElementById('alertModalOk');
        
        const handleOk = () => {
            alertModal.style.display = 'none';
            document.body.style.overflow = '';
            alertModal.style.zIndex = '';
            okBtn.removeEventListener('click', handleOk);
            resolve();
        };
        
        okBtn.addEventListener('click', handleOk);
        
        // Close on escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleOk();
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Remove event listener after modal closes
        setTimeout(() => {
            document.removeEventListener('keydown', handleEscape);
        }, 100);
    });
}

// Open modal with form state tracking
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Store initial form state if not already stored
        const form = modal.querySelector('form');
        if (form && !pendingFormData[form.id]) {
            pendingFormData[form.id] = getFormData(form);
        }
    }
}

// Close modal with confirmation if form is dirty
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const form = modal.querySelector('form');
    if (form && formDirtyStates[form.id]) {
        showConfirmModal('Unsaved Changes', 
            'You have unsaved changes. Are you sure you want to close?',
            modalId)
            .then((confirmed) => {
                if (confirmed) {
                    resetForm(form);
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
    } else {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Confirm close email modal (special handling)
function confirmCloseEmailModal() {
    if (formDirtyStates.emailForm) {
        showConfirmModal('Unsaved Email', 
            'You have an unsaved email. Are you sure you want to close?',
            'emailModal')
            .then((confirmed) => {
                if (confirmed) {
                    resetForm(document.getElementById('emailForm'));
                    closeModal('emailModal');
                }
            });
    } else {
        closeModal('emailModal');
    }
}

// Track form changes
function trackFormChanges(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('input', () => {
        formDirtyStates[formId] = true;
        form.classList.add('form-dirty');
    });
    
    form.addEventListener('change', () => {
        formDirtyStates[formId] = true;
        form.classList.add('form-dirty');
    });
    
    // Reset dirty state on form reset
    form.addEventListener('reset', () => {
        formDirtyStates[formId] = false;
        form.classList.remove('form-dirty');
        pendingFormData[formId] = null;
    });
    
    // Reset dirty state on successful submit
    form.addEventListener('submit', () => {
        formDirtyStates[formId] = false;
        form.classList.remove('form-dirty');
        pendingFormData[formId] = null;
    });
}

// Get form data
function getFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

// Reset form to initial state
function resetForm(form) {
    if (!form) return;
    
    form.reset();
    formDirtyStates[form.id] = false;
    form.classList.remove('form-dirty');
    pendingFormData[form.id] = null;
    
    // Special handling for specific forms
    if (form.id === 'emailForm') {
        document.getElementById('emailBody').innerHTML = '';
        document.getElementById('attachmentsList').innerHTML = '';
    }
    
    // Special handling for avatar preview
    if (form.id === 'editAccountForm') {
        const avatarPreview = document.getElementById('avatarPreview');
        avatarPreview.classList.remove('has-image');
        const img = avatarPreview.querySelector('img');
        if (img) {
            img.style.display = 'none';
        }
        avatarPreview.querySelector('.avatar-preview-image').style.display = 'flex';
    }
}

// ==================== EMAIL FUNCTIONALITY ====================

// Show email modal
function showEmailModal(type, data) {
    let title = '';
    let subject = '';
    let to = '';
    let defaultBody = '';
    
    if (type === 'appointment') {
        title = 'Accept Appointment';
        subject = `Appointment Confirmation - ${data.name}`;
        to = data.email;
        defaultBody = `Dear ${data.name},<br><br>Your appointment on ${new Date(data.date).toLocaleDateString()} has been confirmed.<br><br>Best regards,<br>Dr. Thomas`;
        currentEmailData.appointmentId = data.appointment_id;
    } else if (type === 'question') {
        title = 'Reply to Question';
        subject = `Re: Your question about "${data.question_text.substring(0, 50)}..."`;
        to = data.emailorphone.includes('@') ? data.emailorphone : '';
        defaultBody = `Dear ${data.name},<br><br>Thank you for your question. Here is my response:<br><br><br>Best regards,<br>Dr. Thomas`;
        currentEmailData.questionId = data.question_id;
    }
    
    currentEmailData.to = to;
    currentEmailData.type = type;
    
    document.getElementById('emailModalTitle').textContent = title;
    document.getElementById('emailTo').value = to;
    document.getElementById('emailSubject').value = subject;
    document.getElementById('emailBody').innerHTML = defaultBody;
    
    openModal('emailModal');
}

// Handle email form submission
async function handleEmailSubmit(e) {
    e.preventDefault();
    
    const to = document.getElementById('emailTo').value;
    const subject = document.getElementById('emailSubject').value;
    const body = document.getElementById('emailBody').innerHTML;
    
    try {
        // Here you would typically send the email via your backend
        // For now, we'll simulate the API call
        
        const emailData = {
            to,
            subject,
            body,
            type: currentEmailData.type,
            appointmentId: currentEmailData.appointmentId,
            questionId: currentEmailData.questionId
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use emailModal as parent for z-index
        showAlertModal('Success', 'Email sent successfully!', 'emailModal')
            .then(() => {
                resetForm(document.getElementById('emailForm'));
                closeModal('emailModal');
                
                // Mark as read if applicable
                if (currentEmailData.type === 'appointment') {
                    markAsRead('appointments');
                } else if (currentEmailData.type === 'question') {
                    markAsRead('questions');
                }
            });
        
    } catch (error) {
        showAlertModal('Error', 'Failed to send email. Please try again.', 'emailModal');
    }
}

// Setup email editor toolbar
function setupEmailEditor() {
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const emailBody = document.getElementById('emailBody');
    
    toolbarButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const command = button.dataset.command;
            
            if (command === 'createLink') {
                const url = prompt('Enter URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, null);
            }
            
            emailBody.focus();
        });
    });
    
    // Track changes in email body
    emailBody.addEventListener('input', () => {
        formDirtyStates.emailForm = true;
        document.getElementById('emailForm').classList.add('form-dirty');
    });
}

// Handle attachments
function setupAttachments() {
    const attachmentsInput = document.getElementById('emailAttachments');
    const attachmentsList = document.getElementById('attachmentsList');
    
    attachmentsInput.addEventListener('change', () => {
        attachmentsList.innerHTML = '';
        
        Array.from(attachmentsInput.files).forEach((file, index) => {
            const attachmentItem = document.createElement('div');
            attachmentItem.className = 'attachment-item';
            attachmentItem.innerHTML = `
                <i class="fas fa-paperclip"></i>
                <span>${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                <button type="button" class="remove-attachment" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            attachmentsList.appendChild(attachmentItem);
        });
        
        // Mark form as dirty
        formDirtyStates.emailForm = true;
        document.getElementById('emailForm').classList.add('form-dirty');
    });
    
    // Remove attachment
    attachmentsList.addEventListener('click', (e) => {
        if (e.target.closest('.remove-attachment')) {
            const index = parseInt(e.target.closest('.remove-attachment').dataset.index);
            const files = Array.from(attachmentsInput.files);
            files.splice(index, 1);
            
            // Create new FileList
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            attachmentsInput.files = dataTransfer.files;
            
            // Trigger change event
            attachmentsInput.dispatchEvent(new Event('change'));
        }
    });
}

// ==================== IMAGE PREVIEW ====================

function setupImagePreview() {
    const avatarInput = document.getElementById('accountAvatar');
    const avatarPreview = document.getElementById('avatarPreview');
    
    if (!avatarInput || !avatarPreview) return;
    
    avatarInput.addEventListener('change', function(e) {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Create image element if it doesn't exist
                let img = avatarPreview.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    avatarPreview.appendChild(img);
                }
                
                img.src = e.target.result;
                avatarPreview.classList.add('has-image');
                
                // Mark form as dirty
                formDirtyStates.editAccountForm = true;
                document.getElementById('editAccountForm').classList.add('form-dirty');
            };
            
            reader.readAsDataURL(file);
        }
    });
}

// ==================== REJECT QUESTION ====================

function showRejectQuestionModal(questionId, questionData) {
    const modal = document.getElementById('rejectQuestionModal');
    if (!modal) return;
    
    // Store question data for later use
    modal.dataset.questionId = questionId;
    modal.dataset.questionData = JSON.stringify(questionData);
    
    // Reset form
    const form = document.getElementById('rejectQuestionForm');
    form.reset();
    document.getElementById('customReasonGroup').style.display = 'none';
    
    // Show reason change handler
    document.getElementById('rejectReason').addEventListener('change', function() {
        const customReasonGroup = document.getElementById('customReasonGroup');
        customReasonGroup.style.display = this.value === 'other' ? 'block' : 'none';
    });
    
    openModal('rejectQuestionModal');
}

async function handleRejectQuestion(e) {
    e.preventDefault();
    
    const form = e.target;
    const questionId = form.closest('.modal').dataset.questionId;
    const questionData = JSON.parse(form.closest('.modal').dataset.questionData);
    
    const reason = document.getElementById('rejectReason').value;
    const customReason = document.getElementById('customReason').value;
    const message = document.getElementById('rejectMessage').value;
    
    const finalReason = reason === 'other' ? customReason : reason;
    
    try {
        // Here you would typically send the rejection to your backend
        // For now, we'll simulate the API call
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showAlertModal('Success', 'Question rejected successfully!', 'rejectQuestionModal')
            .then(() => {
                closeModal('rejectQuestionModal');
                markAsRead('questions');
                
                // Refresh questions list
                if (activeSection === 'questions') {
                    getQuestions();
                }
            });
        
    } catch (error) {
        showAlertModal('Error', 'Failed to reject question. Please try again.', 'rejectQuestionModal');
    }
}

// ==================== MOBILE ACTION MENU ====================

function setupActionMenus() {
    // Delegate event handling for action menus
    document.addEventListener('click', (e) => {
        // Toggle action menu
        if (e.target.closest('.action-menu-toggle')) {
            const toggle = e.target.closest('.action-menu-toggle');
            const menu = toggle.nextElementSibling;
            menu.classList.toggle('show');
            e.stopPropagation();
        }
        
        // Handle menu item clicks
        if (e.target.closest('.action-menu-item')) {
            const menuItem = e.target.closest('.action-menu-item');
            const action = menuItem.dataset.action;
            const row = menuItem.closest('tr');
            const data = JSON.parse(row.dataset.rowData);
            
            if (action === 'accept') {
                if (data.email) {
                    showEmailModal('appointment', data);
                }
            } else if (action === 'reject') {
                if (data.appointment_id) {
                    showConfirmModal('Reject Appointment', 
                        'Are you sure you want to reject this appointment?',
                        null)
                        .then((confirmed) => {
                            if (confirmed) {
                                rejectAppointment(data.appointment_id);
                            }
                        });
                } else if (data.question_id) {
                    showRejectQuestionModal(data.question_id, data);
                }
            } else if (action === 'reply') {
                if (data.emailorphone && data.emailorphone.includes('@')) {
                    showEmailModal('question', data);
                }
            }
            
            // Close menu
            const menu = menuItem.closest('.action-menu');
            if (menu) {
                menu.classList.remove('show');
            }
        }
        
        // Close menus when clicking outside
        if (!e.target.closest('.action-menu') && !e.target.closest('.action-menu-toggle')) {
            document.querySelectorAll('.action-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

// ==================== SIDEBAR NAVIGATION SETUP ====================

function setupSidebarNavigation() {
    // News & Events
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
    
    // Resources
    resourcesNav.addEventListener('click', async (e) => {
        e.preventDefault();
        updateNavActiveState(resourcesNav);
        activeSection = 'resources';
        
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Show resources section
        await showResourcesSection();
    });
    
    // Notifications
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
    
    // Account
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
}

// ==================== APPOINTMENTS SECTION ====================

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

dashboardOverview.addEventListener('click' , (e) => {
    e.preventDefault()
    updateNavActiveState(dashboardOverview)
    activeSection = 'dashboardOverview';
    showdashboardOverview()

    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
        document.body.style.overflow = '';
    }
})

const showdashboardOverview = () => {
    contentArea.innerHTML = `

    <div class="dashboard-overview">
        <div class="welcome-card">
            <div class="welcome-content">
                <h2>Welcome back, Dr. Thomas</h2>
                <p>You have <strong id="pendingAppointmentsCount">8</strong> appointments and <strong id="pendingQuestionsCount">5</strong> unanswered questions today.</p>
            </div>
            <div class="welcome-illustration">
                <i class="fas fa-stethoscope"></i>
            </div>
        </div>

        <div class="quick-stats">
            <div class="stat-card stat-primary">
                <i class="fas fa-calendar-alt"></i>
                <div>
                    <h3>24</h3>
                    <p>Monthly Appointments</p>
                </div>
            </div>
            <div class="stat-card stat-success">
                <i class="fas fa-check-circle"></i>
                <div>
                    <h3>18</h3>
                    <p>Answered Questions</p>
                </div>
            </div>
            <div class="stat-card stat-warning">
                <i class="fas fa-exclamation-circle"></i>
                <div>
                    <h3>3</h3>
                    <p>Pending Cases</p>
                </div>
            </div>
            <div class="stat-card stat-info">
                <i class="fas fa-users"></i>
                <div>
                    <h3>42</h3>
                    <p>Active Farmers</p>
                </div>
            </div>
        </div>
    </div>
`;
}

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
        
        if (appointments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                        <p>No appointments scheduled</p>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = appointments.map(appointment => {
                const rowData = JSON.stringify(appointment);
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    return `
                        <tr data-row-data='${rowData}'>
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
                                <div class="action-dropdown">
                                    <button class="action-menu-toggle">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <div class="action-menu">
                                        <button class="action-menu-item accept" data-action="accept">
                                            <i class="fas fa-check"></i> Accept
                                        </button>
                                        <button class="action-menu-item reject" data-action="reject">
                                            <i class="fas fa-times"></i> Reject
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
                } else {
                    return `
                        <tr data-row-data='${rowData}'>
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
                                    <button class="action-btn accept" onclick="showEmailModal('appointment', ${JSON.stringify(appointment).replace(/"/g, '&quot;')})">
                                        <i class="fas fa-check"></i> Accept
                                    </button>
                                    <button class="action-btn reject" onclick="showConfirmModal('Reject Appointment', 'Are you sure you want to reject this appointment?', null).then(confirmed => confirmed && rejectAppointment(${appointment.appointment_id}))">
                                        <i class="fas fa-times"></i> Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }
            }).join('');
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

// Handle rejecting an appointment
async function rejectAppointment(appointment_id) {
    try {
        const response = await fetch(`http://localhost:5700/api/delete_appointment/${appointment_id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlertModal('Success', 'Appointment rejected successfully!', null)
                .then(() => {
                    markAsRead('appointments');
                    getAppointments();
                });
        } else {
            throw new Error('Failed to delete appointment');
        }
    } catch (error) {
        console.error('Error rejecting appointment:', error);
        showAlertModal('Error', 'Failed to reject appointment. Please try again.', null);
    }
}

// ==================== QUESTIONS SECTION ====================

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
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="questionsTableBody">
                            <tr><td colspan="6" class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading questions...</p></td></tr>
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
        
        if (userQuestions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem;">
                        <i class="fas fa-comments" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                        <p>No questions from farmers</p>
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = userQuestions.map(question => {
                const rowData = JSON.stringify({
                    ...question,
                    question_id: question.id || Math.random() // Add ID if not present
                });
                const isMobile = window.innerWidth <= 768;
                const isEmail = question.emailorphone.includes('@');
                
                if (isMobile) {
                    return `
                        <tr data-row-data='${rowData}'>
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
                                <span class="status-badge pending">Pending</span>
                            </td>
                            <td>
                                <div class="action-dropdown">
                                    <button class="action-menu-toggle">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <div class="action-menu">
                                        ${isEmail ? `
                                            <button class="action-menu-item accept" data-action="reply">
                                                <i class="fas fa-reply"></i> Reply
                                            </button>
                                        ` : ''}
                                        <button class="action-menu-item reject" data-action="reject">
                                            <i class="fas fa-times"></i> Reject
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `;
                } else {
                    return `
                        <tr data-row-data='${rowData}'>
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
                                <span class="status-badge pending">Pending</span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    ${isEmail ? `
                                        <button class="action-btn accept" onclick="showEmailModal('question', ${JSON.stringify(question).replace(/"/g, '&quot;')})">
                                            <i class="fas fa-reply"></i> Reply
                                        </button>
                                    ` : ''}
                                    <button class="action-btn reject" onclick="showRejectQuestionModal('${question.id || Math.random()}', ${JSON.stringify(question).replace(/"/g, '&quot;')})">
                                        <i class="fas fa-times"></i> Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }
            }).join('');
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

// ==================== NEWS SECTION ====================

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

// ==================== RESOURCES SECTION ====================

async function showResourcesSection() {
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
                    <button class="btn-outline" onclick="showResourcesSection()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            </div>
        `;
    }
}

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

// ==================== NOTIFICATIONS SECTION ====================

function getNotifications() {
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
        
        showNotification('Notification marked as read');
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
    showNotification('All notifications marked as read');
}

// ==================== ACCOUNT SECTION ====================

function getAccount() {
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
}

// ==================== FORM INITIALIZATION ====================

// Initialize all form tracking
function initializeForms() {
    // Track form changes
    trackFormChanges('addNewsForm');
    trackFormChanges('addResourceForm');
    trackFormChanges('editAccountForm');
    trackFormChanges('changePasswordForm');
    trackFormChanges('emailForm');
    trackFormChanges('rejectQuestionForm');
    
    // Setup form submissions
    const addNewsForm = document.getElementById('addNewsForm');
    if (addNewsForm) {
        addNewsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                showAlertModal('Success', 'News/Event posted successfully!', 'addNewsModal')
                    .then(() => {
                        closeModal('addNewsModal');
                        if (activeSection === 'news') {
                            getNews();
                        }
                    });
            } catch (error) {
                showAlertModal('Error', 'Failed to post news/event. Please try again.', 'addNewsModal');
            }
        });
    }
    
    const addResourceForm = document.getElementById('addResourceForm');
    if (addResourceForm) {
        addResourceForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                showAlertModal('Success', 'Resource added successfully!', 'addResourceModal')
                    .then(() => {
                        closeModal('addResourceModal');
                        if (activeSection === 'resources') {
                            showResourcesSection();
                        }
                    });
            } catch (error) {
                showAlertModal('Error', 'Failed to add resource. Please try again.', 'addResourceModal');
            }
        });
    }
    
    const editAccountForm = document.getElementById('editAccountForm');
    if (editAccountForm) {
        editAccountForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                showAlertModal('Success', 'Account information updated successfully!', 'editAccountModal')
                    .then(() => {
                        closeModal('editAccountModal');
                        if (activeSection === 'account') {
                            getAccount();
                        }
                    });
            } catch (error) {
                showAlertModal('Error', 'Failed to update account. Please try again.', 'editAccountModal');
            }
        });
    }
    
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                showAlertModal('Success', 'Password changed successfully!', 'changePasswordModal')
                    .then(() => {
                        closeModal('changePasswordModal');
                    });
            } catch (error) {
                showAlertModal('Error', 'Failed to change password. Please try again.', 'changePasswordModal');
            }
        });
    }
    
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailSubmit);
    }
    
    const rejectQuestionForm = document.getElementById('rejectQuestionForm');
    if (rejectQuestionForm) {
        rejectQuestionForm.addEventListener('submit', handleRejectQuestion);
    }
    
    // Setup custom close handlers for modals
    const modals = ['addNewsModal', 'addResourceModal', 'editAccountModal', 'changePasswordModal', 'emailModal', 'rejectQuestionModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    const form = modal.querySelector('form');
                    if (form && formDirtyStates[form.id]) {
                        showConfirmModal('Unsaved Changes', 
                            'You have unsaved changes. Are you sure you want to close?',
                            modalId)
                            .then((confirmed) => {
                                if (confirmed) {
                                    resetForm(form);
                                    closeModal(modalId);
                                }
                            });
                    } else {
                        closeModal(modalId);
                    }
                });
            }
            
            // Handle cancel buttons
            const cancelBtn = modal.querySelector('.btn-secondary');
            if (cancelBtn && cancelBtn.textContent.includes('Cancel')) {
                cancelBtn.addEventListener('click', () => {
                    const form = modal.querySelector('form');
                    if (form && formDirtyStates[form.id]) {
                        showConfirmModal('Unsaved Changes', 
                            'You have unsaved changes. Are you sure you want to close?',
                            modalId)
                            .then((confirmed) => {
                                if (confirmed) {
                                    resetForm(form);
                                    closeModal(modalId);
                                }
                            });
                    } else {
                        closeModal(modalId);
                    }
                });
            }
        }
    });
    
    // Setup outside click for modals - preserve data
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            // Don't reset form when clicking outside
            e.target.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // Password strength checker
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
    
    // File upload handling
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
}

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

// ==================== NOTIFICATION SYSTEM ====================

// Notification system (for simple notifications, not modals)
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

// ==================== INITIALIZATION ====================

// Initialize the dashboard
function initDashboard() {
    updateCurrentDate();
    updateNotificationBadges();
    setupEmailEditor();
    setupAttachments();
    setupImagePreview();
    setupActionMenus();
    initializeForms();
    setupSidebarNavigation();
    
    // Set default active section
     dashboardOverview.click();
    
    // Add scroll indicator check on load
    setTimeout(checkScrollIndicator, 500);
}

// Start the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

// Handle window resize for responsive tables
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (activeSection === 'appointments') {
            getAppointments();
        } else if (activeSection === 'questions') {
            getQuestions();
        }
    }, 250);
});