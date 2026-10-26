const STORAGE_KEY = 'hoopIQ-progress';
const STATE_VERSION = 2;
let storageLoadFailed = false;
let corruptStorageRaw = null;
const SHOT_TYPES = {
  freeThrow: 'Free throws',
  layup: 'Layups',
  midrange: 'Midrange',
  threePointer: 'Three-pointers',
};
const SKILL_GOALS = {
  shooting: 'Shooting',
  handling: 'Ball handling',
  finishing: 'Finishing',
  defense: 'Defense',
  iq: 'Basketball IQ',
};
const DRILLS = [
  { name: 'Form shooting', focus: 'shooting', description: 'Use close-range repetitions to practice a balanced base and repeatable release.' },
  { name: 'Spot shooting', focus: 'shooting', description: 'Shoot from set spots, reset your feet, and record makes and attempts.' },
  { name: 'Free-throw routine', focus: 'shooting', description: 'Build a calm, consistent pre-shot routine between free throws.' },
  { name: 'Finishing footwork', focus: 'finishing', description: 'Practice controlled two-foot and one-foot gathers at a comfortable pace.' },
  { name: 'Weak-hand control', focus: 'handling', description: 'Use low, controlled dribbles with the non-dominant hand.' },
  { name: 'Change-of-pace dribble', focus: 'handling', description: 'Vary speed while keeping the ball protected and under control.' },
  { name: 'Defensive closeouts', focus: 'defense', description: 'Close out under control, stay balanced, and recover without lunging.' },
  { name: 'Help-and-recover reads', focus: 'defense', description: 'Practice seeing the ball and your assignment, then recover with short steps.' },
  { name: 'Pick-and-roll reads', focus: 'iq', description: 'Scan the on-ball defender and help before choosing a pass or drive.' },
  { name: 'Transition decisions', focus: 'iq', description: 'Practice identifying numbers, spacing lanes, and the safest early pass.' },
];
const STRATEGY_PLAYS = {
  'five-out': {
    title: 'Five-out spacing',
    read: 'Keep the lane open and move the ball to shift the defense. Cut only when a teammate can see you.',
    offense: [[160, 100], [65, 155], [255, 155], [55, 285], [265, 285]],
    defense: [[160, 145], [100, 195], [220, 195], [100, 290], [220, 290]],
    ball: [160, 100],
    paths: ['M160 100 Q125 80 65 155', 'M65 155 Q35 210 55 285'],
  },
  'pick-roll': {
    title: 'Pick-and-roll',
    read: 'The ball handler reads the screen defender first. If help steps up, look for the roller or the open weak side; do not force a pass.',
    offense: [[115, 140], [160, 170], [260, 145], [55, 285], [265, 285]],
    defense: [[115, 145], [150, 165], [210, 205], [100, 250], [220, 270]],
    ball: [115, 140],
    paths: ['M115 140 Q155 100 160 170', 'M160 170 Q165 115 160 65'],
  },
  'help-defense': {
    title: 'Help defense',
    read: 'Stay between the ball and your assignment, see both, and help only far enough to discourage the drive while keeping a recoverable route.',
    offense: [[160, 80], [60, 150], [260, 150], [55, 285], [265, 285]],
    defense: [[160, 125], [85, 190], [220, 185], [135, 230], [220, 290]],
    ball: [60, 150],
    paths: ['M85 190 Q105 170 125 175', 'M135 230 Q190 235 255 285'],
  },
  closeout: {
    title: 'Closeout rotation',
    read: 'Call the matchup, close out under control with short steps, take away the direct drive, then recover to the next threat if a teammate helps.',
    offense: [[160, 70], [60, 155], [260, 155], [55, 285], [265, 285]],
    defense: [[155, 120], [95, 190], [215, 190], [125, 270], [240, 250]],
    ball: [260, 155],
    paths: ['M215 190 Q235 165 253 158', 'M240 250 Q200 245 165 235'],
  },
};
const ACADEMY_STYLE_MATCHES = {
  shooter: { role: 'Shooting guard', players: ['klay', 'curry'] },
  playmaker: { role: 'Point guard', players: ['luka', 'kyrie'] },
  attacker: { role: 'Scoring guard / attacking forward', players: ['shai', 'giannis'] },
  versatile: { role: 'Small forward / two-way wing', players: ['tatum', 'shai'] },
  big: { role: 'Center / power forward', players: ['jokic', 'giannis'] },
};
const ACADEMY_PLAYER_NAMES = {
  curry: 'Stephen Curry',
  kyrie: 'Kyrie Irving',
  luka: 'Luka Dončić',
  shai: 'Shai Gilgeous-Alexander',
  klay: 'Klay Thompson',
  tatum: 'Jayson Tatum',
  giannis: 'Giannis Antetokounmpo',
  jokic: 'Nikola Jokić',
};
const ZERO_SHOTS = {
  freeThrow: { made: 0, attempts: 0 },
  layup: { made: 0, attempts: 0 },
  midrange: { made: 0, attempts: 0 },
  threePointer: { made: 0, attempts: 0 },
};
const DEFAULT_STATE = {
  version: STATE_VERSION,
  name: '',
  totalMade: 0,
  totalAttempts: 0,
  sessionsCount: 0,
  todayMinutes: 0,
  prValue: 0,
  progressPercent: 0,
  coachProgress: 0,
  lastWorkout: 'No workouts logged yet',
  seasonShootingPct: 0,
  shotTypes: ZERO_SHOTS,
  chartShots: [],
  sessions: [],
  profile: {
    name: '',
    position: 'Guard',
    hand: 'Right',
    experience: 'beginner',
    ageGroup: 'prefer-not',
    equipment: 'ball-hoop',
    location: 'court',
    goal: 'shooting',
    weeklyTarget: 3,
    targetPct: 70,
  },
  skillRatings: {
    shooting: null,
    handling: null,
    finishing: null,
    defense: null,
    iq: null,
  },
  rewards: { xp: 0, achievements: [] },
  iq: { correct: 0, answered: 0, completedQuestions: [], completedTopics: [] },
  academy: { completed: [] },
  activeWorkout: null,
};
const VIEW_TITLES = {
  dashboard: 'Dashboard',
  progress: 'My Progress',
  coach: 'Personal Coach',
  iq: 'Basketball IQ',
  academy: 'NBA Player Academy',
  settings: 'Settings',
};
const IQ_QUESTIONS = [
  {
    id: 'spacing-basic',
    topic: 'Spacing',
    level: 'beginner',
    prompt: 'A teammate drives from the right wing. Where should you move if you are on the weak-side wing?',
    options: ['Stay wide and ready for a pass', 'Run toward the ball and crowd the lane', 'Stand directly behind the driver'],
    answer: 0,
    explanation: 'Holding useful weak-side spacing keeps a passing lane open and makes it harder for one defender to guard two players.',
  },
  {
    id: 'help-basic',
    topic: 'Help defense',
    level: 'beginner',
    prompt: 'A teammate is beaten off the dribble toward the basket. What is a safe first read?',
    options: ['Move into a balanced help position and see both ball and assignment', 'Turn your back to the ball', 'Sprint past the play and reach from behind'],
    answer: 0,
    explanation: 'A balanced help position lets you discourage the drive while staying able to recover. Avoid reckless reaches or collisions.',
  },
  {
    id: 'break-basic',
    topic: 'Fast breaks',
    level: 'beginner',
    prompt: 'Your team has the ball in transition with two defenders back. What should you do first?',
    options: ['Run in a lane and look up to read the defenders', 'Dribble straight into the nearest defender', 'Stop all movement'],
    answer: 0,
    explanation: 'Running in a lane preserves spacing. Looking up helps you choose a safe pass, drive, or reset based on the numbers.',
  },
  {
    id: 'pnr-intermediate',
    topic: 'Pick-and-roll',
    level: 'intermediate',
    prompt: 'The on-ball defender goes under the screen and the screener’s defender stays near the paint. What is a sensible read?',
    options: ['Take the open pull-up only if it is within your practiced range', 'Force a pass through both defenders', 'Ignore the screen and dribble into traffic'],
    answer: 0,
    explanation: 'An under coverage can concede space. Use a shot you have practiced, or keep the dribble alive and make the next read.',
  },
  {
    id: 'rotation-intermediate',
    topic: 'Rotations',
    level: 'intermediate',
    prompt: 'You help stop a drive and a teammate rotates to cover your player. What is your next priority?',
    options: ['Communicate and recover to the next open threat', 'Stay beside your teammate and guard the same player', 'Watch the ball without finding an assignment'],
    answer: 0,
    explanation: 'A good rotation is connected: communicate, identify the next threat, and recover to an open player without abandoning the ball.',
  },
  {
    id: 'spacing-intermediate',
    topic: 'Spacing',
    level: 'intermediate',
    prompt: 'A teammate is posting up on the left block and your defender is shading toward the ball. What helps the offense?',
    options: ['Relocate to a clear passing window on the weak side', 'Cut into the same block space', 'Stand next to the ball handler'],
    answer: 0,
    explanation: 'A clear weak-side window makes help defense choose between staying home and helping. Avoid occupying the same space as a teammate.',
  },
  {
    id: 'late-advanced',
    topic: 'Late-game decisions',
    level: 'advanced',
    prompt: 'Your team is protecting a small lead with little time left. You have a safe advantage but no clear finish. What is the best principle?',
    options: ['Keep possession and make the next safe read', 'Take a contested shot immediately regardless of the clock', 'Attempt a risky cross-court pass'],
    answer: 0,
    explanation: 'A lead changes the value of risk. Protecting possession and avoiding an unnecessary turnover is often more valuable than forcing a low-quality attempt.',
  },
  {
    id: 'pnr-advanced',
    topic: 'Pick-and-roll',
    level: 'advanced',
    prompt: 'The defense traps the ball handler, the screener rolls, and the weak-side defender tags the roll. What read may now be open?',
    options: ['A controlled pass to the next open weak-side teammate', 'A blind pass through the trap', 'A dribble directly into both defenders'],
    answer: 0,
    explanation: 'The tag can create a temporary advantage elsewhere. Use vision and a controlled pass; do not force a pass without a clear lane.',
  },
  {
    id: 'help-advanced',
    topic: 'Help defense',
    level: 'advanced',
    prompt: 'The ball is on the wing and your assignment is in the weak-side corner. What is the balanced help position?',
    options: ['See both the ball and your player, close enough to help and recover', 'Stand under the rim with your back to the corner', 'Leave the corner early and chase the ball'],
    answer: 0,
    explanation: 'Positioning between the ball and your assignment can discourage penetration while preserving a recoverable closeout.',
  },
  {
    id: 'rotation-advanced',
    topic: 'Rotations',
    level: 'advanced',
    prompt: 'Two defenders help on a drive and leave two perimeter players open. What should the defense prioritize?',
    options: ['Communicate and rotate to the most immediate threat, then recover', 'Both defenders sprint to the same shooter', 'Stop communicating to avoid confusion'],
    answer: 0,
    explanation: 'Rotations depend on communication and threat recognition. Recover under control and avoid doubling the same assignment.',
  },
  {
    id: 'break-intermediate',
    topic: 'Fast breaks',
    level: 'intermediate',
    prompt: 'You have a numerical advantage on a fast break but the ball carrier is being pressured. What is a useful support action?',
    options: ['Fill an open lane and present a safe passing target', 'Run directly behind the ball carrier', 'Stop where the defenders can cover both players'],
    answer: 0,
    explanation: 'Filling a separate lane stretches the defense and offers a clear outlet. Stay visible and avoid unsafe, forced passes.',
  },
  {
    id: 'late-intermediate',
    topic: 'Late-game decisions',
    level: 'intermediate',
    prompt: 'There is time for one good possession, but the defense denies your first option. What should you do?',
    options: ['Stay composed and flow to the next option', 'Force the first pass anyway', 'Stop moving and wait for the defense'],
    answer: 0,
    explanation: 'A second action can create a better advantage. Keep spacing and communicate rather than forcing a covered option.',
  },
];

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function safeCount(value, fallback = 0, max = 10000000) {
  return Number.isSafeInteger(value) && value >= 0 && value <= max ? value : fallback;
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

function normalizeSession(session) {
  if (!isPlainObject(session) || !validDate(session.date)) return null;
  const made = safeCount(session.made, -1, 1000000);
  const attempts = safeCount(session.attempts, -1, 1000000);
  const minutes = safeCount(session.minutes, -1, 180);
  if (made < 0 || attempts < made || minutes < 0) return null;
  return {
    id: typeof session.id === 'string' ? session.id.slice(0, 80) : `session-${Date.now()}`,
    date: session.date,
    kind: ['shooting', 'planned', 'academy'].includes(session.kind) ? session.kind : 'shooting',
    title: typeof session.title === 'string' ? session.title.slice(0, 100) : 'Training session',
    shotType: Object.hasOwn(SHOT_TYPES, session.shotType) ? session.shotType : null,
    made,
    attempts,
    minutes,
    focus: Object.hasOwn(SKILL_GOALS, session.focus) ? session.focus : null,
    completed: session.completed === true,
  };
}

function normalizeState(raw) {
  const data = isPlainObject(raw) ? raw : {};
  const normalized = {
    ...DEFAULT_STATE,
    ...data,
    version: STATE_VERSION,
    totalMade: safeCount(data.totalMade),
    totalAttempts: safeCount(data.totalAttempts),
    sessionsCount: safeCount(data.sessionsCount),
    todayMinutes: safeCount(data.todayMinutes),
    prValue: safeCount(data.prValue),
    progressPercent: 0,
    coachProgress: Math.min(100, safeCount(data.coachProgress)),
    name: typeof data.name === 'string' ? data.name.slice(0, 40) : '',
    lastWorkout: typeof data.lastWorkout === 'string' ? data.lastWorkout.slice(0, 100) : DEFAULT_STATE.lastWorkout,
    shotTypes: { ...ZERO_SHOTS },
    chartShots: [],
    sessions: [],
    profile: { ...DEFAULT_STATE.profile },
    skillRatings: { ...DEFAULT_STATE.skillRatings },
    rewards: { ...DEFAULT_STATE.rewards, achievements: [] },
    iq: { ...DEFAULT_STATE.iq, completedQuestions: [], completedTopics: [] },
    academy: { ...DEFAULT_STATE.academy, completed: [] },
    activeWorkout: null,
  };

  for (const key of Object.keys(SHOT_TYPES)) {
    const entry = isPlainObject(data.shotTypes?.[key]) ? data.shotTypes[key] : {};
    const attempts = safeCount(entry.attempts);
    normalized.shotTypes[key] = { attempts, made: Math.min(attempts, safeCount(entry.made)) };
  }

  normalized.sessions = Array.isArray(data.sessions)
    ? data.sessions.map(normalizeSession).filter(Boolean).slice(-2000)
    : [];
  normalized.chartShots = Array.isArray(data.chartShots)
    ? data.chartShots.filter((shot) => isPlainObject(shot)
      && validDate(shot.date)
      && Object.hasOwn(SHOT_TYPES, shot.shotType)
      && typeof shot.zone === 'string'
      && ['Left corner', 'Left wing', 'Top of key', 'Right wing', 'Right corner', 'Paint'].includes(shot.zone)
      && typeof shot.made === 'boolean')
      .slice(-10000)
      .map((shot) => ({ date: shot.date, shotType: shot.shotType, zone: shot.zone, made: shot.made }))
    : [];

  const profile = isPlainObject(data.profile) ? data.profile : {};
  normalized.profile = {
    name: typeof profile.name === 'string' ? profile.name.slice(0, 40) : normalized.name,
    position: ['Guard', 'Forward', 'Center', 'All positions'].includes(profile.position) ? profile.position : 'Guard',
    hand: ['Right', 'Left', 'Both'].includes(profile.hand) ? profile.hand : 'Right',
    experience: ['beginner', 'intermediate', 'advanced'].includes(profile.experience) ? profile.experience : 'beginner',
    ageGroup: ['prefer-not', 'under13', 'teen', 'adult'].includes(profile.ageGroup) ? profile.ageGroup : 'prefer-not',
    equipment: ['ball-hoop', 'ball', 'cones', 'bodyweight'].includes(profile.equipment) ? profile.equipment : 'ball-hoop',
    location: ['court', 'driveway', 'indoors', 'anywhere'].includes(profile.location) ? profile.location : 'court',
    goal: Object.hasOwn(SKILL_GOALS, profile.goal) ? profile.goal : 'shooting',
    weeklyTarget: Math.min(14, Math.max(1, safeCount(profile.weeklyTarget, 3))),
    targetPct: Math.min(100, Math.max(1, safeCount(profile.targetPct, 70))),
  };

  const ratings = isPlainObject(data.skillRatings) ? data.skillRatings : {};
  for (const skill of Object.keys(SKILL_GOALS)) {
    normalized.skillRatings[skill] = Number.isInteger(ratings[skill]) && ratings[skill] >= 1 && ratings[skill] <= 10
      ? ratings[skill]
      : null;
  }

  const rewards = isPlainObject(data.rewards) ? data.rewards : {};
  normalized.rewards = {
    xp: safeCount(rewards.xp),
    achievements: Array.isArray(rewards.achievements)
      ? rewards.achievements.filter((item) => ['first-session', 'five-sessions', 'ten-sessions', 'hundred-shots', 'iq-student', 'week-regular'].includes(item))
      : [],
  };
  const iq = isPlainObject(data.iq) ? data.iq : {};
  normalized.iq = {
    correct: safeCount(iq.correct),
    answered: safeCount(iq.answered),
    completedQuestions: Array.isArray(iq.completedQuestions) ? [...new Set(iq.completedQuestions.filter((id) => IQ_QUESTIONS.some((item) => item.id === id)))] : [],
    completedTopics: Array.isArray(iq.completedTopics) ? [...new Set(iq.completedTopics.filter((topic) => typeof topic === 'string').map((topic) => topic.slice(0, 40)))] : [],
  };
  const academy = isPlainObject(data.academy) ? data.academy : {};
  normalized.academy = {
    completed: Array.isArray(academy.completed)
      ? [...new Set(academy.completed.filter((id) => Object.hasOwn(ACADEMY_PLAYER_NAMES, id)))]
      : [],
  };

  if (isPlainObject(data.activeWorkout) && Array.isArray(data.activeWorkout.blocks) && data.activeWorkout.blocks.length <= 20) {
    const blocks = data.activeWorkout.blocks
      .filter((block) => isPlainObject(block) && typeof block.title === 'string' && typeof block.description === 'string')
      .map((block) => ({
        title: block.title.slice(0, 80),
        description: block.description.slice(0, 300),
        seconds: Math.min(3600, Math.max(0, safeCount(block.seconds))),
      }));
    const index = safeCount(data.activeWorkout.index, 0, Math.max(0, blocks.length - 1));
    if (blocks.length > 0) {
      normalized.activeWorkout = {
        duration: [15, 30, 45, 60].includes(data.activeWorkout.duration) ? data.activeWorkout.duration : 30,
        focus: Object.hasOwn(SKILL_GOALS, data.activeWorkout.focus) ? data.activeWorkout.focus : 'shooting',
        blocks,
        index,
        remaining: Math.min(blocks[index].seconds, safeCount(data.activeWorkout.remaining, blocks[index].seconds)),
        elapsedSeconds: safeCount(data.activeWorkout.elapsedSeconds),
        started: data.activeWorkout.started === true,
        running: false,
      };
    }
  }

  normalized.prValue = Math.max(normalized.prValue, normalized.totalMade);
  normalized.seasonShootingPct = percentage(normalized.totalMade, normalized.totalAttempts);
  normalized.progressPercent = normalized.seasonShootingPct;
  return normalized;
}

function loadState() {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : normalizeState(DEFAULT_STATE);
  } catch (error) {
    storageLoadFailed = true;
    corruptStorageRaw = saved;
    console.error('Unable to load saved HoopIQ progress. The current browser data was left untouched.', error);
    return normalizeState(DEFAULT_STATE);
  }
}

