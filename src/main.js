import './style.css';

/**
 * Notification & Prompt Manager
 */
class UIManager {
  constructor() {
    this.toastContainer = document.getElementById('toast-container');
    this.promptModal = document.getElementById('prompt-modal');
    this.promptTitle = document.getElementById('prompt-title');
    this.promptInput = document.getElementById('prompt-input');
    this.btnPromptOk = document.getElementById('btn-prompt-ok');
    this.btnPromptCancel = document.getElementById('btn-prompt-cancel');
    this.promptCallback = null;

    this.btnPromptCancel.onclick = () => this.hidePrompt();
    this.btnPromptOk.onclick = () => this.confirmPrompt();
    this.promptInput.onkeydown = (e) => {
      if (e.key === 'Enter') this.confirmPrompt();
      if (e.key === 'Escape') this.hidePrompt();
    };
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    this.toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  showPrompt(title, defaultValue, callback) {
    this.promptTitle.innerText = title;
    this.promptInput.value = defaultValue;
    this.promptCallback = callback;
    this.promptModal.classList.remove('hidden');
    this.promptInput.focus();
  }

  confirmPrompt() {
    if (this.promptCallback) this.promptCallback(this.promptInput.value);
    this.hidePrompt();
  }

  hidePrompt() {
    this.promptModal.classList.add('hidden');
    this.promptCallback = null;
  }
}

window.ui = new UIManager();

/**
 * Authentication Manager
 */
class AuthManager {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('tnerd_users') || '{}');
    
    // Initialize demo user if no users exist
    if (Object.keys(this.users).length === 0) {
      const demoEmail = 'demo@tnerd.com';
      this.users[demoEmail] = { 
        name: 'Demo User', 
        email: demoEmail, 
        password: 'password123', 
        courses: {} 
      };
      localStorage.setItem('tnerd_users', JSON.stringify(this.users));
    }

