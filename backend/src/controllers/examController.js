const Exam = require('../models/Exam');

// ─── ADMIN ───────────────────────────────────────────────────

// POST /api/exams  — Create exam
exports.createExam = async (req, res, next) => {
  try {
    const { scheduledAt, expiresAt, durationMinutes } = req.body;

    if (scheduledAt && expiresAt && durationMinutes) {
      const start = new Date(scheduledAt);
      const end = new Date(expiresAt);
      const windowMinutes = Math.round((end - start) / 60000);
      if (windowMinutes <= 0) {
        return res.status(400).json({ success: false, message: 'expiresAt must be after scheduledAt' });
      }
      if (durationMinutes > windowMinutes) {
        return res.status(400).json({ success: false, message: `Duration (${durationMinutes}m) cannot exceed scheduled window (${windowMinutes}m)` });
      }
    }

    const exam = await Exam.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

// GET /api/exams  — Admin sees all exams
exports.getAllExams = async (req, res, next) => {
  try {
    const exams = await Exam.find().select('-questions.correctOption') // don't leak answers
      .sort('-createdAt');
    res.status(200).json({ success: true, count: exams.length, data: exams });
  } catch (err) {
    next(err);
  }
};

// GET /api/exams/:id  — Admin sees one exam with full detail
exports.getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

// PUT /api/exams/:id  — Update exam (only if still draft)
exports.updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (exam.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Can only edit exams in draft status' });
    }
    // Validate duration does not exceed scheduled window when dates/duration are changed
    const newScheduled = req.body.scheduledAt ? new Date(req.body.scheduledAt) : exam.scheduledAt;
    const newExpires = req.body.expiresAt ? new Date(req.body.expiresAt) : exam.expiresAt;
    const newDuration = req.body.durationMinutes !== undefined ? req.body.durationMinutes : exam.durationMinutes;

    if (newScheduled && newExpires && newDuration !== undefined) {
      const windowMinutes = Math.round((newExpires - newScheduled) / 60000);
      if (windowMinutes <= 0) {
        return res.status(400).json({ success: false, message: 'expiresAt must be after scheduledAt' });
      }
      if (newDuration > windowMinutes) {
        return res.status(400).json({ success: false, message: `Duration (${newDuration}m) cannot exceed scheduled window (${windowMinutes}m)` });
      }
    }

    const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/exams/:id/status  — Change exam status (draft→scheduled→active→closed)
exports.updateExamStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const exam = await Exam.findByIdAndUpdate(
      req.params.id, { status }, { new: true, runValidators: true }
    );
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/exams/:id
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (exam.status === 'active') {
      return res.status(400).json({ success: false, message: 'Cannot delete a published exam. Unpublish it first.' });
    }
    await exam.deleteOne();
    res.status(200).json({ success: true, message: 'Exam deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── STUDENT ─────────────────────────────────────────────────

// GET /api/exams/available  — Student sees only open exams, WITHOUT correct answers
exports.getAvailableExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({
      status: 'active',
    }).select('-questions.correctOption'); // NEVER send correct answers to student
    res.status(200).json({ success: true, count: exams.length, data: exams });
  } catch (err) {
    next(err);
  }
};

// GET /api/exams/:id/take  — Get exam to take (no correct answers)
exports.getExamForStudent = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).select('-questions.correctOption');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    
    // Check if exam is open
    const now = new Date();
    if (exam.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Exam is not published yet' });
    }
    if (now < exam.scheduledAt) {
      return res.status(403).json({ success: false, message: `Exam will start on ${exam.scheduledAt.toLocaleDateString()} at ${exam.scheduledAt.toLocaleTimeString()}` });
    }
    if (now > exam.expiresAt) {
      return res.status(403).json({ success: false, message: 'This exam has expired and is no longer available' });
    }
    
    res.status(200).json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
};