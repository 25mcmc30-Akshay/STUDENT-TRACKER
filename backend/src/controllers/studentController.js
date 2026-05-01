const db = require("../config/db");

// ✅ GET ALL
const getStudents = (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// ✅ ADD
const addStudent = (req, res) => {
  const { name, age, course, marks } = req.body;

  const sql = "INSERT INTO students (name, age, course, marks) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, age, course, marks], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Student added", id: result.insertId });
  });
};

// ✅ GET BY ID
const getStudentById = (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM students WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(result[0]);
  });
};

// ✅ UPDATE
const updateStudent = (req, res) => {
  const id = req.params.id;
  const { name, age, course, marks } = req.body;

  const sql = "UPDATE students SET name=?, age=?, course=?, marks=? WHERE id=?";

  db.query(sql, [name, age, course, marks, id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student updated" });
  });
};

// ✅ DELETE
const deleteStudent = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM students WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted" });
  });
};

// ✅ EXPORT ALL
module.exports = {
  getStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent
};