// ── State ──────────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem("todo_tasks") || "[]");
let currentFilter = "all";

// ── Save to localStorage ────────────────────────────────
function saveTasks() {
  localStorage.setItem("todo_tasks", JSON.stringify(tasks));
}

// ── Escape HTML to prevent XSS ─────────────────────────
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Render the task list ────────────────────────────────
function render() {
  const list = document.getElementById("taskList");
  const countLabel = document.getElementById("countLabel");

  // Filter tasks based on current tab
  const visible = tasks.filter((t) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done") return t.done;
    return true;
  });

  // Empty state message
  if (visible.length === 0) {
    list.innerHTML = `<li class="empty-msg">${
      currentFilter === "done"
        ? "No completed tasks yet."
        : "Nothing here — add a task above!"
    }</li>`;
  } else {
    list.innerHTML = visible
      .map(
        (t) => `
        <li class="task-item${t.done ? " done" : ""}" data-id="${t.id}">
          <input
            class="task-check"
            type="checkbox"
            ${t.done ? "checked" : ""}
            aria-label="Mark task as done"
          />
          <span class="task-text">${escapeHTML(t.text)}</span>
          <button class="task-del" aria-label="Delete task">✕</button>
        </li>`
      )
      .join("");
  }

  // Update footer count (only counts active tasks)
  const activeCount = tasks.filter((t) => !t.done).length;
  countLabel.textContent = `${activeCount} task${activeCount !== 1 ? "s" : ""} left`;

  // Attach events to newly rendered items
  attachItemEvents();
}

// ── Attach checkbox + delete events ────────────────────
function attachItemEvents() {
  document.querySelectorAll(".task-item").forEach((item) => {
    const id = Number(item.dataset.id);

    item.querySelector(".task-check").addEventListener("change", () => {
      toggleTask(id);
    });

    item.querySelector(".task-del").addEventListener("click", () => {
      removeTask(id);
    });
  });
}

// ── Add a new task ──────────────────────────────────────
function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({ id: Date.now(), text, done: false });
  input.value = "";
  input.focus();
  saveTasks();
  render();
}

// ── Toggle done/undone ──────────────────────────────────
function toggleTask(id) {
  tasks = tasks.map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  saveTasks();
  render();
}

// ── Remove a task ───────────────────────────────────────
function removeTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

// ── Clear all completed tasks ───────────────────────────
function clearDone() {
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
}

// ── Filter buttons ──────────────────────────────────────
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

// ── Add button click ────────────────────────────────────
document.getElementById("addBtn").addEventListener("click", addTask);

// ── Enter key to add task ───────────────────────────────
document.getElementById("taskInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// ── Clear done button ───────────────────────────────────
document.getElementById("clearDoneBtn").addEventListener("click", clearDone);

// ── Initial render ──────────────────────────────────────
render();
