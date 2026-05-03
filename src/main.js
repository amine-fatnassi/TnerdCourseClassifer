import './style.css';

// State Management
let courseData = {
  name: '',
  sections: [],
  completedLessons: JSON.parse(localStorage.getItem('completedLessons') || '{}'),
  videoPositions: JSON.parse(localStorage.getItem('videoPositions') || '{}')
};

// DOM Elements
const btnBrowse = document.getElementById('btn-browse');
const dirInput = document.getElementById('dir-input');
const landing = document.getElementById('landing');
const sidebar = document.getElementById('sidebar');
const mainStage = document.getElementById('main-stage');
const courseTree = document.getElementById('course-tree');
const videoPlayer = document.getElementById('video-player');
const lessonTitle = document.getElementById('current-lesson-title');
const sectionTitle = document.getElementById('current-section-title');
const progressBar = document.getElementById('course-progress-bar');
const progressText = document.getElementById('course-progress-text');
const btnMarkDone = document.getElementById('btn-mark-done');

let currentActiveLesson = null;
let currentActiveElement = null;

// Initialize
btnBrowse.addEventListener('click', async () => {
  if ('showDirectoryPicker' in window) {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      courseData.name = directoryHandle.name;
      await scanDirectoryAPI(directoryHandle);
      renderCourse();
      showApp();
    } catch (err) {
      console.error('Directory access denied:', err);
    }
  } else {
    // Fallback for browsers like Firefox/Safari
    dirInput.click();
  }
});

dirInput.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    courseData.name = files[0].webkitRelativePath.split('/')[0];
    scanFilesFallback(files);
    renderCourse();
    showApp();
  }
});

/**
 * Modern API scanning
 */
async function scanDirectoryAPI(handle) {
  const sections = [];
  for await (const [name, entry] of handle.entries()) {
    if (entry.kind === 'directory') {
      const section = { name, lessons: [], handle: entry };
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
      section.lessons.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
      if (section.lessons.length > 0) sections.push(section);
    }
  }
  sections.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
  courseData.sections = sections;
}

/**
 * Fallback scanning for files from input
 */
function scanFilesFallback(files) {
  const sectionsMap = {};
  
  files.forEach(file => {
    const pathParts = file.webkitRelativePath.split('/');
    // Path looks like: CourseName/SectionName/Video.mp4
    if (pathParts.length >= 3 && file.name.endsWith('.mp4')) {
      const sectionName = pathParts[1];
      if (!sectionsMap[sectionName]) {
        sectionsMap[sectionName] = { name: sectionName, lessons: [] };
      }
      sectionsMap[sectionName].lessons.push({
        name: file.name.replace('.mp4', ''),
        fullName: file.name,
        file: file,
        type: 'file'
      });
    }
  });

  const sections = Object.values(sectionsMap);
  sections.forEach(s => {
    s.lessons.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
  });
  sections.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
  courseData.sections = sections;
}

/**
 * Renders the course tree
 */
function renderCourse() {
  courseTree.innerHTML = '';
  courseData.sections.forEach(section => {
    const sectionEl = document.createElement('div');
    sectionEl.className = 'section';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'section-title';
    titleEl.innerHTML = `<span>${section.name}</span> <i class="chevron">▾</i>`;
    
    const lessonList = document.createElement('div');
    lessonList.className = 'lesson-list';
    
    section.lessons.forEach(lesson => {
      const lessonEl = document.createElement('div');
      const key = lesson.type === 'handle' ? lesson.handle.name : lesson.fullName;
      const isCompleted = courseData.completedLessons[key];
      
      lessonEl.className = `lesson-item ${isCompleted ? 'completed' : ''}`;
      lessonEl.innerHTML = `
        <span class="lesson-icon">${isCompleted ? '✓' : '○'}</span>
        <span class="lesson-name">${lesson.name}</span>
      `;
      
      lessonEl.addEventListener('click', () => playLesson(section, lesson, lessonEl));
      lessonList.appendChild(lessonEl);
    });
    
    titleEl.addEventListener('click', () => lessonList.classList.toggle('active'));
    sectionEl.appendChild(titleEl);
    sectionEl.appendChild(lessonList);
    courseTree.appendChild(sectionEl);
  });
  updateProgress();
}

/**
 * Handles playing a lesson
 */
async function playLesson(section, lesson, element) {
  document.querySelectorAll('.lesson-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  
  lessonTitle.innerText = lesson.name;
  sectionTitle.innerText = section.name;
  
  // Get video source
  let url;
  const key = lesson.type === 'handle' ? lesson.handle.name : lesson.fullName;

  if (lesson.type === 'handle') {
    const file = await lesson.handle.getFile();
    url = URL.createObjectURL(file);
  } else {
    url = URL.createObjectURL(lesson.file);
  }
  
  videoPlayer.src = url;
  const lastPos = courseData.videoPositions[key] || 0;
  videoPlayer.currentTime = lastPos;
  videoPlayer.play();
  
  btnMarkDone.classList.remove('hidden');
  currentActiveLesson = lesson;
  currentActiveElement = element;
  
  if (courseData.completedLessons[key]) {
    btnMarkDone.innerText = 'Completed ✓';
    btnMarkDone.disabled = true;
  } else {
    btnMarkDone.innerText = 'Mark as Done';
    btnMarkDone.disabled = false;
  }

  videoPlayer.ontimeupdate = () => {
    courseData.videoPositions[key] = videoPlayer.currentTime;
    localStorage.setItem('videoPositions', JSON.stringify(courseData.videoPositions));
    if (videoPlayer.currentTime / videoPlayer.duration > 0.9 && !courseData.completedLessons[key]) {
      markCompleted(lesson, element);
    }
  };
}

function markCompleted(lesson, element) {
  const key = lesson.type === 'handle' ? lesson.handle.name : lesson.fullName;
  courseData.completedLessons[key] = true;
  localStorage.setItem('completedLessons', JSON.stringify(courseData.completedLessons));
  element.classList.add('completed');
  element.querySelector('.lesson-icon').innerText = '✓';
  updateProgress();
}

function updateProgress() {
  const totalLessons = courseData.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const completedCount = Object.keys(courseData.completedLessons).length; // Simplified for robustness
  
  const percentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
  progressBar.style.width = `${percentage}%`;
  progressText.innerText = `${percentage}% Complete`;
}

function showApp() {
  landing.classList.add('hidden');
  sidebar.classList.remove('hidden');
  mainStage.classList.remove('hidden');
}

btnMarkDone.addEventListener('click', () => {
  if (currentActiveLesson && currentActiveElement) {
    markCompleted(currentActiveLesson, currentActiveElement);
    btnMarkDone.innerText = 'Completed ✓';
    btnMarkDone.disabled = true;
  }
});
