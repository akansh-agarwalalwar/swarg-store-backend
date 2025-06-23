const express = require("express");
const router = express.Router();
const postedIDController = require("../controllers/postedIDController");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const upload = require("../config/upload")
// Middleware to allow admin or subadmin
function adminOrSubadminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || (decoded.role !== "admin" && decoded.role !== "subadmin")) {
      return res.status(401).json({ message: "Not authorized" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// // Multer storage config (same as in index.js)
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, '../uploads'));
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + '-' + file.originalname);
//   }
// });
// const upload = multer({ storage });

router.post(
  "/create",
  adminOrSubadminAuth,
  upload.fields([{ name: "image", maxCount: 10 }]),
  postedIDController.create
);
router.get("/", postedIDController.getAll);
router.get("/:id", postedIDController.getOne);
router.patch('/:id/status', adminOrSubadminAuth, postedIDController.updateStatus);
router.put('/:id', adminOrSubadminAuth, upload.fields([{ name: 'image', maxCount: 10 }, { name: 'video', maxCount: 5 }]), postedIDController.updateID);

module.exports = router;
