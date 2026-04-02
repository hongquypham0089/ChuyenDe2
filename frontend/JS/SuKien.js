// Variables
let currentView = 'grid';
let calendar = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initCalendar();
});

// Toggle view
function toggleView(view) {
    currentView = view;
    const gridView = document.getElementById('gridView');
    const calendarView = document.getElementById('calendarView');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => btn.classList.remove('active'));
    
    if (view === 'grid') {
        gridView.style.display = 'grid';
        calendarView.classList.remove('active');
        viewBtns[0].classList.add('active');
    } else {
        gridView.style.display = 'none';
        calendarView.classList.add('active');
        viewBtns[1].classList.add('active');
        if (calendar) {
            calendar.render();
        }
    }
}

// Initialize Calendar
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listMonth'
        },
        events: [
            {
                title: 'Workshop React',
                start: '2026-04-15T18:00:00',
                end: '2026-04-15T21:00:00',
                color: '#c53030'
            },
            {
                title: 'Đêm nhạc GACOUSTIC',
                start: '2026-04-20T19:00:00',
                end: '2026-04-20T22:00:00',
                color: '#fbbf24'
            },
            {
                title: 'Mùa hè xanh',
                start: '2026-04-25',
                end: '2026-04-30',
                color: '#10b981'
            },
            {
                title: 'AI Conference',
                start: '2026-05-10T08:00:00',
                end: '2026-05-10T17:00:00',
                color: '#c53030'
            }
        ],
        dateClick: function(info) {
            alert('Click vào ngày: ' + info.dateStr);
        },
        eventClick: function(info) {
            showEventDetail(info.event.title.toLowerCase().replace(/ /g, '-'));
        }
    });
}

// Filter events
function filterEvents(type) {
    const events = document.querySelectorAll('.event-card');
    const tabs = document.querySelectorAll('.filter-tab');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    events.forEach(event => {
        switch(type) {
            case 'all':
                event.style.display = 'block';
                break;
            case 'upcoming':
                event.style.display = event.dataset.status === 'upcoming' ? 'block' : 'none';
                break;
            case 'ongoing':
                event.style.display = event.dataset.status === 'ongoing' ? 'block' : 'none';
                break;
            case 'ended':
                event.style.display = event.dataset.status === 'ended' ? 'block' : 'none';
                break;
            case 'my-clubs':
                const myClubs = ['it', 'volunteer']; // CLB đã tham gia
                event.style.display = myClubs.includes(event.dataset.club) ? 'block' : 'none';
                break;
        }
    });
}

// Filter by date
function filterByDate() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const events = document.querySelectorAll('.event-card');
    
    if (!startDate && !endDate) return;
    
    events.forEach(event => {
        const eventDate = event.dataset.date;
        if (startDate && endDate) {
            event.style.display = (eventDate >= startDate && eventDate <= endDate) ? 'block' : 'none';
        } else if (startDate) {
            event.style.display = eventDate >= startDate ? 'block' : 'none';
        } else if (endDate) {
            event.style.display = eventDate <= endDate ? 'block' : 'none';
        }
    });
}

// Clear date filter
function clearDateFilter() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    filterEvents('all');
}

// Toggle register
function toggleRegister(btn) {
    if (btn.classList.contains('registered')) {
        if (confirm('Bạn có chắc muốn hủy tham gia sự kiện này?')) {
            btn.classList.remove('registered');
            btn.innerHTML = 'Tham gia';
            btn.style.background = '#c53030';
            
            // Cập nhật số lượng
            const countSpan = btn.closest('.event-card').querySelector('.registered-count span');
            const count = parseInt(countSpan.textContent);
            countSpan.textContent = count - 1 + '/100 đã đăng ký';
            
            // Xóa khỏi my events
            const eventTitle = btn.closest('.event-card').querySelector('.event-title').textContent;
            const myEventsList = document.getElementById('myEventsList');
            const myEvents = myEventsList.querySelectorAll('.my-event-item');
            myEvents.forEach(event => {
                if (event.querySelector('h4').textContent === eventTitle) {
                    event.remove();
                }
            });
        }
    } else {
        btn.classList.add('registered');
        btn.innerHTML = '<i class="fas fa-check"></i> Đã tham gia';
        btn.style.background = '#10b981';
        
        // Cập nhật số lượng
        const countSpan = btn.closest('.event-card').querySelector('.registered-count span');
        const count = parseInt(countSpan.textContent);
        countSpan.textContent = count + 1 + '/100 đã đăng ký';
        
        // Thêm vào my events
        addToMyEvents(btn.closest('.event-card'));
    }
}

// Add to my events
function addToMyEvents(eventCard) {
    const myEventsList = document.getElementById('myEventsList');
    const title = eventCard.querySelector('.event-title').textContent;
    const date = eventCard.querySelector('.event-detail-item:first-child span').textContent;
    const time = eventCard.querySelector('.event-detail-item:nth-child(2) span').textContent;
    const club = eventCard.querySelector('.event-club').textContent;
    
    const [day, month] = date.split('/');
    
    const eventItem = document.createElement('div');
    eventItem.className = 'my-event-item';
    eventItem.innerHTML = `
        <div class="my-event-date">
            <span class="day">${day}</span>
            <span class="month">TH${month}</span>
        </div>
        <div class="my-event-info">
            <h4>${title}</h4>
            <p><i class="fas fa-clock"></i> ${time} · ${club}</p>
        </div>
        <button class="btn-cancel-event" onclick="cancelMyEvent(this)">Hủy tham gia</button>
    `;
    
    myEventsList.appendChild(eventItem);
}

