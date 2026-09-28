/**
 * TOC Case Study 10: Recognition of Language L = {aⁿbⁿ | n ≥ 1}
 * Core Simulation Engine: Turing Machine & Pushdown Automaton
 */

// ==========================================
// Web Audio API Synthesizer (Sound FX)
// ==========================================
class SoundFX {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playTapeClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playStackPush() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(620, this.audioCtx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.06);
    } catch (e) {}
  }

  playStackPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, this.audioCtx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.06);
    } catch (e) {}
  }

  playAccept() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.08);
        osc.stop(this.audioCtx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  playReject() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.2);
    } catch (e) {}
  }
}

const sound = new SoundFX();

// ==========================================
// Turing Machine Engine for L = {a^n b^n | n >= 1}
// ==========================================
class TuringMachine {
  constructor(inputString = '') {
    this.inputString = inputString;
    this.reset();
  }

  reset() {
    this.tape = this.buildInitialTape(this.inputString);
    this.head = 0; // Starts at cell 0
    this.state = 'q0';
    this.stepCount = 0;
    this.status = 'READY'; // READY, RUNNING, PAUSED, ACCEPTED, REJECTED
    this.history = [];
    this.traceLog = [];
    this.currentTransitionId = null;
    this.currentRowId = null;
    this.currentEdgeId = null;

    const initialSymbol = this.getScannedSymbol();
    this.traceLog.push({
      step: 0,
      state: 'q0',
      scanned: initialSymbol,
      desc: `Step 0: State: q0, Read: '${initialSymbol}'`,
      status: 'READY'
    });
    this.saveSnapshot(`Step 0: Initial state q0, scanned symbol '${initialSymbol}', head at cell 0.`);
  }

  buildInitialTape(str) {
    if (!str || str.length === 0) {
      return ['B', 'B', 'B'];
    }
    const chars = str.split('');
    return [...chars, 'B', 'B', 'B'];
  }

  saveSnapshot(desc = '') {
    this.history.push({
      tape: [...this.tape],
      head: this.head,
      state: this.state,
      stepCount: this.stepCount,
      status: this.status,
      desc: desc,
      transitionId: this.currentTransitionId,
      rowId: this.currentRowId,
      edgeId: this.currentEdgeId
    });
  }

  getScannedSymbol() {
    if (this.head < 0 || this.head >= this.tape.length) return 'B';
    return this.tape[this.head] || 'B';
  }

  getNextAction() {
    const symbol = this.getScannedSymbol();
    const st = this.state;

    if (st === 'q_accept') return { type: 'HALT', text: 'Accepted (Halted in q_acc)', nextState: 'q_accept', write: symbol, dir: 'HALT' };
    if (st === 'q_reject') return { type: 'HALT', text: 'Rejected (Halted in q_rej)', nextState: 'q_reject', write: symbol, dir: 'HALT' };

    // Transition definitions: δ(state, symbol) = (nextState, writeSymbol, direction, tableCell, rowId, edgeId)
    // Direction: 'R' (Right), 'L' (Left)
    if (st === 'q0') {
      if (symbol === 'a') {
        return { nextState: 'q1', write: 'X', dir: 'R', cell: 'cell-q0-a', row: 'row-q0', edge: 'edge-q0-q1', text: 'δ(q₀, a) → (q₁, X, R)' };
      }
      if (symbol === 'Y') {
        return { nextState: 'q3', write: 'Y', dir: 'R', cell: 'cell-q0-Y', row: 'row-q0', edge: 'edge-q0-q3', text: 'δ(q₀, Y) → (q₃, Y, R)' };
      }
      // Rejections in q0:
      if (symbol === 'B') {
        return { nextState: 'q_reject', write: 'B', dir: 'HALT', row: 'row-q0', text: 'Reject: Empty string or premature blank (n ≥ 1 required)' };
      }
      return { nextState: 'q_reject', write: symbol, dir: 'HALT', row: 'row-q0', text: `Reject: Unexpected '${symbol}' at start` };
    }

    if (st === 'q1') {
      if (symbol === 'a') {
        return { nextState: 'q1', write: 'a', dir: 'R', cell: 'cell-q1-a', row: 'row-q1', edge: 'edge-q1-loop', text: 'δ(q₁, a) → (q₁, a, R)' };
      }
      if (symbol === 'Y') {
        return { nextState: 'q1', write: 'Y', dir: 'R', cell: 'cell-q1-Y', row: 'row-q1', edge: 'edge-q1-loop', text: 'δ(q₁, Y) → (q₁, Y, R)' };
      }
      if (symbol === 'b') {
        return { nextState: 'q2', write: 'Y', dir: 'L', cell: 'cell-q1-b', row: 'row-q1', edge: 'edge-q1-q2', text: 'δ(q₁, b) → (q₂, Y, L)' };
      }
      return { nextState: 'q_reject', write: symbol, dir: 'HALT', row: 'row-q1', text: `Reject: Missing matching 'b' (found '${symbol}')` };
    }

    if (st === 'q2') {
      if (symbol === 'a') {
        return { nextState: 'q2', write: 'a', dir: 'L', cell: 'cell-q2-a', row: 'row-q2', edge: 'edge-q2-loop', text: 'δ(q₂, a) → (q₂, a, L)' };
      }
      if (symbol === 'Y') {
        return { nextState: 'q2', write: 'Y', dir: 'L', cell: 'cell-q2-Y', row: 'row-q2', edge: 'edge-q2-loop', text: 'δ(q₂, Y) → (q₂, Y, L)' };
      }
      if (symbol === 'X') {
        return { nextState: 'q0', write: 'X', dir: 'R', cell: 'cell-q2-X', row: 'row-q2', edge: 'edge-q2-q0', text: 'δ(q₂, X) → (q₀, X, R)' };
      }
      return { nextState: 'q_reject', write: symbol, dir: 'HALT', row: 'row-q2', text: `Reject: Unexpected '${symbol}' during rewind` };
    }

    if (st === 'q3') {
      if (symbol === 'Y') {
        return { nextState: 'q3', write: 'Y', dir: 'R', cell: 'cell-q3-Y', row: 'row-q3', edge: 'edge-q3-loop', text: 'δ(q₃, Y) → (q₃, Y, R)' };
      }
      if (symbol === 'B') {
        return { nextState: 'q_accept', write: 'B', dir: 'R', cell: 'cell-q3-B', row: 'row-q3', edge: 'edge-q3-qacc', text: 'δ(q₃, B) → (q_acc, B, R)' };
      }
      return { nextState: 'q_reject', write: symbol, dir: 'HALT', row: 'row-q3', text: `Reject: Stray symbol '${symbol}' remaining after match` };
    }

    return { nextState: 'q_reject', write: symbol, dir: 'HALT', text: 'Undefined transition -> Reject' };
  }

