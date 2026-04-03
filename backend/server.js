const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const sql = require("mssql");
const path = require("path");
const jwt = require("jsonwebtoken"); // <--- Thêm thư viện JWT ở đây

const app = express();

// ================= CONFIG EJS & STATIC FILES =================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend")); 
app.use(express.static(path.join(__dirname, "../frontend")));

app.use(cors({ origin: "*" }));
// Cho phép nhận dữ liệu JSON lên đến 50MB (thoải mái cho ảnh Base64)
app.use(express.json({ limit: '50mb' })); // Cho phép nhận tối đa 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// ================= CONFIG SQL SERVER =================
const config = {
    user: "sa",
    password: "123",
    // Đối với SQL Express, dùng 'localhost\\SQLEXPRESS' hoặc '127.0.0.1\\SQLEXPRESS'
    server: "localhost", 
    database: "NentangCLB",
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

let pool;
// Khóa bí mật dùng để tạo JWT
const JWT_SECRET = "CLB_CONNECT_SECRET_KEY_2026"; 

// ================= CONNECT DB =================
async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log("✅ Connected SQL Server (SQLEXPRESS)");
    } catch (err) {
        console.error("❌ DB Error: ", err.message);
        console.log("👉 Mẹo: Hãy chắc chắn bạn đã Restart SQL Service và bật TCP/IP port 1433.");
    }
}

connectDB();

// ================= UTILS =================
function generateUserCode() {
    return "SV" + Date.now();
}

// ================= MIDDLEWARE CHECK DB =================
function ensureDB(req, res, next) {
    if (!pool) {
        return res.status(500).json({ message: "Database not ready" });
    }
    next();
}

// ================= VIEW ROUTES (Giao diện) =================
// Đảm bảo bạn có file ./routes/viewRoutes.js, nếu không thì tạm thời comment 2 dòng này lại
const viewRoutes = require("./routes/viewRoutes");
app.use("/", viewRoutes); 

// ================= AUTH API (ĐĂNG KÝ / ĐĂNG NHẬP) =================

// 1. API Đăng ký
app.post("/api/register", ensureDB, async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Thiếu thông tin" });
    }
    
    try {
        // Kiểm tra xem email đã tồn tại chưa
        const check = await pool.request()
            .input("email", sql.VarChar, email)
            .query("SELECT id FROM users WHERE email = @email");

        if (check.recordset.length > 0) {
            return res.status(400).json({ message: "Email đã tồn tại trong hệ thống" });
        }
        
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Lưu vào database
        await pool.request()
            .input("code", sql.VarChar, generateUserCode())
            .input("name", sql.NVarChar, name)
            .input("email", sql.VarChar, email)
            .input("password", sql.VarChar, hashedPassword)
            .query(`
                INSERT INTO users (user_code, full_name, email, password)
                VALUES (@code, @name, @email, @password)
            `);
            
        res.json({ message: "Đăng ký thành công" });
    } catch (err) {
        console.error("Lỗi đăng ký:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 2. API Đăng nhập
app.post("/api/login", ensureDB, async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });

    try {
        // 1. Tìm user và join với bảng roles để lấy role_name
        const result = await pool.request()
            .input("email", sql.VarChar, email) 
            .query(`
                SELECT u.*, r.role_name 
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.email = @email
            `);
            
        const user = result.recordset[0];
        if (!user) return res.status(404).json({ message: "Email không tồn tại!" });

        // 2. Kiểm tra mật khẩu
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Mật khẩu không chính xác!" });

        // 3. Tạo Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role_name },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        // 4. Trả kết quả (gửi kèm role_name)
        res.json({
            message: "Đăng nhập thành công!",
            token: token,
            user_id: user.id,
            user_code: user.user_code,
            name: user.full_name,
            avatar: user.avatar || null,
            role: user.role_name || 'student' // Mặc định là student nếu không có role
        });

    } catch (err) {
        console.error("Lỗi API Đăng nhập:", err);
        res.status(500).json({ message: "Lỗi máy chủ!" });
    }
});

