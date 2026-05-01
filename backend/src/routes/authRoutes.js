const router  = require('express').Router();
const { register, login, getMe, getStudentCount } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/Auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);
router.get('/students/count', protect, adminOnly, getStudentCount);

module.exports = router;