// Cancel my event
function cancelMyEvent(btn) {
    if (confirm('Bạn có chắc muốn hủy tham gia sự kiện này?')) {
        const eventItem = btn.closest('.my-event-item');
        const eventTitle = eventItem.querySelector('h4').textContent;
        
        // Cập nhật lại nút trong grid
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            const cardTitle = card.querySelector('.event-title').textContent;
            if (cardTitle === eventTitle) {
                const registerBtn = card.querySelector('.btn-register');
                registerBtn.classList.remove('registered');
                registerBtn.innerHTML = 'Tham gia';
                registerBtn.style.background = '#c53030';
                
                // Cập nhật số lượng
                const countSpan = card.querySelector('.registered-count span');
                const count = parseInt(countSpan.textContent);
                countSpan.textContent = count - 1 + '/100 đã đăng ký';
            }
        });
        
        eventItem.remove();
    }
}

// Show event detail
function showEventDetail(eventId) {
    const modal = document.getElementById('eventDetailModal');
    
    // Cập nhật thông tin dựa trên eventId
    switch(eventId) {
        case 'react-workshop':
            document.getElementById('detailEventTitle').textContent = 'Workshop: Lập trình Web với React';
            document.getElementById('detailEventClub').textContent = 'CLB Tin học';
            document.getElementById('detailEventName').textContent = 'Workshop: Lập trình Web với React - Từ A đến Z';
            document.getElementById('detailRegistered').textContent = '72';
            document.getElementById('detailCapacity').textContent = '100';
            document.getElementById('detailEventStatus').textContent = 'Sắp diễn ra';
            document.getElementById('detailDateTime').textContent = '18:00 - 21:00, 15/04/2026';
            document.getElementById('detailLocation').textContent = 'Phòng A101 - ĐH Bách Khoa';
            document.getElementById('detailDescription').textContent = 'Workshop thực hành thiết kế giao diện web với React. Giảng viên: Kỹ sư từ FPT Software với 5 năm kinh nghiệm. Nội dung bao gồm: React Hooks, State Management, Routing, và thực hành dự án mini.';
            
            const registerBtn = document.getElementById('detailRegisterBtn');
            registerBtn.innerHTML = '<i class="fas fa-check"></i> Đã tham gia';
            registerBtn.classList.add('registered');
            break;
            
        case 'music-night':
            document.getElementById('detailEventTitle').textContent = 'Đêm nhạc GACOUSTIC';
            document.getElementById('detailEventClub').textContent = 'CLB Âm nhạc';
            document.getElementById('detailEventName').textContent = 'Đêm nhạc GACOUSTIC - Giai điệu mùa hè';
            document.getElementById('detailRegistered').textContent = '156';
            document.getElementById('detailCapacity').textContent = '200';
            document.getElementById('detailEventStatus').textContent = 'Sắp diễn ra';
            document.getElementById('detailDateTime').textContent = '19:00 - 22:00, 20/04/2026';
            document.getElementById('detailLocation').textContent = 'Hội trường lớn - ĐH Xây dựng';
            document.getElementById('detailDescription').textContent = 'Đêm nhạc acoustic với sự tham gia của các ca sĩ khách mời và các tài năng âm nhạc từ CLB. Gây quỹ ủng hộ trẻ em vùng cao.';
            
            const musicBtn = document.getElementById('detailRegisterBtn');
            musicBtn.innerHTML = '<i class="fas fa-check"></i> Đã tham gia';
            musicBtn.classList.add('registered');
            break;
            
        default:
            const defaultBtn = document.getElementById('detailRegisterBtn');
            defaultBtn.innerHTML = '<i class="fas fa-user-plus"></i> Tham gia sự kiện';
            defaultBtn.classList.remove('registered');
    }
    
    modal.classList.add('active');
}

// Toggle register from detail
function toggleRegisterFromDetail() {
    const btn = document.getElementById('detailRegisterBtn');
    if (btn.classList.contains('registered')) {
        if (confirm('Bạn có chắc muốn hủy tham gia sự kiện này?')) {
            btn.classList.remove('registered');
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Tham gia sự kiện';
            btn.style.background = '#c53030';
        }
    } else {
        btn.classList.add('registered');
        btn.innerHTML = '<i class="fas fa-check"></i> Đã tham gia';
        btn.style.background = '#10b981';
    }
}

// Open create event modal
function openCreateEventModal() {
    document.getElementById('createEventModal').classList.add('active');
}

// Create event
function createEvent() {
    const name = document.getElementById('eventName').value;
    if (!name) {
        alert('Vui lòng nhập tên sự kiện!');
        return;
    }
    
    alert('Tạo sự kiện thành công! Sự kiện đang chờ admin duyệt.');
    closeModal('createEventModal');
    document.getElementById('createEventForm').reset();
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
