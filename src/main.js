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
    this.btnPromptOk.onclick = () => {
      if (this.promptCallback) this.promptCallback(this.promptInput.value);
      this.hidePrompt();
    };
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
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
    this.overlay = document.getElementById('auth-overlay');
    this.loginForm = document.getElementById('auth-login');
    this.signupForm = document.getElementById('auth-signup');
    
    // Switch between login/signup
    document.getElementById('btn-show-signup').onclick = () => {
      this.loginForm.classList.add('hidden');
      this.signupForm.classList.remove('hidden');
    };
    document.getElementById('btn-show-login').onclick = () => {
      this.signupForm.classList.add('hidden');
      this.loginForm.classList.remove('hidden');
    };

    // Password Toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.onclick = () => {
        const input = document.getElementById(btn.getAttribute('data-target'));
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        btn.innerText = type === 'password' ? '👁️' : '🔒';
      };
    });

    // Actions
    document.getElementById('btn-login').onclick = () => this.login();
    document.getElementById('btn-signup').onclick = () => this.signup();

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

    if (this.currentUser) {
      this.showApp();
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
    window.ui.showToast('Account created successfully! Welcome to T-NERD 🎉', 'success');
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
    this.overlay.classList.add('hidden');
    document.getElementById('sidebar').classList.remove('hidden');
    document.getElementById('main-stage').classList.remove('hidden');
    
    document.getElementById('user-display-email').innerText = this.currentUser.email;
    this.updateUI();
    
    // Initialize Course Manager once logged in
    window.courseManager = new CourseManager(this.currentUser);
  }

  saveUserData(updatedUser) {
    this.users[updatedUser.email] = updatedUser;
    localStorage.setItem('tnerd_users', JSON.stringify(this.users));
    localStorage.setItem('tnerd_session', JSON.stringify(updatedUser));
  }
}

/**
 * Course Manager
 */
