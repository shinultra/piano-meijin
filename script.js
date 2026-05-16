const NOTE_KEYS = ['1','2','3','4','5','6','7','8'];
const NOTE_NAMES = {
  '1': 'ド', '2': 'レ', '3': 'ミ', '4': 'ファ',
  '5': 'ソ', '6': 'ラ', '7': 'シ', '8': 'ド+'
};
const NOTE_FREQUENCIES = {
  '1': 261.63,
  '2': 293.66,
  '3': 329.63,
  '4': 349.23,
  '5': 392.00,
  '6': 440.00,
  '7': 493.88,
  '8': 523.25
};
const LEAD_TIME = 2.2;
const PERFECT_WINDOW = 0.12;
const GOOD_WINDOW = 0.24;
const RELEASE_GRACE = 0.3;
const DEFAULT_DURATION = 0.2;
const MAX_SCORE = 100;

let audioContext;
let unlockedIndex = 0;
let activeSong = null;
let gameStartTime = 0;
let animationFrameId = null;
let currentScore = 0;
let pointPerNote = 0;
let judgeText = '準備中';
let allNotes = [];
let isPlaying = false;
let currentSongIndex = 0;
const pressedKeys = new Set();

function judgeTimingDelta(delta) {
  const abs = Math.abs(delta);
  if (abs <= PERFECT_WINDOW) return 'Perfect';
  if (abs <= GOOD_WINDOW) return 'Good';
  return 'Miss';
}

function judgmentValue(label) {
  if (label === 'Perfect') return 1.0;
  if (label === 'Good') return 0.72;
  return 0;
}

function worstJudgment(a, b) {
  if (a === 'Miss' || b === 'Miss') return 'Miss';
  if (a === 'Good' || b === 'Good') return 'Good';
  return 'Perfect';
}

const selectionScreen = document.getElementById('selection-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const songListElement = document.getElementById('song-list');
const currentSongTitle = document.getElementById('current-song-title');
const currentSongSubtitle = document.getElementById('current-song-subtitle');
const scoreValue = document.getElementById('score-value');
const judgeElement = document.getElementById('judge-text');
const noteTrack = document.getElementById('note-track');
const keyboardPanel = document.getElementById('keyboard-panel');
const finalScore = document.getElementById('final-score');
const finalJudge = document.getElementById('final-judge');
const btnBackSelection = document.getElementById('btn-back-selection');
const btnRetry = document.getElementById('btn-retry');
const btnNextStage = document.getElementById('btn-next-stage');
const backgroundLayer = document.getElementById('background-layer');

function init() {
  prepareAudio();
  renderSongList();
  buildKeyboard();
  btnBackSelection.addEventListener('click', goToSelection);
  btnRetry.addEventListener('click', () => selectSong(currentSongIndex));
  btnNextStage.addEventListener('click', () => selectSong(currentSongIndex + 1));
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}

function prepareAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') {
    document.body.addEventListener('pointerdown', resumeAudioContext, { once: true });
  }
}

function resumeAudioContext() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function renderSongList() {
  songListElement.innerHTML = '';
  SONG_LIST.forEach((song, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'song-card';
    card.disabled = index > unlockedIndex;
    if (index > unlockedIndex) {
      card.classList.add('disabled');
    }
    card.innerHTML = `
      <img class="song-thumb" src="${song.image}" alt="${song.title} のイメージ">
      <div>
        <h3 class="song-title">${song.title}</h3>
        <p class="song-subtitle">${song.subtitle}</p>
      </div>
      <div class="song-meta">
        <span class="button-label">${index === 0 ? '練習' : 'ステージ ' + (index + 1)}</span>
        ${index > unlockedIndex ? '<span class="song-locked">LOCKED</span>' : ''}
      </div>
    `;
    card.addEventListener('click', () => selectSong(index));
    songListElement.appendChild(card);
  });
}

function selectSong(index) {
  if (index > unlockedIndex) return;
  activeSong = SONG_LIST[index];
  currentSongIndex = index;
  showScreen('game');
  updateBackground(activeSong.image);
  startGame();
}

