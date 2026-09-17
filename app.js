/**
 * QuizMaster - Multi-Subject Quiz Engine (Font Awesome Icons Version)
 * Modern, interactive, accessible quiz application with multi-subject support,
 * timed challenges, instant study flashcards, question palette navigation,
 * comprehensive analytics, audio feedback, and custom question import.
 */

/* global QUIZ_SUBJECTS, QUIZ_QUESTIONS */

const LETTERS = ["A", "B", "C", "D"];
const STORAGE_KEYS = {
  THEME: "quizmaster_theme",
  SOUND: "quizmaster_sound",
  STATS: "quizmaster_study_stats",
  CUSTOM_SUBJECTS: "quizmaster_custom_subjects",
  LEGACY_THEME: "omniquiz_theme",
  LEGACY_SOUND: "omniquiz_sound",
  LEGACY_STATS: "omniquiz_study_stats",
  LEGACY_CUSTOM_SUBJECTS: "omniquiz_custom_subjects"
};

// -------------------------------------------------------------
// ICON RENDERING HELPER (Font Awesome)
// -------------------------------------------------------------
function renderIconHtml(icon) {
  if (!icon) return `<i class="fa-solid fa-book-open" aria-hidden="true"></i>`;
  if (icon.includes("fa-")) {
    return `<i class="${icon}" aria-hidden="true"></i>`;
  }
  // Mapping for legacy or emoji fallbacks
  const iconMap = {
    "🌲": "fa-solid fa-tree",
    "⚡": "fa-solid fa-laptop-code",
    "🔬": "fa-solid fa-flask-vial",
    "🌍": "fa-solid fa-earth-americas",
    "🧩": "fa-solid fa-calculator",
    "⚖️": "fa-solid fa-scale-balanced",
    "✨": "fa-solid fa-wand-magic-sparkles",
    "🧠": "fa-solid fa-brain",
    "📚": "fa-solid fa-book-bookmark",
    "📝": "fa-solid fa-list-check"
  };
  const faClass = iconMap[icon] || "fa-solid fa-book-open";
  return `<i class="${faClass}" aria-hidden="true"></i>`;
}

// -------------------------------------------------------------
// AUDIO SYNTHESIZER (Pure Web Audio API)
// -------------------------------------------------------------
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type = "sine", duration = 0.08, gainVal = 0.1) {
  if (!appState.soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio non-critical fallback
  }
}

const soundEffects = {
  click() {
    playTone(700, "sine", 0.04, 0.08);
  },
  flag() {
    playTone(950, "triangle", 0.06, 0.1);
  },
  correct() {
    if (!appState.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        setTimeout(() => playTone(freq, "sine", 0.12, 0.09), i * 70);
      });
    } catch {}
  },
  incorrect() {
    if (!appState.soundEnabled) return;
    try {
      playTone(220, "sawtooth", 0.18, 0.08);
      setTimeout(() => playTone(180, "sawtooth", 0.22, 0.08), 80);
    } catch {}
  },
  timerWarn() {
    playTone(880, "sine", 0.08, 0.12);
  },
  fanfare() {
    if (!appState.soundEnabled) return;
    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        setTimeout(() => playTone(freq, "triangle", 0.22, 0.12), i * 90);
      });
    } catch {}
  }
};

// -------------------------------------------------------------
// CONFETTI CELEBRATION EFFECT (Canvas Particles)
// -------------------------------------------------------------
const confettiCanvas = document.getElementById("confettiCanvas");
let confettiAnimationId = null;