  step() {
    if (this.status === 'ACCEPTED' || this.status === 'REJECTED') {
      return false;
    }

    // Safety guard against infinite loops
    if (this.stepCount >= 5000) {
      this.status = 'REJECTED';
      this.state = 'q_reject';
      const desc = `Step ${this.stepCount + 1}: Exceeded safety limit of 5000 steps. REJECTED!`;
      this.traceLog.push({
        step: this.stepCount + 1,
        state: 'q_reject',
        desc: desc,
        status: 'REJECTED'
      });
      this.saveSnapshot(desc);
      return false;
    }

    const action = this.getNextAction();
    const scanned = this.getScannedSymbol();
    const currState = this.state;
    const currHead = this.head;

    if (action.type === 'HALT') {
      return false;
    }

    this.stepCount++;
    this.currentTransitionId = action.cell || null;
    this.currentRowId = action.row || null;
    this.currentEdgeId = action.edge || null;

    // Apply tape write
    this.tape[currHead] = action.write;

    // Advance head
    if (action.dir === 'R') {
      this.head++;
      if (this.head >= this.tape.length) {
        this.tape.push('B', 'B');
      }
    } else if (action.dir === 'L') {
      this.head = Math.max(0, this.head - 1);
    }

    // Advance state
    this.state = action.nextState;

    let desc = "";
    if (this.state === 'q_accept') {
      this.status = 'ACCEPTED';
      desc = `Step ${this.stepCount}: ${currState} + ${scanned} → ${action.write}, ${action.dir}, ${this.state} (ACCEPT)`;
      sound.playAccept();
    } else if (this.state === 'q_reject') {
      this.status = 'REJECTED';
      desc = `Step ${this.stepCount}: ${currState} + ${scanned} → ${action.text} (REJECT)`;
      sound.playReject();
    } else {
      this.status = 'RUNNING';
      desc = `Step ${this.stepCount}: ${currState} + ${scanned} → ${action.write}, ${action.dir}, ${this.state}`;
      sound.playTapeClick();
    }

    this.traceLog.push({
      step: this.stepCount,
      state: currState,
      nextState: this.state,
      scanned: scanned,
      write: action.write,
      dir: action.dir,
      desc: desc,
      status: this.status
    });

    this.saveSnapshot(desc);
    return true;
  }

  stepBack() {
    if (this.history.length <= 1) return false;
    this.history.pop(); // Remove current
    const prev = this.history[this.history.length - 1];

    this.tape = [...prev.tape];
    this.head = prev.head;
    this.state = prev.state;
    this.stepCount = prev.stepCount;
    this.status = prev.status;
    this.currentTransitionId = prev.transitionId;
    this.currentRowId = prev.rowId;
    this.currentEdgeId = prev.edgeId;

    if (this.traceLog.length > 1) {
      this.traceLog.pop();
    }
    return true;
  }
}

// ==========================================
// Pushdown Automaton (PDA) Engine for L = {a^n b^n | n >= 1}
// ==========================================
class PushdownAutomaton {
  constructor(inputString = '') {
    this.inputString = inputString;
    this.reset();
  }

  reset() {
    this.chars = this.inputString.split('');
    this.inputIndex = 0;
    this.stack = ['Z₀']; // Initial stack symbol
    this.state = 'q0';
    this.stepCount = 0;
    this.status = 'READY';
    this.history = [];
    this.traceLog = [];
    this.lastOp = { type: 'INIT', desc: 'Initialized stack with bottom marker Z₀ in state q₀.' };
    this.activeRuleId = null;
    this.saveSnapshot(this.lastOp);
  }

  saveSnapshot(op) {
    this.history.push({
      inputIndex: this.inputIndex,
      stack: [...this.stack],
      state: this.state,
      stepCount: this.stepCount,
      status: this.status,
      lastOp: { ...op },
      activeRuleId: this.activeRuleId
    });
  }

  getTop() {
    return this.stack[this.stack.length - 1] || null;
  }

  getNextInputChar() {
    if (this.inputIndex >= this.chars.length) return 'ε';
    return this.chars[this.inputIndex];
  }

