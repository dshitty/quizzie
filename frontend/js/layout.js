// =========================================
// ExamPulse — Shared Layout Builder
// =========================================

const LAYOUT = {
  studentSidebar: `
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-text">Exam<span>Pulse</span></div>
      </div>
      <div class="sidebar-user">
        <div class="user-name" id="sidebarUserName">Loading...</div>
        <div class="user-role" id="sidebarUserRole">Student</div>
      </div>
      <div class="sidebar-nav">
        <div class="nav-section-label">Navigation</div>
        <button class="nav-item" id="nav-dashboard" onclick="window.location.href='student-dashboard.html'">
          <span class="nav-icon">🏠</span> Dashboard
        </button>
        <button class="nav-item" id="nav-quiz" onclick="window.location.href='student-dashboard.html'">
          <span class="nav-icon">📝</span> Take Quiz
        </button>
        <button class="nav-item" id="nav-results" onclick="window.location.href='student-results.html'">
          <span class="nav-icon">📊</span> My Results
        </button>
      </div>
      <div class="sidebar-footer">
        <button class="btn-logout js-logout">
          <span>⎋</span> Sign Out
        </button>
      </div>
    </nav>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <header class="topbar">
      <button class="btn-menu" id="btnMenu">☰</button>
      <div class="logo-text">Exam<span>Pulse</span></div>
      <span style="font-size:0.82rem;color:var(--text-muted)" id="topbarUser"></span>
    </header>
  `,

  teacherSidebar: `
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-text">Exam<span>Pulse</span></div>
      </div>
      <div class="sidebar-user">
        <div class="user-name" id="sidebarUserName">Loading...</div>
        <div class="user-role" id="sidebarUserRole">Teacher</div>
      </div>
      <div class="sidebar-nav">
        <div class="nav-section-label">Navigation</div>
        <button class="nav-item" id="nav-dashboard" onclick="window.location.href='teacher-dashboard.html'">
          <span class="nav-icon">🏠</span> Dashboard
        </button>
        <button class="nav-item" id="nav-create" onclick="window.location.href='teacher-create-quiz.html'">
          <span class="nav-icon">➕</span> Create Quiz
        </button>
        <button class="nav-item" id="nav-quizzes" onclick="window.location.href='teacher-quizzes.html'">
          <span class="nav-icon">📚</span> All Quizzes
        </button>
        <button class="nav-item" id="nav-results" onclick="window.location.href='teacher-results.html'">
          <span class="nav-icon">📊</span> Student Results
        </button>
      </div>
      <div class="sidebar-footer">
        <button class="btn-logout js-logout">
          <span>⎋</span> Sign Out
        </button>
      </div>
    </nav>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <header class="topbar">
      <button class="btn-menu" id="btnMenu">☰</button>
      <div class="logo-text">Exam<span>Pulse</span></div>
      <span style="font-size:0.82rem;color:var(--text-muted)" id="topbarUser"></span>
    </header>
  `,
};