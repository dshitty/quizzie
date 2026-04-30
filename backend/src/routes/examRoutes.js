const router = require('express').Router();
const {
  createExam, getAllExams, getExamById, updateExam,
  updateExamStatus, deleteExam, getAvailableExams, getExamForStudent,
} = require('../controllers/examController');
const { protect, adminOnly } = require('../middleware/Auth');

// Student routes
router.get('/available',    protect, getAvailableExams);
router.get('/:id/take',     protect, getExamForStudent);

// Admin only routes
router.post('/',            protect, adminOnly, createExam);
router.get('/',             protect, adminOnly, getAllExams);
router.get('/:id',          protect, adminOnly, getExamById);
router.put('/:id',          protect, adminOnly, updateExam);
router.patch('/:id/status', protect, adminOnly, updateExamStatus);
router.delete('/:id',       protect, adminOnly, deleteExam);

module.exports = router;