    this.currentUser = JSON.parse(localStorage.getItem('tnerd_session') || 'null');
    this.initUI();
  }

  initUI() {
    this.landingPage = document.getElementById('landing-page');
    this.heroSection = document.querySelector('.hero-section');
    this.authSection = document.getElementById('auth-section');
    this.loginForm = document.getElementById('auth-login');
    this.signupForm = document.getElementById('auth-signup');
    
    this.navActions = document.getElementById('landing-nav-actions');
    this.navDashboard = document.getElementById('landing-nav-dashboard');
    this.btnGetStarted = document.getElementById('btn-get-started');
    this.btnLandingDashboard = document.getElementById('btn-landing-dashboard');
    this.btnBack = document.getElementById('btn-auth-back');

    this.btnBack.onclick = () => this.hideAuth();

    // Password Toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.onclick = () => {
        const input = document.getElementById(btn.getAttribute('data-target'));
        const isPassword = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPassword ? 'text' : 'password');
        const eyeIcon = btn.querySelector('.eye-icon');
        if (eyeIcon) {
          eyeIcon.innerHTML = isPassword
            ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
            : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        }
      };
    });

    // Navigation & Hero
    document.getElementById('btn-nav-login').onclick = () => this.showAuth('login');
    document.getElementById('btn-nav-signup').onclick = () => this.showAuth('signup');
    document.getElementById('btn-nav-dashboard').onclick = () => this.showApp();
    document.getElementById('btn-landing-dashboard').onclick = () => this.showApp();
    this.btnGetStarted.onclick = () => this.showAuth('signup');

    // Toggle Auth Forms
    document.getElementById('btn-show-signup').onclick = () => {
      this.loginForm.classList.add('hidden');
      this.signupForm.classList.remove('hidden');
    };
    document.getElementById('btn-show-login').onclick = () => {
      this.signupForm.classList.add('hidden');
      this.loginForm.classList.remove('hidden');
    };

    // Auth Actions
    document.getElementById('btn-login').onclick = () => this.login();
    document.getElementById('btn-signup').onclick = () => this.signup();
    document.getElementById('login-password').onkeydown = (e) => { if (e.key === 'Enter') this.login(); };
    document.getElementById('signup-password').onkeydown = (e) => { if (e.key === 'Enter') this.signup(); };

    // User Dropdown & Settings
    this.avatar = document.getElementById('user-avatar');
    this.dropdown = document.getElementById('user-dropdown');
    this.modal = document.getElementById('settings-modal');

    this.avatar.onclick = (e) => {
      e.stopPropagation();
      this.dropdown.classList.toggle('hidden');
    };

    window.onclick = () => this.dropdown.classList.add('hidden');

    document.getElementById('btn-logout').onclick = () => this.logout();
    document.getElementById('btn-settings').onclick = () => this.showSettings();
    document.getElementById('btn-close-settings').onclick = () => this.modal.classList.add('hidden');
    document.getElementById('btn-save-settings').onclick = () => this.saveSettings();

    // Logo Navigation
    document.getElementById('landing-logo').onclick = () => this.showLanding();
    document.getElementById('app-logo').onclick = () => this.showLanding();

    if (this.currentUser) {
      this.showApp();
    }
  }

  showLanding() {
    if (this.currentUser) {
      this.landingPage.classList.remove('hidden');
      document.getElementById('sidebar').classList.add('hidden');
      document.getElementById('main-stage').classList.add('hidden');
      this.authSection.classList.add('hidden');
      this.heroSection.classList.remove('hidden');
      this.updateLandingState(true);
    }
  }

  showAuth(mode) {
    this.heroSection.classList.add('hidden');
    this.authSection.classList.remove('hidden');
    if (mode === 'login') {
      this.loginForm.classList.remove('hidden');
      this.signupForm.classList.add('hidden');
    } else {
      this.signupForm.classList.remove('hidden');
      this.loginForm.classList.add('hidden');
    }
    window.scrollTo(0, 0);
  }

  hideAuth() {
    this.authSection.classList.add('hidden');
    this.heroSection.classList.remove('hidden');
  }

  updateLandingState(isLoggedIn) {
    if (isLoggedIn) {
      this.navActions.classList.add('hidden');
      this.navDashboard.classList.remove('hidden');
      this.btnGetStarted.classList.add('hidden');
      this.btnLandingDashboard.classList.remove('hidden');
    } else {
      this.navActions.classList.remove('hidden');
      this.navDashboard.classList.add('hidden');
      this.btnGetStarted.classList.remove('hidden');
      this.btnLandingDashboard.classList.add('hidden');
    }
  }

  showSettings() {
    this.modal.classList.remove('hidden');
    document.getElementById('settings-name').value = this.currentUser.name;
    document.getElementById('settings-password').value = '';
    this.dropdown.classList.add('hidden');
  }

  saveSettings() {
    const newName = document.getElementById('settings-name').value;
    const newPass = document.getElementById('settings-password').value;

    if (!newName) return window.ui.showToast('Name cannot be empty', 'error');

    this.currentUser.name = newName;
    if (newPass) this.currentUser.password = newPass;

    this.saveUserData(this.currentUser);
    this.modal.classList.add('hidden');
    this.updateUI();
    window.ui.showToast('Profile updated successfully!', 'success');
  }

  updateUI() {
    document.getElementById('user-avatar').innerText = this.currentUser.name.substring(0, 2).toUpperCase();
    document.getElementById('user-display-name').innerText = this.currentUser.name;
    document.getElementById('welcome-message').innerText = `Welcome back, ${this.currentUser.name.split(' ')[0]}!`;
  }

  logout() {
    localStorage.removeItem('tnerd_session');
    location.reload(); // Simplest way to reset state
  }

  signup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) return window.ui.showToast('Please fill all fields', 'error');
    if (this.users[email]) return window.ui.showToast('User already exists', 'error');

    this.users[email] = { name, email, password, courses: {} };
    localStorage.setItem('tnerd_users', JSON.stringify(this.users));
    window.ui.showToast('Account created successfully! Welcome to T-NERD', 'success');
    this.signupForm.classList.add('hidden');
    this.loginForm.classList.remove('hidden');
  }

  login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = this.users[email];
    if (user && user.password === password) {
      this.currentUser = user;
      localStorage.setItem('tnerd_session', JSON.stringify(user));
      window.ui.showToast(`Logged in as ${user.name}`, 'success');
      this.showApp();
    } else {
      window.ui.showToast('Invalid credentials', 'error');
    }
  }

  showApp() {
    this.landingPage.classList.add('hidden');
    document.getElementById('sidebar').classList.remove('hidden');
    document.getElementById('main-stage').classList.remove('hidden');
    
    document.getElementById('user-display-email').innerText = this.currentUser.email;
    this.updateUI();
    
    // Initialize Course Manager once logged in
    window.courseManager = new CourseManager(this.currentUser);
  }

  saveUserData(updatedUser) {
    const cleaned = JSON.parse(JSON.stringify(updatedUser, (key, value) => {
      if (key === 'handle' || key === 'file') return undefined;
      return value;
    }));
    this.users[updatedUser.email] = cleaned;
    localStorage.setItem('tnerd_users', JSON.stringify(this.users));
    localStorage.setItem('tnerd_session', JSON.stringify(cleaned));
  }
}

