// middlewares/upload.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        // Lấy phần mở rộng, nếu không có thì mặc định là ".jpg"
        const ext = path.extname(file.originalname) || ".jpg";
        // Tạo tên file duy nhất
        const filename = Date.now() + ext;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