// ================= CLUBS API =================

// 1. API Tạo câu lạc bộ mới
app.post("/api/clubs", ensureDB, async (req, res) => {
    const { club_name, category_name, description, created_by, logo_url, cover_url } = req.body;

    if (!club_name || !category_name || !created_by) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    try {
        const normalizedCatName = category_name.trim();
        const club_code = "CLB" + Date.now();

        // 1. Tìm hoặc tạo Category (Giữ nguyên logic của bạn)
        let catResult = await pool.request()
            .input("catName", sql.NVarChar, normalizedCatName)
            .query("SELECT id FROM categories WHERE LTRIM(RTRIM(category_name)) = @catName");

        let categoryId;
        if (catResult.recordset.length > 0) {
            categoryId = catResult.recordset[0].id;
        } else {
            let newCat = await pool.request()
                .input("catName", sql.NVarChar, normalizedCatName)
                .query("INSERT INTO categories (category_name) OUTPUT INSERTED.id VALUES (@catName)");
            categoryId = newCat.recordset[0].id;
        }

        // 2. Insert vào bảng clubs (Bổ sung logo_url và cover_url)
        await pool.request()
            .input("name", sql.NVarChar, club_name)
            .input("code", sql.VarChar, club_code)
            .input("desc", sql.NVarChar, description || "")
            .input("catId", sql.Int, categoryId) 
            .input("userId", sql.Int, created_by)
            .input("logo", sql.NVarChar, logo_url || "")
            .input("cover", sql.NVarChar, cover_url || "")
            .query(`
                INSERT INTO clubs (club_name, club_code, description, category_id, created_by, logo_url, cover_url)
                VALUES (@name, @code, @desc, @catId, @userId, @logo, @cover)
            `);

        res.json({ message: "Tạo câu lạc bộ thành công!" });
    } catch (err) {
        console.error("Lỗi tạo CLB:", err);
        res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
});

// 2. API Lấy danh sách CLB (Giữ nguyên - Đã tốt)
app.get("/api/clubs", ensureDB, async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT c.id, c.club_name, c.club_code, c.description, c.created_at,
                   c.created_by, -- QUAN TRỌNG: Phải có cột này để so sánh ID
                   u.full_name AS creator,
                   cat.category_name,
                   c.logo_url, 
                   c.cover_url,
                   (SELECT COUNT(*) FROM club_members cm WHERE cm.club_id = c.id) AS member_count
            FROM clubs c 
            LEFT JOIN users u ON c.created_by = u.id
            LEFT JOIN categories cat ON c.category_id = cat.id
            ORDER BY c.created_at DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi load CLB:", err);
        res.status(500).send(err.message);
    }
});

// 3. API Tham gia CLB (Bổ sung để nút "Tham gia" ở Frontend hoạt động)
app.post("/api/clubs/join", ensureDB, async (req, res) => {
    const { club_id, user_id } = req.body;
    try {
        // Kiểm tra xem đã tham gia chưa
        const check = await pool.request()
            .input("c", sql.Int, club_id)
            .input("u", sql.Int, user_id)
            .query("SELECT * FROM club_members WHERE club_id = @c AND user_id = @u");

        if (check.recordset.length > 0) {
            return res.status(400).json({ message: " bạn đã tham gia CLB này rồi!" });
        }

        await pool.request()
            .input("c", sql.Int, club_id)
            .input("u", sql.Int, user_id)
            .query("INSERT INTO club_members (club_id, user_id, status) VALUES (@c, @u, 'active')");
        
        res.json({ message: "Tham gia câu lạc bộ thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi tham gia" });
    }
});


