/* =========================================================
   STUDYFLOW
   Main Application JavaScript
   Version: 1.0.0
========================================================= */

"use strict";

/* =========================================================
   01. APP STATE
========================================================= */

const StudyFlow = {

    state: {

        darkMode: false,

        sidebarOpen: false,

        notificationsOpen: false,

        tasks: [],

        subjects: [],

        completedTasks: 0,

        totalStudyMinutes: 0,

        streak: 0,

        dailyGoal: 120,

        todayStudyMinutes: 0,

        focus: {

            duration: 25 * 60,

            remaining: 25 * 60,

            running: false,

            mode: "focus",

            interval: null

        }

    },

    storageKey: "studyflow-data-v1",

    installPrompt: null

};


/* =========================================================
   02. DOM HELPERS
========================================================= */

const $ = (selector, parent = document) => {

    return parent.querySelector(selector);

};


const $$ = (selector, parent = document) => {

    return [...parent.querySelectorAll(selector)];

};


function getById(id) {

    return document.getElementById(id);

}


function safeAddEvent(element, event, callback) {

    if (!element) return;

    element.addEventListener(event, callback);

}


/* =========================================================
   03. LOCAL STORAGE
========================================================= */

function saveData() {

    try {

        localStorage.setItem(
            StudyFlow.storageKey,
            JSON.stringify(StudyFlow.state)
        );

    } catch (error) {

        console.warn(
            "StudyFlow: Unable to save data.",
            error
        );

    }

}


function loadData() {

    try {

        const saved =
            localStorage.getItem(
                StudyFlow.storageKey
            );

        if (!saved) {

            createDefaultData();

            return;

        }

        const parsed =
            JSON.parse(saved);

        StudyFlow.state = {

            ...StudyFlow.state,

            ...parsed,

            focus: {

                ...StudyFlow.state.focus,

                ...(parsed.focus || {}),

                interval: null

            }

        };

    } catch (error) {

        console.warn(
            "StudyFlow: Invalid saved data.",
            error
        );

        createDefaultData();

    }

}


function createDefaultData() {

    StudyFlow.state.tasks = [

        {

            id: createId(),

            title: "مرور درس ریاضی",

            subject: "ریاضی",

            priority: "high",

            completed: false,

            createdAt: Date.now()

        },

        {

            id: createId(),

            title: "مطالعه فصل اول علوم",

            subject: "علوم",

            priority: "medium",

            completed: false,

            createdAt: Date.now()

        },

        {

            id: createId(),

            title: "تمرین برنامه‌نویسی",

            subject: "برنامه‌نویسی",

            priority: "low",

            completed: true,

            createdAt: Date.now()

        }

    ];


    StudyFlow.state.subjects = [

        {

            id: createId(),

            name: "ریاضی",

            progress: 72,

            icon: "fa-calculator"

        },

        {

            id: createId(),

            name: "علوم",

            progress: 58,

            icon: "fa-flask"

        },

        {

            id: createId(),

            name: "برنامه‌نویسی",

            progress: 84,

            icon: "fa-code"

        },

        {

            id: createId(),

            name: "زبان انگلیسی",

            progress: 46,

            icon: "fa-language"

        }

    ];


    StudyFlow.state.streak = 7;

    StudyFlow.state.dailyGoal = 120;

    StudyFlow.state.todayStudyMinutes = 75;

    calculateStats();

    saveData();

}


/* =========================================================
   04. ID GENERATOR
========================================================= */

function createId() {

    return (

        Date.now().toString(36) +

        Math.random()
            .toString(36)
            .substring(2, 8)

    );

}


/* =========================================================
   05. INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    loadData();

    initializeTheme();

    initializeNavigation();

    initializeMobileMenu();

    initializeNotifications();

    initializeSearch();

    initializeTasks();

    initializeFocusTimer();

    initializeModals();

    initializeInstallPrompt();

    initializeKeyboardShortcuts();

    initializeButtons();

    renderAll();

    registerServiceWorker();

    updateGreeting();

    console.log(
        "StudyFlow initialized successfully 🚀"
    );

}


/* =========================================================
   06. RENDER ALL
========================================================= */

function renderAll() {

    calculateStats();

    renderTasks();

    renderSubjects();

    updateStatistics();

    updateGoal();

    updateFocusTimer();

    updateStreak();

}


/* =========================================================
   07. CALCULATE STATISTICS
========================================================= */

