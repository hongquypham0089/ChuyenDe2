-- Xóa database cũ nếu đã tồn tại (Cẩn thận mất dữ liệu cũ nhé!)
-- DROP DATABASE NentangCLB;
-- GO

CREATE DATABASE NentangCLB;
GO

USE NenTangCLB;
GO

-- =========================
-- 1. USERS
-- =========================
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_code VARCHAR(20) UNIQUE,
    full_name NVARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    avatar NVARCHAR(500) NULL, -- Cột mới
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- =========================
-- 2. ROLES
-- =========================
CREATE TABLE roles (
    id INT PRIMARY KEY IDENTITY(1,1),
    role_name VARCHAR(50)
);
GO

-- =========================
-- 3. USER ROLES
-- =========================
CREATE TABLE user_roles (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
GO

-- =========================
-- 4. CATEGORIES (Danh mục CLB)
-- =========================
CREATE TABLE categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    category_name NVARCHAR(100) NOT NULL
);
GO

-- =========================
-- 5. CLUBS
-- =========================
CREATE TABLE clubs (
    id INT PRIMARY KEY IDENTITY(1,1),
    club_name NVARCHAR(100),
    club_code VARCHAR(50) UNIQUE, -- Cột mới
    description NVARCHAR(MAX),
    logo NVARCHAR(500) NULL, -- Cột mới
    cover_image NVARCHAR(500) NULL, -- Cột mới
    status NVARCHAR(50) DEFAULT 'pending', -- Cột mới
    category_id INT, -- Khóa ngoại trỏ đến danh mục
    created_by INT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
GO

-- =========================
-- 6. CLUB STATS (Thống kê Xếp hạng)
-- =========================
CREATE TABLE club_stats (
    club_id INT PRIMARY KEY,
    total_score INT DEFAULT 0,
    current_rank INT,
    trend NVARCHAR(20) DEFAULT 'stable', -- 'up', 'down', 'stable'
    last_updated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);
GO

-- =========================
-- 7. CLUB MEMBERS
-- =========================
CREATE TABLE club_members (
    id INT PRIMARY KEY IDENTITY(1,1),
    club_id INT,
    user_id INT,
    role NVARCHAR(50), -- leader / member
    status NVARCHAR(50), -- active / pending
    joined_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (club_id) REFERENCES clubs(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- =========================
-- 8. JOIN REQUESTS
-- =========================
CREATE TABLE join_requests (
    id INT PRIMARY KEY IDENTITY(1,1),
    club_id INT,
    user_id INT,
    status NVARCHAR(50), -- pending / approved / rejected
    requested_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (club_id) REFERENCES clubs(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- =========================
-- 9. EVENTS
-- =========================
CREATE TABLE events (
    id INT PRIMARY KEY IDENTITY(1,1),
    club_id INT,
    event_name NVARCHAR(200),
    description NVARCHAR(MAX),
    location NVARCHAR(255),
    image NVARCHAR(500) NULL, -- Cột mới
    start_time DATETIME,
    end_time DATETIME,
    created_by INT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (club_id) REFERENCES clubs(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
GO

-- =========================
-- 10. EVENT REGISTRATIONS
-- =========================
CREATE TABLE event_registrations (
    id INT PRIMARY KEY IDENTITY(1,1),
    event_id INT,
    user_id INT,
    status NVARCHAR(50),
    registered_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- =========================
-- 11. POSTS
-- =========================
CREATE TABLE posts (
    id INT IDENTITY PRIMARY KEY,
    title NVARCHAR(255),
    content NVARCHAR(MAX),
    image NVARCHAR(500),
    likes INT DEFAULT 0,
    views INT DEFAULT 0,
    comments INT DEFAULT 0,
    type NVARCHAR(50),
    club_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);
GO

-- =========================
-- 12. SAVED POSTS (Lưu bài viết)
-- =========================
CREATE TABLE saved_posts (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    post_id INT,
    saved_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);
GO

-- =========================
-- 13. COMMENTS
-- =========================
CREATE TABLE comments (
    id INT PRIMARY KEY IDENTITY(1,1),
    post_id INT,
    user_id INT,
    content NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- =========================
-- 14. NOTIFICATIONS
-- =========================
CREATE TABLE notifications (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    content NVARCHAR(255),
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- =========================
-- 15. ACTIVITY LOGS
-- =========================
CREATE TABLE activity_logs (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    action NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO