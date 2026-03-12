// ============================================
// THEME TOGGLE (Light/Dark Mode)
// ============================================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.querySelector('.theme-icon').textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    themeToggle.querySelector('.theme-icon').textContent = isDarkMode ? '☀️' : '🌙';
});

// ============================================
// TAB NAVIGATION
// ============================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        const tabName = btn.getAttribute('data-tab');
        document.getElementById(tabName).classList.add('active');
    });
});

// ============================================
// NOTES FUNCTIONALITY
// ============================================
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const fontFamily = document.getElementById('fontFamily');
const fontSize = document.getElementById('fontSize');
const fontColor = document.getElementById('fontColor');
const bgColor = document.getElementById('bgColor');
const saveNote = document.getElementById('saveNote');
const clearNote = document.getElementById('clearNote');
const notesList = document.getElementById('notesList');

let notes = JSON.parse(localStorage.getItem('notes')) || [];

function displayNotes() {
    notesList.innerHTML = '';
    notes.forEach((note, index) => {
        const noteCard = document.createElement('div');
        noteCard.className = `note-card ${note.bgColor}`;
        noteCard.style.fontFamily = note.fontFamily;
        noteCard.style.fontSize = note.fontSize + 'px';
        noteCard.style.color = note.fontColor;

        const date = new Date(note.date).toLocaleDateString('ar-SA');
        
        noteCard.innerHTML = `
            <div class="note-card-header">
                <div class="note-card-title">${escapeHtml(note.title)}</div>
                <div class="note-card-date">${date}</div>
            </div>
            <div class="note-card-content">${escapeHtml(note.content).replace(/\n/g, '<br>')}</div>
            <div class="note-card-actions">
                <button class="btn btn-secondary" onclick="editNote(${index})">✏️ تعديل</button>
                <button class="btn btn-danger" onclick="deleteNote(${index})">🗑️ حذف</button>
            </div>
        `;
        notesList.appendChild(noteCard);
    });
}

function saveNoteHandler() {
    if (noteTitle.value.trim() === '' || noteContent.value.trim() === '') {
        alert('يرجى ملء العنوان والمحتوى!');
        return;
    }

    const note = {
        id: Date.now(),
        title: noteTitle.value,
        content: noteContent.value,
        fontFamily: fontFamily.value,
        fontSize: parseInt(fontSize.value),
        fontColor: fontColor.value,
        bgColor: bgColor.value,
        date: new Date().toISOString()
    };

    notes.unshift(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    clearNoteForm();
    displayNotes();
    alert('✅ تم حفظ الملاحظة بنجاح!');
}

function clearNoteForm() {
    noteTitle.value = '';
    noteContent.value = '';
    fontFamily.value = 'Arial';
    fontSize.value = '16';
    fontColor.value = '#000000';
    bgColor.value = 'bg-light-blue';
}

function deleteNote(index) {
    if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
        notes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(notes));
        displayNotes();
    }
}

function editNote(index) {
    const note = notes[index];
    noteTitle.value = note.title;
    noteContent.value = note.content;
    fontFamily.value = note.fontFamily;
    fontSize.value = note.fontSize;
    fontColor.value = note.fontColor;
    bgColor.value = note.bgColor;
    
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
    
    // Scroll to the top
    document.getElementById('notes').scrollIntoView({ behavior: 'smooth' });
}

// Update note preview as user types
noteContent.addEventListener('input', () => {
    noteContent.style.fontFamily = fontFamily.value;
    noteContent.style.fontSize = fontSize.value + 'px';
    noteContent.style.color = fontColor.value;
});

fontFamily.addEventListener('change', () => {
    noteContent.style.fontFamily = fontFamily.value;
});

fontSize.addEventListener('change', () => {
    noteContent.style.fontSize = fontSize.value + 'px';
});

fontColor.addEventListener('change', () => {
    noteContent.style.color = fontColor.value;
});

saveNote.addEventListener('click', saveNoteHandler);
clearNote.addEventListener('click', clearNoteForm);

displayNotes();