/**
 * IndexedDB helper for persisting directory handles across sessions
 */
const DB = {
  _db: null,
  _open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('tnerd_handles', 1);
      req.onupgradeneeded = (e) => {
        e.target.result.createObjectStore('handles');
      };
      req.onsuccess = (e) => {
        this._db = e.target.result;
        resolve(this._db);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  },
  async save(courseId, handle) {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').put(handle, courseId);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  },
  async get(courseId) {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readonly');
      const req = tx.objectStore('handles').get(courseId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },
  async keys() {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readonly');
      const req = tx.objectStore('handles').getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  },
  async remove(courseId) {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('handles', 'readwrite');
      tx.objectStore('handles').delete(courseId);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e.target.error);
    });
  }
};

/**
 * Course Manager
 */
class CourseManager {
  constructor(user) {
    this.user = user;
    this.activeCourseId = null;
    this.activeCourseData = null;
    this._handleCache = new Map();
    
    this.initElements();
    this.initListeners();
    this._restoreFromIdb().then(() => {
      this.renderCourseList();
      this.updateStats();
      const ids = Object.keys(this.user.courses);
      if (ids.length > 0) {
        for (const id of ids) {
          if (this.user.courses[id].sections && this.user.courses[id].sections.length > 0) {
            this.selectCourse(id);
            return;
          }
        }
        this.selectCourse(ids[0]);
      }
    });
  }

  initElements() {
    this.btnBrowse = document.getElementById('btn-browse');
    this.dirInput = document.getElementById('dir-input');
    this.courseTree = document.getElementById('course-tree');
    this.courseListEl = document.getElementById('course-list');
    this.videoPlayer = document.getElementById('video-player');
    this.homeScreen = document.getElementById('home-screen');
    this.lessonView = document.getElementById('lesson-view');
    this.videoControls = document.getElementById('video-controls');
    this.lessonTitle = document.getElementById('current-lesson-title');
    this.breadcrumbs = document.getElementById('lesson-breadcrumbs');
    this.progressFg = document.getElementById('progress-fg');
    this.progressPercent = document.getElementById('progress-percent');
    this.searchInput = document.getElementById('search-input');
    this.btnRename = document.getElementById('btn-rename-course');
    this.navHome = document.getElementById('nav-home');
    
    // Stats
    this.statCourses = document.getElementById('stat-courses');
    this.statCompleted = document.getElementById('stat-completed');

    // Video Custom Logic Elements
    this.btnPlayPause = document.getElementById('btn-play-pause');
    this.videoProgress = document.getElementById('video-progress');
    this.videoBuffered = document.getElementById('video-buffered');
    this.progressBar = document.querySelector('.progress-bar-container');
    this.currTimeEl = document.getElementById('curr-time');
    this.durTimeEl = document.getElementById('dur-time');
    this.btnVolume = document.getElementById('btn-volume');
    this.volumeSlider = document.getElementById('volume-slider');
    this.speedLabel = document.getElementById('speed-label');
    this.btnSpeed = document.getElementById('btn-speed');
    this.btnPip = document.getElementById('btn-pip');
    this.videoTitleOverlay = document.getElementById('video-title-overlay');
    this.videoCurrentTitle = document.getElementById('video-current-title');
    this.videoWrapper = document.querySelector('.video-wrapper');
  }

