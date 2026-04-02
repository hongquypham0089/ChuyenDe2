const API_BASE = 'http://localhost:5000/api';
let currentUser = null;
let currentPage = 1;
let currentFilter = 'all';
let isLoading = false;

// ================= UTILITY FUNCTIONS =================
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// ================= AUTH UI =================
function renderAuthSection() {
    const authSection = document.getElementById('authSection');
    if (currentUser) {
        authSection.innerHTML = `
            <div class="user-info" id="userInfo">
                <span id="userGreeting">Xin chào, <strong>${currentUser.full_name}</strong></span>
                <div class="user-avatar" id="userAvatar">${currentUser.full_name.charAt(0).toUpperCase()}</div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-item" id="viewProfile">
                        <i class="fas fa-user-circle"></i> Thông tin cá nhân
                    </div>
                    <div class="dropdown-item" id="myClubs">
                        <i class="fas fa-users"></i> CLB của tôi
                    </div>
                    <div class="dropdown-item" id="myEvents">
                        <i class="fas fa-calendar-alt"></i> Sự kiện đã đăng ký
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Đăng xuất
                    </div>
                </div>
            </div>
        `;
        setupUserDropdown();
        updateHeroForLoggedIn();
    } else {
        authSection.innerHTML = `
            <div class="auth-buttons">
                <a href="/login" class="btn-login">
                    <i class="fas fa-sign-in-alt"></i> Đăng nhập
                </a>
                <a href="/login?tab=register" class="btn-register">
                    <i class="fas fa-user-plus"></i> Đăng ký
                </a>
            </div>
        `;
        updateHeroForGuest();
    }
}

function updateHeroForLoggedIn() {
    document.getElementById('heroTitle').innerHTML = `Chào mừng ${currentUser.full_name.split(' ').pop()}! 👋`;
    document.getElementById('heroSubtitle').innerHTML = 'Khám phá những hoạt động sôi nổi nhất từ các câu lạc bộ bạn tham gia và những điều thú vị đang chờ đón.';
}

function updateHeroForGuest() {
    document.getElementById('heroTitle').innerHTML = 'Chào mừng đến với CLB Connect! 🎉';
    document.getElementById('heroSubtitle').innerHTML = 'Khám phá những hoạt động sôi nổi nhất từ các câu lạc bộ sinh viên. Kết nối đam mê, phát triển bản thân!';
}

function setupUserDropdown() {
    const userInfo = document.getElementById('userInfo');
    const dropdown = document.getElementById('userDropdown');
    
    if (userInfo) {
        userInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
    }
    
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('viewProfile')?.addEventListener('click', () => {
        alert('Thông tin cá nhân:\n' + JSON.stringify(currentUser, null, 2));
    });
    document.getElementById('myClubs')?.addEventListener('click', () => navigateTo('/my-clubs'));
    document.getElementById('myEvents')?.addEventListener('click', () => navigateTo('/my-events'));
    
    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
}

// ================= AUTH FUNCTIONS =================
function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            currentUser = JSON.parse(userStr);
        } catch (e) {
            currentUser = null;
        }
    }
    renderAuthSection();
    
    // Nếu đã đăng nhập, load thêm dữ liệu cá nhân
    if (currentUser) {
        loadMyClubs();
    }
}

async function logout() {
    if (currentUser) {
        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.id })
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    localStorage.removeItem('user');
    currentUser = null;
    renderAuthSection();
    showAlert('Đã đăng xuất thành công!', 'success');
}

