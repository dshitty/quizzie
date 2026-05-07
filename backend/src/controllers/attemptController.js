const Attempt = require('../models/Attempt');
const Exam    = require('../models/Exam');

// POST /api/attempts/start/:examId  — Student starts an exam
exports.startAttempt = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    
    // Check if exam is open (active + between scheduled/expiration dates)
    const now = new Date();
    const isOpen = exam.status === 'active' && now >= exam.scheduledAt && now <= exam.expiresAt;
    if (!isOpen) return res.status(403).json({ success: false, message: 'Exam is not open' });

    // Check if student already started this exam
    const existing = await Attempt.findOne({ student: req.user._id, exam: exam._id });
    if (existing) {
      // Return the existing attempt so they can continue
      return res.status(200).json({ success: true, data: existing, message: 'Resuming existing attempt' });
    }

    const attempt = await Attempt.create({
      student:    req.user._id,
      exam:       exam._id,
      totalMarks: exam.totalMarks,
      startedAt:  new Date(),
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
};

// POST /api/attempts/submit/:examId  — Student submits answers + auto-grade
exports.submitAttempt = async (req, res, next) => {
  try {
    const { answers } = req.body;
    // answers = [{ questionId, selectedOption }]

    console.log('📝 Submit request:', { examId: req.params.examId, answersCount: answers?.length, answers });

    const attempt = await Attempt.findOne({ student: req.user._id, exam: req.params.examId });
    if (!attempt) return res.status(404).json({ success: false, message: 'No attempt found — start the exam first' });
    if (attempt.isSubmitted) return res.status(400).json({ success: false, message: 'Already submitted' });

    // Fetch the exam WITH correct answers for grading
    const exam = await Exam.findById(req.params.examId);

    // Prevent submission if exam already expired
    const now = new Date();
    if (exam.expiresAt && now > exam.expiresAt) {
      return res.status(403).json({ success: false, message: 'Cannot submit — the exam has expired' });
    }

    // Build a map of questionId → correctOption for fast lookup
    const correctMap = {};
    exam.questions.forEach(q => { correctMap[q._id.toString()] = { correct: q.correctOption, marks: q.marks }; });

    // Grade each answer
    let totalScore = 0;
    const gradedAnswers = answers.map(a => {
      const questionData = correctMap[a.questionId];
      if (!questionData) return { questionId: a.questionId, selectedOption: a.selectedOption, isCorrect: false, marksAwarded: 0 };
      const isCorrect    = a.selectedOption === questionData.correct;
      const marksAwarded = isCorrect ? questionData.marks : 0;
      totalScore        += marksAwarded;
      return { questionId: a.questionId, selectedOption: a.selectedOption || null, isCorrect, marksAwarded };
    });

    const submittedAt       = new Date();
    const timeTakenMinutes  = Math.round((submittedAt - attempt.startedAt) / 60000);
    const percentage        = Math.round((totalScore / exam.totalMarks) * 100);
    const isPassed          = totalScore >= exam.passingMarks;

    // Save everything with immediate auto-publish
    attempt.answers          = gradedAnswers;
    attempt.totalScore       = totalScore;
    attempt.totalMarks       = exam.totalMarks;
    attempt.percentage       = percentage;
    attempt.isPassed         = isPassed;
    attempt.submittedAt      = submittedAt;
    attempt.timeTakenMinutes = timeTakenMinutes;
    attempt.isSubmitted      = true;
    attempt.resultPublished  = true;  // Auto-publish immediately
    attempt.publishedAt      = submittedAt;

    console.log('💾 Saving attempt:', { totalScore, percentage, isPassed, gradedAnswers: gradedAnswers.length });

    try {
      await attempt.save();
      console.log('✅ Attempt saved successfully!');
    } catch (saveErr) {
      console.error('❌ Error saving attempt:', saveErr.message, saveErr.errors);
      return res.status(400).json({ success: false, message: `Validation error: ${saveErr.message}` });
    }

    res.status(200).json({
      success: true,
      message: 'Exam submitted successfully. Your result is now available!',
      data: {
        submitted:         true,
        timeTakenMinutes,
        totalQuestionsAnswered: answers.filter(a => a.selectedOption).length,
        totalScore,
        percentage,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/attempts/my  — Student sees their own attempts
exports.getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ student: req.user._id })
      .populate('exam', 'title subject totalMarks scheduledAt')
      .sort('-submittedAt');

    // Hide score/answers if result not published yet
    const safeAttempts = attempts.map(a => {
      const obj = a.toObject();
      if (!obj.resultPublished) {
        delete obj.answers;
        delete obj.totalScore;
        delete obj.percentage;
        delete obj.isPassed;
      }
      return obj;
    });

    res.status(200).json({ success: true, data: safeAttempts });
  } catch (err) {
    next(err);
  }
};

// GET /api/attempts/result/:id  — Student/Admin views result by attemptId (auto-published immediately after scoring)
exports.getMyResult = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('exam')
      .populate('student', 'name email studentId');

    if (!attempt) return res.status(404).json({ success: false, message: 'No attempt found' });
    
    // Verify the attempt belongs to the logged-in student OR user is admin viewing attempt
    const isOwner = attempt.student._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // For admin viewing unreleased results, allow viewing
    if (!attempt.resultPublished && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Result not available yet. Please submit your exam first.' });
    }

    res.status(200).json({ success: true, data: attempt });
  } catch (err) {
    next(err);
  }
};

