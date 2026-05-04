const router = require('express').Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/Auth');

// All routes protected - admin only
router.use(protect, adminOnly);

// GET all students with optional filtering
router.get('/students', getAllStudents);

// POST create new student
router.post('/students', createStudent);

// GET single student by ID
router.get('/students/:id', getStudentById);

// PATCH update student
router.patch('/students/:id', updateStudent);

// DELETE student
router.delete('/students/:id', deleteStudent);

module.exports = router;
