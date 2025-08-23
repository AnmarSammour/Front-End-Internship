class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    this.currentFilter = "all";
    this.init();
  }

  // Initialize app
  init() {
    this.renderTasks();
    this.updateStats();
    this.setupEventListeners();
  }

  // Save tasks to localStorage
  saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  };

  // Add a new task
  addTask = (taskName) => {
    if (!taskName.trim()) {
      this.showValidationError();
      return;
    }

    const newTask = {
      id: Date.now(),
      name: taskName,
      completed: false,
      priority: "medium",
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
  };

  // Toggle task completion status
  toggleTaskCompletion = (taskId) => {
    this.tasks = this.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    this.saveTasks();
    this.renderTasks();
    this.updateStats();
  };

  // Delete a task
  deleteTask = (taskId) => {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
  };

  // Set current filter
  setFilter = (filter) => {
    this.currentFilter = filter;

    // Update filter button states
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });

    this.renderTasks();
  };

  // Get filtered tasks based on current filter
  getFilteredTasks = () => {
    switch (this.currentFilter) {
      case "active":
        return this.tasks.filter((task) => !task.completed);
      case "completed":
        return this.tasks.filter((task) => task.completed);
      default:
        return this.tasks;
    }
  };

  // Render tasks
  renderTasks = () => {
    const taskList = document.getElementById("task-list");
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      this.showEmptyState();
      return;
    }

    taskList.innerHTML = "";

    filteredTasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      taskList.appendChild(taskElement);
    });
  };

  // Create element for a task
  createTaskElement = (task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.dataset.id = task.id;

    const formattedDate = this.formatDate(task.createdAt);

    li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${
                      task.completed ? "checked" : ""
                    }>
                    <div class="task-content">
                        <span class="task-name">${task.name}</span>
                        <div class="task-meta">
                            <span class="task-date"><i class="far fa-calendar"></i> ${formattedDate}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="delete-btn" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;

    // Add event listeners
    li.querySelector(".task-checkbox").addEventListener("click", () =>
      this.toggleTaskCompletion(task.id)
    );
    li.querySelector(".task-name").addEventListener("click", () =>
      this.toggleTaskCompletion(task.id)
    );
    li.querySelector(".delete-btn").addEventListener("click", () =>
      this.deleteTask(task.id)
    );

    li.classList.add("fade-in");

    return li;
  };

  // Show empty state message
  showEmptyState = () => {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = `
                    <li class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>${
                          this.currentFilter === "all"
                            ? "No tasks yet"
                            : this.currentFilter === "active"
                            ? "No active tasks"
                            : "No completed tasks"
                        }</p>
                        <small>${
                          this.currentFilter === "all"
                            ? "Add some tasks to get started"
                            : "Try changing the filter to see more tasks"
                        }</small>
                    </li>
                `;
  };

  // Update task statistics
  updateStats = () => {
    const total = this.tasks.length;
    const completed = this.tasks.filter((task) => task.completed).length;
    const remaining = total - completed;

    document.getElementById("total-tasks").textContent = total;
    document.getElementById("completed-tasks").textContent = completed;
    document.getElementById("remaining-tasks").textContent = remaining;
  };

  // Show validation error
  showValidationError = () => {
    const taskInput = document.getElementById("task-input");
    taskInput.classList.add("shake");
    taskInput.placeholder = "Please enter a task first!";

    setTimeout(() => {
      taskInput.classList.remove("shake");
      taskInput.placeholder = "What do you need to do?";
    }, 1000);
  };

  // Format date for display
  formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Set up event listeners
  setupEventListeners = () => {
    const taskInput = document.getElementById("task-input");
    const addTaskBtn = document.getElementById("add-task-btn");
    const filterBtns = document.querySelectorAll(".filter-btn");

    // Add task event listeners
    addTaskBtn.addEventListener("click", () => {
      this.addTask(taskInput.value);
      taskInput.value = "";
      taskInput.focus();
    });

    taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTask(taskInput.value);
        taskInput.value = "";
        taskInput.focus();
      }
    });

    // Filter button event listeners
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.setFilter(btn.dataset.filter));
    });
  };
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const taskManager = new TaskManager();
});