class CourseManager {
  constructor(user) {
    this.user = user;
    this.activeCourseId = null;
    this.activeCourseData = null;
    
    this.initElements();
    this.initListeners();
    this.renderCourseList();
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
    this.progressBar = document.querySelector('.progress-bar-container');
    this.currTimeEl = document.getElementById('curr-time');
    this.durTimeEl = document.getElementById('dur-time');
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

    this.btnPlayPause.onclick = () => this.togglePlay();
    this.videoPlayer.onclick = () => this.togglePlay();

    this.progressBar.onclick = (e) => this.seekVideo(e);

    // Custom Controls
    document.getElementById('btn-skip-back').onclick = () => this.videoPlayer.currentTime -= 10;
    document.getElementById('btn-skip-forward').onclick = () => this.videoPlayer.currentTime += 10;
    document.getElementById('btn-fullscreen').onclick = () => {
      if (this.videoPlayer.requestFullscreen) this.videoPlayer.requestFullscreen();
      else if (this.videoPlayer.webkitRequestFullscreen) this.videoPlayer.webkitRequestFullscreen();
    };

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

  async scanDirectoryAPI(handle) {
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
    this.addCourse(handle.name, sections);
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
    this.addCourse(courseId, sections);
  }

  addCourse(id, sections) {
    if (!this.user.courses[id]) {
      this.user.courses[id] = { 
        displayName: id, 
        completed: {}, 
        positions: {}, 
        sections: sections 
      };
    } else {
      // Update sections if already exists
      this.user.courses[id].sections = sections;
    }
    
    window.authManager.saveUserData(this.user);
    this.renderCourseList();
    this.selectCourse(id);
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
      tab.innerHTML = `<span>📚</span> <span>${course.displayName || id}</span>`;
      tab.onclick = () => this.selectCourse(id);
      this.courseListEl.appendChild(tab);
    });
  }

  selectCourse(id) {
    this.activeCourseId = id;
    const course = this.user.courses[id];
    
    this.activeCourseData = course;
    
    const isAvailable = course.sections && course.sections.length > 0;
    const displayName = course.displayName || id;
    
    this.lessonTitle.innerText = isAvailable ? displayName : `${displayName} (Course Not Found)`;
    this.breadcrumbs.innerText = `Courses / ${displayName}`;
    this.btnRename.classList.remove('hidden');
    
    if (isAvailable) {
      this.renderTree();
    } else {
      this.courseTree.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-dim);">
          <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🔍</span>
          <p>Files not found in local storage session.</p>
          <p style="font-size: 0.8rem; margin-top: 0.5rem;">Please use "Add New Course" to re-sync this folder.</p>
        </div>
      `;
    }
    
    this.renderCourseList();
    this.updateProgress();
    this.showHome();
  }

  showHome() {
    this.homeScreen.classList.remove('hidden');
    this.lessonView.classList.add('hidden');
    this.videoPlayer.pause();
    this.updateStats();
    
    // Clear active lesson
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
    this.activeCourseData.sections.forEach(section => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'section';
      
      const header = document.createElement('div');
      header.className = 'section-header';
      header.innerHTML = `<span>📁</span> <span>${section.name}</span>`;
      
      const list = document.createElement('div');
      list.className = 'lesson-list';
      
      section.lessons.forEach(lesson => {
        const lessonEl = document.createElement('div');
        const isCompleted = this.user.courses[this.activeCourseId].completed[lesson.fullName];
        lessonEl.className = `lesson-item ${isCompleted ? 'completed' : ''}`;
        lessonEl.innerHTML = `<span>${isCompleted ? '✓' : '○'}</span> ${lesson.name}`;
        
        lessonEl.onclick = () => this.playLesson(section, lesson, lessonEl);
        list.appendChild(lessonEl);
      });

      header.onclick = () => list.classList.toggle('active');
      sectionEl.appendChild(header);
      sectionEl.appendChild(list);
      this.courseTree.appendChild(sectionEl);
    });
  }

  async playLesson(section, lesson, element) {
    document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    this.breadcrumbs.innerText = `Courses / ${this.activeCourseData.displayName || this.activeCourseId} / ${section.name}`;
    this.lessonTitle.innerText = lesson.name;
    
    this.homeScreen.classList.add('hidden');
    this.lessonView.classList.remove('hidden');
    this.videoControls.classList.remove('hidden');

    let url;
    if (lesson.type === 'handle') {
      const file = await lesson.handle.getFile();
      url = URL.createObjectURL(file);
    } else {
      url = URL.createObjectURL(lesson.file);
    }

    this.videoPlayer.src = url;
    this.videoPlayer.load();
    
    this.videoPlayer.oncanplay = () => {
      this.videoPlayer.play().catch(e => console.error("Play failed:", e));
    };

    this.videoPlayer.onerror = (e) => {
      console.error("Video Error:", e);
      window.ui.showToast("Error loading video. Please re-sync the course folder.", "error");
    };

    this.btnPlayPause.innerText = '⏸';
    this.currentLesson = lesson;
    this.currentLessonElement = element;

    const lastPos = this.user.courses[this.activeCourseId].positions[lesson.fullName] || 0;
    this.videoPlayer.currentTime = lastPos;
  }

  handleTimeUpdate() {
    if (!this.currentLesson) return;
    const key = this.currentLesson.fullName;
    this.user.courses[this.activeCourseId].positions[key] = this.videoPlayer.currentTime;
    
    if (this.videoPlayer.currentTime / this.videoPlayer.duration > 0.9 && !this.user.courses[this.activeCourseId].completed[key]) {
      this.markCompleted(key);
    }

    window.authManager.saveUserData(this.user);
  }

  markCompleted(key) {
    this.user.courses[this.activeCourseId].completed[key] = true;
    if (this.currentLessonElement) {
      this.currentLessonElement.classList.add('completed');
      this.currentLessonElement.querySelector('span').innerText = '✓';
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
      this.btnPlayPause.innerText = '⏸';
    } else {
      this.videoPlayer.pause();
      this.btnPlayPause.innerText = '▶';
    }
  }

  updateVideoProgress() {
    const percent = (this.videoPlayer.currentTime / this.videoPlayer.duration) * 100;
    this.videoProgress.style.width = `${percent}%`;
    this.currTimeEl.innerText = this.formatTime(this.videoPlayer.currentTime);
  }

  seekVideo(e) {
    const rect = this.progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    this.videoPlayer.currentTime = pos * this.videoPlayer.duration;
  }

  formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  }
}

// Start Auth
window.authManager = new AuthManager();


