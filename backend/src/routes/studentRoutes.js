const express = require("express");
const router = express.Router();

const {
  getStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent
} = require("../controllers/studentController");
const verifyToken = require("../middleware/authMiddleware");
// ✅ ROUTES
router.get("/students", getStudents);
router.post("/students", addStudent);
router.get("/students/:id", getStudentById);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

router.get("/students", verifyToken, getStudents);
router.post("/students", verifyToken, addStudent);
router.put("/students/:id", verifyToken, updateStudent);
router.delete("/students/:id", verifyToken, deleteStudent);

module.exports = router;