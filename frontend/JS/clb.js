/* =============================================================
   CLB.JS - PHIÊN BẢN CẬP NHẬT LOGO & COVER
   ============================================================= */

let clubsData = []; 
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();      
    fetchClubs();     
    setupEventListeners(); 
});

// 1. Kiểm tra đăng nhập
function checkAuth() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            currentUser = JSON.parse(userStr);
        } catch (e) { currentUser = null; }
    }
    renderAuthSection();
}

// 2. Hiển thị thông tin User trên Header
function renderAuthSection() {
    const authSection = document.getElementById('authSection');
    if (!authSection) return;
    if (currentUser && (currentUser.isLoggedIn || currentUser.id)) {
        authSection.innerHTML = `
            <div class="user-info" id="userInfo" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <span>Xin chào, <strong>${currentUser.name}</strong></span>
                <div class="user-avatar" style="width: 35px; height: 35px; background: #c53030; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${currentUser.name.charAt(0).toUpperCase()}
                </div>
            </div>`;
    }
}

// 3. Lấy danh sách CLB từ API
async function fetchClubs() {
    try {
        const response = await fetch('/api/clubs');
        const data = await response.json();
        
        // File: clb.js - Hàm fetchClubs()
        clubsData = data.map(c => ({
            id: c.id,
            name: c.club_name,
            category: c.category_name || "Chung", 
            description: c.description || "Chưa có mô tả.",
            creatorName: c.creator || "Ban quản trị",
            logo_url: c.logo_url || '', 
            cover_url: c.cover_url || '',
            created_by: c.created_by 
        }));

        renderCategoryFilters(); 
        renderClubs();
    } catch (error) {
        console.error("Lỗi tải CLB:", error);
    }
}

// 4. Tạo bộ lọc danh mục động
function renderCategoryFilters() {
    const filterContainer = document.getElementById('categoryFilter');
    if (!filterContainer) return;

    const categories = [...new Set(clubsData.map(c => c.category))];

    let html = `<div class="category-chip active" data-category="all">Tất cả</div>`;
    categories.forEach(cat => {
        html += `<div class="category-chip" data-category="${cat}">${cat}</div>`;
    });

    filterContainer.innerHTML = html;

    filterContainer.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            filterContainer.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            renderClubs();
        });
    });
}

// 5. Hiển thị danh sách CLB ra giao diện (SỬA ĐỔI PHẦN HIỂN THỊ ẢNH)
function renderClubs() {
    const grid = document.getElementById('clubsGrid');
    if (!grid) return;

    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || "";
    const activeChip = document.querySelector('.category-chip.active');
    const selectedCategory = activeChip ? activeChip.getAttribute('data-category') : "all";

    let list = clubsData.filter(club => {
        const matchSearch = club.name.toLowerCase().includes(searchTerm) || 
                            club.description.toLowerCase().includes(searchTerm);
        const matchCategory = (selectedCategory === "all" || club.category === selectedCategory);
        return matchSearch && matchCategory;
    });

    if (list.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 20px;">Không tìm thấy câu lạc bộ nào.</p>`;
        return;
    }

    grid.innerHTML = list.map(club => {
        const coverImg = club.cover_url || 'https://via.placeholder.com/400x150?text=CLB+Connect';
        const logoImg = club.logo_url || 'https://via.placeholder.com/80?text=LOGO';

        // --- LOGIC XỬ LÝ NÚT BẤM ---
        let actionBtn = '';
        
        // Ép kiểu ID về Number để so sánh chính xác 
        const currentUserId = currentUser ? Number(currentUser.id || currentUser.user_id) : null;
        const clubCreatorId = Number(club.created_by);

        if (currentUserId && clubCreatorId === currentUserId) {
            // Nếu là chủ CLB: Đổi màu xanh lá, không cho click 
            actionBtn = `<button class="btn-join" style="background: #28a745; cursor: default;" onclick="event.stopPropagation()">
                            <i class="fas fa-check-circle"></i> Đã tham gia (Chủ CLB)
                         </button>`;
        } 
        else {
            // Nếu là người khác: Hiển thị nút Tham gia và gọi hàm handleJoinClub 
            actionBtn = `<button class="btn-join" onclick="event.stopPropagation(); handleJoinClub(${club.id})">
                            Tham gia
                         </button>`;
        }
        // -----------------------------

        return `
        <div class="club-card" onclick="showClubDetail(${club.id})">
            <div class="club-cover" style="background-image: url('${coverImg}'); background-size: cover; background-position: center; height: 120px; position: relative;">
                <img src="${logoImg}" class="club-logo-img" 
                    style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid white; position: absolute; bottom: -30px; left: 20px; background: white; object-fit: cover;"
                    onerror="this.src='https://via.placeholder.com/80?text=LOGO'">
            </div>
            <div class="club-info" style="padding-top: 35px;">
                <div class="club-category-tag">${club.category}</div>
                <div class="club-name">${club.name}</div>
                <p class="club-description">${club.description}</p>
                <div class="club-footer">
                    <span><i class="fas fa-user-tie"></i> ${club.creatorName}</span>
                    ${actionBtn} 
                </div>
            </div>
        </div>`;
    }).join('');
}

async function handleJoinClub(clubId) {
    if (!currentUser) return alert("Vui lòng đăng nhập để tham gia!");
    
    try {
        const response = await fetch('/api/clubs/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                club_id: clubId,
                user_id: currentUser.id || currentUser.user_id
            })
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            location.reload(); // Load lại để cập nhật trạng thái nút
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Lỗi khi tham gia CLB:", error);
    }
}


function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// 6. Xử lý gửi Form tạo CLB mới (Cập nhật Logo & Cover)
async function handleCreateClub(event) {
    event.preventDefault();
    if (!currentUser) return alert("Vui lòng đăng nhập!");

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    try {
        const logoFile = document.getElementById('clubLogo').files[0];
        const coverFile = document.getElementById('clubCover').files[0];

        // Chuyển đổi sang Base64 nếu có file
        const logoBase64 = logoFile ? await toBase64(logoFile) : '';
        const coverBase64 = coverFile ? await toBase64(coverFile) : '';

        const clubData = {
            club_name: document.getElementById('clubName').value,
            category_name: document.getElementById('clubCategory').value,
            description: document.getElementById('clubDescription').value,
            logo_url: logoBase64, 
            cover_url: coverBase64,
            created_by: currentUser.id || currentUser.user_id
        };

        const response = await fetch('/api/clubs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clubData)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Tạo câu lạc bộ thành công!");
            location.reload(); 
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        console.error("Lỗi khi xử lý ảnh:", error);
        alert("Không thể xử lý ảnh. Vui lòng thử lại với ảnh khác.");
    }
}


// 7. Event Listeners & Điều khiển Modal
function setupEventListeners() {
    document.getElementById('searchInput')?.addEventListener('input', renderClubs);
    document.getElementById('createClubForm')?.addEventListener('submit', handleCreateClub);
}

function showCreateClubModal() {
    if(!currentUser) return alert("Hãy đăng nhập trước!");
    document.getElementById('createClubModal').classList.add('active');
}

function closeCreateClubModal() {
    document.getElementById('createClubModal').classList.remove('active');
    document.getElementById('createClubForm').reset();
}

function showClubDetail(id) {
    // Hàm hiển thị chi tiết (bạn có thể viết thêm logic mở modal chi tiết tại đây)
    console.log("Xem chi tiết CLB ID:", id);
}