function calculateStats() {

    const tasks =
        StudyFlow.state.tasks || [];

    StudyFlow.state.completedTasks =
        tasks.filter(
            task => task.completed
        ).length;

}


/* =========================================================
   08. GREETING
========================================================= */

function updateGreeting() {

    const hour =
        new Date().getHours();

    let greeting = "سلام 👋";

    if (hour >= 5 && hour < 12) {

        greeting =
            "صبح بخیر ☀️";

    } else if (hour >= 12 && hour < 17) {

        greeting =
            "ظهر بخیر 🌤️";

    } else if (hour >= 17 && hour < 21) {

        greeting =
            "عصر بخیر 🌅";

    } else {

        greeting =
            "شب بخیر 🌙";

    }


    const greetingElements =
        $$("[data-greeting]");


    greetingElements.forEach(
        element => {

            element.textContent =
                greeting;

        }
    );

}


/* =========================================================
   09. THEME
========================================================= */

function initializeTheme() {

    const savedTheme =
        localStorage.getItem(
            "studyflow-theme"
        );


    if (
        savedTheme === "dark" ||
        StudyFlow.state.darkMode
    ) {

        enableDarkMode(false);

    } else {

        disableDarkMode(false);

    }

}


function enableDarkMode(save = true) {

    document.body.classList.add(
        "dark-mode"
    );

    StudyFlow.state.darkMode = true;


    updateThemeButtons();


    if (save) {

        localStorage.setItem(
            "studyflow-theme",
            "dark"
        );

        saveData();

    }

}


function disableDarkMode(save = true) {

    document.body.classList.remove(
        "dark-mode"
    );

    StudyFlow.state.darkMode = false;


    updateThemeButtons();


    if (save) {

        localStorage.setItem(
            "studyflow-theme",
            "light"
        );

        saveData();

    }

}


function toggleTheme() {

    if (
        document.body.classList.contains(
            "dark-mode"
        )
    ) {

        disableDarkMode();

        showToast(
            "حالت روشن فعال شد",
            "ظاهر روشن StudyFlow فعال شد."
        );

    } else {

        enableDarkMode();

        showToast(
            "حالت تاریک فعال شد",
            "ظاهر تاریک StudyFlow فعال شد."
        );

    }

}


function updateThemeButtons() {

    const buttons =
        $$(
            "[data-theme-toggle], #themeToggle, #darkModeToggle"
        );


    buttons.forEach(button => {

        const icon =
            $("i", button);

        if (!icon) return;


        if (
            StudyFlow.state.darkMode
        ) {

            icon.className =
                "fa-solid fa-sun";

        } else {

            icon.className =
                "fa-solid fa-moon";

        }

    });

}


/* =========================================================
   10. NAVIGATION
========================================================= */

function initializeNavigation() {

    const items =
        $$(
            ".navigation-item, .bottom-nav-item"
        );


    items.forEach(item => {

        safeAddEvent(
            item,
            "click",
            event => {

                event.preventDefault();

                items.forEach(
                    element =>
                        element.classList.remove(
                            "active"
                        )
                );

                item.classList.add(
                    "active"
                );

                const section =
                    item.dataset.section;

                if (section) {

                    navigateToSection(
                        section
                    );

                }

                closeSidebar();

            }
        );

    });

}


function navigateToSection(section) {

    const target =
        document.querySelector(
            `[data-section-content="${section}"]`
        );


    if (target) {

        target.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

        return;

    }


    const ids = {

        dashboard: "dashboard",

        tasks: "tasks",

        subjects: "subjects",

        focus: "focus",

        statistics: "statistics"

    };


    const id =
        ids[section];


    if (id) {

        const element =
            getById(id);

        if (element) {

            element.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }

    }

}


/* =========================================================
   11. MOBILE SIDEBAR
========================================================= */

function initializeMobileMenu() {

    const openButtons =
        $$(
            "#menuToggle, [data-menu-toggle], .menu-toggle"
        );


    const closeButtons =
        $$(
            "#sidebarClose, .sidebar-close, [data-sidebar-close]"
        );


    const overlay =
        $(
            ".page-overlay"
        );


    openButtons.forEach(button => {

        safeAddEvent(
            button,
            "click",
            openSidebar
        );

    });


    closeButtons.forEach(button => {

        safeAddEvent(
            button,
            "click",
            closeSidebar
        );

    });


    safeAddEvent(
        overlay,
        "click",
        closeSidebar
    );

}


