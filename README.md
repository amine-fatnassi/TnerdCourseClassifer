# 🎬 Course Classifier

A premium, high-performance web application designed to organize and watch local course materials with ease. Built with a sleek **Neon Cyberpunk** aesthetic, it provides an immersive learning experience directly in your browser.

![Course Classifier UI](./src/assets/hero.png)

## ✨ Features

- **📁 Local Folder Access**: Leverage the **File System Access API** to browse your local course folders without uploading any data.
- **🗂️ Smart Auto-Structuring**: Automatically categorizes your files into **Sections** (folders) and **Lessons** (mp4 files).
- **⏱️ Progress Tracking**: 
  - **Resume Playback**: Saves your exact video timestamp using `localStorage`.
  - **Auto-Completion**: Marks lessons as completed once you finish watching.
  - **Course Progress**: A dynamic progress bar showing your journey status.
- **🎨 Premium Aesthetics**:
  - **Neon Red & Black Theme**: High-contrast, futuristic visuals.
  - **Glassmorphism**: Sleek, blurred sidebars and overlays.
  - **Smooth Animations**: Pulse effects and elegant transitions.
- **🌐 Cross-Browser Fallback**: Works on all modern browsers (Chrome, Edge, Firefox, Safari) using smart detection.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/amine-fatnassi/TnerdCourseClassifer.git
   cd TnerdCourseClassifer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Core**: Vanilla JavaScript (ESM)
- **Styling**: Vanilla CSS (Cyberpunk System)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Storage**: Browser `localStorage`
- **APIs**: File System Access API + HTML5 Video API

## 🛡️ Privacy

Your privacy is paramount. Course Classifier operates entirely on your local machine. No course data, video files, or metadata are ever uploaded to a server.

---

Built with ❤️ by [Antigravity AI](https://github.com/amine-fatnassi)