  step() {
    if (this.status === 'ACCEPTED' || this.status === 'REJECTED') {
      return false;
    }

    const currChar = this.getNextInputChar();
    const top = this.getTop();
    const currState = this.state;
    this.stepCount++;

    // PDA Rule 1: δ(q0, a, Z0) -> (q1, AZ0) [First 'a']
    if (currState === 'q0' && currChar === 'a' && top === 'Z₀') {
      this.stack.push('A');
      this.inputIndex++;
      this.state = 'q1';
      this.status = 'RUNNING';
      this.activeRuleId = 'pda-rule-1';
      this.lastOp = { type: 'PUSH', desc: `Read first 'a', pushed 'A' onto stack, moved to q₁` };
      sound.playStackPush();
    }
    // PDA Rule 2: δ(q1, a, A) -> (q1, AA) [Subsequent 'a's]
    else if (currState === 'q1' && currChar === 'a' && top === 'A') {
      this.stack.push('A');
      this.inputIndex++;
      this.state = 'q1';
      this.status = 'RUNNING';
      this.activeRuleId = 'pda-rule-2';
      this.lastOp = { type: 'PUSH', desc: `Read 'a', pushed 'A' onto stack (total A's: ${this.stack.length - 1})` };
      sound.playStackPush();
    }
    // PDA Rule 3: δ(q1, b, A) -> (q2, ε) [First 'b']
    else if (currState === 'q1' && currChar === 'b' && top === 'A') {
      this.stack.pop();
      this.inputIndex++;
      this.state = 'q2';
      this.status = 'RUNNING';
      this.activeRuleId = 'pda-rule-3';
      this.lastOp = { type: 'POP', desc: `Read first 'b', popped 'A' off stack, transitioned to q₂` };
      sound.playStackPop();
    }
    // PDA Rule 4: δ(q2, b, A) -> (q2, ε) [Subsequent 'b's]
    else if (currState === 'q2' && currChar === 'b' && top === 'A') {
      this.stack.pop();
      this.inputIndex++;
      this.state = 'q2';
      this.status = 'RUNNING';
      this.activeRuleId = 'pda-rule-4';
      this.lastOp = { type: 'POP', desc: `Read 'b', popped matching 'A' off stack` };
      sound.playStackPop();
    }
    // PDA Rule 5: δ(q2, ε, Z0) -> (q_f, Z0) [Acceptance at end of string]
    else if (currState === 'q2' && currChar === 'ε' && top === 'Z₀') {
      this.state = 'q_f';
      this.status = 'ACCEPTED';
      this.activeRuleId = 'pda-rule-5';
      this.lastOp = { type: 'ACCEPT', desc: `Input exhausted & stack contains only Z₀. Transitioned to q_f. ACCEPTED!` };
      sound.playAccept();
    }
    // Rejections:
    else {
      this.state = 'q_reject';
      this.status = 'REJECTED';
      this.activeRuleId = null;
      if (currChar === 'ε' && currState === 'q0') {
        this.lastOp = { type: 'REJECT', desc: `Rejected: Empty string (n=0 not permitted for n ≥ 1)` };
      } else if (currChar === 'ε' && top !== 'Z₀') {
        this.lastOp = { type: 'REJECT', desc: `Rejected: Input ended prematurely with ${this.stack.length - 1} unpopped 'A'(s) on stack (more a's than b's)` };
      } else if (currChar === 'b' && top === 'Z₀') {
        this.lastOp = { type: 'REJECT', desc: `Rejected: Read 'b' with stack empty (more b's than a's or b's before a's)` };
      } else if (currChar === 'a' && currState === 'q2') {
        this.lastOp = { type: 'REJECT', desc: `Rejected: Read 'a' after 'b' (violates aⁿbⁿ ordering)` };
      } else {
        this.lastOp = { type: 'REJECT', desc: `Rejected: Invalid character '${currChar}' or unexpected token` };
      }
      sound.playReject();
    }

    const logEntry = {
      step: this.stepCount,
      char: currChar,
      state: currState,
      nextState: this.state,
      top: top,
      op: this.lastOp.type,
      desc: this.lastOp.desc,
      status: this.status
    };
    this.traceLog.push(logEntry);
    this.saveSnapshot(this.lastOp);
    return true;
  }

  stepBack() {
    if (this.history.length <= 1) return false;
    this.history.pop();
    const prev = this.history[this.history.length - 1];

    this.inputIndex = prev.inputIndex;
    this.stack = [...prev.stack];
    this.state = prev.state;
    this.stepCount = prev.stepCount;
    this.status = prev.status;
    this.lastOp = { ...prev.lastOp };
    this.activeRuleId = prev.activeRuleId;

    if (this.traceLog.length > 0) {
      this.traceLog.pop();
    }
    return true;
  }
}

// ==========================================
// Batch Verification Engine
// ==========================================
function evaluateStringSynchronously(str) {
  // Run TM
  const tm = new TuringMachine(str);
  let tmSteps = 0;
  const maxTmSteps = 5000;
  while (tm.status !== 'ACCEPTED' && tm.status !== 'REJECTED' && tmSteps < maxTmSteps) {
    tm.step();
    tmSteps++;
  }
  const tmResult = tm.status;

  // Run PDA
  const pda = new PushdownAutomaton(str);
  let pdaSteps = 0;
  const maxPdaSteps = 5000;
  while (pda.status !== 'ACCEPTED' && pda.status !== 'REJECTED' && pdaSteps < maxPdaSteps) {
    pda.step();
    pdaSteps++;
  }
  const pdaResult = pda.status;

  // Theoretical ground truth for L = {a^n b^n | n >= 1}:
  // Starts with 1 or more 'a', followed by exactly equal number of 'b'
  let expected = 'REJECTED';
  const match = str.match(/^(a+)(b+)$/);
  if (match && match[1].length === match[2].length && match[1].length >= 1) {
    expected = 'ACCEPTED';
  }

  return {
    string: str,
    length: str.length,
    expected: expected,
    tmResult: tmResult,
    tmSteps: tmSteps,
    pdaResult: pdaResult,
    pdaSteps: pdaSteps,
    isCorrect: tmResult === expected && pdaResult === expected
  };
}