function updateBackground(imagePath) {
  backgroundLayer.style.backgroundImage = `url('${imagePath}')`;
  backgroundLayer.style.backgroundSize = 'cover';
  backgroundLayer.style.backgroundPosition = 'center';
  backgroundLayer.style.opacity = '0.55';
}

function startGame() {
  isPlaying = true;
  currentScore = 0;
  pointPerNote = MAX_SCORE / activeSong.notes.length;
  scoreValue.textContent = Math.round(currentScore);
  scoreValue.classList.remove('passing');
  judgeText = '演奏開始';
  judgeElement.textContent = judgeText;
  currentSongTitle.textContent = activeSong.title;
  currentSongSubtitle.textContent = activeSong.subtitle;
  noteTrack.innerHTML = '<div class="hit-line"></div>';
  pressedKeys.clear();
  allNotes = activeSong.notes.map((note, index) => ({
    ...note,
    duration: typeof note.duration === 'number' ? note.duration : DEFAULT_DURATION,
    state: 'pending',
    pressTime: null,
    releaseTime: null,
    pressJudgment: null,
    releaseJudgment: null,
    noteElement: null,
    blockHeight: 0,
    index
  }));
  createNoteElements();
  showCountdown(3, () => {
    gameStartTime = audioContext.currentTime + 0.05;
    scheduleSongEnd();
    animationFrameId = requestAnimationFrame(updateNotes);
    judgeText = '演奏開始';
    judgeElement.textContent = judgeText;
  });
}

function showCountdown(seconds, cb) {
  const el = document.getElementById('countdown');
  if (!el) { cb(); return; }
  el.classList.remove('hidden');
  let s = seconds;
  el.textContent = s;
  const interval = setInterval(() => {
    s -= 1;
    if (s > 0) {
      el.textContent = s;
    } else {
      clearInterval(interval);
      el.textContent = 'Start';
      setTimeout(() => { el.classList.add('hidden'); el.textContent = ''; cb(); }, 500);
    }
  }, 1000);
}

function createNoteElements() {
  const trackHeight = noteTrack.clientHeight || 480;
  const speed = (trackHeight - 92) / LEAD_TIME;
  allNotes.forEach(note => {
    const block = document.createElement('div');
    block.className = 'note-block';
    const blockHeight = Math.max(44, speed * note.duration);
    if (note.duration > 0.4) block.classList.add('long-note');
    block.textContent = NOTE_NAMES[note.key];
    block.style.width = `calc(${100 / NOTE_KEYS.length}% - 10px)`;
    block.style.left = `calc(${NOTE_KEYS.indexOf(note.key) * (100 / NOTE_KEYS.length)}% + 5px)`;
    block.style.height = `${blockHeight}px`;
    block.style.top = `${-blockHeight - 20}px`;
    note.noteElement = block;
    note.blockHeight = blockHeight;
    noteTrack.appendChild(block);
  });
}

function updateNotes() {
  const currentTime = audioContext.currentTime - gameStartTime;
  const trackHeight = noteTrack.clientHeight || 480;
  const distance = trackHeight - 92;
  allNotes.forEach(note => {
    if (note.state === 'completed' || note.state === 'missed') return;
    const visibleTime = note.time - LEAD_TIME;
    if (currentTime >= visibleTime) {
      const headProgress = (currentTime - visibleTime) / LEAD_TIME;
      const headY = headProgress * distance;
      note.noteElement.style.top = `${headY - note.blockHeight}px`;
    }
    if (note.state === 'pending' && currentTime > note.time + GOOD_WINDOW) {
      autoMissNote(note);
    } else if (note.state === 'pressed' && currentTime > note.time + note.duration + GOOD_WINDOW + RELEASE_GRACE) {
      autoReleaseNote(note);
    }
  });

  const last = activeSong.notes[activeSong.notes.length - 1];
  const lastEnd = last.time + (typeof last.duration === 'number' ? last.duration : DEFAULT_DURATION);
  if (currentTime < lastEnd + 2) {
    animationFrameId = requestAnimationFrame(updateNotes);
  }
}

function handleKeyDown(event) {
  if (!isPlaying) return;
  const key = event.key;
  if (!NOTE_KEYS.includes(key)) return;
  if (pressedKeys.has(key)) return;
  pressedKeys.add(key);
  const element = document.querySelector(`.key-button[data-key="${key}"]`);
  if (element) element.classList.add('active');
  pressNote(key);
}

