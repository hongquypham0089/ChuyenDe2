/* =============================================================
   PROFILE.JS - PHIÊN BẢN KẾT NỐI DATABASE 100%
   ============================================================= */

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?background=2563eb&color=fff&size=180&rounded=true&bold=true&name=User";

// State quản lý dữ liệu trang
let currentProfile = {}; 
let currentUser = null;
let isEditMode = false;
let newAvatarBase64 = null; 

// DOM elements
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const dobInput = document.getElementById('dob');
const bioTextarea = document.getElementById('bio');
const hobbiesInput = document.getElementById('hobbies');
const genderRadios = document.querySelectorAll('input[name="gender"]');
const clubContainer = document.getElementById('clubChecklist');
const avatarImg = document.getElementById('avatarImg');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const uploadControlDiv = document.getElementById('uploadControl');
const viewAvatarHint = document.getElementById('viewAvatarHint');
const avatarInput = document.getElementById('avatarInput');

/**
 * 1. KHỞI TẠO KHI TRANG LOAD
 */
document.addEventListener('DOMContentLoaded', async () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = "/login";
        return;
    }
    currentUser = JSON.parse(userStr);
    
    setupEventListeners();
    // CHỈ GỌI MỘT HÀM DUY NHẤT
    await loadFullData(); 
});

async function loadProfileFromServer() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = "/login";
        return;
    }
    
    const user = JSON.parse(userStr);
    const userId = user.id || user.user_id; 

    if (!userId) return;

    // --- PHẦN 1: LẤY THÔNG TIN CÁ NHÂN (Bắt buộc) ---
    try {
        const profileRes = await fetch(`/api/user/profile/${userId}`);
        if (!profileRes.ok) throw new Error("Không lấy được Profile");

        const data = await profileRes.json();
        currentProfile = { ...data, id: userId }; 
        renderFormData();
    } catch (error) {
        console.error("Lỗi Profile:", error);
        showToast("Không thể tải thông tin cá nhân!", false);
        return; // Dừng luôn nếu không lấy được thông tin chính
    }

    // --- PHẦN 2: LẤY DANH SÁCH CLB (Tùy chọn) ---
    try {
        const clubsRes = await fetch(`/api/user/clubs/${userId}`);
        if (clubsRes.ok) {
            const joinedClubs = await clubsRes.json();
            renderJoinedClubs(joinedClubs); 
        }
    } catch (clubErr) {
        // Nếu lỗi ở đây, ta chỉ log ra console, không làm phiền người dùng bằng Toast
        console.warn("Lưu ý: Không tải được danh sách CLB (có thể do lỗi SQL cột 'name')");
    }
}
// Hàm render CLB từ database (Thay cho cái set cứng cũ)
function renderRealClubs(clubs) {
    const clubContainer = document.getElementById('clubChecklist');
    if (!clubContainer) return;

    if (clubs.length === 0) {
        clubContainer.innerHTML = '<p style="font-size:0.9rem; color:#64748b;">Chưa tham gia CLB nào.</p>';
        return;
    }

    clubContainer.innerHTML = clubs.map(club => `
        <div class="club-tag" style="background: #eef2ff; color: #4338ca; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; display: inline-block; margin: 4px; border: 1px solid #e0e7ff;">
            <i class="fas fa-users"></i> ${club.name}
        </div>
    `).join('');
}

/**
 * 2. LẤY TOÀN BỘ DỮ LIỆU TỪ DATABASE
 */
async function loadFullData() {
    const userId = currentUser.id || currentUser.user_id;

    try {
        // Lấy thông tin cá nhân và danh sách CLB song song để tối ưu tốc độ
        const [profileRes, clubsRes] = await Promise.all([
            fetch(`/api/user/profile/${userId}`),
            fetch(`/api/user/clubs/${userId}`)
        ]);

        const profileData = await profileRes.json();
        const joinedClubs = await clubsRes.json();

        if (profileRes.ok) {
            currentProfile = {
                id: userId,
                fullName: profileData.full_name || "",
                email: profileData.email || "",
                phone: profileData.phone || "",
                dob: profileData.dob ? profileData.dob.split('T')[0] : "", 
                gender: profileData.gender || "Nam",
                bio: profileData.bio || "",
                hobbies: profileData.hobbies || "",
                avatar: profileData.avatar || DEFAULT_AVATAR
            };
            
            renderProfileToForm();
            renderJoinedClubsUI(joinedClubs);
        }
    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        showToast("Không thể kết nối đến máy chủ", false);
    }
}

/**
 * 3. HIỂN THỊ DỮ LIỆU CÁ NHÂN
 */
function renderProfileToForm() {
    fullNameInput.value = currentProfile.fullName;
    emailInput.value = currentProfile.email;
    phoneInput.value = currentProfile.phone;
    dobInput.value = currentProfile.dob;
    bioTextarea.value = currentProfile.bio;
    hobbiesInput.value = currentProfile.hobbies;
    avatarImg.src = currentProfile.avatar;

    genderRadios.forEach(radio => {
        radio.checked = (radio.value === currentProfile.gender);
    });
}

/**
 * 4. HIỂN THỊ DANH SÁCH CLB THỰC TẾ (Lấy từ DB)
 */
