// Variables
let currentFilter = 'all';
let mediaFile = null;

// Open create post modal
function openCreatePostModal(type = 'text') {
    document.getElementById('createPostModal').classList.add('active');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    resetPostForm();
}

// Reset post form
function resetPostForm() {
    document.getElementById('postContent').value = '';
    document.getElementById('mediaPreview').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('previewImage').style.display = 'none';
    document.getElementById('previewVideo').style.display = 'none';
    mediaFile = null;
}

// Preview media
function previewMedia(input) {
    if (input.files && input.files[0]) {
        mediaFile = input.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const preview = document.getElementById('mediaPreview');
            const uploadArea = document.getElementById('uploadArea');
            const previewImage = document.getElementById('previewImage');
            const previewVideo = document.getElementById('previewVideo');
            
            if (mediaFile.type.startsWith('image/')) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                previewVideo.style.display = 'none';
            } else if (mediaFile.type.startsWith('video/')) {
                previewVideo.querySelector('source').src = e.target.result;
                previewVideo.load();
                previewVideo.style.display = 'block';
                previewImage.style.display = 'none';
            }
            
            preview.style.display = 'block';
            uploadArea.style.display = 'none';
        }
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Remove media
function removeMedia() {
    document.getElementById('postMedia').value = '';
    document.getElementById('mediaPreview').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    mediaFile = null;
}

// Create post
function createPost() {
    const content = document.getElementById('postContent').value;
    
    if (!content && !mediaFile) {
        alert('Vui lòng nhập nội dung hoặc chọn media!');
        return;
    }

    // Tạo bài post mới
    const newsFeed = document.getElementById('newsFeed');
    const newPost = document.createElement('div');
    newPost.className = 'post-card';
    newPost.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">NA</div>
            <div class="post-info">
                <div class="post-author">
                    <span class="author-name">Nguyễn Văn A</span>
                    <span class="post-time">· Vừa xong</span>
                </div>
                <div class="post-privacy">
                    <i class="fas fa-globe"></i> Công khai
                </div>
            </div>
        </div>

        <div class="post-content">
            <div class="post-text">${content}</div>
            ${mediaFile ? `<div class="post-media"><img src="${URL.createObjectURL(mediaFile)}" alt="Post media"></div>` : ''}
        </div>

        <div class="post-stats">
            <div class="reactions">
                <span>0 lượt thích</span>
            </div>
            <div class="comments-shares">
                <span>0 bình luận</span>
                <span>0 chia sẻ</span>
            </div>
        </div>

        <div class="post-actions">
            <div class="post-action-btn" onclick="likePost(this)">
                <i class="far fa-thumbs-up"></i> Thích
            </div>
            <div class="post-action-btn" onclick="showComments(this)">
                <i class="far fa-comment"></i> Bình luận
            </div>
            <div class="post-action-btn" onclick="sharePost()">
                <i class="far fa-share-square"></i> Chia sẻ
            </div>
        </div>

        <div class="comments-section" style="display: none;">
            <div class="add-comment">
                <div class="comment-avatar">NA</div>
                <input type="text" class="comment-input" placeholder="Viết bình luận...">
                <button class="comment-submit" onclick="addComment(this)"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    newsFeed.insertBefore(newPost, newsFeed.firstChild);
    closeModal('createPostModal');
    alert('Đăng bài thành công!');
}

// Like post
function likePost(btn) {
    btn.classList.toggle('liked');
    const icon = btn.querySelector('i');
    
    if (btn.classList.contains('liked')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.innerHTML = '<i class="fas fa-thumbs-up"></i> Đã thích';
        
        // Cập nhật số lượt thích
        const stats = btn.closest('.post-card').querySelector('.post-stats .reactions span');
        const currentLikes = parseInt(stats.textContent);
        stats.textContent = (currentLikes + 1) + ' lượt thích';
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.innerHTML = '<i class="far fa-thumbs-up"></i> Thích';
        
        // Cập nhật số lượt thích
        const stats = btn.closest('.post-card').querySelector('.post-stats .reactions span');
        const currentLikes = parseInt(stats.textContent);
        stats.textContent = (currentLikes - 1) + ' lượt thích';
    }
}

// Show/hide comments
function showComments(btn) {
    const commentsSection = btn.closest('.post-card').querySelector('.comments-section');
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
    } else {
        commentsSection.style.display = 'none';
    }
}

// Add comment
function addComment(btn) {
    const input = btn.parentElement.querySelector('.comment-input');
    const commentText = input.value.trim();
    
    if (!commentText) return;
    
    const commentsSection = btn.closest('.comments-section');
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.innerHTML = `
        <div class="comment-avatar">NA</div>
        <div class="comment-content">
            <div class="comment-author">Nguyễn Văn A</div>
            <div class="comment-text">${commentText}</div>
            <div class="comment-actions">
                <span>Thích</span>
                <span>Phản hồi</span>
                <span>Vừa xong</span>
            </div>
        </div>
    `;
    
    commentsSection.insertBefore(newComment, btn.parentElement);
    input.value = '';
    
    // Cập nhật số bình luận
    const postCard = btn.closest('.post-card');
    const commentsCount = postCard.querySelector('.comments-shares span:first-child');
    const currentComments = parseInt(commentsCount.textContent);
    commentsCount.textContent = (currentComments + 1) + ' bình luận';
}

// Share post
function sharePost() {
    alert('Chia sẻ bài viết thành công!');
}

// Join club
function joinClub(btn) {
    btn.classList.remove('fa-plus-circle');
    btn.classList.add('fa-check-circle');
    btn.style.color = '#10b981';
    alert('Đã gửi yêu cầu tham gia CLB!');
}

// Filter feed
function filterFeed(type) {
    currentFilter = type;
    const tabs = document.querySelectorAll('.feed-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    const posts = document.querySelectorAll('.post-card');
    
    posts.forEach(post => {
        switch(type) {
            case 'all':
                post.style.display = 'block';
                break;
            case 'clubs':
                post.style.display = post.dataset.club ? 'block' : 'none';
                break;
            case 'trending':
                const popularity = parseInt(post.dataset.popularity || '0');
                post.style.display = popularity > 80 ? 'block' : 'none';
                break;
            case 'following':
                post.style.display = post.dataset.club === 'it' ? 'block' : 'none';
                break;
        }
    });
}

// Load more posts
function loadMorePosts() {
    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
    
    setTimeout(() => {
        alert('Đã hết bài viết!');
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> Xem thêm';
    }, 1500);
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