  initListeners() {
    this.navHome.onclick = () => this.showHome();

    this.btnBrowse.onclick = () => {
      if ('showDirectoryPicker' in window) {
        window.showDirectoryPicker().then(handle => this.scanDirectoryAPI(handle));
      } else {
        this.dirInput.click();
      }
    };

    this.dirInput.onchange = (e) => this.scanFilesFallback(Array.from(e.target.files));

    this.searchInput.oninput = (e) => this.filterLessons(e.target.value);
    
    this.videoPlayer.ontimeupdate = () => {
      this.handleTimeUpdate();
      this.updateVideoProgress();
    };

    this.videoPlayer.onloadedmetadata = () => {
      this.durTimeEl.innerText = this.formatTime(this.videoPlayer.duration);
    };

    this.videoPlayer.onprogress = () => this.updateBufferedProgress();

    this.btnPlayPause.onclick = () => this.togglePlay();
    this.videoPlayer.onclick = () => this.togglePlay();

    this.progressBar.onclick = (e) => this.seekVideo(e);

    // Skip buttons
    document.getElementById('btn-skip-back').onclick = () => { this.videoPlayer.currentTime -= 10; };
    document.getElementById('btn-skip-forward').onclick = () => { this.videoPlayer.currentTime += 10; };

    // Fullscreen
    document.getElementById('btn-fullscreen').onclick = () => this.toggleFullscreen();

    // Volume
    this.btnVolume.onclick = () => this.toggleMute();
    this.volumeSlider.oninput = () => this.handleVolumeChange();

    // Speed
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    this.btnSpeed.onclick = () => {
      const current = this.videoPlayer.playbackRate;
      const idx = speeds.indexOf(current);
      const next = speeds[(idx + 1) % speeds.length];
      this.videoPlayer.playbackRate = next;
      this.speedLabel.textContent = `${next}x`;
    };

    // PiP
    this.btnPip.onclick = () => this.togglePip();

    // Keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Auto-hide controls
    this.setupAutoHideControls();

    // Video title overlay show/hide
    this.videoPlayer.onplay = () => {
      if (this.currentLesson) {
        this.videoCurrentTitle.textContent = this.currentLesson.name;
        this.videoTitleOverlay.classList.remove('hidden');
        setTimeout(() => this.videoTitleOverlay.classList.add('hidden'), 3000);
      }
    };

    this.videoPlayer.onpause = () => this.saveProgress();

    // Rename
    this.btnRename.onclick = () => {
      window.ui.showPrompt(
        'Rename Course', 
        this.user.courses[this.activeCourseId].displayName || this.activeCourseId,
        (newName) => {
          if (newName) {
            this.user.courses[this.activeCourseId].displayName = newName;
            this.lessonTitle.innerText = newName;
            this.renderCourseList();
            window.authManager.saveUserData(this.user);
            window.ui.showToast('Course renamed successfully', 'success');
          }
        }
      );
    };
  }

  async scanDirectoryAPI(handle, silent) {
    const sections = [];
    for await (const [name, entry] of handle.entries()) {
      if (entry.kind === 'directory') {
        const section = { name, lessons: [] };
        for await (const [fileName, fileEntry] of entry.entries()) {
          if (fileEntry.kind === 'file' && fileName.endsWith('.mp4')) {
            section.lessons.push({
              name: fileName.replace('.mp4', ''),
              fullName: fileName,
              handle: fileEntry,
              type: 'handle'
            });
          }
        }
        if (section.lessons.length > 0) {
          section.lessons.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
          sections.push(section);
        }
      }
    }
    sections.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
    this._addCourseData(handle.name, sections);
    await DB.save(handle.name, handle).catch(() => {});
    window.authManager.saveUserData(this.user);
    this.renderCourseList();
    if (!silent) this.selectCourse(handle.name);
  }

  scanFilesFallback(files) {
    if (files.length === 0) return;
    const courseId = files[0].webkitRelativePath.split('/')[0];
    const sectionsMap = {};

    files.forEach(file => {
      const parts = file.webkitRelativePath.split('/');
      if (parts.length >= 3 && file.name.endsWith('.mp4')) {
        const sectionName = parts[1];
        if (!sectionsMap[sectionName]) sectionsMap[sectionName] = { name: sectionName, lessons: [] };
        sectionsMap[sectionName].lessons.push({
          name: file.name.replace('.mp4', ''),
          fullName: file.name,
          file: file,
          type: 'file'
        });
      }
    });

    const sections = Object.values(sectionsMap).map(s => {
      s.lessons.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
      return s;
    });
    sections.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
    this._addCourseData(courseId, sections);
    window.authManager.saveUserData(this.user);
    this.renderCourseList();
    window.ui.showToast('Course added (note: file picker courses cannot auto-restore after reload)', 'info');
  }

