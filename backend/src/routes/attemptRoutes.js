const router  = require('express').Router();
const { 
  startAttempt, 
  submitAttempt, 
  getMyAttempts,
  getMyResult,
  getAttemptsByExam,
  releaseResult,
  releaseAllResults,
  getExamStats
} = require('../controllers/attemptController');
const { protect, adminOnly } = require('../middleware/Auth');

// Student routes
router.post('/start/:examId',           protect, startAttempt);
router.post('/submit/:examId',          protect, submitAttempt);
router.get('/my',                       protect, getMyAttempts);
router.get('/result/:examId',           protect, getMyResult);

// Admin routes - MUST BE BEFORE /:id routes to avoid conflict
router.get('/',                         protect, adminOnly, async (req, res, next) => {
  try {
    const Attempt = require('../models/Attempt');
    const attempts = await Attempt.find({ isSubmitted: true })
      .populate('student', 'name email')
      .populate('exam', 'title')
      .sort('-submittedAt');
    res.status(200).json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
});

router.get('/exam/:examId',             protect, adminOnly, getAttemptsByExam);
router.put('/:attemptId/release',       protect, adminOnly, releaseResult);
router.patch('/release-all/:examId',    protect, adminOnly, releaseAllResults);
router.get('/stats/:examId',            protect, adminOnly, getExamStats);

module.exports = router;