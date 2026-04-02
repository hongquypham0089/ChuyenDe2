
// Lọc bài đăng theo CLB
function filterByClub(club) {
    const posts = document.querySelectorAll('.feed-post');
    const chips = document.querySelectorAll('.filter-chip');
    
    chips.forEach(chip => chip.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    posts.forEach(post => {
        if (club === 'all' || post.dataset.club === club) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

// Xử lý click trên các chip filter
document.querySelectorAll('.filter-chip').forEach((chip, index) => {
    chip.addEventListener('click', function() {
        const clubs = ['all', 'it', 'music', 'volunteer', 'sport', 'english', 'robot', 'art'];
        filterByClub(clubs[index]);
    });
});

// Xử lý nút xem thêm
document.querySelector('.btn-load').addEventListener('click', function() {
    const button = this;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
    
    setTimeout(() => {
        alert('Đã hết bài viết!');
        button.innerHTML = '<i class="fas fa-sync-alt"></i> Xem thêm bài viết';
    }, 1500);
});

// Xử lý like bài viết
document.querySelectorAll('.post-stats span:nth-child(2)').forEach(likeBtn => {
    likeBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#c53030';
            
            // Tăng số lượt thích
            const count = this.innerText.match(/\d+/)[0];
            this.innerHTML = `<i class="fas fa-heart" style="color: #c53030;"></i> ${parseInt(count) + 1} thích`;
        }
    });
});

// Xử lý lưu bài viết
document.querySelectorAll('.post-stats span:last-child').forEach(saveBtn => {
    saveBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#c53030';
            this.innerHTML = '<i class="fas fa-bookmark" style="color: #c53030;"></i> Đã lưu';
        }
    });
});

// Animation cho user avatar
document.querySelector('.user-avatar').addEventListener('click', function() {
    alert('Mở menu người dùng');
});

// Social icons hover effect
document.querySelectorAll('.header-top-right i').forEach(icon => {
    icon.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    icon.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Smooth scroll cho footer links
document.querySelectorAll('.footer-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Điều hướng đến: ' + this.textContent.trim());
    });
});

// Newsletter form
document.querySelector('.newsletter-input button').addEventListener('click', function() {
    const input = document.querySelector('.newsletter-input input');
    if (input.value.trim()) {
        alert('Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi email thông báo sớm nhất.');
        input.value = '';
    } else {
        alert('Vui lòng nhập email của bạn!');
    }
});
