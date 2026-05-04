const User = require('../models/User');

// GET /api/users/students - Get all students
exports.getAllStudents = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    let filter = { role: 'student' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role === 'active') {
      filter.isActive = true;
    } else if (role === 'inactive') {
      filter.isActive = false;
    }

    const students = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: students.length, students });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/students/:id - Get single student
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id).select('-password');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, student });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/students - Create new student
exports.createStudent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        isActive: student.isActive,
        createdAt: student.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/students/:id - Update student
exports.updateStudent = async (req, res, next) => {
  try {
    const { name, email, isActive } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Update allowed fields only
    if (name) student.name = name;
    if (email) {
      // Check if new email is already taken
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      student.email = email;
    }
    if (typeof isActive === 'boolean') {
      student.isActive = isActive;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        isActive: student.isActive,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/students/:id - Delete student
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
