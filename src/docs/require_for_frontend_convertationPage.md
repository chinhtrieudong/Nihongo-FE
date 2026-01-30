You are a senior frontend architect specialized in language learning platforms
(Duolingo, Busuu, Elsa Speak, WaniKani style UX).

Refactor the Conversation Lesson page using React + Ant Design.

Data source:
GET /api/lessons/{lessonId}/conversation
Schema exactly matches:

{
  lesson_id,
  lesson_title,
  situation_vi,
  dialogue[],
  exercises { dictation, comprehension_mcq, reorder, roleplay, shadowing, reaction_speaking }
}

GOAL:
Create an immersive conversation learning flow like Duolingo:
- Listen
- Type what you hear
- Understand meaning
- React
- Speak
- Remember

---

### 🧩 PAGE LAYOUT

Header:
- Lesson title
- Situation (Vietnamese)
- Progress bar: currentStep / totalSteps
- XP animation when correct

Main Area (Card centered):

Tabs or Stepper:

1. 🎧 Listen
2. ✍️ Dictation
3. 🧠 Comprehension
4. 🔀 Reorder
5. 🎭 Roleplay
6. 🔊 Shadowing
7. ⚡ Reaction Speaking
8. 🤖 AI Feedback

---

### 1. 🎧 Dialogue Player (Core Component)

Component: `<ConversationPlayer />`

Features:
- Chat bubble style (left/right by speaker)
- Auto play per line
- Play / Pause / Repeat
- Waveform progress
- Speed control (0.75x – 1.25x)
- Highlight currently playing sentence
- Romaji toggle
- Translation toggle
- Click word to show:
  - Kana
  - Romaji
  - Hán Việt
  - Meaning

Keyboard:
- Space: play / pause
- ← →: previous / next line
- R: repeat current line

---

### 2. ✍️ Dictation Mode

Component: `<DictationExercise />`

UI:
- Play audio
- Show sentence with blank: 私は ___ です
- Input box with IME support
- Auto-check on Enter
- Green highlight correct
- Red underline wrong kana
- Show hint button (first kana)

Scoring:
- Character-level diff
- Speed bonus
- Accuracy %

---

### 3. 🧠 Comprehension (MCQ)

Component: `<ListeningMCQ />`

UI:
- Question in Vietnamese
- 4 options as cards
- Sound effect when correct
- Shake animation when wrong
- Explanation panel collapsible

---

### 4. 🔀 Reorder Sentence

Component: `<SentenceReorder />`

UI:
- Draggable word chips
- Magnetic snapping
- Auto-check when completed
- Meaning shown after correct

---

### 5. 🎭 Roleplay

Component: `<RolePlay />`

UI:
- Choose role: Mai / John
- AI plays other role
- Mic button
- Speech-to-text
- Grammar check
- Politeness score
- Naturalness score

---

### 6. 🔊 Shadowing

Component: `<ShadowingTrainer />`

Flow:
- Play native audio
- Countdown
- User speaks
- Compare waveform & pitch
- Score:
  - Intonation
  - Rhythm
  - Speed
  - Clarity

---

### 7. ⚡ Reaction Speaking

Component: `<SituationResponse />`

UI:
- Show situation in Vietnamese
- Timer (5s)
- Speak response
- AI checks:
  - Pattern correctness
  - Particle usage
  - Politeness
  - Naturalness

---

### 8. 🤖 AI Teacher Feedback

Component: `<AITeacherPanel />`

Shows:
- Weak grammar points
- Pronunciation mistakes
- Suggested patterns
- Custom mini drills

---

### 🎮 GAMIFICATION

- Heart system (3 mistakes = repeat)
- XP
- Combo
- Perfect streak
- Review later list (mistake memory)

---

### 🧠 MEMORY MODE

After finishing lesson:
Buttons:
- 🔁 Review wrong only
- 🎯 Speed run
- 🗂 Shadowing only
- 🧑‍🏫 Roleplay only

---

### ⌨ KEYBOARD SHORTCUTS

Space: Play / Pause  
Enter: Submit  
← →: Next / Prev  
1–7: Switch exercise  
M: Toggle meaning  
R: Repeat  
S: Shadowing  
T: Talk  

---

### 🎨 UI STYLE

- Duolingo + WaniKani hybrid
- Big fonts
- Soft colors
- Mascot teacher (Sensei avatar)
- Collapse panels for:
  - Romaji
  - Translation
  - Grammar notes

---

### 🧩 FILE STRUCTURE

/pages/ConversationLesson.tsx  
/components/conversation/
  ConversationPlayer.tsx
  DictationExercise.tsx
  ListeningMCQ.tsx
  SentenceReorder.tsx
  RolePlay.tsx
  ShadowingTrainer.tsx
  SituationResponse.tsx
  AITeacherPanel.tsx
  ProgressTracker.tsx

State:
- currentLine
- currentExercise
- accuracy
- streak
- weakPoints
- audioCache
- speechResult

---

### 🧠 DESIGN PHILOSOPHY

Not "read and memorize"  
But:

Hear → Understand → Speak → Correct → Repeat → Automate

Like training muscle memory for Japanese conversation.