function handleKeyUp(event) {
  const key = event.key;
  if (!pressedKeys.has(key)) return;
  pressedKeys.delete(key);
  const element = document.querySelector(`.key-button[data-key="${key}"]`);
  if (element) element.classList.remove('active');
  releaseNote(key);
}

function buildKeyboard() {
  NOTE_KEYS.forEach(key => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'key-button';
    button.dataset.key = key;
    button.innerHTML = `<p class="key-note">${NOTE_NAMES[key]}</p><p class="key-label">${key}</p>`;
    button.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (button.dataset.pressed === 'true') return;
      button.dataset.pressed = 'true';
      try { button.setPointerCapture(e.pointerId); } catch (_) {}
      button.classList.add('active');
      pressNote(key);
    });
    const releaseFromPointer = () => {
      if (button.dataset.pressed !== 'true') return;
      button.dataset.pressed = 'false';
      button.classList.remove('active');
      releaseNote(key);
    };
    button.addEventListener('pointerup', releaseFromPointer);
    button.addEventListener('pointercancel', releaseFromPointer);
    button.addEventListener('lostpointercapture', releaseFromPointer);
    keyboardPanel.appendChild(button);
  });
  [1, 2, 4, 5, 6].forEach(afterIndex => {
    const black = document.createElement('span');
    black.className = `black-key bk-${afterIndex}`;
    black.setAttribute('aria-hidden', 'true');
    keyboardPanel.appendChild(black);
  });
}

function pressNote(key) {
  if (!isPlaying) return;
  playNoteSound(key);
  const target = findClosestPendingNoteForKey(key);
  if (!target) {
    judgeText = 'Miss';
    judgeElement.textContent = judgeText;
    showJudgmentEffect(key, 'Miss');
    return;
  }
  const currentTime = audioContext.currentTime - gameStartTime;
  const pressDelta = currentTime - target.time;
  const pressJudgment = judgeTimingDelta(pressDelta);
  if (pressJudgment === 'Miss') {
    autoMissNote(target);
    return;
  }
  target.state = 'pressed';
  target.pressTime = currentTime;
  target.pressJudgment = pressJudgment;
  target.noteElement.classList.add('note-pressed');
  judgeText = pressJudgment;
  judgeElement.textContent = judgeText;
  showJudgmentEffect(key, pressJudgment);
}

function releaseNote(key) {
  const note = allNotes.find(n => n.key === key && n.state === 'pressed');
  if (!note) return;
  const currentTime = audioContext.currentTime - gameStartTime;
  const expectedEnd = note.time + note.duration;
  const releaseDelta = currentTime - expectedEnd;
  const releaseJudgment = judgeTimingDelta(releaseDelta);
  note.releaseTime = currentTime;
  note.releaseJudgment = releaseJudgment;
  note.state = 'completed';
  finalizeNote(note);
  const final = worstJudgment(note.pressJudgment, releaseJudgment);
  judgeText = final;
  judgeElement.textContent = judgeText;
  showJudgmentEffect(key, releaseJudgment);
}

function showJudgmentEffect(key, label) {
  const colIndex = NOTE_KEYS.indexOf(key);
  if (colIndex < 0) return;
  const cssLabel = label.toLowerCase();

  const keyButton = document.querySelector(`.key-button[data-key="${key}"]`);
  if (keyButton) {
    keyButton.classList.remove('flash-perfect', 'flash-good', 'flash-miss');
    void keyButton.offsetWidth;
    keyButton.classList.add(`flash-${cssLabel}`);
    setTimeout(() => keyButton.classList.remove(`flash-${cssLabel}`), 420);
  }

  const effect = document.createElement('div');
  effect.className = `judgment-effect judgment-${cssLabel}`;
  effect.textContent = label;
  effect.style.left = `${(colIndex + 0.5) * (100 / NOTE_KEYS.length)}%`;
  noteTrack.appendChild(effect);
  setTimeout(() => effect.remove(), 850);
}

