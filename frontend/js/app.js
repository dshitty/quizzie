// =========================================
// ExamPulse — App State & API Integration
// =========================================

const API_URL = window.location.origin + '/api';

const APP = {
  quizzes: [],
  results: [],

  async init() {
    // Load quizzes from backend
    try {
      const res = await fetch(`${API_URL}/quizzes`);
      if (res.ok) {
        const data = await res.json();
        this.quizzes = data.quizzes || [];
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }

    // Load user results if logged in
    if (this.currentUser) {
      await this.loadUserResults();
    }
  },

  async loadUserResults() {
    try {
      const res = await fetch(`${API_URL}/results/user/${this.currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        this.results = data.results || [];
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  },

  // ---- Session ----
  currentUser: null,
  currentQuiz: null,
  quizAnswers: {},
  quizStartTime: null,

  // ---- Helpers ----
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.ok) {
        this.currentUser = data.user;
        sessionStorage.setItem('ep_user', JSON.stringify(data.user));
        await this.loadUserResults();
        return data;
      }

      return { ok: false, error: data.error };
    } catch (error) {
      console.error('Login error:', error);
      return { ok: false, error: 'Network error. Please try again.' };
    }
  },

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('ep_user');
    window.location.href = '../index.html';
  },

  restoreSession() {
    const saved = sessionStorage.getItem('ep_user');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      this.loadUserResults();
      return true;
    }
    return false;
  },

  getActiveQuiz() {
    return this.quizzes.find(q => q.active) || null;
  },

  getUserResults(userId) {
    return this.results.filter(r => r.userId.toString() === userId.toString());
  },

  getAllResults() {
    return this.results.map(r => ({
      ...r,
      userName: r.userId?.name || 'Unknown',
      quizTitle: r.quizId?.title || 'Unknown',
      subject: r.quizId?.subject || 'Unknown',
    }));
  },

  async submitQuiz(quizId, answers) {
    try {
      const quiz = this.quizzes.find(q => q._id === quizId || q.id === quizId);
      if (!quiz) return null;

      let score = 0;
      const answerArr = [];

      quiz.questions.forEach((q, i) => {
        const chosen = answers[q._id || i] ?? -1;
        if (chosen === q.correct) score++;
        answerArr.push(chosen);
      });

      const response = await fetch(`${API_URL}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.currentUser.id,
          quizId: quiz._id || quizId,
          score,
          total: quiz.questions.length,
          answers: answerArr,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.results.push(data.result);
        return data.result;
      }

      return null;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return null;
    }
  },

  async createQuiz(data) {
    try {
      const response = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          subject: data.subject,
          duration: parseInt(data.duration) || 15,
          totalMarks: data.questions.length,
          questions: data.questions,
          createdBy: this.currentUser.id,
          active: data.active || false,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        this.quizzes.push(result.quiz);
        return result.quiz;
      }

      return null;
    } catch (error) {
      console.error('Error creating quiz:', error);
      return null;
    }
  },

  async setQuizActive(quizId) {
    try {
      for (let quiz of this.quizzes) {
        const actualId = quiz._id || quiz.id;
        const response = await fetch(`${API_URL}/quizzes/${actualId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...quiz,
            active: actualId === quizId,
          }),
        });
        if (response.ok) {
          const result = await response.json();
          const idx = this.quizzes.findIndex(q => (q._id || q.id) === actualId);
          if (idx !== -1) this.quizzes[idx] = result.quiz;
        }
      }
    } catch (error) {
      console.error('Error setting quiz active:', error);
    }
  },

  async deleteQuiz(quizId) {
    try {
      const actualId = typeof quizId === 'object' ? quizId._id || quizId.id : quizId;
      const response = await fetch(`${API_URL}/quizzes/${actualId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        this.quizzes = this.quizzes.filter(q => (q._id || q.id) !== actualId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      return false;
    }
  },

  formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      + ' at ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  },

  badgeClass(percent) {
    if (percent >= 80) return 'badge-success';
    if (percent >= 50) return 'badge-warning';
    return 'badge-danger';
  },

  verdict(percent) {
    if (percent === 100) return { cls: 'verdict-excellent', text: '🏆 Perfect Score!' };
    if (percent >= 80)   return { cls: 'verdict-excellent', text: '🎉 Excellent!' };
    if (percent >= 60)   return { cls: 'verdict-good',      text: '👍 Good Work!' };
    if (percent >= 40)   return { cls: 'verdict-average',   text: '📚 Keep Practicing' };
    return                      { cls: 'verdict-poor',      text: '💪 Needs Improvement' };
  },
};

// Auto restore session and initialize
async function initApp() {
  APP.restoreSession();
  await APP.init();
}

initApp();