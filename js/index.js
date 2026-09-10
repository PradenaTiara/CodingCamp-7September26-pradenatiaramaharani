// ==========================================
// CURRENT TIME, DATE, AND GREETING
// ==========================================

// Mengambil elemen HTML berdasarkan ID
const currentTime = document.getElementById("currentTime");
const currentDate = document.getElementById("currentDate");
const greeting = document.getElementById("greeting");


// Fungsi untuk memperbarui waktu, tanggal, dan greeting
function updateDateTime() {

    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    currentTime.textContent =
        `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;


    const dateOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    currentDate.textContent =
        now.toLocaleDateString("en-US", dateOptions);


    currentDate.setAttribute(
        "datetime",
        now.toISOString().split("T")[0]
    );


    if (hours >= 5 && hours < 12) {
        greeting.textContent = "Good Morning";
    }
    else if (hours >= 12 && hours < 18) {
        greeting.textContent = "Good Afternoon";
    }
    else if (hours >= 18 && hours < 22) {
        greeting.textContent = "Good Evening";
    }
    else {
        greeting.textContent = "Good Night";
    }
}


// Menjalankan fungsi pertama kali
updateDateTime();

// Memperbarui setiap 1 detik
setInterval(updateDateTime, 1000);


// ==========================================
// FOCUS TIMER
// ==========================================

const focusTimer = document.getElementById("focusTimer");

const startTimer = document.getElementById("startTimer");
const stopTimer = document.getElementById("stopTimer");
const resetTimer = document.getElementById("resetTimer");

let timerSeconds = 0;
let timerInterval = null;


function updateFocusTimer() {

    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    focusTimer.textContent =
        `${formattedMinutes}:${formattedSeconds}`;
}


startTimer.addEventListener("click", function () {

    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(function () {

        timerSeconds++;

        updateFocusTimer();

    }, 1000);
});


stopTimer.addEventListener("click", function () {

    clearInterval(timerInterval);

    timerInterval = null;
});


resetTimer.addEventListener("click", function () {

    clearInterval(timerInterval);

    timerInterval = null;

    timerSeconds = 0;

    updateFocusTimer();
});


updateFocusTimer();


// ==========================================
// TASKS
// ==========================================

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

let tasks = [];


function saveTasks() {

    localStorage.setItem(
        "lifeDashboardTasks",
        JSON.stringify(tasks)
    );
}


function renderTasks() {

    taskList.innerHTML = "";

    tasks.forEach(function (task, index) {

        const li = document.createElement("li");

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;


        checkbox.addEventListener("change", function () {

            tasks[index].completed = checkbox.checked;

            saveTasks();

            renderTasks();
        });


        const span = document.createElement("span");

        span.textContent = task.text;


        if (task.completed) {
            span.style.textDecoration = "line-through";
        }


        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";


        deleteButton.addEventListener("click", function () {

            tasks.splice(index, 1);

            saveTasks();

            renderTasks();
        });


        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });
}


const savedTasks = localStorage.getItem("lifeDashboardTasks");

if (savedTasks) {
    tasks = JSON.parse(savedTasks);
}


taskForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }


    const newTask = {
        text: taskText,
        completed: false
    };


    tasks.push(newTask);

    saveTasks();

    renderTasks();

    taskInput.value = "";

    taskInput.focus();
});


renderTasks();


// ==========================================
// QUICK LINKS
// ==========================================

const linkForm = document.getElementById("linkForm");
const linkName = document.getElementById("linkName");
const linkUrl = document.getElementById("linkUrl");
const linksList = document.getElementById("linksList");

let quickLinks = [];


function saveLinks() {

    localStorage.setItem(
        "lifeDashboardLinks",
        JSON.stringify(quickLinks)
    );
}


function renderLinks() {

    linksList.innerHTML = "";

    quickLinks.forEach(function (link, index) {

        const anchor = document.createElement("a");

        anchor.textContent = link.name;

        anchor.href = link.url;

        anchor.target = "_blank";

        anchor.rel = "noopener noreferrer";


        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";


        deleteButton.addEventListener("click", function () {

            quickLinks.splice(index, 1);

            saveLinks();

            renderLinks();
        });


        const linkContainer = document.createElement("div");

        linkContainer.appendChild(anchor);
        linkContainer.appendChild(deleteButton);

        linksList.appendChild(linkContainer);
    });
}


const savedLinks = localStorage.getItem("lifeDashboardLinks");

if (savedLinks) {
    quickLinks = JSON.parse(savedLinks);
}


linkForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = linkName.value.trim();
    let url = linkUrl.value.trim();


    if (name === "" || url === "") {
        return;
    }


    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {
        url = "https://" + url;
    }


    const newLink = {
        name: name,
        url: url
    };


    quickLinks.push(newLink);

    saveLinks();

    renderLinks();

    linkName.value = "";
    linkUrl.value = "";

    linkName.focus();
});


renderLinks();