// ================= LOAD DATA =================
async function loadMyClubs() {
    if (!currentUser) return;
    
    try {
        const res = await fetch(`${API_BASE}/users/${currentUser.id}/clubs`);
        const data = await res.json();
        if (data.success && data.clubs && data.clubs.length > 0) {
            const myClubsDiv = document.getElementById('myClubsList');
            myClubsDiv.innerHTML = data.clubs.map(club => `
                <span class="filter-chip my-club" onclick="filterByClub('${club.club_name}')">
                    <i class="fas fa-check-circle"></i> ${club.club_name}
                </span>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading my clubs:', error);
    }
}

// ================= POSTS FUNCTIONS =================
function loadDemoPosts() {
    const demoPosts = [
        {
            club_avatar: 'IT',
            club_name: 'CLB Tin học',
            created_at: new Date(),
            type: 'news',
            title: 'Lộ trình học AI toàn diện từ A đến Z năm 2026',
            content: 'Bạn muốn tìm hiểu về Trí tuệ nhân tạo nhưng không biết bắt đầu từ đâu? CLB Tin học tổng hợp lộ trình học AI chi tiết từ cơ bản đến nâng cao, kèm tài liệu và dự án thực tế.',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
            views: 234,
            likes: 45,
            comments: 12
        },
        {
            club_avatar: 'TN',
            club_name: 'CLB Tình nguyện',
            created_at: new Date(Date.now() - 3600000),
            type: 'event',
            title: 'Chiến dịch "Mùa hè xanh" 2026 - Vì biển đảo quê hương',
            content: 'Hành trình tình nguyện 7 ngày tại huyện đảo. Tham gia dạy học, tặng quà và bảo vệ môi trường biển. Đăng ký ngay!',
            image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600',
            event_details: { date: '25-30/04/2026', location: 'Huyện đảo' },
            views: 456,
            likes: 89,
            comments: 23
        },
        {
            club_avatar: 'AN',
            club_name: 'CLB Âm nhạc',
            created_at: new Date(Date.now() - 7200000),
            type: 'event',
            title: 'Đêm nhạc GACOUSTIC mùa 6 - "Giai điệu mùa hè"',
            content: 'Đêm nhạc acoustic với sự tham gia của các ca sĩ khách mời nổi tiếng và các tài năng âm nhạc từ CLB.',
            image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',
            event_details: { date: '20/04/2026', location: 'Hội trường lớn' },
            views: 789,
            likes: 156,
            comments: 45
        },
        {
            club_avatar: 'TA',
            club_name: 'CLB Tiếng Anh',
            created_at: new Date(Date.now() - 14400000),
            type: 'news',
            title: 'English Speaking Club - Chủ đề: "Technology & Future"',
            content: 'Buổi sinh hoạt hàng tuần với chủ đề công nghệ. Cơ hội thực hành tiếng Anh với người nước ngoài.',
            views: 120,
            likes: 45,
            comments: 12
        }
    ];
    
    renderPosts(demoPosts);
}

function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (currentPage === 1) {
        container.innerHTML = '';
    }
    
    posts.forEach(post => {
        const postHtml = `
            <div class="feed-post" data-club="${post.club_name}">
                <div class="post-header">
                    <div class="club-avatar">${post.club_avatar}</div>
                    <div class="post-info">
                        <div class="post-club">${post.club_name}</div>
                        <div class="post-time"><i class="far fa-clock"></i> ${formatDate(post.created_at)}</div>
                    </div>
                    <span class="post-badge ${post.type}">${post.type === 'event' ? '🎉 Sự kiện' : post.type === 'news' ? '📰 Tin tức' : '🚀 Dự án'}</span>
                </div>
                <h2 class="post-title">${post.title}</h2>
                <div class="post-content">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</div>
                ${post.image ? `<div class="post-media"><img src="${post.image}" alt="Post image"></div>` : ''}
                ${post.event_details ? `
                    <div class="post-details">
                        <span><i class="fas fa-calendar-alt"></i> ${post.event_details.date}</span>
                        <span><i class="fas fa-map-marker-alt"></i> ${post.event_details.location}</span>
                    </div>
                ` : ''}
                <div class="post-stats">
                    <span><i class="far fa-eye"></i> ${post.views} lượt xem</span>
                    <span onclick="handleLike(${post.id || Math.random()})"><i class="far fa-heart"></i> ${post.likes} thích</span>
                    <span onclick="handleComment()"><i class="far fa-comment"></i> ${post.comments} bình luận</span>
                    <span onclick="handleSave()"><i class="far fa-bookmark"></i> Lưu</span>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', postHtml);
    });
}

// ================= FILTER FUNCTIONS =================
function filterByClub(clubName) {
    currentFilter = clubName;
    currentPage = 1;
    
    // Update active filter chip
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.textContent === clubName || (clubName === 'all' && chip.textContent === 'Tất cả CLB')) {
            chip.classList.add('active');
        }
    });
    
    // Filter posts
    const posts = document.querySelectorAll('.feed-post');
    posts.forEach(post => {
        const postClub = post.getAttribute('data-club');
        if (clubName === 'all' || postClub === clubName) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

function loadMorePosts() {
    // Demo: chỉ thông báo
    showAlert('Đã hết bài viết!', 'info');
}

// ================= INTERACTION FUNCTIONS =================
function handleLike(postId) {
    if (!currentUser) {
        showAlert('Vui lòng đăng nhập để thích bài viết!', 'info');
        return;
    }
    showAlert('Đã thích bài viết!', 'success');
}

function handleComment() {
    if (!currentUser) {
        showAlert('Vui lòng đăng nhập để bình luận!', 'info');
        return;
    }
    alert('Tính năng bình luận đang phát triển!');
}

function handleSave() {
    if (!currentUser) {
        showAlert('Vui lòng đăng nhập để lưu bài viết!', 'info');
        return;
    }
    showAlert('Đã lưu bài viết!', 'success');
}

function navigateTo(path) {
    if (path !== '/' && path !== '/login' && !currentUser) {
        window.location.href = '/login';
    } else {
        window.location.href = path;
    }
}

// ================= INIT =================
function init() {
    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('vi-VN', options);
    
    // Check auth and render UI
    checkAuth();
    
    // Load demo posts
    loadDemoPosts();
}

// Start the app
init();
