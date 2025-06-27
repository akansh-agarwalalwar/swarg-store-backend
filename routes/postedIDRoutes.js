
const express = require("express");
const router = express.Router();
const postedIDController = require("../controllers/postedIDController");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const upload = require("../config/upload")


function adminOrSubadminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  console.log(token)
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
router.post(
  "/create",
  adminOrSubadminAuth,
  upload.fields([{ name: "image", maxCount: 10 }]),
  postedIDController.create
);
router.get("/", postedIDController.getAll);

router.get("/:id", postedIDController.getOne);

router.patch('/:id/status', adminOrSubadminAuth, postedIDController.updateStatus);

router.put('/:id', adminOrSubadminAuth, 
  upload.fields([
    { name: 'image', maxCount: 10 }, 
    { name: 'video', maxCount: 5 }]),
    postedIDController.updateID
);

router.get("/my",adminOrSubadminAuth, postedIDController.getMyPostedIDs )

module.exports = router;