// ================= EVENTS API =================
app.get("/api/events", ensureDB, async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT e.id, e.event_name, e.description, e.location, e.start_time, e.end_time, c.club_name
            FROM events e JOIN clubs c ON e.club_id = c.id
            ORDER BY e.start_time ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ================= POSTS API =================
app.get("/api/posts", ensureDB, async (req, res) => {
    const club = req.query.club;
    try {
        const request = pool.request();
        let query = `
            SELECT p.id, p.title, p.content, p.image, p.likes, p.views, p.comments, p.type, p.created_at,
                   c.id AS club_id, c.club_name, c.club_code
            FROM posts p LEFT JOIN clubs c ON p.club_id = c.id
        `;
        if (club && club !== "all") {
            query += ` WHERE c.club_code = @club`;
            request.input("club", sql.VarChar, club);
        }
        query += ` ORDER BY p.created_at DESC`;
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: "Lỗi load posts" });
    }
});

// ================= LIKE/VIEW/SAVE API =================
app.post("/api/posts/like/:id", ensureDB, async (req, res) => {
    try {
        await pool.request().input("id", sql.Int, req.params.id).query(`UPDATE posts SET likes = likes + 1 WHERE id = @id`);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Like error" }); }
});

app.post("/api/posts/view/:id", ensureDB, async (req, res) => {
    try {
        await pool.request().input("id", sql.Int, req.params.id).query(`UPDATE posts SET views = views + 1 WHERE id = @id`);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "View error" }); }
});

app.post("/api/posts/save", ensureDB, async (req, res) => {
    const { user_id, post_id } = req.body;
    try {
        const check = await pool.request().input("user_id", sql.Int, user_id).input("post_id", sql.Int, post_id)
            .query(`SELECT id FROM saved_posts WHERE user_id = @user_id AND post_id = @post_id`);
        if (check.recordset.length > 0) return res.json({ message: "Đã lưu trước đó" });
        await pool.request().input("user_id", sql.Int, user_id).input("post_id", sql.Int, post_id)
            .query(`INSERT INTO saved_posts (user_id, post_id) VALUES (@user_id, @post_id)`);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: "Save error" }); }
});


// profile
// 1. API Lấy thông tin chi tiết user
app.get("/api/user/profile/:id", ensureDB, async (req, res) => {
    try {
        const result = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`
                SELECT id, full_name, email, phone, dob, gender, bio, avatar, hobbies 
                FROM users 
                WHERE id = @id
            `);
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server khi lấy profile" });
    }
});

// 2. API Cập nhật thông tin user
app.post("/api/user/update", ensureDB, async (req, res) => {
    const { id, full_name, phone, dob, gender, bio, avatar, hobbies } = req.body;
    try {
        await pool.request()
            .input("id", sql.Int, id)
            .input("full_name", sql.NVarChar, full_name)
            .input("phone", sql.VarChar, phone)
            .input("dob", sql.Date, dob)
            .input("gender", sql.NVarChar, gender)
            .input("bio", sql.NVarChar, bio)
            .input("hobbies", sql.NVarChar, hobbies)
            .input("avatar", sql.NVarChar, avatar) // Lưu Base64
            .query(`
                UPDATE users 
                SET full_name = @full_name, 
                    phone = @phone, 
                    dob = @dob, 
                    gender = @gender, 
                    bio = @bio, 
                    avatar = @avatar,
                    hobbies = @hobbies
                WHERE id = @id
            `);
        res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi lưu vào Database" });
    }
});

// 3. Sửa lại route render trang Profile để không bị lỗi "user is not defined"
app.get("/profile", (req, res) => {
    res.render("Profile", { user: {} }); // Truyền object rỗng, JS sẽ fetch data sau
});

// API lấy danh sách CLB của một User cụ thể
app.get("/api/user/clubs/:userId", async (req, res) => {
    try {
        const result = await pool.request()
            .input("userId", sql.Int, req.params.userId)
            .query(`
                -- Sửa 'name' thành 'club_name' để khớp với database của bạn
                SELECT id, club_name as name FROM clubs WHERE created_by = @userId
                UNION
                SELECT c.id, c.club_name as name 
                FROM clubs c
                JOIN club_members cm ON c.id = cm.club_id
                WHERE cm.user_id = @userId AND cm.status = N'Active'
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi API Clubs:", err);
        res.status(500).json({ message: "Lỗi lấy danh sách CLB" });
    }
});

// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running: http://localhost:${PORT}`);
});