// ============================================
// TASKS FUNCTIONALITY
// ============================================
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTask');
const tasksList = document.getElementById('tasksList');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function displayTasks() {
    tasksList.innerHTML = '';
    let completed = 0;

    tasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;

        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="task-delete" onclick="deleteTask(${index})">🗑️</button>
        `;

        tasksList.appendChild(taskItem);
        if (task.completed) completed++;
    });

    completedCount.textContent = completed;
    totalCount.textContent = tasks.length;
}

function addTask() {
    if (taskInput.value.trim() === '') {
        alert('يرجى إدخال مهمة!');
        return;
    }

    tasks.push({
        id: Date.now(),
        text: taskInput.value,
        completed: false
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskInput.value = '';
    displayTasks();
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
}

function deleteTask(index) {
    if (confirm('حذف هذه المهمة؟')) {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
    }
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

displayTasks();

// ============================================
// HABITS FUNCTIONALITY
// ============================================
const habitInput = document.getElementById('habitInput');
const addHabitBtn = document.getElementById('addHabit');
const habitsList = document.getElementById('habitsList');

let habits = JSON.parse(localStorage.getItem('habits')) || [];

function displayHabits() {
    habitsList.innerHTML = '';

    habits.forEach((habit, index) => {
        const habitCard = document.createElement('div');
        habitCard.className = 'habit-card';

        const lastCheckDate = habit.lastCheck ? new Date(habit.lastCheck).toLocaleDateString('ar-SA') : 'لم تبدأ بعد';

        habitCard.innerHTML = `
            <div class="habit-name">🎯 ${escapeHtml(habit.name)}</div>
            <div class="habit-streak">
                <span>عدد الأيام المتتالية:</span>
                <span class="streak-count">${habit.streak}</span>
            </div>
            <div style="margin-bottom: 10px; font-size: 0.9em; color: var(--text-secondary);">
                آخر تحديث: ${lastCheckDate}
            </div>
            <div class="habit-actions">
                <button class="habit-check" onclick="checkHabit(${index})">✅ تم اليوم</button>
                <button class="habit-delete" onclick="deleteHabit(${index})">🗑️</button>
            </div>
        `;

        habitsList.appendChild(habitCard);
    });
}

function addHabit() {
    if (habitInput.value.trim() === '') {
        alert('يرجى إدخال عادة!');
        return;
    }

    habits.push({
        id: Date.now(),
        name: habitInput.value,
        streak: 0,
        lastCheck: null
    });

    localStorage.setItem('habits', JSON.stringify(habits));
    habitInput.value = '';
    displayHabits();
}

function checkHabit(index) {
    const today = new Date().toDateString();
    const lastCheck = habits[index].lastCheck ? new Date(habits[index].lastCheck).toDateString() : null;

    if (lastCheck === today) {
        alert('لقد سجلت هذه العادة اليوم بالفعل! 🎉');
        return;
    }

    // Check if it's the next day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastCheck === yesterday.toDateString()) {
        habits[index].streak++;
    } else if (lastCheck !== today) {
        habits[index].streak = 1;
    }

    habits[index].lastCheck = new Date().toISOString();
    localStorage.setItem('habits', JSON.stringify(habits));
    displayHabits();
    alert(`🎯 ممتاز! سلسلتك الآن ${habits[index].streak} أيام متتالية!`);
}

function deleteHabit(index) {
    if (confirm('حذف هذه العادة؟')) {
        habits.splice(index, 1);
        localStorage.setItem('habits', JSON.stringify(habits));
        displayHabits();
    }
}

addHabitBtn.addEventListener('click', addHabit);
habitInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addHabit();
});

displayHabits();

// ============================================
// POMODORO TIMER FUNCTIONALITY
// ============================================
const timerDisplay = document.getElementById('timerDisplay');
const startTimer = document.getElementById('startTimer');
const pauseTimer = document.getElementById('pauseTimer');
const resetTimer = document.getElementById('resetTimer');
const workDuration = document.getElementById('workDuration');
const breakDuration = document.getElementById('breakDuration');
const sessionType = document.getElementById('sessionType');

let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let isWorkSession = true;
let timerInterval;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
    sessionType.textContent = isWorkSession ? 'جلسة عمل 💼' : 'فترة راحة ☕';
}

function startTimerHandler() {
    if (isRunning) return;
    isRunning = true;
    startTimer.disabled = true;
    pauseTimer.disabled = false;

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft === 0) {
            // Switch between work and break
            isWorkSession = !isWorkSession;
            timeLeft = (isWorkSession ? workDuration.value : breakDuration.value) * 60;
            playNotification();
        }
    }, 1000);
}

function pauseTimerHandler() {
    isRunning = false;
    clearInterval(timerInterval);
    startTimer.disabled = false;
    pauseTimer.disabled = true;
}

function resetTimerHandler() {
    isRunning = false;
    clearInterval(timerInterval);
    isWorkSession = true;
    timeLeft = workDuration.value * 60;
    updateDisplay();
    startTimer.disabled = false;
    pauseTimer.disabled = true;
}

function playNotification() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Alert notification
    const message = isWorkSession ? '🎉 انتهت فترة الراحة! وقت العمل' : '✅ انتهت جلسة العمل! خذ راحة';
    alert(message);
}

workDuration.addEventListener('change', () => {
    if (!isRunning && isWorkSession) {
        timeLeft = workDuration.value * 60;
        updateDisplay();
    }
});

breakDuration.addEventListener('change', () => {
    if (!isRunning && !isWorkSession) {
        timeLeft = breakDuration.value * 60;
        updateDisplay();
    }
});

startTimer.addEventListener('click', startTimerHandler);
pauseTimer.addEventListener('click', pauseTimerHandler);
resetTimer.addEventListener('click', resetTimerHandler);

updateDisplay();

// ============================================
// UTILITY FUNCTION
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// AUTO-SAVE AND LOAD
// ============================================
window.addEventListener('beforeunload', () => {
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('habits', JSON.stringify(habits));
});

// Load all data on page load
window.addEventListener('load', () => {
    displayNotes();
    displayTasks();
    displayHabits();
});