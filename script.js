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
  allNotes = activeSong.notes.map((note, index) => ({
    ...note,
    hit: false,
    noteElement: null,
    index
  }));
  createNoteElements();
  // カウントダウンを表示してから演奏開始
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
  const trackWidth = noteTrack.clientWidth;
  const columnWidth = trackWidth / NOTE_KEYS.length;
  allNotes.forEach(note => {
    const block = document.createElement('div');
    block.className = 'note-block';
    block.textContent = NOTE_NAMES[note.key];
    block.style.width = `calc(${100 / NOTE_KEYS.length}% - 10px)`;
    block.style.left = `calc(${NOTE_KEYS.indexOf(note.key) * (100 / NOTE_KEYS.length)}% + 5px)`;
    block.style.top = '-70px';
    note.noteElement = block;
    noteTrack.appendChild(block);
  });
}

function updateNotes() {
  const currentTime = audioContext.currentTime - gameStartTime;
  allNotes.forEach(note => {
    const timeFromHit = currentTime - note.time;
    const visibleTime = note.time - LEAD_TIME;
    if (currentTime >= visibleTime) {
      const progress = Math.min(1, Math.max(0, (currentTime - visibleTime) / LEAD_TIME));
      const y = progress * (noteTrack.clientHeight - 60);
      note.noteElement.style.transform = `translateY(${y}px)`;
    }
    if (!note.hit && currentTime > note.time + GOOD_WINDOW) {
      markMiss(note);
    }
  });

  if (currentTime < activeSong.notes[activeSong.notes.length - 1].time + 2) {
    animationFrameId = requestAnimationFrame(updateNotes);
  }
}

function handleKeyDown(event) {
  if (!isPlaying) return;
  const key = event.key;
  if (!NOTE_KEYS.includes(key)) return;
  const element = document.querySelector(`.key-button[data-key="${key}"]`);
  if (element) {
    element.classList.add('active');
    window.setTimeout(() => element.classList.remove('active'), 120);
  }
  pressNote(key);
}

function buildKeyboard() {
  NOTE_KEYS.forEach(key => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'key-button';
    button.dataset.key = key;
    button.innerHTML = `<p class="key-note">${NOTE_NAMES[key]}</p><p class="key-label">${key}</p>`;
    button.addEventListener('pointerdown', () => pressNote(key));
    keyboardPanel.appendChild(button);
  });
  // Decorative black keys (between C-D, D-E, F-G, G-A, A-B in C major)
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
  const target = findClosestNoteForKey(key);
  if (!target) {
    judgeText = 'Miss';
    judgeElement.textContent = judgeText;
    return;
  }
  const currentTime = audioContext.currentTime - gameStartTime;
  const delta = Math.abs(currentTime - target.time);
  if (delta <= PERFECT_WINDOW) {
    scoreHit(target, 3, 'Perfect');
  } else if (delta <= GOOD_WINDOW) {
    scoreHit(target, 2, 'Good');
  } else {
    markMiss(target);
  }
}

function findClosestNoteForKey(key) {
  const candidates = allNotes.filter(note => note.key === key && !note.hit);
  if (!candidates.length) return null;
  return candidates.reduce((best, note) => {
    const currentTime = audioContext.currentTime - gameStartTime;
    const bestDist = Math.abs(currentTime - best.time);
    const noteDist = Math.abs(currentTime - note.time);
    return noteDist < bestDist ? note : best;
  });
}

function scoreHit(note, multiplier, label) {
  if (note.hit) return;
  note.hit = true;
  note.noteElement.style.opacity = '0.35';
  note.noteElement.style.transform += ' scale(0.9)';
  const scoreStep = multiplier === 3 ? pointPerNote : pointPerNote * 0.72;
  currentScore += scoreStep;
  currentScore = Math.min(currentScore, MAX_SCORE);
  scoreValue.textContent = Math.round(currentScore);
  scoreValue.classList.toggle('passing', currentScore >= 60);
  judgeText = label;
  judgeElement.textContent = judgeText;
}

function markMiss(note) {
  if (note.hit) return;
  note.hit = true;
  note.noteElement.style.opacity = '0.18';
  note.noteElement.style.transform += ' translateY(12px)';
  judgeText = 'Miss';
  judgeElement.textContent = judgeText;
}

function scheduleSongEnd() {
  const lastTime = activeSong.notes[activeSong.notes.length - 1].time + 1.2;
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