  _addCourseData(id, sections) {
    if (!this.user.courses[id]) {
      this.user.courses[id] = { 
        displayName: id, 
        completed: {}, 
        positions: {}, 
        sections: sections 
      };
    } else {
      this.user.courses[id].sections = sections;
    }
  }

  renderCourseList() {
    this.courseListEl.innerHTML = '';
    const courseIds = Object.keys(this.user.courses);
    
    this.updateStats();

    if (courseIds.length === 0) {
      this.courseListEl.innerHTML = '<div style="padding: 1rem; color: var(--text-dim); font-size: 0.8rem;">No courses added yet.</div>';
      return;
    }

    courseIds.forEach(id => {
      const course = this.user.courses[id];
      const tab = document.createElement('div');
      tab.className = `course-tab ${this.activeCourseId === id ? 'active' : ''}`;
      
      const tabContent = document.createElement('div');
      tabContent.className = 'course-tab-content';
      tabContent.onclick = () => this.selectCourse(id);
      
      const titleRow = document.createElement('div');
      titleRow.className = 'course-tab-title-row';
      
      const titleSpan = document.createElement('span');
      titleSpan.className = 'course-tab-title';
      titleSpan.textContent = course.displayName || id;
      
      const lessonCount = course.sections
        ? course.sections.reduce((acc, s) => acc + s.lessons.length, 0)
        : 0;
      const completedCount = Object.keys(course.completed || {}).length;
      const countLabel = document.createElement('span');
      countLabel.className = 'course-tab-count';
      countLabel.textContent = `${completedCount}/${lessonCount}`;
      
      titleRow.appendChild(titleSpan);
      titleRow.appendChild(countLabel);
      
      if (lessonCount > 0) {
        const pct = Math.round((completedCount / lessonCount) * 100);
        const progressOuter = document.createElement('div');
        progressOuter.className = 'course-tab-progress';
        const progressInner = document.createElement('div');
        progressInner.className = 'course-tab-progress-fg';
        progressInner.style.width = `${pct}%`;
        progressOuter.appendChild(progressInner);
        tabContent.appendChild(titleRow);
        tabContent.appendChild(progressOuter);
      } else {
        tabContent.appendChild(titleRow);
      }
      
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete-course';
      delBtn.textContent = '\u00D7';
      delBtn.title = 'Remove Course';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        this.deleteCourse(id);
      };
      
      tab.appendChild(tabContent);
      tab.appendChild(delBtn);
      this.courseListEl.appendChild(tab);
    });
  }

  deleteCourse(id) {
    if (confirm(`Are you sure you want to remove "${this.user.courses[id].displayName || id}"?`)) {
      delete this.user.courses[id];
      if (this.activeCourseId === id) {
        this.activeCourseId = null;
        this.activeCourseData = null;
        this.courseTree.innerHTML = '<div style="padding: 1rem; color: var(--text-dim); font-size: 0.8rem; text-align: center;">No course selected.</div>';
      }
      DB.remove(id).catch(() => {});
      window.authManager.saveUserData(this.user);
      this.renderCourseList();
      window.ui.showToast('Course removed from library', 'info');
    }
  }

  async _restoreFromIdb() {
    const keys = await DB.keys().catch(() => []);
    for (const courseId of keys) {
      if (!this.user.courses[courseId]) {
        this.user.courses[courseId] = {
          displayName: courseId,
          completed: {},
          positions: {},
          sections: []
        };
      }
      const handle = await DB.get(courseId).catch(() => null);
      if (!handle) continue;
      this._handleCache.set(courseId, handle);
      let permission = 'denied';
      try {
        if (handle.queryPermission) permission = await handle.queryPermission({ mode: 'read' });
      } catch (e) { continue; }
      if (permission !== 'granted') continue;
      try {
        const sections = await this._buildSectionsFromHandle(handle);
        this._addCourseData(courseId, sections);
      } catch (e) {
        continue;
      }
    }
  }

  async selectCourse(id) {
    this.activeCourseId = id;
    const course = this.user.courses[id];
    this.activeCourseData = course;
    
    const displayName = course.displayName || id;
    const hasSections = course.sections && course.sections.length > 0;
    const handle = this._handleCache.get(id);
    
    this.lessonTitle.innerText = displayName;
    this.breadcrumbs.innerText = `Courses / ${displayName}`;
    this.btnRename.classList.remove('hidden');
    
    if (hasSections) {
      this.renderTree();
    } else if (handle) {
      let permission = 'denied';
      try {
        if (handle.queryPermission) permission = await handle.queryPermission({ mode: 'read' });
        if (permission === 'prompt' && handle.requestPermission) permission = await handle.requestPermission({ mode: 'read' });
      } catch (e) {}
      if (permission === 'granted') {
        const sections = await this._buildSectionsFromHandle(handle);
        this._addCourseData(id, sections);
        this.renderTree();
      } else {
        this.courseTree.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: var(--text-dim);">
            <p>Click to restore access to the course folder.</p>
            <button class="btn-sync primary-btn" style="margin: 1rem auto 0; width: auto; padding: 0.6rem 1.5rem;">Restore Course Access</button>
          </div>
        `;
        this.courseTree.querySelector('.btn-sync').onclick = async () => {
          try {
            let p = 'prompt';
            if (handle.requestPermission) p = await handle.requestPermission({ mode: 'read' });
            if (p === 'granted') {
              const secs = await this._buildSectionsFromHandle(handle);
              this._addCourseData(id, secs);
              this.renderTree();
              window.ui.showToast('Course access restored', 'success');
            }
          } catch (e) {}
        };
      }
    } else {
      this.courseTree.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-dim);">
          <p>No course data found.</p>
          <p style="font-size: 0.8rem; margin-top: 0.5rem;">Select the course folder to load it.</p>
        </div>
      `;
    }
    
    this.renderCourseList();
    this.updateProgress();
    this.showHome();
  }

  async _buildSectionsFromHandle(handle) {
    const sections = [];
    for await (const [name, entry] of handle.entries()) {
      if (entry.kind === 'directory') {
        const section = { name, lessons: [] };
        for await (const [fileName, fileEntry] of entry.entries()) {
          if (fileEntry.kind === 'file' && fileName.endsWith('.mp4')) {
            section.lessons.push({
              name: fileName.replace('.mp4', ''),
              fullName: fileName,
              handle: fileEntry,
              type: 'handle'
            });
          }
        }
        if (section.lessons.length > 0) {
          section.lessons.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
          sections.push(section);
        }
      }
    }
    sections.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
    return sections;
  }

  _findLessonInSections(sections, fullName) {
    for (const section of sections) {
      for (const lesson of section.lessons) {
        if (lesson.fullName === fullName) return lesson.handle;
      }
    }
    return null;
  }

  saveProgress() {
    if (!this.currentLesson) return;
    const key = this.currentLesson.fullName;
    this.user.courses[this.activeCourseId].positions[key] = this.videoPlayer.currentTime;
    window.authManager.saveUserData(this.user);
  }

  showHome() {
    this.saveProgress();
    this.homeScreen.classList.remove('hidden');
    this.lessonView.classList.add('hidden');
    this.videoPlayer.pause();
    this.updateStats();
    
    document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
  }

  updateStats() {
    const courseIds = Object.keys(this.user.courses);
    this.statCourses.innerText = courseIds.length;
    
    let totalCompleted = 0;
    courseIds.forEach(id => {
      totalCompleted += Object.keys(this.user.courses[id].completed || {}).length;
    });
    this.statCompleted.innerText = totalCompleted;
  }

  renderTree() {
    this.courseTree.innerHTML = '';
    const allLists = [];
    this.activeCourseData.sections.forEach((section, idx) => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'section';
      
      const header = document.createElement('div');
      header.className = 'section-header';
      header.innerHTML = `<span>${section.name}</span>`;
      
      const list = document.createElement('div');
      list.className = 'lesson-list';
      
      section.lessons.forEach(lesson => {
        const lessonEl = document.createElement('div');
        const isCompleted = this.user.courses[this.activeCourseId].completed[lesson.fullName];
        lessonEl.className = `lesson-item ${isCompleted ? 'completed' : ''}`;
        lessonEl.innerHTML = `<span class="lesson-status">${isCompleted ? '\u2713' : '\u25CB'}</span> ${lesson.name}`;
        
        lessonEl.onclick = () => this.playLesson(section, lesson, lessonEl);
        list.appendChild(lessonEl);
      });

      header.onclick = () => {
        const isOpen = list.classList.contains('active');
        allLists.forEach(l => l.classList.remove('active'));
        if (!isOpen) list.classList.add('active');
      };
      
      allLists.push(list);
      sectionEl.appendChild(header);
      sectionEl.appendChild(list);
      this.courseTree.appendChild(sectionEl);
    });

    if (allLists.length > 0) {
      allLists[0].classList.add('active');
    }
  }

  async playLesson(section, lesson, element) {
    document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    this.breadcrumbs.innerText = `Courses / ${this.activeCourseData.displayName || this.activeCourseId} / ${section.name}`;
    this.lessonTitle.innerText = lesson.name;
    
    this.homeScreen.classList.add('hidden');
    this.lessonView.classList.remove('hidden');
    this.videoControls.classList.remove('hidden');

    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
    }

    let url;
    if (lesson.type === 'handle') {
      let fileHandle = lesson.handle;
      if (!fileHandle || typeof fileHandle.getFile !== 'function') {
        const cached = this._handleCache.get(this.activeCourseId);
        if (cached && cached.queryPermission) {
          let p = 'denied';
          try {
            p = await cached.queryPermission({ mode: 'read' });
            if (p === 'prompt' && cached.requestPermission) p = await cached.requestPermission({ mode: 'read' });
          } catch (e) {}
          if (p === 'granted') {
            const sections = await this._buildSectionsFromHandle(cached);
            this._addCourseData(this.activeCourseId, sections);
            const found = this._findLessonInSections(sections, lesson.fullName);
            if (found) fileHandle = found;
          }
        }
        if (!fileHandle || typeof fileHandle.getFile !== 'function') {
          window.ui.showToast('Course data expired. Re-sync the course folder.', 'error');
          return;
        }
      }
      const file = await fileHandle.getFile();
      url = URL.createObjectURL(file);
    } else {
      if (!lesson.file || !(lesson.file instanceof Blob)) {
        window.ui.showToast('Course data expired. Re-sync the course folder.', 'error');
        return;
      }
      url = URL.createObjectURL(lesson.file);
    }
    this.currentBlobUrl = url;

    this.videoPlayer.src = url;
    this.videoPlayer.load();
    
    this.videoPlayer.oncanplay = () => {
      this.videoPlayer.play().catch(e => {
        if (e.name === 'NotAllowedError') {
          window.ui.showToast('Click anywhere on the video to play', 'info');
        }
      });
    };

    this.videoPlayer.onerror = (e) => {
      window.ui.showToast("Failed to load video.", "error");
    };

    this.updatePlayPauseIcon(true);
    this.currentLesson = lesson;
    this.currentLessonElement = element;

    const lastPos = this.user.courses[this.activeCourseId].positions[lesson.fullName] || 0;
    if (lastPos > 0) {
      this.videoPlayer.currentTime = lastPos;
    }
  }

  handleTimeUpdate() {
    if (!this.currentLesson) return;
    const dur = this.videoPlayer.duration;
    if (!dur || !isFinite(dur)) return;

    const key = this.currentLesson.fullName;
    this.user.courses[this.activeCourseId].positions[key] = this.videoPlayer.currentTime;
    
    if (this.videoPlayer.currentTime / dur > 0.9 && !this.user.courses[this.activeCourseId].completed[key]) {
      this.markCompleted(key);
    }

    if (!this._saveThrottle) this._saveThrottle = 0;
    const now = Date.now();
    if (now - this._saveThrottle > 2000) {
      this._saveThrottle = now;
      window.authManager.saveUserData(this.user);
    }
  }

  markCompleted(key) {
    this.user.courses[this.activeCourseId].completed[key] = true;
    if (this.currentLessonElement) {
      this.currentLessonElement.classList.add('completed');
      this.currentLessonElement.querySelector('.lesson-status').textContent = '\u2713';
    }
    this.updateProgress();
    window.authManager.saveUserData(this.user);
  }

  updateProgress() {
    if (!this.activeCourseData) return;
    const total = this.activeCourseData.sections.reduce((acc, s) => acc + s.lessons.length, 0);
    const completed = Object.keys(this.user.courses[this.activeCourseId].completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.progressPercent.innerText = `${percent}%`;
    const offset = 226 - (226 * percent) / 100;
    this.progressFg.style.strokeDashoffset = offset;
  }

  filterLessons(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.lesson-item').forEach(el => {
      const text = el.innerText.toLowerCase();
      el.classList.toggle('hidden', !text.includes(q));
    });
    document.querySelectorAll('.section').forEach(sec => {
      const list = sec.querySelector('.lesson-list');
      const hasVisible = list.querySelectorAll('.lesson-item:not(.hidden)').length > 0;
      if (query) list.classList.toggle('active', hasVisible);
    });
  }

  togglePlay() {
    if (this.videoPlayer.paused) {
      this.videoPlayer.play();
      this.updatePlayPauseIcon(true);
    } else {
      this.videoPlayer.pause();
      this.updatePlayPauseIcon(false);
    }
  }

  updatePlayPauseIcon(isPlaying) {
    const playIcon = document.getElementById('icon-play');
    const pauseIcon = document.getElementById('icon-pause');
    if (playIcon && pauseIcon) {
      playIcon.classList.toggle('hidden', isPlaying);
      pauseIcon.classList.toggle('hidden', !isPlaying);
    }
  }

  updateVideoProgress() {
    const percent = (this.videoPlayer.currentTime / this.videoPlayer.duration) * 100;
    this.videoProgress.style.width = `${percent}%`;
    this.currTimeEl.innerText = this.formatTime(this.videoPlayer.currentTime);
  }

  updateBufferedProgress() {
    if (!this.videoPlayer.buffered || !this.videoPlayer.buffered.length) return;
    const end = this.videoPlayer.buffered.end(this.videoPlayer.buffered.length - 1);
    const pct = (end / this.videoPlayer.duration) * 100;
    this.videoBuffered.style.width = `${pct}%`;
  }

  seekVideo(e) {
    const rect = this.progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    this.videoPlayer.currentTime = pos * this.videoPlayer.duration;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.videoWrapper.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  toggleMute() {
    this.videoPlayer.muted = !this.videoPlayer.muted;
    this.updateVolumeIcons();
  }

  handleVolumeChange() {
    this.videoPlayer.volume = parseFloat(this.volumeSlider.value);
    this.videoPlayer.muted = false;
    this.updateVolumeIcons();
  }

  updateVolumeIcons() {
    const volIcon = document.getElementById('icon-volume');
    const mutedIcon = document.getElementById('icon-muted');
    const isMuted = this.videoPlayer.muted || this.videoPlayer.volume === 0;
    volIcon.classList.toggle('hidden', isMuted);
    mutedIcon.classList.toggle('hidden', !isMuted);
    this.volumeSlider.value = isMuted ? '0' : String(this.videoPlayer.volume);
  }

  async togglePip() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (this.videoPlayer.requestPictureInPicture) {
        await this.videoPlayer.requestPictureInPicture();
      }
    } catch (e) {
      // PiP not supported
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (this.lessonView.classList.contains('hidden')) return;
      if (e.target.tagName === 'INPUT') return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.videoPlayer.currentTime -= 10;
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.videoPlayer.currentTime += 10;
          break;
        case 'f':
          this.toggleFullscreen();
          break;
        case 'm':
          this.toggleMute();
          break;
        case 'j':
          this.videoPlayer.currentTime -= 10;
          break;
        case 'l':
          this.videoPlayer.currentTime += 10;
          break;
      }
    });
  }

  setupAutoHideControls() {
    let hideTimer = null;
    const controls = this.videoControls;

    const showControls = () => {
      controls.classList.remove('controls-hidden');
      this.videoWrapper.style.cursor = '';
      clearTimeout(hideTimer);
      if (!this.videoPlayer.paused) {
        hideTimer = setTimeout(() => {
          controls.classList.add('controls-hidden');
          this.videoWrapper.style.cursor = 'none';
        }, 3000);
      }
    };

    this.videoWrapper.addEventListener('mousemove', showControls);
    this.videoWrapper.addEventListener('mouseenter', showControls);
    this.videoWrapper.addEventListener('mouseleave', () => {
      if (!this.videoPlayer.paused) {
        controls.classList.add('controls-hidden');
        this.videoWrapper.style.cursor = 'none';
      }
    });
    this.videoPlayer.addEventListener('play', showControls);
  }

  formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }
}

// Start Auth
window.authManager = new AuthManager();


