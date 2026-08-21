# QuizMaster ⚡

An interactive, multi-subject quiz platform featuring rich analytics, timed challenges, instant study flashcards, topic filtering, mistake reviews, sound synthesis, and multiple theme options (Light, Dark, and AMOLED).

---

## 📚 Subject Catalog (190 Questions across 18 Modules)

1. 🌲 **Forestry & Wildlife Ecology** (120 Questions • Weeks 1–12)
2. 🌐 **Distributed Systems** (40 Questions • Weeks 1–4)
3. ⚡ **Introduction to Internet of Things (IoT)** (30 Questions • Weeks 1–2)

---

## 🚀 Getting Started

### Option 1: Direct in Browser / GitHub Pages
Open `index.html` directly in any modern browser, or deploy to **GitHub Pages** (no build step or backend required).

### Option 2: Local Server with Bun
```bash
bun -e "Bun.serve({ port: 3000, fetch(req) { const url = new URL(req.url); let path = url.pathname === '/' ? '/index.html' : url.pathname; const file = Bun.file('.' + path); return new Response(file); } }); console.log('Server running on http://localhost:3000');"
```

### Option 3: Local Server with Python
```bash
python -m http.server 3000
```

---

## 🛠️ Project Structure

```
├── index.html              # Main application shell and UI
├── styles.css              # Design system, themes (Light, Dark, AMOLED), and animations
├── app.js                  # Core quiz engine, timer, scoring, sound synthesizer, and UI logic
├── questions-data.js       # Master question repository (190 questions across 3 subjects)
├── build-data.js           # Build script to generate and compile questions-data.js
├── parsed_new_subjects.json# Structured JSON data for Distributed Systems & IoT
├── data/                   # Original course assignment PDF files
├── README.md               # Project documentation
└── .gitignore              # Files ignored by Git
```

---

## 🌟 Key Features
- **3 Quiz Modes**: Standard Practice, Timed Exam Challenge, and Instant Study Flashcards.
- **Topic & Module Filtering**: Select specific weeks/topics or practice the entire subject bank.
- **Mix & Match Exam**: Create custom cross-subject exams.
- **Analytics & Mistake Review**: Real-time score tracking, speed analytics, topic breakdown bars, and retry-mistakes mode.
- **Audio Feedback**: Built-in Web Audio API sound effects with mute toggle.
- **Custom Question Importer**: Import and test custom JSON question banks.
