// =========================================
// ExamPulse — Shared UI Utilities
// =========================================

const UI = {
  // Sidebar toggle (mobile)
  initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const btnMenu = document.getElementById('btnMenu');
    if (!sidebar) return;
    const open  = () => { sidebar.classList.add('open'); overlay?.classList.add('open'); };
    const close = () => { sidebar.classList.remove('open'); overlay?.classList.remove('open'); };
    btnMenu?.addEventListener('click', open);
    overlay?.addEventListener('click', close);
    // nav items close sidebar on mobile
    sidebar.querySelectorAll('.nav-item').forEach(el => el.addEventListener('click', () => {
      if (window.innerWidth < 900) close();
    }));
  },

  // Populate sidebar user info
  initUserInfo() {
    if (!APP.currentUser) return;
    const nameEl = document.getElementById('sidebarUserName');
    const roleEl = document.getElementById('sidebarUserRole');
    if (nameEl) nameEl.textContent = APP.currentUser.name;
    if (roleEl) roleEl.textContent = APP.currentUser.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student';

    // topbar user label
    const tbUser = document.getElementById('topbarUser');
    if (tbUser) tbUser.textContent = APP.currentUser.name;
  },

  // Logout button
  initLogout() {
    document.querySelectorAll('.js-logout').forEach(el =>
      el.addEventListener('click', () => APP.logout())
    );
  },

  // Auth guard — redirect if not logged in or wrong role
  requireAuth(role) {
    if (!APP.currentUser) {
      window.location.href = '../index.html'; return false;
    }
    if (role && APP.currentUser.role !== role) {
      window.location.href = '../index.html'; return false;
    }
    return true;
  },

  // Show toast notification
  toast(msg, type = 'success') {
    let t = document.getElementById('epToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'epToast';
      t.style.cssText = `
        position:fixed;bottom:24px;right:24px;z-index:9999;
        background:var(--bg-card);border:1px solid var(--border);
        color:var(--text-primary);padding:12px 20px;border-radius:var(--radius-md);
        font-size:0.88rem;font-weight:500;box-shadow:var(--shadow-card);
        transform:translateY(80px);opacity:0;transition:all 0.3s ease;
        max-width:320px;font-family:var(--font-main);
      `;
      document.body.appendChild(t);
    }
    const accent = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--accent)';
    t.style.borderLeftColor = accent;
    t.style.borderLeftWidth = '3px';
    t.textContent = msg;
    requestAnimationFrame(() => { t.style.transform = 'translateY(0)'; t.style.opacity = '1'; });
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.transform = 'translateY(80px)'; t.style.opacity = '0'; }, 3000);
  },

  // Confirm modal
  confirm(title, body, onConfirm) {
    const overlay = document.getElementById('confirmModal');
    if (!overlay) return;
    overlay.querySelector('.modal-title').textContent = title;
    overlay.querySelector('.modal-body').textContent  = body;
    overlay.classList.add('open');
    const btnOk  = overlay.querySelector('.js-confirm-ok');
    const btnCan = overlay.querySelector('.js-confirm-cancel');
    const close  = () => overlay.classList.remove('open');
    const handler = () => { close(); btnOk.removeEventListener('click', handler); onConfirm(); };
    btnOk.addEventListener('click', handler);
    btnCan.addEventListener('click', close);
  },

  // Score bar fill
  animateScoreBars() {
    document.querySelectorAll('.score-bar-fill').forEach(el => {
      const pct = el.dataset.pct || 0;
      setTimeout(() => el.style.width = pct + '%', 100);
    });
  },

  // Mark active nav item
  setActiveNav(id) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  },
};

// Global confirm modal HTML (injected once)
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('confirmModal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-overlay" id="confirmModal">
        <div class="modal-box">
          <div class="modal-title"></div>
          <div class="modal-body"></div>
          <div class="modal-actions">
            <button class="btn btn-outline js-confirm-cancel">Cancel</button>
            <button class="btn btn-accent js-confirm-ok">Confirm</button>
          </div>
        </div>
      </div>
    `);
  }
});