# 🎓 QuizMaster Pro
An interactive, multi-subject quiz platform featuring rich analytics, timed challenges, instant study flashcards, topic filtering, mistake reviews, sound synthesis, and multiple theme options (Light, Dark, and AMOLED).

---

## 📚 Subject Catalog (330 Questions across 30 Modules)

1. 🌲 **Forestry & Wildlife Ecology** (120 Questions • Weeks 1–12)
2. 🌐 **Distributed Systems** (180 Questions • 16 Modules)
   - **Course Assignment Weeks (80 Questions)**:
     - **Week 1**: Fundamentals & Spanning Trees (10 Qs)
     - **Week 2**: Logical & Vector Clocks (10 Qs)
     - **Week 3**: Mutual Exclusion Algorithms (10 Qs)
     - **Week 4**: Deadlocks & Wait-For Graphs (10 Qs)
     - **Week 5**: Termination Detection & Weight-Throwing (10 Qs)
     - **Week 6**: Randomized Algorithms & Leader Election (10 Qs)
     - **Week 7**: MapReduce & Distributed Data Processing (10 Qs)
     - **Week 8**: Distributed Security, Kerberos & SSL (10 Qs)
   - **Practice Weeks (100 Questions)**:
     - **Practice Week 1**: Fundamentals, Models & Leader Election (13 Qs)
     - **Practice Week 2**: Clocks, NTP, Mutual Exclusion & Quorums (13 Qs)
     - **Practice Week 3**: Token Algorithms, Byzantine Faults & Checkpointing (13 Qs)
     - **Practice Week 4**: Deadlocks, DSM & GHS MST Algorithm (13 Qs)
     - **Practice Week 5**: Termination Detection, Message Ordering & Self-Stabilization (12 Qs)
     - **Practice Week 6**: Randomized Algorithms, Chord DHT & GFS Architecture (12 Qs)
     - **Practice Week 7**: MapReduce Framework, HDFS & Apache Spark (12 Qs)
     - **Practice Week 8**: Distributed Security, Kerberos, SSL & Blockchain (12 Qs)
3. ⚡ **Introduction to Internet of Things (IoT)** (30 Questions • Weeks 1–2)

---

## 🚀 Getting Started

### Option 1: Direct in Browser / GitHub Pages
Open `index.html` directly in any modern browser, or deploy to **GitHub Pages** (no build step or backend required).

### Option 2: Local Server with Python
```bash
python -m http.server 3000
```

### Option 3: Local Server with Node / Bun
```bash
npx serve .
```

---

## 🛠️ Project Structure

```
├── index.html              # Main application shell and UI
├── styles.css              # Design system, themes (Light, Dark, AMOLED), and animations
├── app.js                  # Core quiz engine, timer, scoring, sound synthesizer, and UI logic
├── questions-data.js       # Master question repository (330 questions across 3 subjects)
├── build-data.js           # Build script to compile questions-data.js
├── parsed_new_subjects.json# Structured JSON data for Distributed Systems & IoT
├── data/                   # Original course assignment PDF files
├── README.md               # Project documentation
└── .gitignore              # Files ignored by Git
```

---

## 🌟 Key Features
- **3 Quiz Modes**: Standard Practice, Timed Exam Challenge, and Instant Study Flashcards.
- **Section & Topic Filtering**: Select specific assignment or practice weeks, or practice the entire subject bank.
- **Mix & Match Exam**: Create custom cross-subject exams.
- **Analytics & Mistake Review**: Real-time score tracking, speed analytics, topic breakdown bars, and retry-mistakes mode.
- **Audio Feedback**: Built-in Web Audio API sound effects with mute toggle.
- **Custom Question Importer**: Import and test custom JSON question banks.