function openSidebar() {

    const sidebar =
        $(".sidebar");


    if (!sidebar) return;


    sidebar.classList.add(
        "open"
    );


    const overlay =
        $(".page-overlay");


    if (overlay) {

        overlay.classList.add(
            "active"
        );

    }


    document.body.style.overflow =
        "hidden";


    StudyFlow.state.sidebarOpen =
        true;

}


function closeSidebar() {

    const sidebar =
        $(".sidebar");


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    const overlay =
        $(".page-overlay");


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }


    document.body.style.overflow =
        "";


    StudyFlow.state.sidebarOpen =
        false;

}


/* =========================================================
   12. NOTIFICATIONS
========================================================= */

function initializeNotifications() {

    const buttons =
        $$(
            "#notificationButton, [data-notifications]"
        );


    const panel =
        $(
            ".notification-panel"
        );


    buttons.forEach(button => {

        safeAddEvent(
            button,
            "click",
            event => {

                event.stopPropagation();

                if (!panel) return;

                panel.classList.toggle(
                    "active"
                );

                StudyFlow.state.notificationsOpen =
                    panel.classList.contains(
                        "active"
                    );

            }
        );

    });


    document.addEventListener(
        "click",
        event => {

            if (
                !panel ||
                !panel.classList.contains(
                    "active"
                )
            ) {

                return;

            }


            if (
                !panel.contains(
                    event.target
                )
            ) {

                panel.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =========================================================
   13. SEARCH
========================================================= */

function initializeSearch() {

    const searchButtons =
        $$(
            "#searchButton, [data-search-button], .topbar-search"
        );


    const searchModal =
        $(
            "#searchModal, [data-search-modal]"
        );


    searchButtons.forEach(button => {

        safeAddEvent(
            button,
            "click",
            () => {

                if (searchModal) {

                    openModal(
                        searchModal
                    );

                    const input =
                        $(
                            "input",
                            searchModal
                        );

                    if (input) {

                        setTimeout(
                            () => input.focus(),
                            100
                        );

                    }

                }

            }
        );

    });


    const inputs =
        $$(
            "#searchInput, [data-search-input], .search-box-large input"
        );


    inputs.forEach(input => {

        safeAddEvent(
            input,
            "input",
            () => {

                performSearch(
                    input.value
                );

            }
        );

    });

}


function performSearch(query) {

    query =
        String(query)
            .trim()
            .toLowerCase();


    const results =
        $(
            "#searchResults, .search-results"
        );


    if (!results) return;


    if (!query) {

        results.innerHTML = `

            <div class="search-empty">

                <i class="fa-solid fa-magnifying-glass"></i>

                <span>
                    برای جستجو چیزی بنویسید
                </span>

            </div>

        `;

        return;

    }


    const tasks =
        StudyFlow.state.tasks
            .filter(task => {

                return (

                    task.title
                        .toLowerCase()
                        .includes(query)

                    ||

                    task.subject
                        .toLowerCase()
                        .includes(query)

                );

            });


    const subjects =
        StudyFlow.state.subjects
            .filter(subject => {

                return subject.name
                    .toLowerCase()
                    .includes(query);

            });


    if (
        tasks.length === 0 &&
        subjects.length === 0
    ) {

        results.innerHTML = `

            <div class="search-empty">

                <i class="fa-solid fa-face-frown"></i>

                <span>
                    نتیجه‌ای پیدا نشد
                </span>

            </div>

        `;

        return;

    }


    let html = "";


    tasks.forEach(task => {

        html += `

            <div class="task-item">

                <div class="task-checkbox">

                    <i class="fa-solid fa-check"></i>

                </div>

                <div class="task-info">

                    <strong>
                        ${escapeHTML(task.title)}
                    </strong>

                    <span>
                        ${escapeHTML(task.subject)}
                    </span>

                </div>

            </div>

        `;

    });


    subjects.forEach(subject => {

        html += `

            <div class="task-item">

                <div class="task-checkbox">

                    <i class="fa-solid ${subject.icon || "fa-book"}"></i>

                </div>

                <div class="task-info">

                    <strong>
                        ${escapeHTML(subject.name)}
                    </strong>

                    <span>
                        پیشرفت ${subject.progress}٪
                    </span>

                </div>

            </div>

        `;

    });


    results.innerHTML =
        html;

}


/* =========================================================
   14. TASKS
========================================================= */

function initializeTasks() {

    const taskContainer =
        $(
            "#taskList, .task-list"
        );


    if (!taskContainer) return;


    taskContainer.addEventListener(
        "click",
        event => {

            const checkbox =
                event.target.closest(
                    ".task-checkbox"
                );


            if (!checkbox) return;


            const taskElement =
                checkbox.closest(
                    ".task-item"
                );


            if (!taskElement) return;


            const taskId =
                taskElement.dataset.taskId;


            if (taskId) {

                toggleTask(taskId);

            } else {

                const index =
                    [...taskContainer.children]
                        .indexOf(taskElement);

                if (
                    index >= 0 &&
                    StudyFlow.state.tasks[index]
                ) {

                    toggleTask(
                        StudyFlow.state.tasks[index].id
                    );

                }

            }

        }
    );


    $$(
        "[data-add-task], #addTaskButton, #newTaskButton"
    ).forEach(button => {

        safeAddEvent(
            button,
            "click",
            openTaskModal
        );

    });

}


function toggleTask(id) {

    const task =
        StudyFlow.state.tasks.find(
            item => item.id === id
        );


    if (!task) return;


    task.completed =
        !task.completed;


    if (task.completed) {

        StudyFlow.state.completedTasks++;

        showToast(
            "آفرین! 🎉",
            "یک کار دیگر را با موفقیت انجام دادی."
        );

    } else {

        StudyFlow.state.completedTasks--;

    }


    saveData();

    renderAll();

}


function renderTasks() {

    const containers =
        $$(
            "#taskList, .task-list"
        );


    containers.forEach(container => {

        if (
            StudyFlow.state.tasks.length === 0
        ) {

            container.innerHTML = `

                <div class="search-empty">

                    <i class="fa-solid fa-clipboard-check"></i>

                    <span>
                        هنوز کاری اضافه نکرده‌اید
                    </span>

                </div>

            `;

            return;

        }


        container.innerHTML =
            StudyFlow.state.tasks
                .map(
                    task =>
                        createTaskHTML(task)
                )
                .join("");

    });

}


function createTaskHTML(task) {

    const priorityText = {

        high: "مهم",

        medium: "متوسط",

        low: "عادی"

    };


    return `

        <div
            class="task-item ${task.completed ? "completed" : ""}"
            data-task-id="${task.id}"
        >

            <button
                class="task-checkbox"
                aria-label="تغییر وضعیت کار"
            >

                <i class="fa-solid fa-check"></i>

            </button>


            <div class="task-info">

                <strong>
                    ${escapeHTML(task.title)}
                </strong>

                <span>
                    ${escapeHTML(task.subject || "عمومی")}
                </span>

            </div>


            <span
                class="task-priority ${task.priority || "low"}"
            >
                ${priorityText[task.priority] || "عادی"}
            </span>

        </div>

    `;

}


/* =========================================================
   15. ADD TASK
========================================================= */

function openTaskModal() {

    const modal =
        $(
            "#taskModal, [data-task-modal]"
        );


    if (!modal) {

        addQuickTask();

        return;

    }


    openModal(modal);

}


function addQuickTask() {

    const title =
        prompt(
            "عنوان کار جدید را وارد کنید:"
        );


    if (!title || !title.trim()) {

        return;

    }


    const task = {

        id: createId(),

        title: title.trim(),

        subject: "عمومی",

        priority: "medium",

        completed: false,

        createdAt: Date.now()

    };


    StudyFlow.state.tasks.unshift(
        task
    );


    saveData();

    renderAll();


    showToast(
        "کار اضافه شد",
        "کار جدید با موفقیت ایجاد شد."
    );

}


/* =========================================================
   16. SUBJECTS
========================================================= */

function renderSubjects() {

    const containers =
        $$(
            "#subjectsGrid, .subjects-grid"
        );


    containers.forEach(container => {

        if (
            StudyFlow.state.subjects.length === 0
        ) {

            container.innerHTML = `

                <div class="search-empty">

                    <i class="fa-solid fa-book"></i>

                    <span>
                        هنوز درسی اضافه نشده است.
                    </span>

                </div>

            `;

            return;

        }


        container.innerHTML =
            StudyFlow.state.subjects
                .map(
                    subject =>
                        createSubjectHTML(
                            subject
                        )
                )
                .join("");

    });

}


function createSubjectHTML(subject) {

    return `

        <div class="subject-card">

            <div class="subject-icon programming">

                <i class="fa-solid ${
                    subject.icon || "fa-book"
                }"></i>

            </div>


            <div class="subject-info">

                <strong>
                    ${escapeHTML(subject.name)}
                </strong>

                <span>
                    ${subject.progress}٪ پیشرفت
                </span>

            </div>


            <div class="subject-progress">

                <div class="mini-progress">

                    <span
                        style="width:${subject.progress}%"
                    ></span>

                </div>

                <small>
                    ${subject.progress}٪
                </small>

            </div>

        </div>

    `;

}


/* =========================================================
   17. STATISTICS
========================================================= */

function updateStatistics() {

    const completed =
        StudyFlow.state.completedTasks;


    const total =
        StudyFlow.state.tasks.length;


    const percentage =
        total > 0

            ? Math.round(
                (completed / total) * 100
            )

            : 0;


    setText(
        [
            "#completedTasks",
            "[data-completed-tasks]"
        ],
        completed
    );


    setText(
        [
            "#totalTasks",
            "[data-total-tasks]"
        ],
        total
    );


    setText(
        [
            "#taskPercentage",
            "[data-task-percentage]"
        ],
        `${percentage}%`
    );


    setText(
        [
            "#studyMinutes",
            "[data-study-minutes]"
        ],
        StudyFlow.state.todayStudyMinutes
    );


    setText(
        [
            "#streak",
            "[data-streak]"
        ],
        StudyFlow.state.streak
    );


    const progress =
        total > 0

            ? Math.round(
                completed / total * 100
            )

            : 0;


    $$(
        "[data-task-progress], .task-progress .progress-value"
    ).forEach(element => {

        element.style.width =
            `${progress}%`;

    });

}


function setText(selectors, value) {

    selectors.forEach(selector => {

        $$(selector).forEach(element => {

            element.textContent =
                value;

        });

    });

}


/* =========================================================
   18. DAILY GOAL
========================================================= */

function updateGoal() {

    const goal =
        Math.max(
            1,
            StudyFlow.state.dailyGoal
        );


    const current =
        Math.min(
            StudyFlow.state.todayStudyMinutes,
            goal
        );


    const percentage =
        Math.min(
            100,
            Math.round(
                (current / goal) * 100
            )
        );


    const degrees =
        percentage * 3.6;


    $$(
        ".goal-circle"
    ).forEach(circle => {

        circle.style.background = `

            conic-gradient(

                var(--primary)
                ${degrees}deg,

                var(--border)
                ${degrees}deg

            )

        `;

    });


    setText(
        [
            "#goalPercentage",
            "[data-goal-percentage]"
        ],
        `${percentage}%`
    );


    setText(
        [
            "#todayStudy",
            "[data-today-study]"
        ],
        `${current} دقیقه`
    );


    setText(
        [
            "#dailyGoal",
            "[data-daily-goal]"
        ],
        `${goal} دقیقه`
    );

}


/* =========================================================
   19. STREAK
========================================================= */

function updateStreak() {

    setText(
        [
            "#streakNumber",
            "[data-streak-number]"
        ],
        StudyFlow.state.streak
    );


    setText(
        [
            "#streakText",
            "[data-streak-text]"
        ],
        `${StudyFlow.state.streak} روز`
    );

}


/* =========================================================
   20. POMODORO / FOCUS TIMER
========================================================= */

function initializeFocusTimer() {

    const startButtons =
        $$(
            "#focusStart, #focusStartButton, [data-focus-start]"
        );


    const resetButtons =
        $$(
            "#focusReset, #focusResetButton, [data-focus-reset]"
        );


    startButtons.forEach(button => {

        safeAddEvent(
            button,
            "click",
            toggleFocusTimer
        );

    });


    resetButtons.forEach(button => {

        safeAddEvent(
            button,
            "click",
            resetFocusTimer
        );

    });


    updateFocusTimer();

}


function toggleFocusTimer() {

    if (
        StudyFlow.state.focus.running
    ) {

        pauseFocusTimer();

    } else {

        startFocusTimer();

    }

}


function startFocusTimer() {

    if (
        StudyFlow.state.focus.running
    ) {

        return;

    }


    StudyFlow.state.focus.running =
        true;


    const cards =
        $$(
            ".focus-card"
        );


    cards.forEach(card => {

        card.classList.add(
            "is-running"
        );

    });


    StudyFlow.state.focus.interval =
        setInterval(
            focusTick,
            1000
        );


    updateFocusButtons();

    showToast(
        "تمرکز شروع شد 🎯",
        "حالا فقط روی مطالعه تمرکز کن."
    );

}


function pauseFocusTimer() {

    StudyFlow.state.focus.running =
        false;


    clearInterval(
        StudyFlow.state.focus.interval
    );


    StudyFlow.state.focus.interval =
        null;


    $$(
        ".focus-card"
    ).forEach(card => {

        card.classList.remove(
            "is-running"
        );

    });


    updateFocusButtons();

    saveData();

}


function focusTick() {

    if (
        StudyFlow.state.focus.remaining <= 0
    ) {

        finishFocusSession();

        return;

    }


    StudyFlow.state.focus.remaining--;

    updateFocusTimer();

}


function finishFocusSession() {

    pauseFocusTimer();


    const completedMinutes =
        StudyFlow.state.focus.mode === "focus"

            ? Math.round(
                StudyFlow.state.focus.duration / 60
            )

            : 0;


    if (completedMinutes > 0) {

        StudyFlow.state.todayStudyMinutes +=
            completedMinutes;

        StudyFlow.state.totalStudyMinutes +=
            completedMinutes;

    }


    saveData();

    renderAll();


    showToast(
        "جلسه تمام شد 🎉",
        "عالی بود! یک جلسه تمرکز کامل شد."
    );


    resetFocusTimer();

}


function resetFocusTimer() {

    pauseFocusTimer();


    StudyFlow.state.focus.remaining =
        StudyFlow.state.focus.duration;


    updateFocusTimer();

}


function updateFocusTimer() {

    const seconds =
        Math.max(
            0,
            StudyFlow.state.focus.remaining
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    const formatted =

        `${String(minutes).padStart(2, "0")}:` +

        `${String(remainingSeconds).padStart(2, "0")}`;


    setText(
        [
            "#focusTime",
            "#focusTimer",
            ".focus-time",
            ".modal-focus-timer"
        ],
        formatted
    );


    updateFocusProgress();

    updateFocusButtons();

}


function updateFocusProgress() {

    const duration =
        StudyFlow.state.focus.duration;


    const remaining =
        StudyFlow.state.focus.remaining;


    if (!duration) return;


    const progress =
        Math.max(
            0,
            Math.min(
                100,
                ((duration - remaining) / duration) * 100
            )
        );


    const degrees =
        progress * 3.6;


    $$(
        ".focus-ring"
    ).forEach(ring => {

        ring.style.background = `

            conic-gradient(

                var(--primary)
                ${degrees}deg,

                var(--border)
                ${degrees}deg

            )

        `;

    });

}


function updateFocusButtons() {

    const buttons =
        $$(
            "#focusStart, #focusStartButton, [data-focus-start], .focus-start-button"
        );


    buttons.forEach(button => {

        const icon =
            $("i", button);


        if (
            StudyFlow.state.focus.running
        ) {

            button.setAttribute(
                "aria-label",
                "توقف"
            );


            if (icon) {

                icon.className =
                    "fa-solid fa-pause";

            }


            const text =
                button.querySelector(
                    "[data-button-text]"
                );


            if (text) {

                text.textContent =
                    "توقف";

            }

        } else {

            button.setAttribute(
                "aria-label",
                "شروع"
            );


            if (icon) {

                icon.className =
                    "fa-solid fa-play";

            }


            const text =
                button.querySelector(
                    "[data-button-text]"
                );


            if (text) {

                text.textContent =
                    "شروع تمرکز";

            }

        }

    });

}


/* =========================================================
   21. MODALS
========================================================= */

function initializeModals() {

    $$(
        ".modal-overlay"
    ).forEach(overlay => {

        safeAddEvent(
            overlay,
            "click",
            event => {

                if (
                    event.target === overlay
                ) {

                    closeModal(overlay);

                }

            }
        );

    });


    $$(
        ".modal-close, [data-modal-close]"
    ).forEach(button => {

        safeAddEvent(
            button,
            "click",
            () => {

                const modal =
                    button.closest(
                        ".modal-overlay"
                    );

                if (modal) {

                    closeModal(modal);

                }

            }
        );

    });


    $$(
        "[data-open-modal]"
    ).forEach(button => {

        safeAddEvent(
            button,
            "click",
            () => {

                const targetId =
                    button.dataset.openModal;


                const modal =
                    getById(targetId);


                if (modal) {

                    openModal(modal);

                }

            }
        );

    });

}


function openModal(modal) {

    if (!modal) return;


    modal.classList.add(
        "active"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(modal) {

    if (!modal) return;


    modal.classList.remove(
        "active"
    );


    if (
        !$(".modal-overlay.active")
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* =========================================================
   22. BUTTONS
========================================================= */

function initializeButtons() {

    $$(
        "#themeToggle, #darkModeToggle, [data-theme-toggle]"
    ).forEach(button => {

        safeAddEvent(
            button,
            "click",
            toggleTheme
        );

    });


    $$(
        "#quickFocus, [data-quick-focus]"
    ).forEach(button => {

        safeAddEvent(
            button,
            "click",
            () => {

                const modal =
                    $(
                        "#focusModal, [data-focus-modal]"
                    );


                if (modal) {

                    openModal(modal);

                } else {

                    startFocusTimer();

                }

            }
        );

    });


    $$(
        "[data-reset]"
    ).forEach(button => {

        safeAddEvent(
            button,
            "click",
            () => {

                resetApplication();

            }
        );

    });

}


/* =========================================================
   23. TOAST
========================================================= */

let toastTimeout = null;


function showToast(
    title = "StudyFlow",
    message = ""
) {

    let toast =
        $(
            "#toast, .toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "toast";

        toast.className =
            "toast";

        toast.innerHTML = `

            <div class="toast-icon">

                <i class="fa-solid fa-check"></i>

            </div>

            <div class="toast-content">

                <strong></strong>

                <span></span>

            </div>

            <button
                class="toast-close"
                aria-label="بستن"
            >

                <i class="fa-solid fa-xmark"></i>

            </button>

        `;


        document.body.appendChild(
            toast
        );


        safeAddEvent(
            $(".toast-close", toast),
            "click",
            () => {

                hideToast();

            }
        );

    }


    const titleElement =
        $(".toast-content strong", toast);


    const messageElement =
        $(".toast-content span", toast);


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    toast.classList.add(
        "active"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            hideToast,
            4000
        );

}


function hideToast() {

    const toast =
        $(
            "#toast, .toast"
        );


    if (toast) {

        toast.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   24. INSTALL PWA
========================================================= */

function initializeInstallPrompt() {

    window.addEventListener(
        "beforeinstallprompt",
        event => {

            event.preventDefault();

            StudyFlow.installPrompt =
                event;


            showInstallBanner();

        }
    );


    window.addEventListener(
        "appinstalled",
        () => {

            StudyFlow.installPrompt =
                null;


            hideInstallBanner();


            showToast(
                "StudyFlow نصب شد 📱",
                "حالا می‌توانی مثل یک اپلیکیشن واقعی از آن استفاده کنی."
            );

        }
    );


    $$(
        "#installButton, [data-install]"
    ).forEach(button => {

        safeAddEvent(
            button,
            "click",
            installApplication
        );

    });


    $$(
        "#installClose, .install-close, [data-install-close]"
    ).forEach(button => {

        safeAddEvent(
            button,
            "click",
            hideInstallBanner
        );

    });

}


function showInstallBanner() {

    const banner =
        $(
            "#installBanner, .install-banner"
        );


    if (!banner) return;


    banner.classList.add(
        "active"
    );

}


function hideInstallBanner() {

    const banner =
        $(
            "#installBanner, .install-banner"
        );


    if (!banner) return;


    banner.classList.remove(
        "active"
    );

}


async function installApplication() {

    if (!StudyFlow.installPrompt) {

        showToast(
            "نصب در دسترس نیست",
            "مرورگر فعلاً گزینه نصب را ارائه نکرده است."
        );

        return;

    }


    try {

        StudyFlow.installPrompt.prompt();


        const result =
            await StudyFlow.installPrompt
                .userChoice;


        if (
            result.outcome === "accepted"
        ) {

            hideInstallBanner();

        }


        StudyFlow.installPrompt =
            null;

    } catch (error) {

        console.warn(
            "Install error:",
            error
        );

    }

}


/* =========================================================
   25. SERVICE WORKER
========================================================= */

async function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        return;

    }


    try {

        const registration =
            await navigator.serviceWorker
                .register(
                    "./sw.js"
                );


        console.log(
            "StudyFlow Service Worker registered:",
            registration.scope
        );

    } catch (error) {

        console.warn(
            "StudyFlow Service Worker registration failed:",
            error
        );

    }

}


/* =========================================================
   26. KEYBOARD SHORTCUTS
========================================================= */

function initializeKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();


                const searchModal =
                    $(
                        "#searchModal, [data-search-modal]"
                    );


                if (searchModal) {

                    openModal(
                        searchModal
                    );


                    const input =
                        $("input", searchModal);


                    if (input) {

                        setTimeout(
                            () => input.focus(),
                            100
                        );

                    }

                }

            }


            if (
                event.key === "Escape"
            ) {

                closeSidebar();


                $$(
                    ".modal-overlay.active"
                ).forEach(
                    closeModal
                );


                const panel =
                    $(
                        ".notification-panel.active"
                    );


                if (panel) {

                    panel.classList.remove(
                        "active"
                    );

                }

            }

        }
    );

}


/* =========================================================
   27. RESET APPLICATION
========================================================= */

function resetApplication() {

    const confirmed =
        confirm(
            "آیا مطمئن هستید که می‌خواهید اطلاعات StudyFlow پاک شود؟"
        );


    if (!confirmed) return;


    localStorage.removeItem(
        StudyFlow.storageKey
    );


    localStorage.removeItem(
        "studyflow-theme"
    );


    location.reload();

}


/* =========================================================
   28. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}


/* =========================================================
   29. PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            StudyFlow.state.focus.running
        ) {

            saveData();

        }

    }
);


/* =========================================================
   30. BEFORE UNLOAD
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        saveData();

    }
);


/* =========================================================
   31. ONLINE / OFFLINE
========================================================= */

window.addEventListener(
    "online",
    () => {

        showToast(
            "اتصال برقرار شد 🌐",
            "StudyFlow دوباره آنلاین است."
        );

    }
);


window.addEventListener(
    "offline",
    () => {

        showToast(
            "حالت آفلاین",
            "StudyFlow همچنان می‌تواند به صورت آفلاین کار کند."
        );

    }
);


/* =========================================================
   32. DYNAMIC FOCUS TIME
========================================================= */

function setFocusDuration(minutes) {

    const value =
        Number(minutes);


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        return;

    }


    pauseFocusTimer();


    StudyFlow.state.focus.duration =
        Math.round(value * 60);


    StudyFlow.state.focus.remaining =
        StudyFlow.state.focus.duration;


    saveData();

    updateFocusTimer();

}


/* =========================================================
   33. ADD STUDY MINUTES
========================================================= */

function addStudyMinutes(minutes) {

    const value =
        Number(minutes);


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        return;

    }


    StudyFlow.state.todayStudyMinutes +=
        Math.round(value);


    StudyFlow.state.totalStudyMinutes +=
        Math.round(value);


    saveData();

    renderAll();

}


/* =========================================================
   34. PUBLIC API
========================================================= */

window.StudyFlow = {

    state: StudyFlow.state,

    addTask: function (
        title,
        subject = "عمومی",
        priority = "medium"
    ) {

        if (
            !title ||
            !title.trim()
        ) {

            return null;

        }


        const task = {

            id: createId(),

            title: title.trim(),

            subject,

            priority,

            completed: false,

            createdAt: Date.now()

        };


        StudyFlow.state.tasks.unshift(
            task
        );


        saveData();

        renderAll();


        showToast(
            "کار جدید اضافه شد",
            task.title
        );


        return task;

    },


    removeTask: function (id) {

        const index =
            StudyFlow.state.tasks.findIndex(
                task => task.id === id
            );


        if (index === -1) {

            return false;

        }


        StudyFlow.state.tasks.splice(
            index,
            1
        );


        saveData();

        renderAll();

        return true;

    },


    toggleTask,

    startFocusTimer,

    pauseFocusTimer,

    resetFocusTimer,

    setFocusDuration,

    addStudyMinutes,

    toggleTheme,

    showToast

};


/* =========================================================
   35. FINAL LOG
========================================================= */

console.log(
    "%c StudyFlow ",
    "background:#6c5ce7;color:white;padding:8px;border-radius:8px;font-weight:bold"
);

console.log(
    "StudyFlow App.js loaded successfully 🚀"
);