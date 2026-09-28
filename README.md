# Theory of Computation Project: Recognition of L = {aⁿbⁿ | n ≥ 1}
### Case Study 10 — Turing Machine & Pushdown Automaton Interactive Simulator

An interactive, high-fidelity visualizer and comprehensive academic suite for **TOC Case Study 10**: Recognition of Context-Free Language $L = \{a^n b^n \mid n \ge 1\}$.

---

## 🌟 Features Included

1. **Interactive Turing Machine Simulator (1-Tape DTM)**
   - Visual tape with live read/write head pointer, cell coordinates, and auto-scrolling.
   - Live state badges: Current State ($q_0, q_1, q_2, q_3, q_{\text{acc}}, q_{\text{rej}}$), Scanned Symbol, and Next Planned Transition.
   - Interactive SVG State Transition Graph with active node and transition edge illumination.
   - Real-time cell highlighting in the formal TM Transition Table.
   - Play, Pause, Single Step Forward, Step Backward (Undo), and Instant Run to Completion.
   - Variable execution speed slider (0.2x to 3.0x).

2. **Pushdown Automaton (PDA) Visualizer**
   - Animated vertical stack chamber with dynamic push/pop block animations.
   - Input tape stream highlighting current scanned symbol and consumed prefix.
   - Real-time PDA Transition Table rule highlighter ($R_1 \dots R_5$).

3. **Dual / Side-by-Side Synchronous Runner**
   - Run both the Turing Machine and Pushdown Automaton on the same input simultaneously.
   - Visual demonstration of why the PDA operates in $O(n)$ time while the 1-Tape TM takes $O(n^2)$ time.

4. **Batch Test Suite & Matrix**
   - 15 pre-configured positive and negative test cases covering boundary conditions ($n=1$, $n=2$, $n=3$, $n=4$, $n=5$, empty string $\epsilon$, unbalanced strings, inverted tokens, illegal characters).
   - Instant calculation of total pass/fail rates and accuracy.
   - 1-Click "Load" button to transfer any test case directly into the active visualizer.
   - "+ Add Custom Test" button to test any user-provided string dynamically.

5. **Audio Feedback (Web Audio API)**
   - Synthesized mechanical tape shifts, stack push/pop sound effects, and pleasant acceptance/rejection chimes (with 1-click mute toggle).

6. **Comprehensive Academic Documentation**
   - In-app mathematical foundation & formal proof using the **Pumping Lemma for Regular Languages**.
   - Full [PROJECT_REPORT.md](file:///c:/Users/Sujal/Documents/TOC%20Project/PROJECT_REPORT.md) containing formal 7-tuples, complexity derivations, trace walkthroughs, and viva-voce examination preparation Q&A.

---

## 🚀 How to Run the Visualizer

### Method 1: Direct Browser Launch
Simply double-click or open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari):
```
c:\Users\Sujal\Documents\TOC Project\index.html
```

### Method 2: Local HTTP Server (Optional)
If you prefer running via a local server (e.g., Python or Node.js):
```powershell
# Using Python
python -m http.server 8000

# Using Node (npx)
npx serve .
```
Then navigate to `http://localhost:8000` in your browser.

---

## 📂 Project Structure

```
TOC Project/
│
├── index.html           # Main user interface & visual simulator
├── style.css            # Modern glassmorphism & responsive CSS styling
├── script.js            # Turing Machine & Pushdown Automaton engines, audio synth
├── PROJECT_REPORT.md    # Complete academic documentation & viva prep
└── README.md            # Quick start & project overview
```

---

## 🎓 Academic Summary

- **Language:** $L = \{a^n b^n \mid n \ge 1\}$
- **Classification:** Context-Free Language (Chomsky Type-2)
- **Regular?** No, proven via Pumping Lemma for Regular Languages.
- **Turing Machine Complexity:** $O(n^2)$ Time, $O(n)$ Space.
- **Pushdown Automaton Complexity:** $O(n)$ Time, $O(n)$ Space.
