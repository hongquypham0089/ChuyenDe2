// Chart instances
let monthlyChart, yearlyChart, monthlyDetailChart, yearlyDetailChart;

// Initialize charts
function initCharts() {
    // Monthly Chart
    const monthlyCtx = document.getElementById('monthlyChart')?.getContext('2d');
    if (monthlyCtx) {
        monthlyChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: ['Thg 10', 'Thg 11', 'Thg 12', 'Thg 1', 'Thg 2', 'Thg 3'],
                datasets: [
                    {
                        label: 'CLB mới',
                        data: [3, 5, 2, 8, 6, 8],
                        borderColor: '#c53030',
                        tension: 0.4
                    },
                    {
                        label: 'Sự kiện',
                        data: [25, 30, 20, 45, 55, 60],
                        borderColor: '#2563eb',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Yearly Chart
    const yearlyCtx = document.getElementById('yearlyChart')?.getContext('2d');
    if (yearlyCtx) {
        yearlyChart = new Chart(yearlyCtx, {
            type: 'bar',
            data: {
                labels: ['2022', '2023', '2024', '2025', '2026'],
                datasets: [
                    {
                        label: 'Số CLB',
                        data: [25, 32, 38, 42, 48],
                        backgroundColor: '#c53030'
                    },
                    {
                        label: 'Số sự kiện',
                        data: [80, 120, 145, 160, 180],
                        backgroundColor: '#2563eb'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Monthly Detail Chart
    const monthlyDetailCtx = document.getElementById('monthlyDetailChart')?.getContext('2d');
    if (monthlyDetailCtx) {
        monthlyDetailChart = new Chart(monthlyDetailCtx, {
            type: 'line',
            data: {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                datasets: [{
                    label: 'Số sự kiện',
                    data: [45, 38, 52, 48, 55, 60, 58, 62, 48, 42, 38, 45],
                    borderColor: '#c53030',
                    tension: 0.4
                }]
            }
        });
    }

    // Yearly Detail Chart
    const yearlyDetailCtx = document.getElementById('yearlyDetailChart')?.getContext('2d');
    if (yearlyDetailCtx) {
        yearlyDetailChart = new Chart(yearlyDetailCtx, {
            type: 'bar',
            data: {
                labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
                datasets: [{
                    label: 'Số CLB',
                    data: [15, 22, 25, 32, 38, 42, 48],
                    backgroundColor: '#c53030'
                }]
            }
        });
    }
}

// Page navigation
function showPage(page) {
    // Hide all pages
    document.getElementById('dashboard-page').style.display = 'none';
    document.getElementById('users-page').style.display = 'none';
    document.getElementById('clubs-page').style.display = 'none';
    document.getElementById('events-page').style.display = 'none';
    document.getElementById('pending-page').style.display = 'none';
    document.getElementById('monthly-report-page').style.display = 'none';
    document.getElementById('yearly-report-page').style.display = 'none';

    // Show selected page
    document.getElementById(page + '-page').style.display = 'block';

    // Update active menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// Modal functions
function showAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

function showAddClubModal() {
    document.getElementById('addClubModal').classList.add('active');
}

function showAddEventModal() {
    alert('Mở form thêm sự kiện mới');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// CRUD operations
function viewUserDetail(name) {
    document.getElementById('detailUserName').textContent = name;
    document.getElementById('userDetailModal').classList.add('active');
}

function viewClubDetail(name) {
    alert('Xem chi tiết CLB: ' + name);
}

function editUser(name) {
    alert('Chỉnh sửa người dùng: ' + name);
}

function editClub(name) {
    alert('Chỉnh sửa CLB: ' + name);
}

function deleteUser(name) {
    if (confirm('Bạn có chắc muốn xóa người dùng ' + name + '?')) {
        alert('Đã xóa người dùng');
    }
}

function deleteClub(name) {
    if (confirm('Bạn có chắc muốn xóa CLB ' + name + '?')) {
        alert('Đã xóa CLB');
    }
}

function approveItem(name) {
    if (confirm('Duyệt ' + name + '?')) {
        alert('Đã duyệt thành công');
    }
}

function rejectItem(name) {
    if (confirm('Từ chối ' + name + '?')) {
        alert('Đã từ chối');
    }
}

function saveUser() {
    alert('Thêm người dùng thành công');
    closeModal('addUserModal');
}

function saveClub() {
    alert('Thêm CLB thành công');
    closeModal('addClubModal');
}

// Chart update functions
function updateMonthlyChart(period) {
    let data;
    if (period === '6months') {
        data = [3, 5, 2, 8, 6, 8];
    } else if (period === '12months') {
        data = [3, 5, 2, 8, 6, 8, 7, 9, 4, 6, 5, 7];
    } else {
        data = [3, 5, 2, 8, 6, 8, 7, 9, 4, 6, 5, 7, 4, 6, 3, 5, 7, 8, 5, 6, 4, 7, 5, 6];
    }
    
    monthlyChart.data.datasets[0].data = data;
    monthlyChart.update();
    
    // Update active button
    document.querySelectorAll('.chart-period .period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

function updateYearlyChart(year) {
    let data;
    if (year === '2026') {
        data = [48, 180];
    } else if (year === '2025') {
        data = [42, 160];
    } else {
        data = [38, 145];
    }
    
    yearlyChart.data.datasets[0].data = year === '2026' ? [48] : year === '2025' ? [42] : [38];
    yearlyChart.data.datasets[1].data = year === '2026' ? [180] : year === '2025' ? [160] : [145];
    yearlyChart.update();
    
    // Update active button
    document.querySelectorAll('.chart-period .period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

function showDatePicker() {
    alert('Chọn khoảng thời gian');
}

function exportReport() {
    alert('Đang xuất báo cáo...');
}

// Search functionality
document.getElementById('searchUser')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    // Implement search logic here
});

document.getElementById('filterRole')?.addEventListener('change', function(e) {
    const role = e.target.value;
    // Implement filter logic here
});

// Initialize
window.onload = function() {
    initCharts();
};