let state = loadState();
let timerHandle = null;
let selectedZone = '';
let currentPeriod = 'week';
let currentQuestion = null;
let questionAnswered = false;
let previousView = 'dashboard';
const navButtons = [...document.querySelectorAll('.nav-item')];
const viewMap = {
  dashboard: document.getElementById('view-dashboard'),
  progress: document.getElementById('view-progress'),
  coach: document.getElementById('view-coach'),
  iq: document.getElementById('view-iq'),
  academy: document.getElementById('view-academy'),
  settings: document.getElementById('view-settings'),
};
const pageTitle = document.getElementById('pageTitle');
const quickWorkoutBtn = document.getElementById('quickWorkoutBtn');
const resetProgressBtn = document.getElementById('resetProgressBtn');
const workoutForm = document.getElementById('workoutForm');
const drillInput = document.getElementById('drillInput');
const drillFeedback = document.getElementById('drillFeedback');

function percentage(made, attempts) {
  return attempts > 0 ? Math.round((made / attempts) * 100) : 0;
}

function localDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysAgo(count) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - count);
  return localDate(date);
}

function formatDate(date) {
  if (!validDate(date)) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`));
}

function formatMetric(value) {
  return `${Number(value).toFixed(1)}/10`;
}

function setStatus(id, message, isError = false) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function isDarkTheme() {
  const theme = document.documentElement.dataset.theme;
  return theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function updateThemeControls() {
  const dark = isDarkTheme();
  const themeToggle = document.getElementById('themeToggleBtn');
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.title = label;
  document.getElementById('themePreferenceLabel').textContent = `Current theme: ${dark ? 'Dark' : 'Light'}`;
  document.querySelector('meta[name="theme-color"]').content = dark ? '#161714' : '#f5f5f2';
}

function toggleTheme() {
  const nextTheme = isDarkTheme() ? 'light' : 'dark';
  try {
    localStorage.setItem('hoopIQ-theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.querySelector('meta[name="theme-color"]').content = nextTheme === 'dark' ? '#161714' : '#f5f5f2';
    updateThemeControls();
  } catch (error) {
    console.error('Unable to save the HoopIQ color theme.', error);
    setStatus('globalStatus', 'Could not save the theme preference in this browser.', true);
  }
}

function saveState() {
  if (storageLoadFailed) {
    setStatus('globalStatus', 'Saved data could not be read, so it has not been overwritten. Import a valid backup or confirm a reset to continue.', true);
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setStatus('globalStatus', '');
    return true;
  } catch (error) {
    console.error('Unable to save HoopIQ progress to this browser.', error);
    setStatus('globalStatus', 'Could not save. Export your data or free local storage and try again.', true);
    return false;
  }
}

function syncDerivedStats() {
  state.seasonShootingPct = percentage(state.totalMade, state.totalAttempts);
  state.progressPercent = state.seasonShootingPct;
  state.prValue = Math.max(state.prValue, state.totalMade);
}

function currentWeekStart() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return localDate(date);
}

function completedSessions() {
  return state.sessions.filter((session) => session.completed);
}

function weekSessions() {
  const start = currentWeekStart();
  return completedSessions().filter((session) => session.date >= start);
}

function getStreak() {
  const dates = [...new Set(completedSessions().map((session) => session.date))].sort().reverse();
  if (!dates.length) return 0;
  const today = localDate();
  const yesterday = daysAgo(1);
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  let previous = new Date(`${dates[0]}T12:00:00`);
  for (const date of dates.slice(1)) {
    const current = new Date(`${date}T12:00:00`);
    const difference = Math.round((previous - current) / 86400000);
    if (difference !== 1) break;
    streak += 1;
    previous = current;
  }
  return streak;
}

function unlockAchievements() {
  const completed = completedSessions().length;
  const shots = Object.values(state.shotTypes).reduce((sum, entry) => sum + entry.attempts, 0);
  const conditions = [
    ['first-session', completed >= 1],
    ['five-sessions', completed >= 5],
    ['ten-sessions', completed >= 10],
    ['hundred-shots', shots >= 100],
    ['iq-student', state.iq.completedQuestions.length >= 5],
    ['week-regular', weekSessions().length >= state.profile.weeklyTarget],
  ];
  conditions.forEach(([key, met]) => {
    if (met && !state.rewards.achievements.includes(key)) state.rewards.achievements.push(key);
  });
}

function addReward(minutes, message) {
  const xp = 10 + Math.min(20, Math.floor(minutes / 5));
  state.rewards.xp += xp;
  unlockAchievements();
  setStatus('playerStatus', `${message} +${xp} XP earned for completing training.`);
}

function updateDashboard() {
  syncDerivedStats();
  const put = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  };
  put('seasonShootingPct', `${state.seasonShootingPct}%`);
  put('sessionsCount', state.sessionsCount);
  put('prValue', state.totalMade);
  put('progressPercent', `${state.progressPercent}%`);
  const todayMinutes = state.sessions.filter((session) => session.completed && session.date === localDate())
    .reduce((sum, session) => sum + session.minutes, 0);
  put('todayMinutes', todayMinutes || (state.sessions.length ? 0 : state.todayMinutes));

  const ring = document.querySelector('.ring-progress');
  if (ring) {
    const circumference = 2 * Math.PI * 48;
    ring.style.strokeDasharray = String(circumference);
    ring.style.strokeDashoffset = String(circumference - (state.progressPercent / 100) * circumference);
  }
  const ratings = state.skillRatings;
  put('shotFormMetric', ratings.shooting === null ? 'Not rated' : formatMetric(ratings.shooting));
  put('ballHandlingMetric', ratings.handling === null ? 'Not rated' : formatMetric(ratings.handling));
  put('gameIQMetric', ratings.iq === null ? 'Not rated' : formatMetric(ratings.iq));
  put('finishingMetric', ratings.finishing === null ? 'Not rated' : formatMetric(ratings.finishing));
  put('defenseMetric', ratings.defense === null ? 'Not rated' : formatMetric(ratings.defense));
  put('madeShotsStat', state.totalMade);
  put('attemptsStat', state.totalAttempts);
  put('sessionMinutesStat', `${state.sessions.reduce((sum, session) => sum + session.minutes, 0)} min`);
  put('sessionsLoggedStat', state.sessionsCount);
  put('miniNoteText', state.sessionsCount === 0 ? 'No workouts logged yet' : `${state.sessionsCount} completed session${state.sessionsCount === 1 ? '' : 's'}`);
  put('trainingStatusPill', state.sessionsCount ? 'Practice in progress' : 'Ready to start');

  const categories = Object.entries(state.shotTypes);
  const barValues = {
    catchShoot: state.shotTypes.threePointer,
    midRange: state.shotTypes.midrange,
    pullUp: state.shotTypes.freeThrow,
    layup: state.shotTypes.layup,
  };
  for (const [key, entry] of Object.entries(barValues)) {
    const value = percentage(entry.made, entry.attempts);
    put(`${key}Pct`, `${value}%`);
    const bar = document.getElementById(`${key}Bar`);
    if (bar) bar.style.width = `${value}%`;
  }

  const sessions = completedSessions();
  const bestMakes = sessions.reduce((best, session) => Math.max(best, session.made), 0);
  put('consecutiveMakesStat', bestMakes);
  const threePointSessions = sessions.filter((session) => session.shotType === 'threePointer' && session.attempts > 0);
  put('threePointStreakStat', threePointSessions.length
    ? `${Math.max(...threePointSessions.map((session) => percentage(session.made, session.attempts)))}%`
    : '—');
  put('defensiveStopsStat', sessions.filter((session) => session.focus === 'defense').length);
  put('closeoutWeakness', `${state.skillRatings.defense ?? 0}/10`);
  put('rimFinishingWeakness', `${state.skillRatings.finishing ?? 0}/10`);
  put('lateShotWeakness', `${state.skillRatings.iq ?? 0}/10`);
  put('improvementTrendText', state.sessions.length
    ? `${state.sessions.length} dated session${state.sessions.length === 1 ? '' : 's'} logged.`
    : 'Log a session to begin your dated progress history.');
  put('xpTotal', state.rewards.xp);
  put('streakCount', getStreak());
  put('weeklyChallengeCount', `${weekSessions().length}/${state.profile.weeklyTarget}`);
  put('motivationSummary', state.rewards.xp
    ? `${state.rewards.achievements.length} achievement${state.rewards.achievements.length === 1 ? '' : 's'} earned. Training sessions, not app visits, build your streak.`
    : 'Complete a workout to earn XP and start your streak.');

  const focus = getRecommendations()[0];
  put('dashboardFocusTitle', focus.title);
  put('dashboardFocusReason', focus.reason);
  put('recommendedFocusPill', focus.badge);
  renderShotBreakdown();
  renderTrendChart();
  renderPeriodSummary();
  renderSessionHistory();
  renderWorkoutHistory();
  renderRecommendations();
  renderAchievementSummary();
}

function renderShotBreakdown() {
  const list = document.getElementById('shotBreakdown');
  list.replaceChildren();
  for (const [key, label] of Object.entries(SHOT_TYPES)) {
    const entry = state.shotTypes[key];
    const item = document.createElement('li');
    const title = document.createElement('span');
    const counts = document.createElement('strong');
    const pct = document.createElement('span');
    title.textContent = label;
    counts.textContent = `${entry.made} made · ${entry.attempts - entry.made} missed`;
    pct.textContent = `${percentage(entry.made, entry.attempts)}%`;
    item.append(title, counts, pct);
    list.append(item);
  }
}

function renderTrendChart() {
  const chart = document.getElementById('progressTrendChart');
  const empty = document.getElementById('trendEmptyState');
  const days = currentPeriod === 'week' ? 7 : 30;
  const start = daysAgo(days - 1);
  const grouped = new Map();
  state.sessions.filter((session) => session.date >= start).forEach((session) => {
    const entry = grouped.get(session.date) || { made: 0, attempts: 0 };
    entry.made += session.made;
    entry.attempts += session.attempts;
    grouped.set(session.date, entry);
  });
  state.chartShots.filter((shot) => shot.date >= start).forEach((shot) => {
    const entry = grouped.get(shot.date) || { made: 0, attempts: 0 };
    entry.attempts += 1;
    if (shot.made) entry.made += 1;
    grouped.set(shot.date, entry);
  });
  const values = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  chart.replaceChildren();
  empty.hidden = values.length > 0;
  const ns = 'http://www.w3.org/2000/svg';
  const addSvgElement = (name, attrs) => {
    const element = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
    chart.append(element);
    return element;
  };
  [25, 65, 105, 145].forEach((y) => addSvgElement('line', { x1: 45, x2: 620, y1: y, y2: y, class: 'trend-gridline' }));
  if (!values.length) return;
  const points = values.map(([date, entry], index) => ({
    date,
    pct: percentage(entry.made, entry.attempts),
    x: values.length === 1 ? 332 : 50 + index * (560 / (values.length - 1)),
  }));
  const coords = points.map((point) => `${point.x},${165 - (point.pct * 1.35)}`).join(' ');
  addSvgElement('polyline', { points: coords, class: 'trend-line' });
  points.forEach((point) => {
    const y = 165 - (point.pct * 1.35);
    const dot = addSvgElement('circle', { cx: point.x, cy: y, r: 5, class: 'trend-dot' });
    const title = document.createElementNS(ns, 'title');
    title.textContent = `${formatDate(point.date)}: ${point.pct}%`;
    dot.append(title);
  });
}

function renderPeriodSummary() {
  const days = currentPeriod === 'week' ? 7 : 30;
  const start = daysAgo(days - 1);
  const sessions = completedSessions().filter((session) => session.date >= start);
  const chartShots = state.chartShots.filter((shot) => shot.date >= start);
  const puts = {
    periodSessions: sessions.length,
    periodMinutes: sessions.reduce((sum, session) => sum + session.minutes, 0),
    periodAttempts: sessions.reduce((sum, session) => sum + session.attempts, 0) + chartShots.length,
  };
  Object.entries(puts).forEach(([id, value]) => {
    document.getElementById(id).textContent = String(value);
  });
}

function renderSessionHistory() {
  const list = document.getElementById('sessionHistory');
  const sessions = [...state.sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  list.replaceChildren();
  document.getElementById('sessionHistoryCount').textContent = `${state.sessions.length} session${state.sessions.length === 1 ? '' : 's'}`;
  if (!sessions.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No sessions yet. Save a shooting session or complete a workout to build your history.';
    list.append(empty);
    return;
  }
  sessions.forEach((session) => {
    const row = document.createElement('div');
    row.className = 'history-row';
    const title = document.createElement('strong');
    const detail = document.createElement('span');
    const date = document.createElement('time');
    title.textContent = session.title;
    detail.textContent = `${session.made} made · ${session.attempts - session.made} missed · ${session.attempts} attempts · ${session.minutes} min`;
    date.textContent = formatDate(session.date);
    date.dateTime = session.date;
    row.append(title, detail, date);
    list.append(row);
  });
}

function renderWorkoutHistory() {
  const list = document.getElementById('completedWorkoutHistory');
  const sessions = completedSessions().filter((session) => session.kind !== 'shooting').slice().reverse().slice(0, 5);
  list.replaceChildren();
  if (!sessions.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Completed planned or academy workouts will appear here.';
    list.append(empty);
    return;
  }
  sessions.forEach((session) => {
    const row = document.createElement('div');
    row.className = 'history-row';
    const title = document.createElement('strong');
    const detail = document.createElement('span');
    title.textContent = session.title;
    detail.textContent = `${formatDate(session.date)} · ${session.minutes} min`;
    row.append(title, detail);
    list.append(row);
  });
}

function getRecommendations() {
  const recommendations = [];
  const profile = state.profile;
  const lowestCategory = Object.entries(state.shotTypes)
    .filter(([, entry]) => entry.attempts >= 5)
    .sort((a, b) => percentage(a[1].made, a[1].attempts) - percentage(b[1].made, b[1].attempts))[0];
  if (lowestCategory) {
    const [key, entry] = lowestCategory;
    const drill = key === 'freeThrow' ? DRILLS[2] : key === 'threePointer' || key === 'midrange' ? DRILLS[1] : DRILLS[3];
    recommendations.push({
      title: drill.name,
      reason: `${SHOT_TYPES[key]} are currently ${percentage(entry.made, entry.attempts)}% across ${entry.attempts} recorded attempts.`,
      badge: 'Based on shot log',
      focus: drill.focus,
    });
  }
  const shooting = Object.values(state.shotTypes).reduce((sum, entry) => sum + entry.attempts, 0);
  if (shooting >= 5 && state.seasonShootingPct < profile.targetPct) {
    recommendations.push({
      title: 'Build shot consistency',
      reason: `Your overall logged shooting rate is ${state.seasonShootingPct}%; your saved target is ${profile.targetPct}%. Use comfortable, repeatable reps and track makes and misses.`,
      badge: 'Goal progress',
      focus: 'shooting',
    });
  }
  const goalDrill = DRILLS.find((drill) => drill.focus === profile.goal) || DRILLS[0];
  recommendations.push({
    title: goalDrill.name,
    reason: `It matches your saved goal: ${SKILL_GOALS[profile.goal]}. Adapted for a ${profile.position.toLowerCase()} at ${profile.experience} level, using ${profile.equipment.replace('-', ' ')} around ${profile.location}.`,
    badge: 'Matches your goal',
    focus: goalDrill.focus,
  });
  const recent = completedSessions().filter((session) => session.date >= daysAgo(6)).length;
  if (recent >= 5) {
    recommendations.unshift({
      title: 'Recovery day',
      reason: `You logged ${recent} completed sessions in the last 7 days. Choose rest or gentle mobility today.`,
      badge: 'Rest recommended',
      focus: null,
    });
  } else if (state.sessionsCount === 0) {
    recommendations.unshift({
      title: 'Start with a baseline session',
      reason: 'No dated training sessions are recorded yet. A short, comfortable session gives future suggestions useful context.',
      badge: 'Build a baseline',
      focus: 'shooting',
    });
  }
  return recommendations.slice(0, 3);
}

function renderRecommendations() {
  const list = document.getElementById('coachRecommendations');
  list.replaceChildren();
  getRecommendations().forEach((recommendation) => {
    const card = document.createElement('article');
    card.className = 'recommendation-item';
    const heading = document.createElement('div');
    heading.className = 'recommendation-heading';
    const title = document.createElement('h5');
    const badge = document.createElement('span');
    const reason = document.createElement('p');
    title.textContent = recommendation.title;
    badge.className = 'pill';
    badge.textContent = recommendation.badge;
    reason.textContent = recommendation.reason;
    heading.append(title, badge);
    card.append(heading, reason);
    list.append(card);
  });
}

const ACHIEVEMENT_LABELS = {
  'first-session': 'First completed session',
  'five-sessions': 'Five completed sessions',
  'ten-sessions': 'Ten completed sessions',
  'hundred-shots': '100 recorded shot attempts',
  'iq-student': 'Five game IQ situations completed',
  'week-regular': 'Weekly session target reached',
};

function renderAchievementSummary() {
  const summary = document.getElementById('achievementSummary');
  if (!summary) return;
  summary.replaceChildren();
  if (!state.rewards.achievements.length) {
    summary.textContent = 'Achievements unlock when you complete real training or reach practice milestones.';
    return;
  }
  state.rewards.achievements.forEach((achievement) => {
    const item = document.createElement('span');
    item.className = 'pill success';
    item.textContent = ACHIEVEMENT_LABELS[achievement] || achievement;
    summary.append(item);
  });
}

function switchView(viewName) {
  if (!Object.hasOwn(viewMap, viewName)) return;
  const currentView = Object.keys(viewMap).find((key) => viewMap[key].classList.contains('active'));
  if (viewName === 'settings' && currentView && currentView !== 'settings') previousView = currentView;
  Object.entries(viewMap).forEach(([key, section]) => section.classList.toggle('active', key === viewName));
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === viewName));
  pageTitle.textContent = VIEW_TITLES[viewName];
  const settingsButton = document.getElementById('settingsBtn');
  const settingsOpen = viewName === 'settings';
  settingsButton.setAttribute('aria-label', settingsOpen ? 'Exit settings' : 'Open settings');
  settingsButton.title = settingsOpen ? 'Exit settings' : 'Settings';
  document.querySelector('.main-panel').scrollTop = 0;
  if (viewName === 'iq') renderQuestion();
}

function normalizeDrillName(name) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function findKnownDrill(name) {
  const normalized = normalizeDrillName(name);
  return DRILLS.find((drill) => normalizeDrillName(drill.name) === normalized);
}

function updateDrillFeedback(showError = false) {
  const drill = findKnownDrill(drillInput.value);
  drillInput.setAttribute('aria-invalid', String(showError && !drill));
  if (drill) {
    drillFeedback.textContent = `Recognized: ${drill.name} — ${drill.description}`;
    drillFeedback.classList.remove('error');
  } else if (showError) {
    drillFeedback.textContent = drillInput.value.trim()
      ? 'Drill not recognized. Choose a suggestion or check the spelling.'
      : 'Please enter a drill name.';
    drillFeedback.classList.add('error');
  } else {
    drillFeedback.textContent = '';
    drillFeedback.classList.remove('error');
  }
}

function addSession(session) {
  state.sessions.push({
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: localDate(),
    kind: 'shooting',
    title: 'Shooting practice',
    shotType: null,
    made: 0,
    attempts: 0,
    minutes: 0,
    focus: null,
    completed: true,
    ...session,
  });
  if (state.sessions.length > 2000) state.sessions.shift();
  state.sessionsCount += 1;
  state.todayMinutes += session.minutes;
  state.lastWorkout = session.title;
  unlockAchievements();
}

function addManualSession(event) {
  event.preventDefault();
  const made = Number(document.getElementById('madeShotsInput').value);
  const attempts = Number(document.getElementById('attemptsInput').value);
  const minutes = Number(document.getElementById('minutesInput').value);
  const shotType = document.getElementById('shotTypeInput').value;
  const drill = findKnownDrill(drillInput.value);
  if (![made, attempts, minutes].every(Number.isSafeInteger) || made < 0 || attempts < made || minutes < 0 || minutes > 180) {
    window.alert('Enter whole numbers from 0 to 180 minutes; makes cannot exceed attempts.');
    return;
  }
  if (attempts === 0 && minutes === 0) {
    window.alert('Log at least one shot attempt or one training minute.');
    return;
  }
  if (!drill) {
    updateDrillFeedback(true);
    drillInput.focus();
    return;
  }

  state.totalMade += made;
  state.totalAttempts += attempts;
  state.shotTypes[shotType].made += made;
  state.shotTypes[shotType].attempts += attempts;
  addSession({
    title: drill.name,
    shotType,
    made,
    attempts,
    minutes,
    focus: drill.focus,
  });
  state.rewards.xp += 10 + Math.min(20, Math.floor(minutes / 5));
  unlockAchievements();
  syncDerivedStats();
  const saved = saveState();
  updateDashboard();
  workoutForm.reset();
  document.getElementById('madeShotsInput').value = 0;
  document.getElementById('attemptsInput').value = 0;
  document.getElementById('minutesInput').value = 0;
  drillInput.value = '';
  updateDrillFeedback();
  if (saved) setStatus('globalStatus', `Saved ${made} makes from ${attempts} ${SHOT_TYPES[shotType].toLowerCase()}.`);
}

function clearWorkoutForm() {
  workoutForm.reset();
  document.getElementById('madeShotsInput').value = 0;
  document.getElementById('attemptsInput').value = 0;
  document.getElementById('minutesInput').value = 0;
  updateDrillFeedback();
}

function recordChartShot(made) {
  if (!selectedZone) return;
  const shotType = document.getElementById('chartShotType').value;
  state.totalAttempts += 1;
  state.shotTypes[shotType].attempts += 1;
  if (made) {
    state.totalMade += 1;
    state.shotTypes[shotType].made += 1;
  }
  state.chartShots.push({ date: localDate(), shotType, zone: selectedZone, made });
  if (state.chartShots.length > 10000) state.chartShots.shift();
  state.prValue = Math.max(state.prValue, state.totalMade);
  unlockAchievements();
  const saved = saveState();
  updateDashboard();
  if (saved) setStatus('selectedZoneText', `${made ? 'Make' : 'Miss'} recorded: ${SHOT_TYPES[shotType]} · ${selectedZone}.`);
}

function selectCourtZone(zone) {
  selectedZone = zone.dataset.zone;
  document.querySelectorAll('.court-zone').forEach((item) => item.classList.toggle('selected', item === zone));
  document.getElementById('selectedZoneText').textContent = `${selectedZone} selected. Record the result.`;
  document.getElementById('chartMadeBtn').disabled = false;
  document.getElementById('chartMissedBtn').disabled = false;
}

function populateProfile() {
  const profile = state.profile;
  document.getElementById('profileName').value = profile.name;
  document.getElementById('profilePosition').value = profile.position;
  document.getElementById('profileHand').value = profile.hand;
  document.getElementById('profileExperience').value = profile.experience;
  document.getElementById('profileAgeGroup').value = profile.ageGroup;
  document.getElementById('profileEquipment').value = profile.equipment;
  document.getElementById('profileLocation').value = profile.location;
  document.getElementById('profileGoal').value = profile.goal;
  document.getElementById('weeklyGoalInput').value = profile.weeklyTarget;
  document.getElementById('targetPctInput').value = profile.targetPct;
  const ratingIds = {
    shooting: 'ratingShooting',
    handling: 'ratingHandling',
    finishing: 'ratingFinishing',
    defense: 'ratingDefense',
    iq: 'ratingIq',
  };
  Object.entries(ratingIds).forEach(([key, id]) => {
    document.getElementById(id).value = state.skillRatings[key] ?? 5;
  });
}

function saveProfile(event) {
  event.preventDefault();
  const weeklyTarget = Number(document.getElementById('weeklyGoalInput').value);
  const targetPct = Number(document.getElementById('targetPctInput').value);
  if (!Number.isInteger(weeklyTarget) || weeklyTarget < 1 || weeklyTarget > 14
    || !Number.isInteger(targetPct) || targetPct < 1 || targetPct > 100) {
    setStatus('profileStatus', 'Weekly sessions must be 1–14 and target percentage must be 1–100.', true);
    return;
  }
  const name = document.getElementById('profileName').value.trim().slice(0, 40);
  state.profile = {
    name,
    position: document.getElementById('profilePosition').value,
    hand: document.getElementById('profileHand').value,
    experience: document.getElementById('profileExperience').value,
    ageGroup: document.getElementById('profileAgeGroup').value,
    equipment: document.getElementById('profileEquipment').value,
    location: document.getElementById('profileLocation').value,
    goal: document.getElementById('profileGoal').value,
    weeklyTarget,
    targetPct,
  };
  state.name = name;
  const ratingIds = {
    shooting: 'ratingShooting',
    handling: 'ratingHandling',
    finishing: 'ratingFinishing',
    defense: 'ratingDefense',
    iq: 'ratingIq',
  };
  Object.entries(ratingIds).forEach(([key, id]) => {
    state.skillRatings[key] = Number(document.getElementById(id).value);
  });
  unlockAchievements();
  const saved = saveState();
  updateDashboard();
  if (saved) setStatus('profileStatus', 'Profile and goals saved on this device.');
}

function focusDrill(focus) {
  const matches = DRILLS.filter((drill) => drill.focus === focus);
  return matches.length ? matches : DRILLS.filter((drill) => drill.focus === 'shooting');
}

function createPlan(event) {
  event.preventDefault();
  const duration = Number(document.getElementById('planDuration').value);
  const focusValue = document.getElementById('planFocus').value;
  const focus = focusValue === 'balanced' ? state.profile.goal : focusValue;
  const planParts = {
    15: [2, 6, 1, 4, 2],
    30: [4, 12, 2, 9, 3],
    45: [5, 19, 3, 14, 4],
    60: [6, 25, 4, 20, 5],
  }[duration];
  const drills = focusDrill(focus);
  const equipmentText = state.profile.equipment === 'bodyweight' ? 'Use controlled footwork and shadow repetitions without equipment.'
    : state.profile.equipment === 'ball' ? 'This plan uses a ball and bodyweight; use a safe open space.'
      : 'Use your available ball and court equipment only if the area is clear and safe.';
  const locationText = state.profile.location === 'indoors' ? 'Choose a clear indoor area and keep movements compact.'
    : state.profile.location === 'driveway' ? 'Use a flat, clear driveway and avoid practicing near vehicles or hard obstacles.'
      : state.profile.location === 'anywhere' ? 'Adapt the movement to a clear, safe space.'
        : 'Use a clear court and check the playing surface before starting.';
  const positionText = `For your ${state.profile.position.toLowerCase()} role, focus on balance, awareness, and controlled decisions.`;
  const ageGuidance = state.profile.ageGroup === 'under13'
    ? 'Keep effort light, take frequent water breaks, and practice with a responsible adult nearby.'
    : state.profile.ageGroup === 'teen'
        ? 'Use a qualified coach or responsible adult for feedback, and avoid training through pain.'
        : 'Use controlled effort, take breaks when needed, and avoid training through pain.';
  state.activeWorkout = {
    duration,
    focus,
    index: 0,
    elapsedSeconds: 0,
    started: false,
    remaining: planParts[0] * 60,
    running: false,
    blocks: [
      { title: 'Warm-up', description: `${locationText} ${ageGuidance} Begin with gentle movement, mobility, and easy ball control. Stop if anything hurts.`, seconds: planParts[0] * 60 },
      { title: drills[0].name, description: `${drills[0].description} ${equipmentText} ${positionText} ${ageGuidance}`, seconds: planParts[1] * 60 },
      { title: 'Rest and water', description: 'Pause, hydrate, and check how you feel. Extend the rest if needed.', seconds: planParts[2] * 60 },
      { title: drills[1 % drills.length].name, description: `${drills[1 % drills.length].description} Adapt speed to your ${state.profile.experience} experience. ${positionText} ${ageGuidance}`, seconds: planParts[3] * 60 },
      { title: 'Cooldown', description: 'Finish with easy walking and comfortable mobility. No painful stretching.', seconds: planParts[4] * 60 },
    ],
  };
  renderGeneratedPlan();
  const saved = saveState();
  renderWorkoutPlayer();
  if (saved) setStatus('playerStatus', `${duration}-minute ${SKILL_GOALS[focus] || 'balanced'} plan ready for your ${state.profile.position.toLowerCase()} profile.`);
}

function renderGeneratedPlan() {
  const container = document.getElementById('generatedPlan');
  container.replaceChildren();
  const workout = state.activeWorkout;
  if (!workout) return;
  workout.blocks.forEach((block) => {
    const row = document.createElement('div');
    row.className = 'plan-block';
    const title = document.createElement('strong');
    const duration = document.createElement('span');
    title.textContent = block.title;
    duration.textContent = `${Math.round(block.seconds / 60)} min`;
    row.append(title, duration);
    container.append(row);
  });
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, totalSeconds);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function renderWorkoutPlayer() {
  const player = document.getElementById('workoutPlayer');
  const workout = state.activeWorkout;
  player.hidden = !workout;
  if (!workout) return;
  const block = workout.blocks[workout.index];
  if (!block) return;
  document.getElementById('playerBlockTitle').textContent = `${workout.index + 1}/${workout.blocks.length} · ${block.title}`;
  document.getElementById('playerBlockDescription').textContent = block.description;
  document.getElementById('playerTimer').textContent = formatTime(workout.remaining);
  const isNewWorkout = !workout.started;
  document.getElementById('playerStartPauseBtn').textContent = workout.running ? 'Pause' : isNewWorkout ? 'Start' : 'Resume';
}

function advanceWorkoutBlock() {
  const workout = state.activeWorkout;
  if (!workout) return;
  if (workout.index + 1 >= workout.blocks.length) {
    completeWorkout();
    return;
  }
  workout.index += 1;
  workout.remaining = workout.blocks[workout.index].seconds;
  renderWorkoutPlayer();
  const saved = saveState();
}

function startWorkoutTimer() {
  if (timerHandle) window.clearInterval(timerHandle);
  timerHandle = window.setInterval(() => {
    const workout = state.activeWorkout;
    if (!workout || !workout.running) return;
    workout.remaining -= 1;
    workout.elapsedSeconds += 1;
    if (workout.remaining <= 0) advanceWorkoutBlock();
    renderWorkoutPlayer();
    if (workout.elapsedSeconds % 10 === 0) saveState();
  }, 1000);
}

function toggleWorkoutTimer() {
  if (!state.activeWorkout) return;
  state.activeWorkout.running = !state.activeWorkout.running;
  if (state.activeWorkout.running) state.activeWorkout.started = true;
  renderWorkoutPlayer();
  saveState();
  if (state.activeWorkout.running) startWorkoutTimer();
  else if (timerHandle) {
    window.clearInterval(timerHandle);
    timerHandle = null;
  }
  setStatus('playerStatus', state.activeWorkout.running ? 'Workout running. Pause or skip a block whenever needed.' : 'Workout paused. Resume when ready.');
}

function skipWorkoutBlock() {
  if (!state.activeWorkout) return;
  advanceWorkoutBlock();
  setStatus('playerStatus', 'Current block skipped. Continue at a comfortable pace.');
}

function completeWorkout() {
  const workout = state.activeWorkout;
  if (!workout) return;
  if (timerHandle) window.clearInterval(timerHandle);
  timerHandle = null;
  const minutes = Math.max(1, Math.min(workout.duration, Math.round(workout.elapsedSeconds / 60)));
  addSession({
    kind: 'planned',
    title: `${workout.duration}-minute ${SKILL_GOALS[workout.focus] || 'balanced'} workout`,
    focus: workout.focus,
    minutes,
    completed: true,
  });
  addReward(minutes, 'Workout complete.');
  state.activeWorkout = null;
  const saved = saveState();
  renderWorkoutPlayer();
  updateDashboard();
  if (!saved) setStatus('playerStatus', 'Workout completed in this session, but browser storage failed. Export your data before leaving.', true);
}

function levelForIq() {
  const selected = document.getElementById('iqLevel').value;
  if (selected !== 'auto') return selected;
  if (state.iq.correct >= 8) return 'advanced';
  if (state.iq.correct >= 3) return 'intermediate';
  return 'beginner';
}

function renderStrategyBoard() {
  const play = STRATEGY_PLAYS[document.getElementById('strategyPlaySelect').value] || STRATEGY_PLAYS['five-out'];
  const markers = document.getElementById('strategyBoardMarkers');
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const title = document.getElementById('strategyBoardTitle');
  const description = document.getElementById('strategyBoardDescription');
  markers.replaceChildren();
  title.textContent = play.title;
  description.textContent = `${play.title} tactical diagram. Offensive players are shown in lime and defenders in muted red.`;
  document.getElementById('strategyReadTitle').textContent = play.title;
  document.getElementById('strategyReadText').textContent = play.read;

  play.paths.forEach((pathData) => {
    const path = document.createElementNS(svgNamespace, 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'strategy-path');
    markers.append(path);
  });

  [['offense', play.offense], ['defense', play.defense]].forEach(([team, positions]) => {
    positions.forEach(([x, y], index) => {
      const group = document.createElementNS(svgNamespace, 'g');
      group.setAttribute('class', `strategy-player ${team}`);
      const circle = document.createElementNS(svgNamespace, 'circle');
      circle.setAttribute('cx', String(x));
      circle.setAttribute('cy', String(y));
      circle.setAttribute('r', '13');
      const label = document.createElementNS(svgNamespace, 'text');
      label.setAttribute('x', String(x));
      label.setAttribute('y', String(y + 4));
      label.textContent = `${team === 'offense' ? 'O' : 'D'}${index + 1}`;
      group.append(circle, label);
      markers.append(group);
    });
  });

  const ball = document.createElementNS(svgNamespace, 'circle');
  ball.setAttribute('cx', String(play.ball[0]));
  ball.setAttribute('cy', String(play.ball[1]));
  ball.setAttribute('r', '4');
  ball.setAttribute('class', 'strategy-ball');
  markers.append(ball);
}

function createStrategyAdvice(focus, problem) {
  const normalized = problem.toLowerCase();
  if (focus === 'offense') {
    if (/space|crowd|lane|stand still|spacing/.test(normalized)) {
      return {
        title: 'Create clear spacing',
        why: 'Crowded lanes let one defender guard multiple players and make drives harder.',
        steps: ['Move to an open perimeter window instead of following the ball.', 'If a teammate drives, stay wide or make a timed cut into space.', 'Be ready to catch, shoot within your practiced range, or make the extra pass.'],
        drill: 'Practice five-out spacing: one player drives while teammates relocate to open passing windows.',
      };
    }
    if (/screen|pick.?and.?roll|pick.?roll|trap|roll/.test(normalized)) {
      return {
        title: 'Read the screen defense',
        why: 'The defender’s coverage tells you whether to use the screen, pass, or keep the dribble alive.',
        steps: ['Approach the screen under control and make shoulder-to-shoulder contact with the screener.', 'Look at the on-ball defender and the help defender before choosing a direction.', 'If help closes the lane, pass to a visible teammate rather than forcing the drive.'],
        drill: 'Walk through five screen reads at half speed; call out the coverage before making a pass or change of direction.',
      };
    }
    if (/turnover|pass|pressure|double team|dribble/.test(normalized)) {
      return {
        title: 'Protect the ball and find an outlet',
        why: 'A calm pivot and clear passing angle reduce rushed decisions under pressure.',
        steps: ['Keep your body between the defender and the ball; use a strong, controlled pivot if stopped.', 'Look for a nearby safe outlet before attempting a cross-court pass.', 'If no advantage is available, reset the offense and re-space.'],
        drill: 'Practice controlled pivots and two-hand target passes with a partner at comfortable speed.',
      };
    }
    return {
      title: 'Build a simple offensive read',
      why: 'Good possessions start with spacing, seeing the help, and choosing the safest available advantage.',
      steps: ['Get to a balanced triple-threat position and scan the floor.', 'Attack only a clear lane; if help arrives, pass to the open teammate.', 'After passing, relocate to provide a new passing angle.'],
      drill: 'Rehearse catch-scan-drive-or-pass decisions from both wings without rushing.',
    };
  }

  if (/close.?out|shooter|shot|perimeter/.test(normalized)) {
    return {
      title: 'Close out under control',
      why: 'A balanced closeout contests the shot without giving up an easy drive or risking a collision.',
      steps: ['Sprint the first part of the closeout, then shorten your steps as you approach.', 'Stay balanced with a hand up and your body between the attacker and the basket.', 'If they drive, slide to contain them and communicate help; do not lunge or reach.'],
      drill: 'Use a partner or marker for controlled closeout-and-slide repetitions, alternating sides.',
    };
  }
  if (/help|drive|rim|paint|beaten/.test(normalized)) {
    return {
      title: 'Help early, then recover',
      why: 'A short, balanced help position can discourage a drive while keeping you close enough to recover.',
      steps: ['Position yourself so you can see both the ball and your assignment.', 'Step toward the driving lane only when needed; stay balanced and avoid contact.', 'As a teammate calls help, recover to the next open threat under control.'],
      drill: 'Walk through a drive-and-kick rotation at half speed, communicating “help” and “recover.”',
    };
  }
  if (/rotation|rotate|switch|assignment|open player/.test(normalized)) {
    return {
      title: 'Communicate the defensive rotation',
      why: 'Clear calls help teammates cover the ball and the next open player without doubling the same assignment.',
      steps: ['Call out the drive or screen early so teammates can prepare.', 'Take the nearest immediate threat if your teammate helps off their player.', 'Recover to your original assignment when the ball moves and the matchup is covered.'],
      drill: 'Practice three-player drive-and-kick rotations at walking pace, naming each matchup aloud.',
    };
  }
  if (/foul|reach|contact|pain/.test(normalized)) {
    return {
      title: 'Defend with balance, not reaching',
      why: 'Staying between the attacker and the basket reduces reach-in fouls and unsafe contact.',
      steps: ['Keep a comfortable stance and slide to maintain position.', 'Show your hands and contest vertically instead of swiping at the ball.', 'If beaten, recover safely rather than grabbing or colliding from behind.'],
      drill: 'Practice mirror slides with a partner at low speed, focusing on stance and safe distance.',
    };
  }
  return {
    title: 'Start with position and communication',
    why: 'Balanced positioning and clear calls help the defense respond without overcommitting.',
    steps: ['Stay between your assignment and the basket while keeping the ball in view.', 'Call out screens, drives, and help early.', 'Move under control and recover to an open player when the ball moves.'],
    drill: 'Rehearse a simple two-player closeout and help rotation at half speed.',
  };
}

function showStrategyAdvice(event) {
  event.preventDefault();
  const focus = document.getElementById('strategyAdviceFocus').value;
  const problem = document.getElementById('strategyProblemInput').value.trim();
  const result = document.getElementById('strategyAdviceResult');
  if (!problem) {
    result.hidden = true;
    return;
  }

  const advice = createStrategyAdvice(focus, problem);
  result.replaceChildren();
  const heading = document.createElement('h5');
  heading.textContent = advice.title;
  const rationale = document.createElement('p');
  rationale.textContent = advice.why;
  const steps = document.createElement('ol');
  advice.steps.forEach((step) => {
    const item = document.createElement('li');
    item.textContent = step;
    steps.append(item);
  });
  const drill = document.createElement('p');
  drill.className = 'strategy-drill';
  drill.textContent = `Try this: ${advice.drill}`;
  result.append(heading, rationale, steps, drill);
  result.hidden = false;
}

function renderQuestion() {
  const scenario = document.getElementById('iqScenario');
  if (!scenario) return;
  const level = levelForIq();
  document.getElementById('iqLevel').value = document.getElementById('iqLevel').value || 'auto';
  const pool = IQ_QUESTIONS.filter((question) => question.level === level);
  currentQuestion = pool.find((question) => !state.iq.completedQuestions.includes(question.id)) || pool[0];
  questionAnswered = state.iq.completedQuestions.includes(currentQuestion.id);
  scenario.replaceChildren();
  const topic = document.createElement('span');
  topic.className = 'pill accent';
  topic.textContent = `${currentQuestion.topic} · ${level}`;
  const prompt = document.createElement('h5');
  prompt.textContent = currentQuestion.prompt;
  const options = document.createElement('div');
  options.className = 'iq-options';
  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'iq-option';
    button.textContent = option;
    button.dataset.answer = String(index);
    button.disabled = questionAnswered;
    options.append(button);
  });
  scenario.append(topic, prompt, options);
  document.getElementById('iqFeedback').textContent = questionAnswered
    ? `Already completed. ${currentQuestion.explanation}`
    : '';
  document.getElementById('iqScore').textContent = `${state.iq.correct} correct`;
  document.getElementById('iqLessonCount').textContent = `${state.iq.completedQuestions.length} completed`;
}

function answerQuestion(button) {
  if (!currentQuestion || questionAnswered) return;
  questionAnswered = true;
  const selected = Number(button.dataset.answer);
  const correct = selected === currentQuestion.answer;
  state.iq.answered += 1;
  if (correct) state.iq.correct += 1;
  state.iq.completedQuestions.push(currentQuestion.id);
  if (!state.iq.completedTopics.includes(currentQuestion.topic)) state.iq.completedTopics.push(currentQuestion.topic);
  document.querySelectorAll('.iq-option').forEach((option) => {
    option.disabled = true;
    if (Number(option.dataset.answer) === currentQuestion.answer) option.classList.add('correct');
    else if (option === button) option.classList.add('incorrect');
  });
  document.getElementById('iqFeedback').textContent = `${correct ? 'Good read.' : 'Review the preferred read.'} ${currentQuestion.explanation}`;
  unlockAchievements();
  saveState();
  renderAchievementSummary();
  document.getElementById('iqScore').textContent = `${state.iq.correct} correct`;
  document.getElementById('iqLessonCount').textContent = `${state.iq.completedQuestions.length} completed`;
}

function nextQuestion() {
  if (!currentQuestion || !questionAnswered) {
    setStatus('iqFeedback', 'Choose an answer before moving to the next situation.');
    return;
  }
  renderQuestion();
}

function completeAcademyPractice(card) {
  const id = card.dataset.academyId;
  if (state.academy.completed.includes(id)) {
    setStatus('academyStatus', 'This lesson is already recorded as practiced.');
    return;
  }
  state.academy.completed.push(id);
  const title = card.querySelector('h4').textContent;
  const focusByPlayer = {
    curry: 'shooting',
    klay: 'shooting',
    kyrie: 'handling',
    luka: 'iq',
    shai: 'finishing',
    tatum: 'defense',
    giannis: 'finishing',
    jokic: 'iq',
  };
  addSession({ kind: 'academy', title: `${title} lesson practice`, minutes: 10, focus: focusByPlayer[id], completed: true });
  addReward(10, 'Academy practice complete.');
  const saved = saveState();
  updateDashboard();
  const button = card.querySelector('[data-academy-complete]');
  button.textContent = 'Practice recorded';
  button.disabled = true;
  if (saved) setStatus('academyStatus', `${title} practice saved.`);
}

function recommendAcademyStyle(event) {
  event.preventDefault();
  const form = document.getElementById('academyQuizForm');
  const scores = { shooter: 0, playmaker: 0, attacker: 0, versatile: 0, big: 0 };
  ['enjoy', 'strength', 'play'].forEach((question) => {
    const answer = form.elements[question].value;
    if (Object.hasOwn(scores, answer)) scores[answer] += 1;
  });
  const topStyle = Object.keys(scores).reduce((best, style) => scores[style] > scores[best] ? style : best, 'shooter');
  const match = ACADEMY_STYLE_MATCHES[topStyle];
  const result = document.getElementById('academyQuizResult');
  const title = document.createElement('h5');
  const intro = document.createElement('p');
  const players = document.createElement('div');
  title.textContent = `Suggested role: ${match.role}`;
  intro.textContent = `Your answers leaned toward ${topStyle === 'big' ? 'interior team play' : topStyle === 'playmaker' ? 'creating for teammates' : topStyle === 'shooter' ? 'shooting and off-ball movement' : topStyle === 'versatile' ? 'all-around wing play' : 'attacking space and finishing'}. Explore these player-inspired lessons:`;
  players.className = 'academy-match-list';
  match.players.forEach((id) => {
    const card = document.querySelector(`[data-academy-id="${id}"]`);
    const player = document.createElement('button');
    player.type = 'button';
    player.className = 'academy-match-link';
    player.dataset.academyMatch = id;
    player.textContent = ACADEMY_PLAYER_NAMES[id];
    players.append(player);
    card.classList.add('recommended-player');
  });
  document.querySelectorAll('.player-card').forEach((card) => {
    if (!match.players.includes(card.dataset.academyId)) card.classList.remove('recommended-player');
  });
  result.replaceChildren(title, intro, players);
  result.hidden = false;
}

function openAcademyMatch(event) {
  const button = event.target.closest('[data-academy-match]');
  if (!button) return;
  const card = document.querySelector(`[data-academy-id="${button.dataset.academyMatch}"]`);
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.setAttribute('tabindex', '-1');
  card.focus({ preventScroll: true });
}

function exportData() {
  const payload = storageLoadFailed
    ? corruptStorageRaw
    : JSON.stringify({
      app: 'HoopIQ',
      version: STATE_VERSION,
      exportedAt: new Date().toISOString(),
      state,
    }, null, 2);
  if (payload === null) {
    setStatus('dataStatus', 'No readable saved data is available to export.', true);
    return;
  }
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hoopiq-progress-${localDate()}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus('dataStatus', storageLoadFailed
    ? 'The unreadable saved payload was downloaded as a backup. It may not be importable; your stored data remains unchanged.'
    : 'Your HoopIQ data export was created on this device.');
}

function validateImportPayload(payload) {
  if (!isPlainObject(payload)) throw new Error('The file must contain a JSON object.');
  const imported = payload.app === 'HoopIQ' ? payload.state : payload;
  if (!isPlainObject(imported)) throw new Error('This file does not contain HoopIQ progress data.');
  for (const key of ['totalMade', 'totalAttempts', 'sessionsCount', 'todayMinutes']) {
    if (imported[key] !== undefined && (!Number.isSafeInteger(imported[key]) || imported[key] < 0)) {
      throw new Error(`The ${key} value must be a non-negative whole number.`);
    }
  }
  if (Array.isArray(imported.sessions)) {
    if (imported.sessions.length > 2000 || imported.sessions.some((session) => !normalizeSession(session))) {
      throw new Error('The session history contains invalid entries or exceeds 2,000 sessions.');
    }
  }
  if (Array.isArray(imported.chartShots) && imported.chartShots.length > 10000) {
    throw new Error('The shot chart history exceeds the 10,000 shot limit.');
  }
  if (Array.isArray(imported.chartShots) && imported.chartShots.some((shot) => !isPlainObject(shot)
    || !validDate(shot.date)
    || !Object.hasOwn(SHOT_TYPES, shot.shotType)
    || !['Left corner', 'Left wing', 'Top of key', 'Right wing', 'Right corner', 'Paint'].includes(shot.zone)
    || typeof shot.made !== 'boolean')) {
    throw new Error('The shot chart history contains an invalid entry.');
  }
  for (const key of Object.keys(SHOT_TYPES)) {
    const entry = imported.shotTypes?.[key];
    if (entry !== undefined && (!isPlainObject(entry)
      || !Number.isSafeInteger(entry.made) || !Number.isSafeInteger(entry.attempts)
      || entry.made < 0 || entry.attempts < entry.made)) {
      throw new Error(`The ${SHOT_TYPES[key].toLowerCase()} totals are invalid.`);
    }
  }
  return normalizeState(imported);
}

async function importData(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const imported = validateImportPayload(JSON.parse(text));
    if (!window.confirm('Replace the current HoopIQ data on this device with the data in this file? Export your current data first if you want a backup.')) return;
    state = imported;
    storageLoadFailed = false;
    corruptStorageRaw = null;
    if (!saveState()) return;
    populateProfile();
    renderGeneratedPlan();
    renderWorkoutPlayer();
    updateDashboard();
    renderQuestion();
    document.querySelectorAll('[data-academy-complete]').forEach((button) => {
      const done = state.academy.completed.includes(button.closest('[data-academy-id]').dataset.academyId);
      button.disabled = done;
      button.textContent = done ? 'Practice recorded' : 'Log lesson practice';
    });
    setStatus('dataStatus', 'HoopIQ data imported and saved on this device.');
    setStatus('globalStatus', 'HoopIQ data imported.');
  } catch (error) {
    console.error('HoopIQ import failed validation.', error);
    setStatus('dataStatus', `Import failed: ${error.message || 'Could not read this file.'}`, true);
  }
}

function resetProgress() {
  if (!window.confirm('Reset your saved HoopIQ progress to zero? Export your data first if you want a backup.')) return;
  if (!window.confirm('This removes all saved sessions, profile settings, goals, and rewards from this browser. Continue?')) return;
  state = normalizeState(DEFAULT_STATE);
  storageLoadFailed = false;
  corruptStorageRaw = null;
  if (timerHandle) window.clearInterval(timerHandle);
  timerHandle = null;
  const saved = saveState();
  clearWorkoutForm();
  populateProfile();
  renderGeneratedPlan();
  renderWorkoutPlayer();
  updateDashboard();
  renderQuestion();
  if (saved) setStatus('globalStatus', 'Progress reset. Your previous data cannot be restored unless you exported it.');
}

function bindEvents() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    if (button.id === 'quickWorkoutBtn' || button.id === 'resetProgressBtn') return;
    button.addEventListener('click', () => {
      const target = button.dataset.view;
      if (target) switchView(target);
    });
  });
  quickWorkoutBtn.addEventListener('click', () => {
    switchView('progress');
    document.getElementById('madeShotsInput').focus();
  });
  resetProgressBtn.addEventListener('click', resetProgress);
  document.getElementById('settingsResetProgressBtn').addEventListener('click', resetProgress);
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.addEventListener('click', toggleTheme));
  document.getElementById('settingsBtn').addEventListener('click', () => {
    const settingsOpen = viewMap.settings.classList.contains('active');
    switchView(settingsOpen ? previousView : 'settings');
  });
  workoutForm.addEventListener('submit', addManualSession);
  document.getElementById('addSampleSessionBtn').addEventListener('click', clearWorkoutForm);
  DRILLS.forEach((drill) => {
    const option = document.createElement('option');
    option.value = drill.name;
    document.getElementById('knownDrills').append(option);
  });
  drillInput.addEventListener('input', () => updateDrillFeedback());
  drillInput.addEventListener('blur', () => updateDrillFeedback(true));
  document.querySelectorAll('.court-zone').forEach((zone) => {
    zone.addEventListener('click', () => selectCourtZone(zone));
    zone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectCourtZone(zone);
      }
    });
  });
  document.getElementById('chartMadeBtn').addEventListener('click', () => recordChartShot(true));
  document.getElementById('chartMissedBtn').addEventListener('click', () => recordChartShot(false));
  document.querySelectorAll('[data-period]').forEach((button) => button.addEventListener('click', () => {
    currentPeriod = button.dataset.period;
    document.querySelectorAll('[data-period]').forEach((item) => item.classList.toggle('selected', item === button));
    renderTrendChart();
    renderPeriodSummary();
  }));
  document.getElementById('profileForm').addEventListener('submit', saveProfile);
  document.getElementById('plannerForm').addEventListener('submit', createPlan);
  document.getElementById('playerStartPauseBtn').addEventListener('click', toggleWorkoutTimer);
  document.getElementById('playerSkipBtn').addEventListener('click', skipWorkoutBlock);
  document.getElementById('playerCompleteBtn').addEventListener('click', completeWorkout);
  document.getElementById('iqLevel').addEventListener('change', renderQuestion);
  document.getElementById('academyQuizForm').addEventListener('submit', recommendAcademyStyle);
  document.getElementById('academyQuizResult').addEventListener('click', openAcademyMatch);
  document.getElementById('strategyPlaySelect').addEventListener('change', renderStrategyBoard);
  document.getElementById('strategyAdviceForm').addEventListener('submit', showStrategyAdvice);
  document.getElementById('iqScenario').addEventListener('click', (event) => {
    const button = event.target.closest('.iq-option');
    if (button) answerQuestion(button);
  });
  document.getElementById('nextIqBtn').addEventListener('click', nextQuestion);
  document.getElementById('exportDataBtn').addEventListener('click', exportData);
  document.getElementById('importDataBtn').addEventListener('click', () => document.getElementById('importDataInput').click());
  document.getElementById('importDataInput').addEventListener('change', (event) => {
    importData(event.target.files[0]);
    event.target.value = '';
  });
  document.querySelectorAll('[data-academy-complete]').forEach((button) => {
    button.addEventListener('click', () => completeAcademyPractice(button.closest('[data-academy-id]')));
  });
}

function init() {
  if (state.activeWorkout) {
    state.activeWorkout.running = false;
    setStatus('playerStatus', 'Workout restored and paused. Resume when you are ready.');
  }
  populateProfile();
  document.querySelectorAll('[data-academy-complete]').forEach((button) => {
    const card = button.closest('[data-academy-id]');
    if (state.academy.completed.includes(card.dataset.academyId)) {
      button.disabled = true;
      button.textContent = 'Practice recorded';
    }
  });
  syncDerivedStats();
  renderGeneratedPlan();
  updateDashboard();
  renderWorkoutPlayer();
  renderQuestion();
  renderStrategyBoard();
  updateThemeControls();
  switchView('dashboard');
  bindEvents();
  if (storageLoadFailed) {
    setStatus('globalStatus', 'Saved data could not be read and was left unchanged. Import a valid backup or confirm a reset to continue.', true);
  } else {
    saveState();
  }
}

init();
