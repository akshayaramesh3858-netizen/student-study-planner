const STORAGE_KEY = 'studyspace.tasks.v1';

const taskForm = document.querySelector('#taskForm');
const taskList = document.querySelector('#taskList');
const formHeading = document.querySelector('#form-heading');
const submitButton = document.querySelector('#submitButton');
const cancelEditButton = document.querySelector('#cancelEdit');
const formMessage = document.querySelector('#formMessage');
const dateInput = document.querySelector('#dueDate');
const filterButtons = [...document.querySelectorAll('.filter-button')];

let tasks = loadTasks();
let currentFilter = 'all';
let editingTaskId = null;

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Keep saved tasks across refreshes, while recovering cleanly from invalid stored data.
function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(savedTasks) ? savedTasks.filter(isValidTask) : [];
  } catch {
    return [];
  }
}

function isValidTask(task) {
  return task && typeof task.id === 'string'
    && typeof task.subject === 'string'
    && typeof task.description === 'string'
    && typeof task.date === 'string'
    && ['low', 'medium', 'high'].includes(task.priority)
    && typeof task.completed === 'boolean';
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(year, month - 1, day));
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderTask(task) {
  const row = createElement('article', `task-row${task.completed ? ' is-complete' : ''}`);
  row.dataset.taskId = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-check';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', `Mark ${task.subject} as ${task.completed ? 'pending' : 'completed'}`);
  checkbox.addEventListener('change', () => toggleTask(task.id));

  const content = createElement('div', 'task-content');
  const subjectLine = createElement('div', 'task-subject-line');
  subjectLine.append(createElement('h3', 'task-subject', task.subject));
  subjectLine.append(createElement('span', `priority-tag priority-${task.priority}`, task.priority));
  content.append(subjectLine);
  content.append(createElement('p', 'task-description', task.description));

  const meta = createElement('div', 'task-meta');
  const date = createElement('span', 'task-date', `Due ${formatDate(task.date)}`);
  if (!task.completed && task.date < localDateString()) date.classList.add('overdue');
  meta.append(date);
  content.append(meta);

  const actions = createElement('div', 'task-actions');
  const editButton = createElement('button', 'task-action', 'Edit');
  editButton.type = 'button';
  editButton.setAttribute('aria-label', `Edit ${task.subject}`);
  editButton.addEventListener('click', () => startEditing(task));
  const deleteButton = createElement('button', 'task-action delete', 'Delete');
  deleteButton.type = 'button';
  deleteButton.setAttribute('aria-label', `Delete ${task.subject}`);
  deleteButton.addEventListener('click', () => deleteTask(task.id));
  actions.append(editButton, deleteButton);

  row.append(checkbox, content, actions);
  return row;
}

function renderEmptyState() {
  const empty = createElement('div', 'empty-state');
  empty.append(createElement('span', 'empty-symbol', '+'));
  empty.append(createElement('h3', '', currentFilter === 'all' ? 'Your planner is clear' : `No ${currentFilter} tasks`));
  empty.append(createElement('p', '', currentFilter === 'all' ? 'A fresh page. Add your first study task.' : 'Try another filter to see your tasks.'));
  return empty;
}

// Re-render the list and its counters from the same source of truth.
function render() {
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const visibleTasks = tasks
    .filter((task) => currentFilter === 'all' || (currentFilter === 'completed' ? task.completed : !task.completed))
    .sort((first, second) => Number(first.completed) - Number(second.completed) || first.date.localeCompare(second.date));

  document.querySelector('#totalCount').textContent = tasks.length;
  document.querySelector('#completedCount').textContent = completed;
  document.querySelector('#pendingCount').textContent = pending;
  document.querySelector('#allFilterCount').textContent = tasks.length;
  document.querySelector('#pendingFilterCount').textContent = pending;
  document.querySelector('#completedFilterCount').textContent = completed;
  document.querySelector('#visibleCount').textContent = visibleTasks.length;

  taskList.replaceChildren(...(visibleTasks.length ? visibleTasks.map(renderTask) : [renderEmptyState()]));
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function resetForm() {
  editingTaskId = null;
  taskForm.reset();
  dateInput.value = localDateString();
  formHeading.textContent = 'Add a task';
  submitButton.innerHTML = 'Add to planner <span aria-hidden="true">+</span>';
  cancelEditButton.hidden = true;
  formMessage.textContent = '';
}

function startEditing(task) {
  editingTaskId = task.id;
  taskForm.elements.subject.value = task.subject;
  taskForm.elements.description.value = task.description;
  taskForm.elements.dueDate.value = task.date;
  taskForm.elements.priority.value = task.priority;
  formHeading.textContent = 'Edit task';
  submitButton.innerHTML = 'Save changes <span aria-hidden="true">✓</span>';
  cancelEditButton.hidden = false;
  formMessage.textContent = '';
  taskForm.elements.subject.focus();
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const taskDetails = {
    subject: formData.get('subject').trim(),
    description: formData.get('description').trim(),
    date: formData.get('dueDate'),
    priority: formData.get('priority')
  };

  if (editingTaskId) {
    tasks = tasks.map((task) => task.id === editingTaskId ? { ...task, ...taskDetails } : task);
    formMessage.textContent = 'Task updated.';
  } else {
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    tasks.push({ id, ...taskDetails, completed: false });
    formMessage.textContent = 'Task added to your planner.';
  }

  saveTasks();
  render();
  resetForm();
});

function toggleTask(taskId) {
  tasks = tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task);
  saveTasks();
  render();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  if (editingTaskId === taskId) resetForm();
  saveTasks();
  render();
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    render();
  });
});

cancelEditButton.addEventListener('click', resetForm);
document.querySelector('#todayDate').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());
document.querySelector('#footerYear').textContent = new Date().getFullYear();
dateInput.value = localDateString();
render();