function findClosestPendingNoteForKey(key) {
  const currentTime = audioContext.currentTime - gameStartTime;
  const window = GOOD_WINDOW + 0.05;
  const candidates = allNotes.filter(note =>
    note.key === key &&
    note.state === 'pending' &&
    Math.abs(currentTime - note.time) <= window
  );
  if (!candidates.length) return null;
  return candidates.reduce((best, note) =>
    Math.abs(currentTime - note.time) < Math.abs(currentTime - best.time) ? note : best
  );
}

function finalizeNote(note) {
  const pressVal = judgmentValue(note.pressJudgment);
  const releaseVal = judgmentValue(note.releaseJudgment);
  const factor = (pressVal + releaseVal) / 2;
  currentScore = Math.min(MAX_SCORE, currentScore + pointPerNote * factor);
  scoreValue.textContent = Math.round(currentScore);
  scoreValue.classList.toggle('passing', currentScore >= 60);
  note.noteElement.classList.remove('note-pressed');
  const final = worstJudgment(note.pressJudgment, note.releaseJudgment);
  note.noteElement.classList.add(`note-${final.toLowerCase()}`);
  note.noteElement.style.opacity = '0.35';
}

function autoMissNote(note) {
  if (note.state === 'completed' || note.state === 'missed') return;
  note.state = 'missed';
  note.pressJudgment = 'Miss';
  note.releaseJudgment = 'Miss';
  note.noteElement.classList.remove('note-pressed');
  note.noteElement.classList.add('note-missed');
  note.noteElement.style.opacity = '0.2';
  judgeText = 'Miss';
  judgeElement.textContent = judgeText;
  showJudgmentEffect(note.key, 'Miss');
}

function autoReleaseNote(note) {
  if (note.state !== 'pressed') return;
  note.releaseTime = audioContext.currentTime - gameStartTime;
  note.releaseJudgment = 'Miss';
  note.state = 'completed';
  finalizeNote(note);
  showJudgmentEffect(note.key, 'Miss');
  judgeText = 'Miss';
  judgeElement.textContent = judgeText;
}

function scheduleSongEnd() {
  const last = activeSong.notes[activeSong.notes.length - 1];
  const lastDur = typeof last.duration === 'number' ? last.duration : DEFAULT_DURATION;
  const lastTime = last.time + lastDur + 1.4;
  const endTime = gameStartTime + lastTime;
  setTimeout(() => finishSong(), (endTime - audioContext.currentTime) * 1000);
}

function finishSong() {
  if (!isPlaying) return;
  isPlaying = false;
  cancelAnimationFrame(animationFrameId);
  const score = Math.min(MAX_SCORE, Math.round(currentScore));
  finalScore.textContent = score;
  finalScore.classList.toggle('passing', score >= 60);
  finalJudge.textContent = score >= 60 ? '合格！次のステージへ' : '再挑戦しましょう';
  if (score >= 60 && currentSongIndex === unlockedIndex && unlockedIndex < SONG_LIST.length - 1) {
    unlockedIndex += 1;
  }
  const canAdvance = score >= 60 && currentSongIndex + 1 < SONG_LIST.length;
  btnNextStage.style.display = canAdvance ? '' : 'none';
  showScreen('result');
}

function goToSelection() {
  renderSongList();
  showScreen('selection');
}

function showScreen(name) {
  selectionScreen.classList.toggle('screen-active', name === 'selection');
  gameScreen.classList.toggle('screen-active', name === 'game');
  resultScreen.classList.toggle('screen-active', name === 'result');
}

function playNoteSound(key) {
  if (!audioContext) return;
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  const frequency = NOTE_FREQUENCIES[key];
  if (!frequency) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  filter.Q.value = 1.5;

  const real = new Float32Array([0, 1, 0.46, 0.26, 0.14, 0.08, 0.04, 0.02]);
  const imag = new Float32Array(real.length);
  const wave = audioContext.createPeriodicWave(real, imag, { disableNormalization: false });
  osc.setPeriodicWave(wave);
  osc.frequency.value = frequency;

  const now = audioContext.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.75, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.02, now + 0.45);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(now);
  osc.stop(now + 1.1);
}

document.addEventListener('DOMContentLoaded', init);