function renderJoinedClubsUI(clubs) {
    if (!clubContainer) return;

    if (!clubs || clubs.length === 0) {
        clubContainer.innerHTML = '<p style="color: #64748b; font-size: 0.9rem;">Bạn chưa tham gia câu lạc bộ nào.</p>';
        return;
    }

    // Hiển thị dưới dạng Tag nhãn (không dùng checkbox vì CLB phải đăng ký mới được vào)
    clubContainer.innerHTML = clubs.map(club => `
        <div class="club-tag" style="background: #eef2ff; color: #4338ca; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; border: 1px solid #e0e7ff; display: inline-block; margin: 4px;">
            <i class="fas fa-users" style="margin-right: 6px;"></i> ${club.name}
        </div>
    `).join('');
}

/**
 * 5. XỬ LÝ LƯU THÔNG TIN (Update Database)
 */
async function handleSaveProfile() {
    const userId = currentUser.id || currentUser.user_id;

    let genderValue = "Nam";
    genderRadios.forEach(radio => { if (radio.checked) genderValue = radio.value; });

    const updatedData = {
        id: userId,
        full_name: fullNameInput.value.trim(),
        phone: phoneInput.value.trim(),
        dob: dobInput.value,
        gender: genderValue,
        bio: bioTextarea.value.trim(),
        hobbies: hobbiesInput.value.trim(),
        avatar: newAvatarBase64 || currentProfile.avatar
    };

    try {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast("Đã cập nhật thông tin thành công! ✅");
            
            // Cập nhật State và localStorage để đồng bộ Header
            currentProfile = { ...currentProfile, ...updatedData, fullName: updatedData.full_name };
            currentUser.name = updatedData.full_name;
            currentUser.avatar = updatedData.avatar;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            disableEditMode();
            // Nếu có đổi ảnh, cập nhật lại ảnh trên header (nếu có hàm global)
            if(window.renderAuthSection) window.renderAuthSection(); 
        } else {
            showToast(result.message || "Lỗi khi cập nhật", false);
        }
    } catch (error) {
        console.error("Lỗi Save:", error);
        showToast("Lỗi kết nối mạng", false);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu thay đổi';
    }
}

// Hàm lấy dữ liệu thật từ DB
async function loadJoinedClubs() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userId = user?.id || user?.user_id;
    if (!userId) return;

    const clubContainer = document.getElementById('clubChecklist');

    try {
        const response = await fetch(`/api/user/clubs/${userId}`);
        const clubs = await response.json();

        if (clubs.length === 0) {
            clubContainer.innerHTML = '<p class="hint">Bạn chưa tham gia CLB nào.</p>';
            return;
        }

        // Đổ dữ liệu vào giao diện dưới dạng tag
        clubContainer.innerHTML = clubs.map(club => `
            <div class="club-tag" style="
                background: ${club.role === 'Owner' ? '#fef2f2' : '#eff6ff'}; 
                color: ${club.role === 'Owner' ? '#991b1b' : '#1e40af'};
                border: 1px solid ${club.role === 'Owner' ? '#fecaca' : '#bfdbfe'};
                padding: 5px 12px; border-radius: 20px; display: inline-block; margin: 4px; font-size: 0.85rem;">
                <i class="fas ${club.role === 'Owner' ? 'fa-crown' : 'fa-users'}"></i> ${club.name}
            </div>
        `).join('');
    } catch (error) {
        console.error("Lỗi:", error);
    }
}

/**
 * 6. ĐIỀU KHIỂN GIAO DIỆN (UI)
 */
function enableEditMode() {
    isEditMode = true;
    [fullNameInput, phoneInput, dobInput, bioTextarea, hobbiesInput].forEach(el => el.disabled = false);
    genderRadios.forEach(r => r.disabled = false);
    
    uploadControlDiv.style.display = 'block';
    viewAvatarHint.style.display = 'none';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-flex';
    cancelBtn.style.display = 'inline-flex';
}

function disableEditMode() {
    isEditMode = false;
    [fullNameInput, emailInput, phoneInput, dobInput, bioTextarea, hobbiesInput].forEach(el => el.disabled = true);
    genderRadios.forEach(r => r.disabled = true);

    uploadControlDiv.style.display = 'none';
    viewAvatarHint.style.display = 'block';
    editBtn.style.display = 'inline-flex';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    
    newAvatarBase64 = null;
    renderProfileToForm();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.size > 2 * 1024 * 1024) return showToast("Ảnh không được quá 2MB", false);
    if (!file.type.startsWith('image/')) return showToast("Vui lòng chọn file ảnh", false);

    const reader = new FileReader();
    reader.onload = (e) => {
        newAvatarBase64 = e.target.result;
        avatarImg.src = newAvatarBase64;
        showToast("Đã chọn ảnh mới", true);
    };
    reader.readAsDataURL(file);
}

function showToast(message, isSuccess = true) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.style.cssText = `position:fixed; bottom:20px; right:20px; background:${isSuccess?'#28a745':'#dc3545'}; color:white; padding:12px 24px; border-radius:8px; z-index:9999; box-shadow:0 4px 12px rgba(0,0,0,0.15); font-family: sans-serif;`;
    toast.innerHTML = `<i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = '0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function setupEventListeners() {
    editBtn.addEventListener('click', enableEditMode);
    saveBtn.addEventListener('click', handleSaveProfile);
    cancelBtn.addEventListener('click', disableEditMode);
    avatarInput.addEventListener('change', handleAvatarUpload);
}