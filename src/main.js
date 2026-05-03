import './style.css';

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

    // Actions
    document.getElementById('btn-login').onclick = () => this.login();
    document.getElementById('btn-signup').onclick = () => this.signup();

    if (this.currentUser) {
      this.showApp();
    }
  }

  signup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) return alert('Please fill all fields');
    if (this.users[email]) return alert('User already exists');

    this.users[email] = { name, email, password, courses: {} };
    localStorage.setItem('tnerd_users', JSON.stringify(this.users));
    alert('Account created! Please sign in.');
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
      this.showApp();
    } else {
      alert('Invalid credentials');
    }
  }

  showApp() {
    this.overlay.classList.add('hidden');
    document.getElementById('sidebar').classList.remove('hidden');
    document.getElementById('main-stage').classList.remove('hidden');
    document.getElementById('user-avatar').innerText = this.currentUser.name.substring(0, 2).toUpperCase();
    
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
    this.currentCourseId = null;
    this.courseData = null;
    
    this.initElements();
    this.initListeners();
  }

  initElements() {
    this.btnBrowse = document.getElementById('btn-browse');
    this.dirInput = document.getElementById('dir-input');
    this.courseTree = document.getElementById('course-tree');
    this.videoPlayer = document.getElementById('video-player');
    this.videoPlaceholder = document.getElementById('video-placeholder');
    this.lessonTitle = document.getElementById('current-lesson-title');
    this.breadcrumbs = document.getElementById('lesson-breadcrumbs');
    this.progressFg = document.getElementById('progress-fg');
    this.progressPercent = document.getElementById('progress-percent');
    this.searchInput = document.getElementById('search-input');
  }

  initListeners() {
    this.btnBrowse.onclick = () => {
      if ('showDirectoryPicker' in window) {
        window.showDirectoryPicker().then(handle => this.scanDirectoryAPI(handle));
      } else {
        this.dirInput.click();
      }
    };

    this.dirInput.onchange = (e) => this.scanFilesFallback(Array.from(e.target.files));

    this.searchInput.oninput = (e) => this.filterLessons(e.target.value);
    
    this.videoPlayer.ontimeupdate = () => this.handleTimeUpdate();
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
    this.loadCourse(handle.name, sections);
  }

  scanFilesFallback(files) {
    if (files.length === 0) return;
    const courseName = files[0].webkitRelativePath.split('/')[0];
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
    this.loadCourse(courseName, sections);
  }

  loadCourse(name, sections) {
    this.currentCourseId = name;
    this.courseData = { name, sections };
    
    // Initialize user's progress for this course if not exists
    if (!this.user.courses[name]) {
      this.user.courses[name] = { completed: {}, positions: {} };
    }

    this.renderTree();
    this.updateProgress();
  }

  renderTree() {
    this.courseTree.innerHTML = '';
    this.courseData.sections.forEach(section => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'section';
      
      const header = document.createElement('div');
      header.className = 'section-header';
      header.innerHTML = `<span>📁</span> <span>${section.name}</span>`;
      
      const list = document.createElement('div');
      list.className = 'lesson-list';
      
      section.lessons.forEach(lesson => {
        const lessonEl = document.createElement('div');
        const isCompleted = this.user.courses[this.currentCourseId].completed[lesson.fullName];
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

    this.lessonTitle.innerText = lesson.name;
    this.breadcrumbs.innerText = `Courses / ${this.currentCourseId} / ${section.name}`;
    
    this.videoPlaceholder.classList.add('hidden');
    this.videoPlayer.classList.remove('hidden');

    let url;
    if (lesson.type === 'handle') {
      const file = await lesson.handle.getFile();
      url = URL.createObjectURL(file);
    } else {
      url = URL.createObjectURL(lesson.file);
    }

    this.videoPlayer.src = url;
    this.currentLesson = lesson;
    this.currentLessonElement = element;

    const lastPos = this.user.courses[this.currentCourseId].positions[lesson.fullName] || 0;
    this.videoPlayer.currentTime = lastPos;
    this.videoPlayer.play();
  }

  handleTimeUpdate() {
    if (!this.currentLesson) return;
    const key = this.currentLesson.fullName;
    this.user.courses[this.currentCourseId].positions[key] = this.videoPlayer.currentTime;
    
    // Auto-complete at 90%
    if (this.videoPlayer.currentTime / this.videoPlayer.duration > 0.9 && !this.user.courses[this.currentCourseId].completed[key]) {
      this.markCompleted(key);
    }

    // Save every 5 seconds or so (throttled by browser usually)
    window.authManager.saveUserData(this.user);
  }

  markCompleted(key) {
    this.user.courses[this.currentCourseId].completed[key] = true;
    if (this.currentLessonElement) {
      this.currentLessonElement.classList.add('completed');
      this.currentLessonElement.querySelector('span').innerText = '✓';
    }
    this.updateProgress();
    window.authManager.saveUserData(this.user);
  }

  updateProgress() {
    const total = this.courseData.sections.reduce((acc, s) => acc + s.lessons.length, 0);
    const completed = Object.keys(this.user.courses[this.currentCourseId].completed).length;
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
    // Auto-expand sections that have visible lessons
    document.querySelectorAll('.section').forEach(sec => {
      const list = sec.querySelector('.lesson-list');
      const hasVisible = list.querySelectorAll('.lesson-item:not(.hidden)').length > 0;
      if (query) {
        list.classList.toggle('active', hasVisible);
      }
    });
  }
}

// Start Auth
window.authManager = new AuthManager();