function triggerConfetti() {
  if (!confettiCanvas) return;
  const ctx = confettiCanvas.getContext("2d");
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const colors = ["#ffe34f", "#53e7df", "#ccff66", "#ff7aa8", "#ff9a3d", "#6fb3ff"];
  const particles = Array.from({ length: 90 }).map(() => ({
    x: window.innerWidth * (0.3 + Math.random() * 0.4),
    y: window.innerHeight * 0.45,
    vx: (Math.random() - 0.5) * 14,
    vy: (Math.random() - 0.7) * 16,
    size: 6 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 12,
    alpha: 1
  }));

  const startTime = Date.now();
  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

  function frame() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.rotSpeed;
      p.alpha = Math.max(0, 1 - elapsed / 2600);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (elapsed < 2600) {
      confettiAnimationId = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  confettiAnimationId = requestAnimationFrame(frame);
}

// -------------------------------------------------------------
// APP STATE & STORAGE
// -------------------------------------------------------------
const appState = {
  subjects: {},
  activeSubjectId: "forestry",
  activeCategoryFilter: "all",
  searchQuery: "",

  quizQuestions: [],
  answersById: {},
  flagsById: {},
  currentIndex: 0,
  quizMode: "practice",
  isSubmitted: false,
  result: null,

  timerInterval: null,
  timeRemaining: 0,
  totalDuration: 0,
  quizStartTime: null,

  soundEnabled: true,
  studyStats: {
    totalQuizzes: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    lastStudyDate: null,
    streakDays: 0,
    subjectBests: {}
  }
};

// -------------------------------------------------------------
// DOM REFERENCES
// -------------------------------------------------------------
const navHomeBtn = document.getElementById("navHomeBtn");
const crumbHub = document.getElementById("crumbHub");
const navBreadcrumbs = document.getElementById("navBreadcrumbs");
const soundToggleBtn = document.getElementById("soundToggleBtn");
const soundIcon = document.getElementById("soundIcon");
const streakCount = document.getElementById("streakCount");
const overallAcc = document.getElementById("overallAcc");
const themeSelect = document.getElementById("themeSelect");

const subjectHubPanel = document.getElementById("subjectHubPanel");
const setupPanel = document.getElementById("setupPanel");
const quizPanel = document.getElementById("quizPanel");
const resultPanel = document.getElementById("resultPanel");

const statTotalQuizzes = document.getElementById("statTotalQuizzes");
const statQuestionsAnswered = document.getElementById("statQuestionsAnswered");
const statAvgAccuracy = document.getElementById("statAvgAccuracy");
const statMasteredCount = document.getElementById("statMasteredCount");
const subjectSearchInput = document.getElementById("subjectSearchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const categoryChipsList = document.getElementById("categoryChipsList");
const subjectCardsGrid = document.getElementById("subjectCardsGrid");
const launchMegaMixBtn = document.getElementById("launchMegaMixBtn");
const openImportModalBtn = document.getElementById("openImportModalBtn");

const backToHubBtn = document.getElementById("backToHubBtn");
const setupSubjectBadge = document.getElementById("setupSubjectBadge");
const setupSubjectIcon = document.getElementById("setupSubjectIcon");
const setupSubjectTitle = document.getElementById("setupSubjectTitle");
const setupSubjectDesc = document.getElementById("setupSubjectDesc");
const allTopicsToggle = document.getElementById("allTopicsToggle");
const allTopicsToggleLabel = document.getElementById("allTopicsToggleLabel");
const topicCheckboxList = document.getElementById("topicCheckboxList");
const selectAllTopicsBtn = document.getElementById("selectAllTopicsBtn");
const deselectAllTopicsBtn = document.getElementById("deselectAllTopicsBtn");
const modeSelect = document.getElementById("modeSelect");
const timerControl = document.getElementById("timerControl");
const timerDurationSelect = document.getElementById("timerDurationSelect");
const countSelect = document.getElementById("countSelect");
const orderSelect = document.getElementById("orderSelect");
const optionOrderSelect = document.getElementById("optionOrderSelect");
const questionPoolInfo = document.getElementById("questionPoolInfo");
const startBtn = document.getElementById("startBtn");

const quizSubjectTagIcon = document.getElementById("quizSubjectTagIcon");
const quizSubjectTagTitle = document.getElementById("quizSubjectTagTitle");
const progressLabel = document.getElementById("progressLabel");
const metaLabel = document.getElementById("metaLabel");
const quizTimerBadge = document.getElementById("quizTimerBadge");
const timerDisplay = document.getElementById("timerDisplay");
const liveScore = document.getElementById("liveScore");
const focusModeBtn = document.getElementById("focusModeBtn");
const focusModeIcon = document.getElementById("focusModeIcon");
const focusModeLabel = document.getElementById("focusModeLabel");
const togglePaletteBtn = document.getElementById("togglePaletteBtn");
const questionPaletteDrawer = document.getElementById("questionPaletteDrawer");
const closePaletteBtn = document.getElementById("closePaletteBtn");
const paletteGrid = document.getElementById("paletteGrid");
const progressBar = document.getElementById("progressBar");
const currentTopicTag = document.getElementById("currentTopicTag");
const flagQuestionBtn = document.getElementById("flagQuestionBtn");
const questionText = document.getElementById("questionText");
const instantFeedbackBox = document.getElementById("instantFeedbackBox");
const instantFeedbackStatus = document.getElementById("instantFeedbackStatus");
const instantFeedbackExplanation = document.getElementById("instantFeedbackExplanation");
const optionList = document.getElementById("optionList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const clearAnswerBtn = document.getElementById("clearAnswerBtn");
const submitBtn = document.getElementById("submitBtn");

const scoreCircle = document.getElementById("scoreCircle");
const resultScorePercent = document.getElementById("resultScorePercent");
const resultGrade = document.getElementById("resultGrade");
const resultSubjectCategory = document.getElementById("resultSubjectCategory");
const resultHeading = document.getElementById("resultHeading");
const resultSummary = document.getElementById("resultSummary");
const resultBest = document.getElementById("resultBest");
const metricCorrect = document.getElementById("metricCorrect");
const metricIncorrect = document.getElementById("metricIncorrect");
const metricUnanswered = document.getElementById("metricUnanswered");
const metricTimeSpent = document.getElementById("metricTimeSpent");
const metricAvgSpeed = document.getElementById("metricAvgSpeed");
const topicBreakdownList = document.getElementById("topicBreakdownList");
const retryMistakesBtn = document.getElementById("retryMistakesBtn");
const mistakeCountBadge = document.getElementById("mistakeCountBadge");
const retryBtn = document.getElementById("retryBtn");
const reviewBtn = document.getElementById("reviewBtn");
const reviewCorrectBtn = document.getElementById("reviewCorrectBtn");
const returnToHubBtn = document.getElementById("returnToHubBtn");
const mistakeList = document.getElementById("mistakeList");
const correctList = document.getElementById("correctList");

const megaMixModal = document.getElementById("megaMixModal");
const closeMegaMixModalBtn = document.getElementById("closeMegaMixModalBtn");
const cancelMegaMixBtn = document.getElementById("cancelMegaMixBtn");
const megaSubjectPicker = document.getElementById("megaSubjectPicker");
const megaCountSelect = document.getElementById("megaCountSelect");
const megaModeSelect = document.getElementById("megaModeSelect");
const startMegaQuizBtn = document.getElementById("startMegaQuizBtn");

const importModal = document.getElementById("importModal");
const closeImportModalBtn = document.getElementById("closeImportModalBtn");
const cancelImportBtn = document.getElementById("cancelImportBtn");
const importSubjectTitle = document.getElementById("importSubjectTitle");
const importSubjectCategory = document.getElementById("importSubjectCategory");
const importSubjectIcon = document.getElementById("importSubjectIcon");
const importSubjectDesc = document.getElementById("importSubjectDesc");
const importQuestionsJson = document.getElementById("importQuestionsJson");
const loadSampleJsonBtn = document.getElementById("loadSampleJsonBtn");
const importErrorMsg = document.getElementById("importErrorMsg");
const saveImportedSubjectBtn = document.getElementById("saveImportedSubjectBtn");

// -------------------------------------------------------------
// HELPER UTILITIES
// -------------------------------------------------------------
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getGradeInfo(percent) {
  if (percent >= 95) return { grade: "Exceptional", title: "Grandmaster Mastery" };
  if (percent >= 85) return { grade: "Excellent", title: "Outstanding Performance" };
  if (percent >= 70) return { grade: "Great", title: "Solid Understanding" };
  if (percent >= 50) return { grade: "Good Effort", title: "Making Progress" };
  return { grade: "Needs Review", title: "Time for Focused Revision" };
}

// -------------------------------------------------------------
// STORAGE & SETTINGS MANAGEMENT
// -------------------------------------------------------------
function loadSettingsAndStats() {
  try {
    const savedTheme =
      localStorage.getItem(STORAGE_KEYS.THEME) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_THEME) ||
      "light";
    applyTheme(savedTheme);
  } catch {}

  try {
    const soundVal =
      localStorage.getItem(STORAGE_KEYS.SOUND) ??
      localStorage.getItem(STORAGE_KEYS.LEGACY_SOUND);
    appState.soundEnabled = soundVal !== "false";
    soundIcon.className = appState.soundEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
  } catch {}

  try {
    const statsJson =
      localStorage.getItem(STORAGE_KEYS.STATS) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_STATS);
    if (statsJson) {
      appState.studyStats = JSON.parse(statsJson);
    }
  } catch {}

  updateStreak();
  updateHeaderStats();
}

function applyTheme(theme) {
  const safe = ["light", "dark", "amoled"].includes(theme) ? theme : "light";
  document.body.classList.remove("theme-light", "theme-dark", "theme-amoled");
  document.body.classList.add(`theme-${safe}`);
  themeSelect.value = safe;
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, safe);
  } catch {}
}

function updateStreak() {
  const today = new Date().toISOString().split("T")[0];
  const last = appState.studyStats.lastStudyDate;

  if (!last) {
    appState.studyStats.streakDays = 1;
    appState.studyStats.lastStudyDate = today;
  } else if (last !== today) {
    const lastDate = new Date(last);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      appState.studyStats.streakDays += 1;
    } else if (diffDays > 1) {
      appState.studyStats.streakDays = 1;
    }
    appState.studyStats.lastStudyDate = today;
  }
  saveStats();
}

function saveStats() {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(appState.studyStats));
  } catch {}
}

function updateHeaderStats() {
  const stats = appState.studyStats;
  streakCount.textContent = stats.streakDays || 0;
  const acc = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
  overallAcc.textContent = `${acc}%`;

  statTotalQuizzes.textContent = stats.totalQuizzes || 0;
  statQuestionsAnswered.textContent = stats.totalQuestions || 0;
  statAvgAccuracy.textContent = `${acc}%`;

  let mastered = 0;
  if (stats.subjectBests) {
    Object.values(stats.subjectBests).forEach((pct) => {
      if (pct >= 80) mastered += 1;
    });
  }
  statMasteredCount.textContent = mastered;
}

// -------------------------------------------------------------
// SUBJECT REGISTRY INITIALIZATION
// -------------------------------------------------------------
function initializeSubjects() {
  appState.subjects = {};

  if (window.QUIZ_SUBJECTS && typeof window.QUIZ_SUBJECTS === "object") {
    Object.keys(window.QUIZ_SUBJECTS).forEach((key) => {
      appState.subjects[key] = { ...window.QUIZ_SUBJECTS[key] };
    });
  } else if (Array.isArray(window.QUIZ_QUESTIONS)) {
    appState.subjects.forestry = {
      id: "forestry",
      title: "Forestry & Wildlife Ecology",
      category: "Natural & Environmental Sciences",
      icon: "fa-solid fa-tree",
      iconClass: "fa-solid fa-tree",
      description: "Comprehensive question bank covering silviculture, ecology and forest conservation.",
      topicType: "Week",
      topics: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Week ${i + 1}` })),
      questions: window.QUIZ_QUESTIONS
    };
  }

  try {
    const customJson =
      localStorage.getItem(STORAGE_KEYS.CUSTOM_SUBJECTS) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_CUSTOM_SUBJECTS);
    if (customJson) {
      const customSubjects = JSON.parse(customJson);
      Object.keys(customSubjects).forEach((id) => {
        appState.subjects[id] = customSubjects[id];
      });
    }
  } catch {}
}

// -------------------------------------------------------------
// PANEL NAVIGATION & BREADCRUMBS
// -------------------------------------------------------------
function showPanel(panel) {
  if (panel !== quizPanel) {
    disableFocusMode();
  }
  [subjectHubPanel, setupPanel, quizPanel, resultPanel].forEach((p) => p.classList.add("hidden"));
  panel.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

  navBreadcrumbs.innerHTML = "";
  const hubCrumb = document.createElement("span");
  hubCrumb.className = `breadcrumb-item ${panel === subjectHubPanel ? "active" : ""}`;
  hubCrumb.innerHTML = `<i class="fa-solid fa-house" aria-hidden="true"></i> Hub`;
  hubCrumb.style.cursor = panel !== subjectHubPanel ? "pointer" : "default";
  hubCrumb.addEventListener("click", () => {
    if (panel !== subjectHubPanel) {
      if (panel === quizPanel && !appState.isSubmitted) {
        if (!window.confirm("Abandon current quiz attempt and return to Hub?")) return;
        stopTimer();
      }
      openSubjectHub();
    }
  });
  navBreadcrumbs.appendChild(hubCrumb);

  if (panel === setupPanel || panel === quizPanel || panel === resultPanel) {
    const separator = document.createElement("span");
    separator.innerHTML = `<i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; opacity: 0.5;"></i>`;
    separator.className = "text-divider";
    navBreadcrumbs.appendChild(separator);

    const subCrumb = document.createElement("span");
    subCrumb.className = `breadcrumb-item ${panel === setupPanel ? "active" : ""}`;
    const subject = appState.subjects[appState.activeSubjectId] || { title: "Custom Quiz", iconClass: "fa-solid fa-book-open" };
    subCrumb.innerHTML = `${renderIconHtml(subject.iconClass || subject.icon)} ${subject.shortTitle || subject.title || "Quiz"}`;
    if (panel !== setupPanel) {
      subCrumb.style.cursor = "pointer";
      subCrumb.addEventListener("click", () => {
        if (panel === quizPanel && !appState.isSubmitted) {
          if (!window.confirm("Leave current quiz and adjust settings?")) return;
          stopTimer();
        }
        openQuizSetup(appState.activeSubjectId);
      });
    }
    navBreadcrumbs.appendChild(subCrumb);
  }

  if (panel === quizPanel) {
    const separator2 = document.createElement("span");
    separator2.innerHTML = `<i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; opacity: 0.5;"></i>`;
    separator2.className = "text-divider";
    navBreadcrumbs.appendChild(separator2);

    const quizCrumb = document.createElement("span");
    quizCrumb.className = "breadcrumb-item active";
    quizCrumb.innerHTML = `<i class="fa-solid fa-gamepad"></i> Arena`;
    navBreadcrumbs.appendChild(quizCrumb);
  } else if (panel === resultPanel) {
    const separator2 = document.createElement("span");
    separator2.innerHTML = `<i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; opacity: 0.5;"></i>`;
    separator2.className = "text-divider";
    navBreadcrumbs.appendChild(separator2);

    const resCrumb = document.createElement("span");
    resCrumb.className = "breadcrumb-item active";
    resCrumb.innerHTML = `<i class="fa-solid fa-square-poll-vertical"></i> Results`;
    navBreadcrumbs.appendChild(resCrumb);
  }
}

function openSubjectHub() {
  renderSubjectHub();
  updateHeaderStats();
  showPanel(subjectHubPanel);
}

// -------------------------------------------------------------
// SUBJECT HUB RENDERING & SEARCH
// -------------------------------------------------------------
function renderSubjectHub() {
  subjectCardsGrid.innerHTML = "";
  const query = appState.searchQuery.toLowerCase().trim();
  const catFilter = appState.activeCategoryFilter;

  const subjectEntries = Object.values(appState.subjects);

  const filtered = subjectEntries.filter((subject) => {
    if (catFilter !== "all") {
      if (catFilter === "Custom" && !subject.isCustom) return false;
      if (catFilter !== "Custom" && subject.category !== catFilter) return false;
    }
    if (query) {
      const matchTitle = (subject.title || "").toLowerCase().includes(query);
      const matchDesc = (subject.description || "").toLowerCase().includes(query);
      const matchCat = (subject.category || "").toLowerCase().includes(query);
      return matchTitle || matchDesc || matchCat;
    }
    return true;
  });

  if (filtered.length === 0) {
    subjectCardsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem;">
        <p style="font-size: 2.2rem; margin: 0;"><i class="fa-solid fa-magnifying-glass text-brand-orange"></i></p>
        <h3 style="margin-top: 0.6rem;">No subjects found</h3>
        <p class="muted">Try adjusting your search terms or filter chips.</p>
        <button id="resetSearchBtn" class="btn btn-subtle" style="margin-top: 0.8rem;">
          <i class="fa-solid fa-arrow-rotate-left"></i> Reset Filters
        </button>
      </div>
    `;
    const resetBtn = document.getElementById("resetSearchBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        subjectSearchInput.value = "";
        appState.searchQuery = "";
        clearSearchBtn.classList.add("hidden");
        appState.activeCategoryFilter = "all";
        updateCategoryChipActiveState();
        renderSubjectHub();
      });
    }
    return;
  }

  filtered.forEach((subject) => {
    const card = document.createElement("article");
    card.className = "subject-card";

    const qCount = Array.isArray(subject.questions) ? subject.questions.length : 0;
    const topicCount = Array.isArray(subject.topics) ? subject.topics.length : 0;
    const bestScore = appState.studyStats.subjectBests ? appState.studyStats.subjectBests[subject.id] : null;

    card.innerHTML = `
      <div class="subject-card-head">
        <span class="subject-card-icon">${renderIconHtml(subject.iconClass || subject.icon)}</span>
        <span class="subject-category-badge">${subject.category || "General"}</span>
      </div>
      <h2>${subject.title}</h2>
      <p class="subject-card-desc">${subject.description || "Interactive quiz module."}</p>
      <div class="subject-card-stats">
        <span class="stat-badge"><i class="fa-solid fa-list-ol"></i> ${qCount} Questions</span>
        <span class="stat-badge"><i class="fa-solid fa-folder-tree"></i> ${topicCount} ${subject.topicType || "Topic"}s</span>
        ${
          typeof bestScore === "number"
            ? `<span class="stat-badge stat-badge-best"><i class="fa-solid fa-award"></i> Best: ${bestScore}%</span>`
            : `<span class="stat-badge muted"><i class="fa-regular fa-circle"></i> Unattempted</span>`
        }
      </div>
      <div class="subject-card-actions">
        <button class="btn btn-secondary btn-quick" data-subject="${subject.id}" type="button">
          <i class="fa-solid fa-bolt"></i> Quick 10Q
        </button>
        <button class="btn btn-primary btn-customize" data-subject="${subject.id}" type="button">
          <i class="fa-solid fa-sliders"></i> Customize
        </button>
      </div>
    `;

    card.querySelector(".btn-quick").addEventListener("click", () => {
      soundEffects.click();
      quickStartSubjectQuiz(subject.id);
    });

    card.querySelector(".btn-customize").addEventListener("click", () => {
      soundEffects.click();
      openQuizSetup(subject.id);
    });

    subjectCardsGrid.appendChild(card);
  });
}

function updateCategoryChipActiveState() {
  const chips = categoryChipsList.querySelectorAll(".chip-filter");
  chips.forEach((chip) => {
    if (chip.getAttribute("data-category") === appState.activeCategoryFilter) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
  });
}

// -------------------------------------------------------------
// QUIZ SETUP CONTROLLER
// -------------------------------------------------------------
function openQuizSetup(subjectId) {
  appState.activeSubjectId = subjectId;
  const subject = appState.subjects[subjectId];
  if (!subject) return;

  setupSubjectIcon.innerHTML = renderIconHtml(subject.iconClass || subject.icon);
  setupSubjectTitle.textContent = subject.title || "Quiz Setup";
  setupSubjectDesc.textContent = subject.description || "";
  allTopicsToggleLabel.textContent = `All ${subject.topicType || "Topic"}s`;

  renderTopicCheckboxes(subject);
  updatePoolInfo();
  showPanel(setupPanel);
}

function renderTopicCheckboxes(subject) {
  topicCheckboxList.innerHTML = "";
  const topics = Array.isArray(subject.topics) ? subject.topics : [];

  let currentSection = null;

  topics.forEach((topic) => {
    if (topic.section && topic.section !== currentSection) {
      currentSection = topic.section;
      const sectionHeader = document.createElement("div");
      sectionHeader.className = "topic-section-title";
      sectionHeader.innerHTML = `<i class="${topic.sectionIcon || 'fa-solid fa-layer-group'}" aria-hidden="true"></i> <span>${topic.section}</span>`;
      topicCheckboxList.appendChild(sectionHeader);
    }

    const chip = document.createElement("label");
    chip.className = "topic-chip";
    if (topic.section === "Practice Weeks") {
      chip.classList.add("topic-chip-practice");
    }

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = String(topic.id);
    input.checked = false;

    const span = document.createElement("span");
    span.textContent = topic.name || `${subject.topicType || "Topic"} ${topic.id}`;

    chip.appendChild(input);
    chip.appendChild(span);
    topicCheckboxList.appendChild(chip);
  });

  allTopicsToggle.checked = true;
}

function getSelectedTopicIds() {
  if (allTopicsToggle.checked) return "all";
  const checked = [...topicCheckboxList.querySelectorAll("input[type='checkbox']:checked")];
  return checked.map((input) => (isNaN(Number(input.value)) ? input.value : Number(input.value)));
}

function getFilteredQuestionPool() {
  const subject = appState.subjects[appState.activeSubjectId];
  if (!subject || !Array.isArray(subject.questions)) return [];

  const selectedTopics = getSelectedTopicIds();
  if (selectedTopics === "all") return [...subject.questions];

  return subject.questions.filter((q) => {
    const qTopic = q.topicId !== undefined ? q.topicId : q.week;
    return selectedTopics.includes(qTopic);
  });
}

function updatePoolInfo() {
  const pool = getFilteredQuestionPool();
  const requested = Number(countSelect.value);
  const actual = Math.min(requested, pool.length);
  const selectedTopics = getSelectedTopicIds();

  if (selectedTopics !== "all" && selectedTopics.length === 0) {
    questionPoolInfo.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-danger"></i> Please select at least one topic or enable All Topics.`;
    startBtn.disabled = true;
    return;
  }

  if (pool.length === 0) {
    questionPoolInfo.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-danger"></i> No questions available for the selected topic filter.`;
    startBtn.disabled = true;
    return;
  }

  startBtn.disabled = false;
  if (requested > pool.length) {
    questionPoolInfo.innerHTML = `<i class="fa-solid fa-circle-info"></i> Pool has ${pool.length} questions available. Quiz will launch with ${pool.length}.`;
  } else {
    questionPoolInfo.innerHTML = `<i class="fa-solid fa-circle-check text-ok"></i> Ready! Quiz will select ${actual} questions from pool of ${pool.length}.`;
  }
}

function quickStartSubjectQuiz(subjectId) {
  appState.activeSubjectId = subjectId;
  const subject = appState.subjects[subjectId];
  if (!subject || !Array.isArray(subject.questions)) return;

  const pool = [...subject.questions];
  const subset = shuffle(pool).slice(0, Math.min(10, pool.length));
  const questions = subset.map((q) => buildDisplayQuestion(q, true));
  launchQuizWithQuestions(questions, "practice", 0);
}

// -------------------------------------------------------------
// QUIZ ARENA ENGINE
// -------------------------------------------------------------
function buildDisplayQuestion(question, shuffleOptions = true) {
  const isTrueFalse =
    Array.isArray(question.options) &&
    question.options.length === 2 &&
    (question.options.includes("True") || question.options.includes("False"));

  if (!shuffleOptions || isTrueFalse) {
    const rawAnswers = Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0
      ? question.correctAnswers
      : [question.answerIndex !== undefined ? question.answerIndex : 0];
    return {
      ...question,
      displayOptions: [...question.options],
      answerDisplayIndex: question.answerIndex !== undefined ? question.answerIndex : 0,
      displayCorrectAnswers: rawAnswers
    };
  }

  const indices = question.options.map((_, i) => i);
  const shuffledIndices = shuffle(indices);
  const displayOptions = shuffledIndices.map((i) => question.options[i]);
  const answerDisplayIndex = shuffledIndices.indexOf(
    question.answerIndex !== undefined ? question.answerIndex : 0
  );

  const rawAnswers = Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0
    ? question.correctAnswers
    : [question.answerIndex !== undefined ? question.answerIndex : 0];

  const displayCorrectAnswers = rawAnswers
    .map((origIdx) => shuffledIndices.indexOf(origIdx))
    .filter((idx) => idx !== -1);

  return {
    ...question,
    displayOptions,
    answerDisplayIndex: answerDisplayIndex !== -1 ? answerDisplayIndex : 0,
    displayCorrectAnswers: displayCorrectAnswers.length > 0 ? displayCorrectAnswers : [0]
  };
}

function startQuizFromSetup() {
  const pool = getFilteredQuestionPool();
  if (pool.length === 0) return;

  const requestedCount = Number(countSelect.value);
  const qOrder = orderSelect.value;
  const optOrder = optionOrderSelect.value;
  const quizMode = modeSelect.value;

  const orderedPool = qOrder === "random" ? shuffle(pool) : pool;
  const takeCount = Math.min(requestedCount, orderedPool.length);
  const rawSubset = orderedPool.slice(0, takeCount);

  const finalQuestions = rawSubset.map((q) => buildDisplayQuestion(q, optOrder === "random"));

  let durationSeconds = 0;
  if (quizMode === "timed") {
    const val = timerDurationSelect.value;
    durationSeconds = val === "auto" ? finalQuestions.length * 45 : Number(val);
  }

  launchQuizWithQuestions(finalQuestions, quizMode, durationSeconds);
}

function launchQuizWithQuestions(questions, mode = "practice", durationSeconds = 0) {
  // Ensure every question has displayOptions and displayCorrectAnswers configured
  const preparedQuestions = questions.map((q) => {
    if (Array.isArray(q.displayOptions) && Array.isArray(q.displayCorrectAnswers)) {
      return q;
    }
    return buildDisplayQuestion(q, false);
  });

  appState.quizQuestions = preparedQuestions;
  appState.quizMode = mode;
  appState.currentIndex = 0;
  appState.isSubmitted = false;
  appState.result = null;
  appState.answersById = {};
  appState.flagsById = {};
  appState.quizStartTime = Date.now();

  preparedQuestions.forEach((q) => {
    appState.answersById[q.id] = null;
    appState.flagsById[q.id] = false;
  });

  const subject = appState.subjects[appState.activeSubjectId] || { iconClass: "fa-solid fa-book-open", shortTitle: "Quiz" };
  quizSubjectTagIcon.innerHTML = renderIconHtml(subject.iconClass || subject.icon);
  quizSubjectTagTitle.textContent = subject.shortTitle || subject.title || "Arena";

  if (mode === "timed" && durationSeconds > 0) {
    quizTimerBadge.classList.remove("hidden");
    startTimer(durationSeconds);
  } else {
    quizTimerBadge.classList.add("hidden");
    stopTimer();
  }

  instantFeedbackBox.classList.add("hidden");
  questionPaletteDrawer.classList.add("hidden");

  renderActiveQuestion();
  renderQuestionPalette();
  enableFocusMode();
  showPanel(quizPanel);
  soundEffects.click();
}

// -------------------------------------------------------------
// FOCUS MODE CONTROLLER
// -------------------------------------------------------------
function enableFocusMode() {
  document.body.classList.add("focus-mode");
  if (focusModeBtn) {
    focusModeBtn.classList.add("active");
    if (focusModeIcon) focusModeIcon.className = "fa-solid fa-compress";
    if (focusModeLabel) focusModeLabel.textContent = "Focus";
    focusModeBtn.setAttribute("title", "Focus Mode is ON. Click to show navbar.");
  }
}

function disableFocusMode() {
  document.body.classList.remove("focus-mode");
  if (focusModeBtn) {
    focusModeBtn.classList.remove("active");
    if (focusModeIcon) focusModeIcon.className = "fa-solid fa-expand";
    if (focusModeLabel) focusModeLabel.textContent = "Focus";
    focusModeBtn.setAttribute("title", "Click to enter Focus Mode (hide navbar).");
  }
}

function toggleFocusMode() {
  if (document.body.classList.contains("focus-mode")) {
    disableFocusMode();
  } else {
    enableFocusMode();
  }
}

// -------------------------------------------------------------
// TIMER ENGINE
// -------------------------------------------------------------
function startTimer(durationSeconds) {
  stopTimer();
  appState.totalDuration = durationSeconds;
  appState.timeRemaining = durationSeconds;
  updateTimerUI();

  appState.timerInterval = setInterval(() => {
    appState.timeRemaining -= 1;
    updateTimerUI();

    if (appState.timeRemaining === 60 || appState.timeRemaining === 10) {
      soundEffects.timerWarn();
    }

    if (appState.timeRemaining <= 0) {
      stopTimer();
      alert("Time is up! Submitting your quiz now.");
      submitQuiz(true);
    }
  }, 1000);
}

function stopTimer() {
  if (appState.timerInterval) {
    clearInterval(appState.timerInterval);
    appState.timerInterval = null;
  }
}

function updateTimerUI() {
  timerDisplay.textContent = formatTime(Math.max(0, appState.timeRemaining));
  if (appState.timeRemaining <= 60) {
    quizTimerBadge.classList.add("warning");
  } else {
    quizTimerBadge.classList.remove("warning");
  }
}

// -------------------------------------------------------------
// IN-QUIZ QUESTION RENDERING
// -------------------------------------------------------------
function renderActiveQuestion() {
  const total = appState.quizQuestions.length;
  if (total === 0) return;

  const current = appState.quizQuestions[appState.currentIndex];
  const selected = appState.answersById[current.id];
  const isFlagged = appState.flagsById[current.id];

  progressLabel.textContent = `Question ${appState.currentIndex + 1} of ${total}`;
  metaLabel.textContent = current.topicName || `Topic ${current.topicId || ""}`;
  currentTopicTag.textContent = current.topicName || "Question";

  const progressPercent = ((appState.currentIndex + 1) / total) * 100;
  progressBar.style.width = `${progressPercent}%`;

  const answered = Object.values(appState.answersById).filter((v) => v !== null).length;
  liveScore.textContent = `Answered: ${answered}/${total}`;

  if (isFlagged) {
    flagQuestionBtn.classList.add("active");
    flagQuestionBtn.innerHTML = `<i id="flagIcon" class="fa-solid fa-bookmark text-brand-orange"></i> <span id="flagLabel">Bookmarked</span>`;
  } else {
    flagQuestionBtn.classList.remove("active");
    flagQuestionBtn.innerHTML = `<i id="flagIcon" class="fa-regular fa-bookmark"></i> <span id="flagLabel">Bookmark</span>`;
  }

  questionText.textContent = current.question;

  optionList.innerHTML = "";
  const options = current.displayOptions || current.options;
  const correctIndices = current.displayCorrectAnswers || [current.answerDisplayIndex];

  options.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";

    const badge = document.createElement("span");
    badge.className = "option-badge";
    badge.textContent = LETTERS[idx] || String(idx + 1);

    const label = document.createElement("span");
    label.className = "option-text";
    label.textContent = optText;

    btn.appendChild(badge);
    btn.appendChild(label);

    if (selected === idx) {
      btn.classList.add("selected");
    }

    if (appState.isSubmitted || (appState.quizMode === "study" && selected !== null)) {
      if (correctIndices.includes(idx)) {
        btn.classList.add("correct");
      } else if (selected === idx && !correctIndices.includes(selected)) {
        btn.classList.add("incorrect");
      }
    }

    btn.addEventListener("click", () => {
      handleOptionSelect(idx);
    });

    optionList.appendChild(btn);
  });

  if (appState.quizMode === "study" && selected !== null) {
    const isCorrect = correctIndices.includes(selected);
    instantFeedbackBox.className = `instant-feedback-box ${isCorrect ? "correct" : "incorrect"}`;
    instantFeedbackStatus.innerHTML = isCorrect
      ? `<i class="fa-solid fa-circle-check text-ok"></i> Correct!`
      : `<i class="fa-solid fa-circle-xmark text-danger"></i> Incorrect`;
    
    const correctAnswersText = correctIndices.map((i) => `(${LETTERS[i]}) ${options[i]}`).join(", ");
    instantFeedbackExplanation.textContent =
      current.explanation || `The correct answer is ${correctAnswersText}.`;
    instantFeedbackBox.classList.remove("hidden");
  } else {
    instantFeedbackBox.classList.add("hidden");
  }

  prevBtn.disabled = appState.currentIndex === 0;
  nextBtn.disabled = appState.currentIndex === total - 1;

  updatePaletteHighlight();
}

function handleOptionSelect(optionIndex) {
  if (appState.isSubmitted) return;
  const current = appState.quizQuestions[appState.currentIndex];
  appState.answersById[current.id] = optionIndex;

  const correctIndices = current.displayCorrectAnswers || [current.answerDisplayIndex];
  if (appState.quizMode === "study") {
    if (correctIndices.includes(optionIndex)) {
      soundEffects.correct();
    } else {
      soundEffects.incorrect();
    }
  } else {
    soundEffects.click();
  }

  renderActiveQuestion();
  renderQuestionPalette();
}

function clearCurrentAnswer() {
  if (appState.isSubmitted) return;
  const current = appState.quizQuestions[appState.currentIndex];
  appState.answersById[current.id] = null;
  soundEffects.click();
  renderActiveQuestion();
  renderQuestionPalette();
}

function toggleQuestionFlag() {
  const current = appState.quizQuestions[appState.currentIndex];
  appState.flagsById[current.id] = !appState.flagsById[current.id];
  soundEffects.flag();
  renderActiveQuestion();
  renderQuestionPalette();
}

// -------------------------------------------------------------
// QUESTION PALETTE DRAWER
// -------------------------------------------------------------
function renderQuestionPalette() {
  paletteGrid.innerHTML = "";
  appState.quizQuestions.forEach((q, idx) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "palette-pill";
    pill.textContent = String(idx + 1);

    const isCurrent = idx === appState.currentIndex;
    const isAnswered = appState.answersById[q.id] !== null;
    const isFlagged = appState.flagsById[q.id];

    if (isCurrent) pill.classList.add("current");
    if (isAnswered) pill.classList.add("answered");
    if (isFlagged) pill.classList.add("flagged");

    pill.addEventListener("click", () => {
      appState.currentIndex = idx;
      soundEffects.click();
      renderActiveQuestion();
      if (window.innerWidth < 640) {
        questionPaletteDrawer.classList.add("hidden");
      }
    });

    paletteGrid.appendChild(pill);
  });
}

function updatePaletteHighlight() {
  const pills = paletteGrid.querySelectorAll(".palette-pill");
  pills.forEach((pill, idx) => {
    if (idx === appState.currentIndex) {
      pill.classList.add("current");
    } else {
      pill.classList.remove("current");
    }
  });
}

// -------------------------------------------------------------
// QUIZ SUBMISSION & RESULTS
// -------------------------------------------------------------
function submitQuiz(force = false) {
  const total = appState.quizQuestions.length;
  const answered = Object.values(appState.answersById).filter((v) => v !== null).length;

  if (!force && answered < total) {
    const unanswered = total - answered;
    const proceed = window.confirm(
      `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. Are you sure you want to submit?`
    );
    if (!proceed) return;
  }

  stopTimer();
  appState.isSubmitted = true;
  const elapsedSeconds = Math.round((Date.now() - appState.quizStartTime) / 1000);

  let correct = 0;
  const mistakes = [];
  const correctAnswers = [];
  const topicStats = {};

  appState.quizQuestions.forEach((q) => {
    const selected = appState.answersById[q.id];
    const correctIndices = q.displayCorrectAnswers || [q.answerDisplayIndex];
    const isCorrect = selected !== null && correctIndices.includes(selected);
    const topicKey = q.topicName || `Topic ${q.topicId || "General"}`;

    if (!topicStats[topicKey]) {
      topicStats[topicKey] = { total: 0, correct: 0 };
    }
    topicStats[topicKey].total += 1;

    if (isCorrect) {
      correct += 1;
      topicStats[topicKey].correct += 1;
      correctAnswers.push({ question: q, selected });
    } else {
      mistakes.push({ question: q, selected });
    }
  });

  const percent = Number(((correct / total) * 100).toFixed(1));
  const gradeInfo = getGradeInfo(percent);

  appState.result = {
    correct,
    total,
    percent,
    gradeInfo,
    elapsedSeconds,
    mistakes,
    correctAnswers,
    topicStats
  };

  appState.studyStats.totalQuizzes += 1;
  appState.studyStats.totalQuestions += total;
  appState.studyStats.totalCorrect += correct;

  if (!appState.studyStats.subjectBests) {
    appState.studyStats.subjectBests = {};
  }
  const currentBest = appState.studyStats.subjectBests[appState.activeSubjectId] || 0;
  let isNewBest = false;
  if (percent > currentBest) {
    appState.studyStats.subjectBests[appState.activeSubjectId] = percent;
    isNewBest = true;
  }
  saveStats();

  if (percent >= 80) {
    soundEffects.fanfare();
    triggerConfetti();
  } else {
    soundEffects.click();
  }

  renderResultsUI(isNewBest, currentBest);
  showPanel(resultPanel);
}

