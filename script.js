// ============================================
// THEME TOGGLE
// ============================================
const themeToggle = document.getElementById('themeToggle');
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
// SETTINGS
// ============================================
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('show');
    loadSettings();
});

closeSettings.addEventListener('click', () => {
    settingsModal.classList.remove('show');
    saveSettings();
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('show');
        saveSettings();
    }
});

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    document.getElementById('soundEnabled').checked = settings.soundEnabled !== false;
    document.getElementById('notificationsEnabled').checked = settings.notificationsEnabled !== false;
    document.getElementById('vibrationEnabled').checked = settings.vibrationEnabled !== false;
    document.getElementById('defaultFontSize').value = settings.defaultFontSize || 16;
    document.getElementById('defaultFont').value = settings.defaultFont || 'Arial';
}

function saveSettings() {
    const settings = {
        soundEnabled: document.getElementById('soundEnabled').checked,
        notificationsEnabled: document.getElementById('notificationsEnabled').checked,
        vibrationEnabled: document.getElementById('vibrationEnabled').checked,
        defaultFontSize: document.getElementById('defaultFontSize').value,
        defaultFont: document.getElementById('defaultFont').value
    };
    localStorage.setItem('settings', JSON.stringify(settings));
}

document.getElementById('exportJSON').addEventListener('click', () => {
    const data = {
        notes: JSON.parse(localStorage.getItem('notes')) || [],
        tasks: JSON.parse(localStorage.getItem('tasks')) || [],
        habits: JSON.parse(localStorage.getItem('habits')) || [],
        achievements: JSON.parse(localStorage.getItem('achievements')) || []
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `notebook_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showNotification('✅ تم تصدير البيانات بنجاح!');
});

document.getElementById('deleteAllData').addEventListener('click', () => {
    if (confirm('⚠️ هل أنت متأكد؟ سيتم حذف جميع البيانات!')) {
        localStorage.clear();
        location.reload();
    }
});

document.getElementById('resetSettings').addEventListener('click', () => {
    if (confirm('هل تريد إعادة تعيين الإعدادات؟')) {
        localStorage.removeItem('settings');
        loadSettings();
        showNotification('✅ تم إعادة تعيين الإعدادات');
    }
});

// ============================================
// TAB NAVIGATION
// ============================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        btn.classList.add('active');
        const tabName = btn.getAttribute('data-tab');
        document.getElementById(tabName).classList.add('active');
        
        if (tabName === 'stats') {
            setTimeout(updateStatistics, 100);
        }
        if (tabName === 'achievements') {
            updateAchievements();
        }
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
const noteTags = document.getElementById('noteTags');
const saveNote = document.getElementById('saveNote');
const clearNote = document.getElementById('clearNote');
const notesList = document.getElementById('notesList');
const searchNotes = document.getElementById('searchNotes');
const filterTags = document.getElementById('filterTags');
const sortNotes = document.getElementById('sortNotes');

let notes = JSON.parse(localStorage.getItem('notes')) || [];
let userPoints = parseInt(localStorage.getItem('userPoints')) || 0;

function displayNotes(notesToDisplay = notes) {
    notesList.innerHTML = '';
    notesToDisplay.forEach((note, index) => {
        const realIndex = notes.findIndex(n => n.id === note.id);
        const noteCard = document.createElement('div');
        noteCard.className = `note-card ${note.bgColor}`;
        noteCard.style.fontFamily = note.fontFamily;
        noteCard.style.fontSize = note.fontSize + 'px';
        noteCard.style.color = note.fontColor;

        const date = new Date(note.date).toLocaleDateString('ar-SA');
        const tagsHtml = note.tags && note.tags.length > 0 ? 
            `<div class="note-tags">${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : '';
        
        noteCard.innerHTML = `
            <div class="note-card-header">
                <div class="note-card-title">${escapeHtml(note.title)}</div>
                <div class="note-card-date">${date}</div>
            </div>
            ${tagsHtml}
            <div class="note-card-content">${escapeHtml(note.content).replace(/\n/g, '<br>')}</div>
            <div class="note-card-actions">
                <button class="btn btn-secondary" onclick="editNote(${realIndex})">✏️</button>
                <button class="btn btn-secondary" onclick="exportNotePDF(${realIndex})">📄</button>
                <button class="btn btn-danger" onclick="deleteNote(${realIndex})">🗑️</button>
            </div>
        `;
        notesList.appendChild(noteCard);
    });
}

function saveNoteHandler() {
    if (noteTitle.value.trim() === '' || noteContent.value.trim() === '') {
        showNotification('⚠️ يرجى ملء العنوان والمحتوى!');
        return;
    }

    const tags = noteTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const note = {
        id: Date.now(),
        title: noteTitle.value,
        content: noteContent.value,
        fontFamily: fontFamily.value,
        fontSize: parseInt(fontSize.value),
        fontColor: fontColor.value,
        bgColor: bgColor.value,
        tags: tags,
        date: new Date().toISOString()
    };

    notes.unshift(note);
    saveNotesToStorage();
    addAchievementProgress('note_writer', 1);
    clearNoteForm();
    displayNotes();
    showNotification('✅ تم حفظ الملاحظة بنجاح!');
    updateTagFilters();
}

function saveNotesToStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function clearNoteForm() {
    noteTitle.value = '';
    noteContent.value = '';
    noteTags.value = '';
    fontFamily.value = 'Arial';
    fontSize.value = '16';
    fontColor.value = '#000000';
    bgColor.value = 'bg-light-blue';
}

function deleteNote(index) {
    if (confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) {
        notes.splice(index, 1);
        saveNotesToStorage();
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
    noteTags.value = (note.tags || []).join(', ');
    
    notes.splice(index, 1);
    saveNotesToStorage();
    displayNotes();
    document.getElementById('notes').scrollIntoView({ behavior: 'smooth' });
}

function exportNotePDF(index) {
    const note = notes[index];
    const element = document.createElement('div');
    element.innerHTML = `
        <h1>${escapeHtml(note.title)}</h1>
        <p>${escapeHtml(note.content).replace(/\n/g, '<br>')}</p>
        <hr>
        <p>التاريخ: ${new Date(note.date).toLocaleDateString('ar-SA')}</p>
    `;
    
    const opt = {
        margin: 10,
        filename: `${note.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
    showNotification('📄 تم تصدير الملاحظة كـ PDF');
}

function updateTagFilters() {
    const allTags = new Set();
    notes.forEach(note => {
        if (note.tags) {
            note.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    const currentValue = filterTags.value;
    filterTags.innerHTML = '<option value="">الكل</option>';
    allTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        filterTags.appendChild(option);
    });
    filterTags.value = currentValue;
}

// Search and Filter
searchNotes.addEventListener('input', filterAndSort);
filterTags.addEventListener('change', filterAndSort);
sortNotes.addEventListener('change', filterAndSort);

function filterAndSort() {
    let filtered = notes.filter(note => {
        const matchesSearch = note.title.includes(searchNotes.value) || 
                             note.content.includes(searchNotes.value);
        const matchesTag = !filterTags.value || 
                          (note.tags && note.tags.includes(filterTags.value));
        return matchesSearch && matchesTag;
    });

    if (sortNotes.value === 'oldest') {
        filtered.reverse();
    } else if (sortNotes.value === 'title') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    displayNotes(filtered);
}

noteContent.addEventListener('input', () => {
    noteContent.style.fontFamily = fontFamily.value;
    noteContent.style.fontSize = fontSize.value + 'px';
    noteContent.style.color = fontColor.value;
});

saveNote.addEventListener('click', saveNoteHandler);
clearNote.addEventListener('click', clearNoteForm);

displayNotes();
updateTagFilters();

// ============================================
// TASKS FUNCTIONALITY
// ============================================
const taskInput = document.getElementById('taskInput');
const taskPriority = document.getElementById('taskPriority');
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
        taskItem.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;

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
    
    // Update progress bar
    const percent = tasks.length > 0 ?