// ─── ADMIN ───────────────────────────────────────────────────

// GET /api/attempts/exam/:examId  — Admin sees all attempts for an exam
exports.getAttemptsByExam = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ exam: req.params.examId, isSubmitted: true })
      .populate('student', 'name email studentId department')
      .sort('-submittedAt');
    res.status(200).json({ success: true, count: attempts.length, data: attempts });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/attempts/release/:attemptId  — Admin releases one student's result
exports.releaseResult = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });

    await Attempt.updateOne(
      { _id: attempt._id },
      {
        $set: {
          resultReleased: true,
          releasedAt: new Date(),
          releasedBy: req.user._id,
        },
      }
    );

    attempt.resultReleased = true;
    attempt.releasedAt = new Date();
    attempt.releasedBy = req.user._id;

    res.status(200).json({ success: true, message: 'Result released to student', data: attempt });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/attempts/release-all/:examId  — Admin releases ALL results for an exam at once
// PATCH /api/attempts/release-all           — Admin releases all pending results across exams
exports.releaseAllResults = async (req, res, next) => {
  try {
    const filter = req.params.examId
      ? { exam: req.params.examId, isSubmitted: true, resultReleased: false }
      : { isSubmitted: true, resultReleased: false };

    const result = await Attempt.updateMany(filter, {
      $set: {
        resultReleased: true,
        releasedAt: new Date(),
        releasedBy: req.user._id,
      },
    });

    const scopeMessage = req.params.examId ? 'exam' : 'all exams';
    res.status(200).json({
      success: true,
      message: `Released ${result.modifiedCount} results for ${scopeMessage}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/attempts/stats/:examId  — Admin analytics for an exam
exports.getExamStats = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ exam: req.params.examId, isSubmitted: true });
    if (!attempts.length) return res.status(200).json({ success: true, data: { message: 'No submissions yet' } });

    const scores      = attempts.map(a => a.totalScore);
    const passed      = attempts.filter(a => a.isPassed).length;
    const avgScore    = scores.reduce((s, v) => s + v, 0) / scores.length;
    const highest     = Math.max(...scores);
    const lowest      = Math.min(...scores);
    const passRate    = ((passed / attempts.length) * 100).toFixed(1);

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions: attempts.length,
        passed,
        failed:     attempts.length - passed,
        passRate:   `${passRate}%`,
        avgScore:   avgScore.toFixed(1),
        highest,
        lowest,
      },
    });
  } catch (err) {
    next(err);
  }
};