function renderResultsUI(isNewBest, prevBest) {
  const res = appState.result;
  const subject = appState.subjects[appState.activeSubjectId] || { title: "Mixed Exam", category: "Exam" };

  resultScorePercent.textContent = `${res.percent}%`;
  resultGrade.textContent = res.gradeInfo.grade;
  resultSubjectCategory.textContent = subject.category || "Subject Mastery";
  resultHeading.textContent = res.gradeInfo.title;
  resultSummary.textContent = `You answered ${res.correct} out of ${res.total} questions correctly (${res.percent}%).`;

  if (isNewBest) {
    resultBest.innerHTML = `<i class="fa-solid fa-trophy text-brand-yellow"></i> New personal high score for ${subject.shortTitle || subject.title}: ${res.percent}%!`;
  } else if (prevBest > 0) {
    resultBest.innerHTML = `<i class="fa-solid fa-award"></i> Personal Best: ${prevBest}% (Current: ${res.percent}%)`;
  } else {
    resultBest.textContent = `First attempt recorded for this subject.`;
  }

  metricCorrect.textContent = res.correct;
  metricIncorrect.textContent = res.mistakes.filter((m) => m.selected !== null).length;
  metricUnanswered.textContent = res.mistakes.filter((m) => m.selected === null).length;
  metricTimeSpent.textContent = formatTime(res.elapsedSeconds);
  const avgSpeed = res.total > 0 ? Math.round(res.elapsedSeconds / res.total) : 0;
  metricAvgSpeed.textContent = `${avgSpeed}s/q`;

  topicBreakdownList.innerHTML = "";
  Object.keys(res.topicStats).forEach((topicName) => {
    const item = res.topicStats[topicName];
    const pct = Math.round((item.correct / item.total) * 100);

    const row = document.createElement("div");
    row.className = "topic-breakdown-row";
    row.innerHTML = `
      <span class="topic-breakdown-name" title="${topicName}">${topicName}</span>
      <div class="topic-breakdown-bar-track">
        <div class="topic-breakdown-bar-fill" style="width: ${pct}%"></div>
      </div>
      <span class="topic-breakdown-pct">${item.correct}/${item.total} (${pct}%)</span>
    `;
    topicBreakdownList.appendChild(row);
  });

  if (res.mistakes.length > 0) {
    retryMistakesBtn.classList.remove("hidden");
    mistakeCountBadge.textContent = res.mistakes.length;
  } else {
    retryMistakesBtn.classList.add("hidden");
  }

  mistakeList.classList.add("hidden");
  mistakeList.innerHTML = "";
  correctList.classList.add("hidden");
  correctList.innerHTML = "";
}

