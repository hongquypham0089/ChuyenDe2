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
// Giả sử đây là hàm tạo thẻ CLB của bạn
function createClubCard(club) {
    const card = document.createElement('div');
    card.className = 'club-card';
    // Khi click vào khung câu lạc bộ
    card.onclick = () => showClubDetail(club); 
    
    card.innerHTML = `
        <img src="${club.logo}" alt="${club.name}">
        <h3>${club.name}</h3>
        <p>${club.category}</p>
    `;
    return card;
}

function showClubDetail(club) {
    const modal = document.getElementById('clubModal');
    const modalBody = document.getElementById('modalBody');
    
    // Kiểm tra xem các phần tử có tồn tại không để tránh lỗi null
    const nameEl = document.getElementById('modalClubName');
    const categoryEl = document.getElementById('modalClubCategory');

    if (nameEl) nameEl.textContent = club.name; 
    if (categoryEl) categoryEl.textContent = club.category;

    // Render nội dung vào modal
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="modal-detail-content">
                <img src="${club.cover_url || 'https://via.placeholder.com/400x150?text=CLB+Connect'}" class="modal-detail-banner" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                
                <div class="modal-detail-section" style="margin-top: 20px;">
                    <h3 style="color: #c53030;"><i class="fas fa-info-circle"></i> Giới thiệu</h3>
                    <p style="line-height: 1.6; color: #4a5568;">${club.description || 'Chưa có mô tả chi tiết.'}</p>
                </div>

                ${club.achievements ? `
                <div class="modal-detail-section" style="margin-top: 15px;">
                    <h3 style="color: #c53030;"><i class="fas fa-trophy"></i> Thành tựu</h3>
                    <p>${club.achievements}</p>
                </div>` : ''}
            </div>
        `;
    }

    if (modal) modal.style.display = 'block'; 
}

function showClubDetail(id) {
    const club = clubsData.find(c => c.id === id);
    if (!club) return;

    const modal = document.getElementById('clubModal');
    const modalBody = document.getElementById('modalBody');
    const modalJoinBtn = document.getElementById('modalJoinBtn'); // Lấy nút bấm từ footer
    
    // 1. Cập nhật Tiêu đề và Category
    document.getElementById('modalClubName').textContent = club.name;
    document.getElementById('modalClubCategory').textContent = club.category;

    // 2. Render nội dung thân Modal
    modalBody.innerHTML = `
        <div class="modal-detail-content">
            <div class="detail-banner-wrapper" style="position: relative; margin-bottom: 50px;">
                <img src="${club.cover_url || 'default-cover.jpg'}" style="width: 100%; height: 220px; object-fit: cover; border-radius: 15px;">
                <div style="position: absolute; bottom: -40px; left: 30px; display: flex; align-items: flex-end; gap: 15px;">
                    <img src="${club.logo_url || 'default-logo.png'}" style="width: 100px; height: 100px; border-radius: 20px; border: 5px solid white; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div style="background: #f1f5f9; padding: 15px; border-radius: 12px; text-align: center;">
                    <i class="fas fa-users" style="color: #c53030;"></i>
                    <div style="font-weight: bold; font-size: 18px;">${club.memberCount || 0}</div>
                    <div style="font-size: 12px; color: #64748b;">Thành viên</div>
                </div>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 12px; text-align: center;">
                    <i class="fas fa-calendar-alt" style="color: #c53030;"></i>
                    <div style="font-weight: bold; font-size: 14px;">Thứ 7 hàng tuần</div>
                    <div style="font-size: 12px; color: #64748b;">Lịch sinh hoạt</div>
                </div>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 12px; text-align: center;">
                    <i class="fas fa-map-marker-alt" style="color: #c53030;"></i>
                    <div style="font-weight: bold; font-size: 14px;">Hội trường A</div>
                    <div style="font-size: 12px; color: #64748b;">Địa điểm</div>
                </div>
            </div>

            <div class="modal-detail-section">
                <h3 style="font-size: 18px; color: #1a2639; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                    <span style="width: 4px; height: 18px; background: #c53030; display: inline-block; border-radius: 2px;"></span>
                    Giới thiệu chung
                </h3>
                <p style="color: #4a5568; line-height: 1.7;">${club.description}</p>
            </div>

            <div class="modal-detail-section" style="margin-top: 20px;">
                <h3 style="font-size: 18px; color: #1a2639; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                    <span style="width: 4px; height: 18px; background: #c53030; display: inline-block; border-radius: 2px;"></span>
                    Quyền lợi thành viên
                </h3>
                <ul style="padding-left: 20px; color: #4a5568;">
                    <li>Được đào tạo kỹ năng chuyên môn miễn phí.</li>
                    <li>Cấp giấy chứng nhận hoạt động ngoại khóa.</li>
                    <li>Mở rộng mạng lưới kết nối bạn bè cùng đam mê.</li>
                </ul>
            </div>
        </div>
    `;

    // 3. LOGIC XỬ LÝ NÚT BẤM (QUAN TRỌNG)
    if (modalJoinBtn) {
        const currentUserId = currentUser ? Number(currentUser.id || currentUser.user_id) : null;
        const clubCreatorId = Number(club.created_by);

        if (currentUserId && clubCreatorId === currentUserId) {
            // Nếu là chủ CLB
            modalJoinBtn.innerHTML = `<i class="fas fa-crown"></i> Bạn là chủ CLB`;
            modalJoinBtn.style.background = "#28a745"; // Màu xanh lá
            modalJoinBtn.disabled = true;
            modalJoinBtn.onclick = null;
        } else {
            // Nếu là người dùng bình thường hoặc chưa tham gia
            modalJoinBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Tham gia CLB`;
            modalJoinBtn.style.background = "#c53030"; // Màu đỏ mặc định
            modalJoinBtn.disabled = false;
            modalJoinBtn.onclick = () => handleJoinClub(club.id);
        }
    }

    modal.style.display = 'flex'; 
}

// Đảm bảo hàm đóng modal hoạt động
function closeModal() {
    const modal = document.getElementById('clubModal');
    if (modal) modal.style.display = 'none';
}

// Hàm đóng modal đã có sẵn trong code của bạn
function closeModal() {
    document.getElementById('clubModal').style.display = 'none';
}

// 7. Event Listeners & Điều khiển Modal
function setupEventListeners() {
    document.getElementById('searchInput')?.addEventListener('input', renderClubs);
    document.getElementById('createClubForm')?.addEventListener('submit', handleCreateClub);
}

function showCreateClubModal() {
    if (!currentUser) return alert("Hãy đăng nhập trước!");
    document.getElementById('createClubModal').classList.add('active');
}

function closeCreateClubModal() {
    document.getElementById('createClubModal').classList.remove('active');
    document.getElementById('createClubForm')?.reset();
}