// ==========================================
// Application UI Controller & State Manager
// ==========================================
class AppController {
  constructor() {
    this.currentTab = 'tm';
    this.activeString = 'aabb';
    this.tm = new TuringMachine(this.activeString);
    this.pda = new PushdownAutomaton(this.activeString);

    this.isPlaying = false;
    this.playInterval = null;
    this.speed = 1.0;

    this.testCases = [
      { str: "ab", desc: "Minimal valid case (n=1)" },
      { str: "aabb", desc: "Even valid case (n=2)" },
      { str: "aaabbb", desc: "Higher order (n=3)" },
      { str: "aaaabbbb", desc: "Balanced (n=4)" },
      { str: "aaaaabbbbb", desc: "Stress test (n=5)" },
      { str: "a", desc: "Single 'a' without 'b'" },
      { str: "b", desc: "Single 'b' without 'a'" },
      { str: "aa", desc: "Missing 'b's" },
      { str: "bb", desc: "Missing 'a's" },
      { str: "aab", desc: "More a's than b's" },
      { str: "abb", desc: "More b's than a's" },
      { str: "aaabb", desc: "More a's than b's" },
      { str: "aabbb", desc: "More b's than a's" },
      { str: "abab", desc: "Alternating sequence" },
      { str: "ba", desc: "Inverted order: 'b' precedes 'a'" },
      { str: "baba", desc: "Alternating sequence" },
      { str: "abc", desc: "Illegal character 'c'" },
      { str: "", desc: "Empty string ε (n=0 not in L)" }
    ];

    this.cacheDom();
    this.bindEvents();
    this.validateInput(this.activeString);
    this.render();
    this.renderBatchSuite();
  }

  cacheDom() {
    // Nav & sound
    this.tabs = document.querySelectorAll('.nav-tab');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.soundToggle = document.getElementById('soundToggle');

    // Global Input Controls
    this.stringInput = document.getElementById('stringInput');
    this.clearInputBtn = document.getElementById('clearInputBtn');
    this.loadStringBtn = document.getElementById('loadStringBtn');
    this.presetButtons = document.querySelectorAll('.preset-btn');
    this.inputValidationMsg = document.getElementById('inputValidationMsg');

    // Playback Controls
    this.btnRunTM = document.getElementById('btnRunTM') || document.getElementById('btnPlayPause');
    this.runIcon = document.getElementById('runIcon') || document.getElementById('playIcon');
    this.runText = document.getElementById('runText') || document.getElementById('playText');
    this.btnPause = document.getElementById('btnPause');
    this.btnStepFwd = document.getElementById('btnStepFwd');
    this.btnStepBack = document.getElementById('btnStepBack');
    this.btnReset = document.getElementById('btnReset');
    this.btnFastRun = document.getElementById('btnFastRun');
    this.speedSlider = document.getElementById('speedSlider');
    this.speedValue = document.getElementById('speedValue');
    this.globalStatusPill = document.getElementById('globalStatusPill');
    this.globalStatusText = document.getElementById('globalStatusText');

    // TM Tab DOM
    this.tmStepCounter = document.getElementById('tmStepCounter');
    this.tmCurrentState = document.getElementById('tmCurrentState');
    this.tmScannedSymbol = document.getElementById('tmScannedSymbol');
    this.tmHeadIndex = document.getElementById('tmHeadIndex');
    this.tmPlannedAction = document.getElementById('tmPlannedAction');
    this.tapeTrack = document.getElementById('tapeTrack');
    this.tapeTopHead = document.getElementById('tapeTopHead');
    this.tapeHeadPointer = document.getElementById('tapeHeadPointer');
    this.pointerStateLabel = document.getElementById('pointerStateLabel');
    this.tmExplText = document.getElementById('tmExplText');
    this.tmTraceLog = document.getElementById('tmTraceLog');
    this.btnExportLog = document.getElementById('btnExportLog');

    // Prominent Status Panel DOM
    this.panelCurrentState = document.getElementById('panelCurrentState');
    this.panelScannedSymbol = document.getElementById('panelScannedSymbol');
    this.panelWriteSymbol = document.getElementById('panelWriteSymbol');
    this.panelMoveDir = document.getElementById('panelMoveDir');
    this.panelNextState = document.getElementById('panelNextState');
    this.panelExecStatus = document.getElementById('panelExecStatus');

    // Prominent Result Banner DOM
    this.tmResultBanner = document.getElementById('tmResultBanner');
    this.tmResultBannerContent = document.getElementById('tmResultBannerContent');
    this.tmResultBannerIcon = document.getElementById('tmResultBannerIcon');

    // PDA Tab DOM
    this.pdaStepCounter = document.getElementById('pdaStepCounter');
    this.pdaCurrentState = document.getElementById('pdaCurrentState');
    this.pdaRemainingInput = document.getElementById('pdaRemainingInput');
    this.pdaTopStack = document.getElementById('pdaTopStack');
    this.pdaStackSize = document.getElementById('pdaStackSize');
    this.pdaStreamChars = document.getElementById('pdaStreamChars');
    this.pdaStackContainer = document.getElementById('pdaStackContainer');
    this.pdaOpType = document.getElementById('pdaOpType');
    this.pdaOpDesc = document.getElementById('pdaOpDesc');
    this.pdaExplText = document.getElementById('pdaExplText');
    this.pdaTraceLog = document.getElementById('pdaTraceLog');
    this.pdaLogCount = document.getElementById('pdaLogCount');

    // Compare Tab DOM
    this.compareTapeTrack = document.getElementById('compareTapeTrack');
    this.comparePdaStack = document.getElementById('comparePdaStack');
    this.compareTmStatus = document.getElementById('compareTmStatus');
    this.comparePdaStatus = document.getElementById('comparePdaStatus');
    this.compareTmState = document.getElementById('compareTmState');
    this.compareTmSteps = document.getElementById('compareTmSteps');
    this.compareTmHead = document.getElementById('compareTmHead');
    this.compareTmTrace = document.getElementById('compareTmTrace');
    this.comparePdaState = document.getElementById('comparePdaState');
    this.comparePdaSteps = document.getElementById('comparePdaSteps');
    this.comparePdaHeight = document.getElementById('comparePdaHeight');
    this.comparePdaTrace = document.getElementById('comparePdaTrace');

    // Batch Tab DOM
    this.batchTableBody = document.getElementById('batchTableBody');
    this.batchTotal = document.getElementById('batchTotal');
    this.batchPassed = document.getElementById('batchPassed');
    this.batchFailed = document.getElementById('batchFailed');
    this.batchAccuracy = document.getElementById('batchAccuracy');
    this.btnRunAllTests = document.getElementById('btnRunAllTests');
    this.btnAddCustomTest = document.getElementById('btnAddCustomTest');
  }