function renderMistakesReview() {
  correctList.classList.add("hidden");
  if (!appState.result || appState.result.mistakes.length === 0) {
    mistakeList.innerHTML = "<p class='muted'><i class='fa-solid fa-circle-check text-ok'></i> No mistakes to review. Outstanding score!</p>";
    mistakeList.classList.remove("hidden");
    return;
  }

  mistakeList.innerHTML = "";
  appState.result.mistakes.forEach((item) => {
    const card = document.createElement("article");
    card.className = "review-card mistake";

    const q = item.question;
    const options = Array.isArray(q.displayOptions) && q.displayOptions.length > 0
      ? q.displayOptions
      : (Array.isArray(q.options) ? q.options : []);

    let correctIndices = [];
    if (Array.isArray(q.displayCorrectAnswers) && q.displayCorrectAnswers.length > 0) {
      correctIndices = q.displayCorrectAnswers.filter((idx) => typeof idx === "number" && !isNaN(idx) && idx >= 0 && idx < options.length);
    }
    if (correctIndices.length === 0) {
      if (typeof q.answerDisplayIndex === "number" && !isNaN(q.answerDisplayIndex) && q.answerDisplayIndex >= 0 && q.answerDisplayIndex < options.length) {
        correctIndices = [q.answerDisplayIndex];
      } else if (typeof q.answerIndex === "number" && !isNaN(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < options.length) {
        correctIndices = [q.answerIndex];
      } else {
        correctIndices = [0];
      }
    }

    const yourAns =
      item.selected === null || item.selected === undefined || item.selected < 0 || item.selected >= options.length
        ? "<span class='muted'>Not answered</span>"
        : `<strong>(${LETTERS[item.selected] || item.selected + 1})</strong> ${options[item.selected] || ""}`;

    const correctAns = correctIndices
      .map((cIdx) => `<strong>(${LETTERS[cIdx] || cIdx + 1})</strong> ${options[cIdx] || ""}`)
      .join(" <span class='muted'>•</span> ");

    card.innerHTML = `
      <div class="review-card-head">
        <span><i class="fa-solid fa-bookmark"></i> ${q.topicName || "Topic"}</span>
        <span>ID: ${q.id || "Q"}</span>
      </div>
      <h3 class="review-question">${q.question}</h3>
      <p class="review-answer-row"><strong>Your Answer:</strong> ${yourAns}</p>
      <p class="review-answer-row text-ok"><strong>Correct Answer:</strong> ${correctAns}</p>
      <div class="review-explanation">
        <strong><i class="fa-solid fa-lightbulb"></i> Explanation:</strong> ${q.explanation || `The correct answer is ${correctAns}.`}
      </div>
    `;

    mistakeList.appendChild(card);
  });

  mistakeList.classList.remove("hidden");
}

function renderCorrectReview() {
  mistakeList.classList.add("hidden");
  if (!appState.result || appState.result.correctAnswers.length === 0) {
    correctList.innerHTML = "<p class='muted'>No correct answers recorded in this attempt.</p>";
    correctList.classList.remove("hidden");
    return;
  }

  correctList.innerHTML = "";
  appState.result.correctAnswers.forEach((item) => {
    const card = document.createElement("article");
    card.className = "review-card correct";

    const q = item.question;
    const options = Array.isArray(q.displayOptions) && q.displayOptions.length > 0
      ? q.displayOptions
      : (Array.isArray(q.options) ? q.options : []);

    let correctIndices = [];
    if (Array.isArray(q.displayCorrectAnswers) && q.displayCorrectAnswers.length > 0) {
      correctIndices = q.displayCorrectAnswers.filter((idx) => typeof idx === "number" && !isNaN(idx) && idx >= 0 && idx < options.length);
    }
    if (correctIndices.length === 0) {
      if (typeof q.answerDisplayIndex === "number" && !isNaN(q.answerDisplayIndex) && q.answerDisplayIndex >= 0 && q.answerDisplayIndex < options.length) {
        correctIndices = [q.answerDisplayIndex];
      } else if (typeof q.answerIndex === "number" && !isNaN(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < options.length) {
        correctIndices = [q.answerIndex];
      } else {
        correctIndices = [0];
      }
    }

    const correctAns = correctIndices
      .map((cIdx) => `<strong>(${LETTERS[cIdx] || cIdx + 1})</strong> ${options[cIdx] || ""}`)
      .join(" <span class='muted'>•</span> ");

    card.innerHTML = `
      <div class="review-card-head">
        <span><i class="fa-solid fa-bookmark"></i> ${q.topicName || "Topic"}</span>
        <span>ID: ${q.id || "Q"}</span>
      </div>
      <h3 class="review-question">${q.question}</h3>
      <p class="review-answer-row text-ok"><strong>Your Correct Answer:</strong> ${correctAns}</p>
      <div class="review-explanation">
        <strong><i class="fa-solid fa-lightbulb"></i> Explanation:</strong> ${q.explanation || `The correct answer is ${correctAns}.`}
      </div>
    `;

    correctList.appendChild(card);
  });

  correctList.classList.remove("hidden");
}

function retryMistakesQuiz() {
  if (!appState.result || appState.result.mistakes.length === 0) return;
  const mistakeQuestions = appState.result.mistakes.map((m) => buildDisplayQuestion(m.question, true));
  launchQuizWithQuestions(mistakeQuestions, "practice", 0);
}

// -------------------------------------------------------------
// MEGA MIX & MATCH MODAL
// -------------------------------------------------------------
function openMegaMixModal() {
  megaSubjectPicker.innerHTML = "";
  const subjects = Object.values(appState.subjects);

  subjects.forEach((subject) => {
    const label = document.createElement("label");
    label.className = "mega-subject-chip";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = subject.id;
    checkbox.checked = true;

    const text = document.createElement("span");
    text.innerHTML = `${renderIconHtml(subject.iconClass || subject.icon)} ${subject.shortTitle || subject.title} (${subject.questions.length}Q)`;

    label.appendChild(checkbox);
    label.appendChild(text);
    megaSubjectPicker.appendChild(label);
  });

  megaMixModal.classList.remove("hidden");
}

function startMegaMixQuiz() {
  const checked = [...megaSubjectPicker.querySelectorAll("input[type='checkbox']:checked")];
  if (checked.length === 0) {
    alert("Please select at least one subject for the Mega Mix quiz.");
    return;
  }

  const selectedIds = checked.map((input) => input.value);
  let combinedPool = [];
  selectedIds.forEach((id) => {
    const sub = appState.subjects[id];
    if (sub && Array.isArray(sub.questions)) {
      combinedPool = combinedPool.concat(sub.questions);
    }
  });

  if (combinedPool.length === 0) {
    alert("No questions found in chosen subjects.");
    return;
  }

  const requestedCount = Number(megaCountSelect.value);
  const mode = megaModeSelect.value;
  const shuffledPool = shuffle(combinedPool);
  const subset = shuffledPool.slice(0, Math.min(requestedCount, shuffledPool.length));
  const finalQuestions = subset.map((q) => buildDisplayQuestion(q, true));

  appState.activeSubjectId = "mega_mix";
  appState.subjects.mega_mix = {
    id: "mega_mix",
    title: "Cross-Subject Mega Mix Exam",
    shortTitle: "Mega Mix",
    category: "Mixed Exam",
    icon: "fa-solid fa-wand-magic-sparkles",
    iconClass: "fa-solid fa-wand-magic-sparkles",
    description: "Multi-disciplinary examination testing cross-subject mastery.",
    questions: combinedPool
  };

  megaMixModal.classList.add("hidden");
  const duration = mode === "timed" ? finalQuestions.length * 45 : 0;
  launchQuizWithQuestions(finalQuestions, mode, duration);
}

// -------------------------------------------------------------
// CUSTOM SUBJECT & QUESTION IMPORTER
// -------------------------------------------------------------
const SAMPLE_JSON_TEMPLATE = [
  {
    "question": "What is the primary excitatory neurotransmitter in the human brain?",
    "options": ["GABA", "Glutamate", "Dopamine", "Serotonin"],
    "answerIndex": 1,
    "topicName": "Neurochemistry",
    "explanation": "Glutamate is the most abundant excitatory neurotransmitter."
  },
  {
    "question": "Which brain region is essential for the consolidation of long-term memory?",
    "options": ["Hippocampus", "Amygdala", "Cerebellum", "Medulla Oblongata"],
    "answerIndex": 0,
    "topicName": "Brain Anatomy",
    "explanation": "The hippocampus plays a pivotal role in memory encoding."
  }
];

function openImportModal() {
  importSubjectTitle.value = "";
  importSubjectCategory.value = "Custom";
  importSubjectIcon.value = "fa-solid fa-brain";
  importSubjectDesc.value = "";
  importQuestionsJson.value = "";
  importErrorMsg.classList.add("hidden");
  importModal.classList.remove("hidden");
}

function saveCustomSubject() {
  const title = importSubjectTitle.value.trim();
  const category = importSubjectCategory.value.trim() || "Custom";
  const iconClass = importSubjectIcon.value.trim() || "fa-solid fa-book-open";
  const desc = importSubjectDesc.value.trim() || "Custom user-imported quiz questions.";
  const jsonStr = importQuestionsJson.value.trim();

  if (!title) {
    showImportError("Subject title is required.");
    return;
  }

  if (!jsonStr) {
    showImportError("Please provide questions in JSON array format.");
    return;
  }

  let questions = [];
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      showImportError("JSON must be a non-empty array of question objects.");
      return;
    }

    questions = parsed.map((item, idx) => {
      if (!item.question || !Array.isArray(item.options) || item.options.length < 2) {
        throw new Error(`Question #${idx + 1} is missing a question string or options array.`);
      }
      const ansIdx = typeof item.answerIndex === "number" ? item.answerIndex : 0;
      return {
        id: item.id || `CUST_${Date.now()}_Q${idx + 1}`,
        topicId: item.topicId || 1,
        topicName: item.topicName || "General",
        question: item.question,
        options: item.options,
        answerIndex: ansIdx,
        answer: LETTERS[ansIdx].toLowerCase(),
        explanation: item.explanation || `The correct answer is ${item.options[ansIdx]}.`
      };
    });
  } catch (err) {
    showImportError(`Invalid JSON: ${err.message}`);
    return;
  }

  const subjectId = `custom_${Date.now()}`;
  const topics = [...new Set(questions.map((q) => q.topicName))].map((name, i) => ({
    id: i + 1,
    name
  }));

  const newSubject = {
    id: subjectId,
    title,
    shortTitle: title.slice(0, 16),
    category,
    icon: iconClass,
    iconClass: iconClass,
    description: desc,
    topicType: "Topic",
    topics,
    questions,
    isCustom: true
  };

  appState.subjects[subjectId] = newSubject;
  try {
    const existingCustom = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_SUBJECTS) || "{}");
    existingCustom[subjectId] = newSubject;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SUBJECTS, JSON.stringify(existingCustom));
  } catch {}

  importModal.classList.add("hidden");
  soundEffects.correct();
  alert(`Custom subject "${title}" with ${questions.length} questions successfully created!`);
  openSubjectHub();
}

