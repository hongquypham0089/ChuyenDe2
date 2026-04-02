const express = require("express");
const router = express.Router();

// Trang chủ
router.get("/", (req, res) => {
    res.render("Home", { title: "Trang chủ - CLB" });
});

// Trang Câu lạc bộ
router.get("/clb", (req, res) => {
    res.render("clb", { title: "Danh sách Câu lạc bộ" });
});

// Đăng Nhập
router.get("/dangnhap", (req, res) => {
    res.render("dangnhap", { title: "Đăng Nhập" });
});

// Trang Diễn đàn
router.get("/DienDan", (req, res) => {
    res.render("DienDan", { title: "Diễn đàn" });
});

// Trang Câu lạc bộ
router.get("/clb", (req, res) => {
    res.render("CLB", { title: "Danh sách Câu lạc bộ" });
});

// Trang Sự kiện
router.get("/SuKien", (req, res) => {
    res.render("SuKien", { title: "Sự kiện sắp tới" });
});

// Trang Tin Tức
router.get("/TinTuc", (req, res) => {
    res.render("TinTuc", { title: "TinTuc" });
});

// Trang admin
router.get("/admin", (req, res) => {
    res.render("admin", { title: "Diễn đàn" });
});

module.exports = router;