  bindEvents() {
    // Navigation Tabs
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Sound toggle
    this.soundToggle.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      this.soundToggle.classList.toggle('muted', !sound.enabled);
      this.soundToggle.querySelector('.sound-text').textContent = sound.enabled ? 'Sound ON' : 'Sound OFF';
      this.soundToggle.querySelector('.icon').textContent = sound.enabled ? '🔊' : '🔇';
    });

    // Input live validation
    this.stringInput.addEventListener('input', () => {
      this.validateInput(this.stringInput.value.trim());
    });

    // Preset buttons
    this.presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        this.stringInput.value = val;
        this.validateInput(val);
        this.loadString(val);
      });
    });

    // Clear input
    this.clearInputBtn.addEventListener('click', () => {
      this.stringInput.value = '';
      this.validateInput('');
      this.stringInput.focus();
    });

    // Load String button
    this.loadStringBtn.addEventListener('click', () => {
      const val = this.stringInput.value.trim();
      this.validateInput(val);
      this.loadString(val);
    });

    this.stringInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = this.stringInput.value.trim();
        this.validateInput(val);
        this.loadString(val);
      }
    });

    // Playback Controls
    if (this.btnRunTM) {
      this.btnRunTM.addEventListener('click', () => this.runTM());
    }
    if (this.btnPause) {
      this.btnPause.addEventListener('click', () => this.pause());
    }
    this.btnStepFwd.addEventListener('click', () => this.stepForward());
    this.btnStepBack.addEventListener('click', () => this.stepBackward());
    this.btnReset.addEventListener('click', () => this.resetSimulators());
    this.btnFastRun.addEventListener('click', () => this.fastRun());

    // Speed Slider
    this.speedSlider.addEventListener('input', (e) => {
      this.speed = parseFloat(e.target.value);
      this.speedValue.textContent = `${this.speed.toFixed(1)}x`;
      if (this.isPlaying) {
        this.pause();
        this.runTM();
      }
    });

    // Export Log
    this.btnExportLog.addEventListener('click', () => this.exportLog());

    // Batch runner
    this.btnRunAllTests.addEventListener('click', () => this.renderBatchSuite());
    this.btnAddCustomTest.addEventListener('click', () => this.promptCustomTest());
  }

  validateInput(str) {
    if (!this.inputValidationMsg) return true;

    if (str === '') {
      this.inputValidationMsg.className = 'validation-msg info';
      this.inputValidationMsg.textContent = 'ℹ️ Note: The empty string is rejected because n ≥ 1.';
      this.inputValidationMsg.style.display = 'block';
      return true;
    }

    if (!/^[ab]+$/.test(str)) {
      this.inputValidationMsg.className = 'validation-msg error';
      this.inputValidationMsg.textContent = "⚠️ Invalid input. Only the symbols 'a' and 'b' are allowed.";
      this.inputValidationMsg.style.display = 'block';
      return false;
    }

    this.inputValidationMsg.style.display = 'none';
    return true;
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    this.tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === tabId));
    this.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `content-${tabId}`);
    });
    this.render();
    const activeSection = document.getElementById(`content-${tabId}`);
    if (activeSection) renderMathSafely(activeSection);
  }

  loadString(str) {
    this.pause();
    this.activeString = str;
    this.tm = new TuringMachine(str);
    this.pda = new PushdownAutomaton(str);
    this.render();
  }

  resetSimulators() {
    this.pause();
    this.tm.reset();
    this.pda.reset();
    this.render();
  }

  stepForward() {
    let moved = false;
    if (this.currentTab === 'tm' || this.currentTab === 'compare') {
      moved = this.tm.step() || moved;
    }
    if (this.currentTab === 'pda' || this.currentTab === 'compare') {
      moved = this.pda.step() || moved;
    }
    if (this.currentTab === 'batch' || this.currentTab === 'theory') {
      this.tm.step();
      this.pda.step();
      moved = true;
    }
    this.render();
    return moved;
  }

  stepBackward() {
    this.pause();
    this.tm.stepBack();
    this.pda.stepBack();
    this.render();
  }

  runTM() {
    const isDone = (this.currentTab === 'tm' && (this.tm.status === 'ACCEPTED' || this.tm.status === 'REJECTED')) ||
                   (this.currentTab === 'pda' && (this.pda.status === 'ACCEPTED' || this.pda.status === 'REJECTED'));
    if (isDone) {
      this.resetSimulators();
    }

    this.isPlaying = true;
    if (this.runIcon) this.runIcon.textContent = '⏸';
    if (this.runText) this.runText.textContent = 'Pause';
    if (this.btnRunTM) this.btnRunTM.classList.add('btn-primary');

    // Run delay between 300ms and 700ms
    const intervalMs = Math.max(120, Math.floor(520 / this.speed));
    this.playInterval = setInterval(() => {
      const moved = this.stepForward();
      const currentDone = (this.currentTab === 'tm' && (this.tm.status === 'ACCEPTED' || this.tm.status === 'REJECTED')) ||
                          (this.currentTab === 'pda' && (this.pda.status === 'ACCEPTED' || this.pda.status === 'REJECTED')) ||
                          (this.currentTab === 'compare' && 
                           (this.tm.status === 'ACCEPTED' || this.tm.status === 'REJECTED') &&
                           (this.pda.status === 'ACCEPTED' || this.pda.status === 'REJECTED'));

      if (!moved || currentDone) {
        this.pause();
      }
    }, intervalMs);
  }

  pause() {
    this.isPlaying = false;
    if (this.runIcon) this.runIcon.textContent = '▶';
    if (this.runText) this.runText.textContent = 'Run TM';
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
    if (this.tm.status === 'RUNNING') {
      this.tm.status = 'PAUSED';
    }
    if (this.pda.status === 'RUNNING') {
      this.pda.status = 'PAUSED';
    }
    this.render();
  }

  fastRun() {
    this.pause();
    let max = 4000;
    while ((this.tm.status !== 'ACCEPTED' && this.tm.status !== 'REJECTED') && max > 0) {
      this.tm.step();
      max--;
    }
    max = 4000;
    while ((this.pda.status !== 'ACCEPTED' && this.pda.status !== 'REJECTED') && max > 0) {
      this.pda.step();
      max--;
    }
    this.render();
  }

  // ==========================================
  // Render Routines
  // ==========================================
  render() {
    this.renderGlobalStatus();
    this.renderTM();
    this.renderPDA();
    this.renderCompare();
  }

  renderGlobalStatus() {
    const status = this.currentTab === 'pda' ? this.pda.status : this.tm.status;
    this.globalStatusPill.className = `status-pill status-${status.toLowerCase()}`;

    let label = 'Ready';
    if (status === 'RUNNING') label = 'Simulating...';
    if (status === 'PAUSED') label = 'Paused';
    if (status === 'ACCEPTED') label = 'String ACCEPTED (w ∈ L)';
    if (status === 'REJECTED') label = 'String REJECTED (w ∉ L)';
    this.globalStatusText.textContent = label;
  }

  renderTM() {
    this.tmStepCounter.textContent = `Step: ${this.tm.stepCount}`;
    if (this.tmCurrentState) this.tmCurrentState.textContent = this.formatStateName(this.tm.state);
    if (this.tmScannedSymbol) this.tmScannedSymbol.textContent = `'${this.tm.getScannedSymbol()}'`;
    if (this.tmHeadIndex) this.tmHeadIndex.textContent = `Cell ${this.tm.head}`;

    const action = this.tm.getNextAction();
    if (this.tmPlannedAction) this.tmPlannedAction.textContent = action.text || '-';

    // Prominent Status Panel Update
    if (this.panelCurrentState) this.panelCurrentState.textContent = this.formatStateName(this.tm.state);
    if (this.panelScannedSymbol) this.panelScannedSymbol.textContent = `'${this.tm.getScannedSymbol()}'`;
    if (this.panelWriteSymbol) this.panelWriteSymbol.textContent = action.write || '-';
    if (this.panelMoveDir) {
      this.panelMoveDir.textContent = action.dir === 'R' ? 'RIGHT' : (action.dir === 'L' ? 'LEFT' : 'HALT');
    }
    if (this.panelNextState) this.panelNextState.textContent = this.formatStateName(action.nextState || '-');
    if (this.panelExecStatus) this.panelExecStatus.textContent = this.tm.status;

    // Prominent Result Banner Update
    if (this.tmResultBanner) {
      if (this.tm.status === 'ACCEPTED') {
        this.tmResultBanner.style.display = 'flex';
        this.tmResultBanner.className = 'tm-result-banner accepted';
        if (this.tmResultBannerIcon) this.tmResultBannerIcon.textContent = '✓';
        if (this.tmResultBannerContent) {
          this.tmResultBannerContent.innerHTML = `<strong>✓ ACCEPTED:</strong> String "<code>${this.activeString || 'ε'}</code>" belongs to $L = \\{a^n b^n \\mid n \\ge 1\\}$`;
          renderMathSafely(this.tmResultBannerContent);
        }
      } else if (this.tm.status === 'REJECTED') {
        this.tmResultBanner.style.display = 'flex';
        this.tmResultBanner.className = 'tm-result-banner rejected';
        if (this.tmResultBannerIcon) this.tmResultBannerIcon.textContent = '✗';
        if (this.tmResultBannerContent) {
          this.tmResultBannerContent.innerHTML = `<strong>✗ REJECTED:</strong> String "<code>${this.activeString || 'ε'}</code>" does not belong to $L = \\{a^n b^n \\mid n \\ge 1\\}$`;
          renderMathSafely(this.tmResultBannerContent);
        }
      } else {
        this.tmResultBanner.style.display = 'none';
      }
    }

    // Render Tape Cells
    this.tapeTrack.innerHTML = '';
    const cellWidth = 66; // 58px + 8px gap
    this.tm.tape.forEach((symbol, idx) => {
      const cell = document.createElement('div');
      cell.className = `tape-cell symbol-${symbol.toLowerCase()}`;
      if (idx === this.tm.head) {
        cell.classList.add('head-active');
      }

      const indexLabel = document.createElement('span');
      indexLabel.className = 'cell-index';
      indexLabel.textContent = idx;
      cell.appendChild(indexLabel);

      const charSpan = document.createElement('span');
      charSpan.textContent = symbol === 'B' ? '␣' : symbol;
      cell.appendChild(charSpan);

      this.tapeTrack.appendChild(cell);
    });

    // Move Tape Head Pointer (Bottom) and Top Head
    const offset = 12 + (this.tm.head * cellWidth) + 16;
    if (this.tapeTopHead) {
      this.tapeTopHead.style.left = `${offset}px`;
    }
    if (this.tapeHeadPointer) {
      this.tapeHeadPointer.style.left = `${offset}px`;
      if (this.pointerStateLabel) {
        this.pointerStateLabel.textContent = this.formatStateName(this.tm.state);
      }
    }

    // Auto scroll tape viewport so active cell stays in view
    const container = document.querySelector('.tape-viewport-container');
    if (container) {
      const targetScroll = Math.max(0, offset - container.clientWidth / 2);
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }

    // Explanation Box
    const lastSnapshot = this.tm.history[this.tm.history.length - 1];
    if (this.tmExplText) {
      this.tmExplText.textContent = lastSnapshot ? lastSnapshot.desc : "Turing Machine ready.";
    }

    // Highlight SVG Graph Nodes & Edges
    this.updateSvgDiagram();

    // Highlight Transition Table Cell & Row
    this.updateTransitionTable();

    // Render Trace Log
    this.renderTraceLog(this.tmTraceLog, this.tm.traceLog);
  }

  updateSvgDiagram() {
    document.querySelectorAll('.graph-node').forEach(node => node.classList.remove('active'));
    document.querySelectorAll('.edge-path').forEach(edge => edge.classList.remove('active'));

    const nodeEl = document.getElementById(`node-${this.tm.state}`);
    if (nodeEl) nodeEl.classList.add('active');

    if (this.tm.currentEdgeId) {
      const edgeEl = document.getElementById(this.tm.currentEdgeId);
      if (edgeEl) edgeEl.classList.add('active');
    }
  }

  updateTransitionTable() {
    document.querySelectorAll('#tmTransitionTable tr').forEach(tr => tr.classList.remove('highlight-row'));
    document.querySelectorAll('#tmTransitionTable td').forEach(td => td.classList.remove('highlight-transition'));

    if (this.tm.currentRowId) {
      const row = document.getElementById(this.tm.currentRowId);
      if (row) row.classList.add('highlight-row');
    }
    if (this.tm.currentTransitionId) {
      const cell = document.getElementById(this.tm.currentTransitionId);
      if (cell) cell.classList.add('highlight-transition');
    }
  }

  renderPDA() {
    this.pdaStepCounter.textContent = `Step: ${this.pda.stepCount}`;
    this.pdaCurrentState.textContent = this.formatStateName(this.pda.state);

    const remaining = this.pda.chars.slice(this.pda.inputIndex).join('') || 'ε';
    this.pdaRemainingInput.textContent = remaining;
    this.pdaTopStack.textContent = this.pda.getTop() || 'Empty';
    this.pdaStackSize.textContent = this.pda.stack.length;

    // Render Input Tape Stream
    this.pdaStreamChars.innerHTML = '';
    if (this.pda.chars.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'stream-char-box current';
      emptyBox.textContent = 'ε';
      this.pdaStreamChars.appendChild(emptyBox);
    } else {
      this.pda.chars.forEach((ch, idx) => {
        const box = document.createElement('div');
        box.className = 'stream-char-box';
        if (idx < this.pda.inputIndex) {
          box.classList.add('consumed');
        } else if (idx === this.pda.inputIndex) {
          box.classList.add('current');
        }
        box.textContent = ch;
        this.pdaStreamChars.appendChild(box);
      });
      // Trailing epsilon marker
      const epsBox = document.createElement('div');
      epsBox.className = 'stream-char-box';
      if (this.pda.inputIndex >= this.pda.chars.length) {
        epsBox.classList.add('current');
      } else {
        epsBox.style.opacity = '0.4';
      }
      epsBox.textContent = 'ε';
      this.pdaStreamChars.appendChild(epsBox);
    }

    // Render Stack Blocks
    this.pdaStackContainer.innerHTML = '';
    this.pda.stack.forEach((sym, idx) => {
      const block = document.createElement('div');
      block.className = `stack-item ${sym === 'Z₀' ? 'bottom-marker' : ''}`;
      block.textContent = sym;
      this.pdaStackContainer.appendChild(block);
    });

    // Render Op badge & desc
    this.pdaOpType.textContent = this.pda.lastOp.type;
    this.pdaOpDesc.textContent = this.pda.lastOp.desc;
    this.pdaExplText.textContent = this.pda.lastOp.desc;

    // Highlight PDA Transition Table Rule
    document.querySelectorAll('#pdaTransitionTable tr').forEach(tr => tr.classList.remove('highlight-transition'));
    if (this.pda.activeRuleId) {
      const r = document.getElementById(this.pda.activeRuleId);
      if (r) r.classList.add('highlight-transition');
    }

    // PDA Log
    this.pdaLogCount.textContent = `${this.pda.traceLog.length} events`;
    this.renderTraceLog(this.pdaTraceLog, this.pda.traceLog);
  }

  renderCompare() {
    // TM Mini
    this.compareTmStatus.textContent = this.tm.status;
    this.compareTmState.textContent = this.formatStateName(this.tm.state);
    this.compareTmSteps.textContent = this.tm.stepCount;
    this.compareTmHead.textContent = this.tm.head;
    const lastTmLog = this.tm.traceLog[this.tm.traceLog.length - 1];
    this.compareTmTrace.textContent = lastTmLog ? lastTmLog.desc : "TM Initialized.";

    this.compareTapeTrack.innerHTML = '';
    this.tm.tape.slice(0, 14).forEach((symbol, idx) => {
      const cell = document.createElement('div');
      cell.className = `tape-cell symbol-${symbol.toLowerCase()} ${idx === this.tm.head ? 'head-active' : ''}`;
      cell.textContent = symbol === 'B' ? '␣' : symbol;
      this.compareTapeTrack.appendChild(cell);
    });

    // PDA Mini
    this.comparePdaStatus.textContent = this.pda.status;
    this.comparePdaState.textContent = this.formatStateName(this.pda.state);
    this.comparePdaSteps.textContent = this.pda.stepCount;
    this.comparePdaHeight.textContent = this.pda.stack.length;
    const lastPdaLog = this.pda.traceLog[this.pda.traceLog.length - 1];
    this.comparePdaTrace.textContent = lastPdaLog ? lastPdaLog.desc : "PDA Initialized.";

    this.comparePdaStack.innerHTML = '';
    this.pda.stack.forEach((sym) => {
      const pill = document.createElement('div');
      pill.className = 'stack-item';
      pill.style.width = '42px';
      pill.style.height = '34px';
      pill.style.fontSize = '0.9rem';
      pill.textContent = sym;
      this.comparePdaStack.appendChild(pill);
    });
  }

  renderTraceLog(container, logItems) {
    container.innerHTML = '';
    if (logItems.length === 0) {
      container.innerHTML = '<div class="trace-item">Waiting for execution to commence...</div>';
      return;
    }

    logItems.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'trace-item';
      if (index === logItems.length - 1) div.classList.add('current');
      if (item.status === 'ACCEPTED') div.classList.add('accept');
      if (item.status === 'REJECTED') div.classList.add('reject');

      div.textContent = item.desc;
      container.appendChild(div);
    });

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  formatStateName(state) {
    if (state === 'q0') return 'q₀';
    if (state === 'q1') return 'q₁';
    if (state === 'q2') return 'q₂';
    if (state === 'q3') return 'q₃';
    if (state === 'q_accept') return 'q_acc';
    if (state === 'q_reject') return 'q_rej';
    if (state === 'q_f') return 'q_f';
    return state;
  }

  // ==========================================
  // Batch Suite Logic
  // ==========================================
  renderBatchSuite() {
    this.batchTableBody.innerHTML = '';
    let passedCount = 0;

    this.testCases.forEach((tc, idx) => {
      const res = evaluateStringSynchronously(tc.str);
      if (res.isCorrect) passedCount++;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><code>"${res.string}"</code> <span style="font-size: 0.72rem; color: var(--text-dim);">(${tc.desc})</span></td>
        <td>${res.length}</td>
        <td><span class="result-tag ${res.expected.toLowerCase()}">${res.expected}</span></td>
        <td><span class="result-tag ${res.tmResult.toLowerCase()}">${res.tmResult}</span></td>
        <td><strong>${res.tmSteps}</strong> steps</td>
        <td><span class="result-tag ${res.pdaResult.toLowerCase()}">${res.pdaResult}</span></td>
        <td><strong>${res.pdaSteps}</strong> steps</td>
        <td>
          <span class="status-badge-table ${res.isCorrect ? 'pass' : 'fail'}">
            ${res.isCorrect ? '✔ PASS' : '✖ FAIL'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm" data-load-test="${res.string}" title="Load string into active simulator">
            Load
          </button>
        </td>
      `;

      tr.querySelector('[data-load-test]').addEventListener('click', () => {
        this.stringInput.value = tc.str;
        this.loadString(tc.str);
        this.switchTab('tm');
      });

      this.batchTableBody.appendChild(tr);
    });

    const total = this.testCases.length;
    const failed = total - passedCount;
    const accuracy = total > 0 ? ((passedCount / total) * 100).toFixed(0) : 100;

    this.batchTotal.textContent = total;
    this.batchPassed.textContent = passedCount;
    this.batchFailed.textContent = failed;
    this.batchAccuracy.textContent = `${accuracy}%`;
  }

  promptCustomTest() {
    const input = prompt("Enter a test string (e.g., 'aaabbb', 'aab', 'bbaa'):", "aaaaabbbbb");
    if (input !== null) {
      this.testCases.push({
        str: input,
        desc: "Custom User Test"
      });
      this.renderBatchSuite();
    }
  }

  exportLog() {
    const logData = {
      language: "L = {a^n b^n | n >= 1}",
      inputString: this.activeString,
      turingMachine: {
        finalState: this.tm.state,
        status: this.tm.status,
        totalSteps: this.tm.stepCount,
        finalTape: this.tm.tape.join(''),
        trace: this.tm.traceLog
      },
      pushdownAutomaton: {
        finalState: this.pda.state,
        status: this.pda.status,
        totalSteps: this.pda.stepCount,
        finalStack: this.pda.stack,
        trace: this.pda.traceLog
      }
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TOC_CaseStudy10_Trace_${this.activeString || 'empty'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Safely render LaTeX math formulas using KaTeX auto-render extension
function renderMathSafely(container = document.body) {
  if (typeof renderMathInElement === 'function' && container) {
    try {
      renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn('KaTeX render warning:', e);
    }
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.tocApp = new AppController();
  renderMathSafely(document.body);
});

// Re-render math once deferred external fonts and KaTeX scripts are fully loaded
window.addEventListener('load', () => {
  renderMathSafely(document.body);
});