function showImportError(msg) {
  importErrorMsg.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
  importErrorMsg.classList.remove("hidden");
}

// -------------------------------------------------------------
// KEYBOARD SHORTCUTS HANDLER
// -------------------------------------------------------------
function handleKeyboardShortcuts(event) {
  if (quizPanel.classList.contains("hidden") || appState.isSubmitted) return;
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT")) {
    return;
  }

  const key = event.key;

  if (key === "Escape") {
    toggleFocusMode();
    return;
  }

  if (["1", "2", "3", "4"].includes(key)) {
    const idx = Number(key) - 1;
    handleOptionSelect(idx);
    return;
  }

  const lower = key.toLowerCase();
  if (["a", "b", "c", "d"].includes(lower)) {
    const idx = LETTERS.map((l) => l.toLowerCase()).indexOf(lower);
    if (idx !== -1) handleOptionSelect(idx);
    return;
  }

  if (key === "ArrowLeft" && appState.currentIndex > 0) {
    appState.currentIndex -= 1;
    soundEffects.click();
    renderActiveQuestion();
    return;
  }

  if (key === "ArrowRight" && appState.currentIndex < appState.quizQuestions.length - 1) {
    appState.currentIndex += 1;
    soundEffects.click();
    renderActiveQuestion();
    return;
  }

  if (lower === "f") {
    toggleQuestionFlag();
    return;
  }

  if (key === "Enter" && appState.currentIndex < appState.quizQuestions.length - 1) {
    appState.currentIndex += 1;
    soundEffects.click();
    renderActiveQuestion();
  }
}

// -------------------------------------------------------------
// EVENT LISTENERS BINDING
// -------------------------------------------------------------
function bindEvents() {
  navHomeBtn.addEventListener("click", openSubjectHub);
  navHomeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") openSubjectHub();
  });

  themeSelect.addEventListener("change", () => {
    applyTheme(themeSelect.value);
  });

  soundToggleBtn.addEventListener("click", () => {
    appState.soundEnabled = !appState.soundEnabled;
    soundIcon.className = appState.soundEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, String(appState.soundEnabled));
    } catch {}
    if (appState.soundEnabled) soundEffects.click();
  });

  subjectSearchInput.addEventListener("input", (e) => {
    appState.searchQuery = e.target.value;
    clearSearchBtn.classList.toggle("hidden", !e.target.value);
    renderSubjectHub();
  });

  clearSearchBtn.addEventListener("click", () => {
    subjectSearchInput.value = "";
    appState.searchQuery = "";
    clearSearchBtn.classList.add("hidden");
    renderSubjectHub();
  });

  categoryChipsList.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip-filter");
    if (!btn) return;
    appState.activeCategoryFilter = btn.getAttribute("data-category");
    updateCategoryChipActiveState();
    soundEffects.click();
    renderSubjectHub();
  });

  launchMegaMixBtn.addEventListener("click", () => {
    soundEffects.click();
    openMegaMixModal();
  });

  openImportModalBtn.addEventListener("click", () => {
    soundEffects.click();
    openImportModal();
  });

  backToHubBtn.addEventListener("click", () => {
    soundEffects.click();
    openSubjectHub();
  });

  allTopicsToggle.addEventListener("change", () => {
    const chips = topicCheckboxList.querySelectorAll("input[type='checkbox']");
    chips.forEach((c) => (c.checked = false));
    updatePoolInfo();
  });

  topicCheckboxList.addEventListener("change", (e) => {
    if (e.target && e.target.matches("input[type='checkbox']")) {
      if (allTopicsToggle.checked) {
        allTopicsToggle.checked = false;
      }
      updatePoolInfo();
    }
  });

  selectAllTopicsBtn.addEventListener("click", () => {
    allTopicsToggle.checked = true;
    const chips = topicCheckboxList.querySelectorAll("input[type='checkbox']");
    chips.forEach((c) => (c.checked = false));
    updatePoolInfo();
  });

  deselectAllTopicsBtn.addEventListener("click", () => {
    allTopicsToggle.checked = false;
    const chips = topicCheckboxList.querySelectorAll("input[type='checkbox']");
    chips.forEach((c) => (c.checked = false));
    updatePoolInfo();
  });

  modeSelect.addEventListener("change", () => {
    const isTimed = modeSelect.value === "timed";
    timerControl.style.display = isTimed ? "flex" : "none";
  });

  countSelect.addEventListener("change", updatePoolInfo);
  orderSelect.addEventListener("change", updatePoolInfo);
  optionOrderSelect.addEventListener("change", updatePoolInfo);

  startBtn.addEventListener("click", () => {
    soundEffects.click();
    startQuizFromSetup();
  });

  togglePaletteBtn.addEventListener("click", () => {
    questionPaletteDrawer.classList.toggle("hidden");
    soundEffects.click();
  });

  closePaletteBtn.addEventListener("click", () => {
    questionPaletteDrawer.classList.add("hidden");
  });

  flagQuestionBtn.addEventListener("click", toggleQuestionFlag);
  clearAnswerBtn.addEventListener("click", clearCurrentAnswer);

  prevBtn.addEventListener("click", () => {
    if (appState.currentIndex > 0) {
      appState.currentIndex -= 1;
      soundEffects.click();
      renderActiveQuestion();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (appState.currentIndex < appState.quizQuestions.length - 1) {
      appState.currentIndex += 1;
      soundEffects.click();
      renderActiveQuestion();
    }
  });

  submitBtn.addEventListener("click", () => submitQuiz(false));

  retryBtn.addEventListener("click", () => {
    soundEffects.click();
    openQuizSetup(appState.activeSubjectId);
  });

  retryMistakesBtn.addEventListener("click", () => {
    soundEffects.click();
    retryMistakesQuiz();
  });

  reviewBtn.addEventListener("click", () => {
    soundEffects.click();
    renderMistakesReview();
  });

  reviewCorrectBtn.addEventListener("click", () => {
    soundEffects.click();
    renderCorrectReview();
  });

  returnToHubBtn.addEventListener("click", () => {
    soundEffects.click();
    openSubjectHub();
  });

  closeMegaMixModalBtn.addEventListener("click", () => megaMixModal.classList.add("hidden"));
  cancelMegaMixBtn.addEventListener("click", () => megaMixModal.classList.add("hidden"));
  startMegaQuizBtn.addEventListener("click", startMegaMixQuiz);

  closeImportModalBtn.addEventListener("click", () => importModal.classList.add("hidden"));
  cancelImportBtn.addEventListener("click", () => importModal.classList.add("hidden"));
  loadSampleJsonBtn.addEventListener("click", () => {
    importQuestionsJson.value = JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2);
  });
  saveImportedSubjectBtn.addEventListener("click", saveCustomSubject);

  if (focusModeBtn) {
    focusModeBtn.addEventListener("click", () => {
      soundEffects.click();
      toggleFocusMode();
    });
  }

  window.addEventListener("keydown", handleKeyboardShortcuts);
}

function init() {
  initializeSubjects();
  loadSettingsAndStats();
  bindEvents();
  openSubjectHub();
}

init();
