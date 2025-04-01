// Todo list functionality
document.addEventListener("DOMContentLoaded", () => {
  if (
    !window.location.pathname.includes("index.html") &&
    window.location.pathname !== "/" &&
    !window.location.pathname.endsWith("/")
  ) {
    return
  }

  initTodoList()
})

function initTodoList() {
  // DOM elements
  const todoList = document.getElementById("todo-list")
  const todoForm = document.getElementById("todo-form")
  const todoFormContainer = document.getElementById("todo-form-container")
  const addTodoBtn = document.getElementById("add-todo-btn")
  const cancelTodoBtn = document.getElementById("cancel-todo-btn")
  const filterBtns = document.querySelectorAll(".filter-btn")

  // Current filter
  let currentFilter = "all"

  // Helper functions
  function getFromLocalStorage(key, defaultValue) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  function saveToLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
      return false
    }
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
  }

  function showNotification(message, duration = 3000) {
    const notification = document.getElementById("notification")
    const notificationMessage = document.getElementById("notification-message")

    if (!notification || !notificationMessage) return

    notificationMessage.textContent = message
    notification.classList.add("show")

    setTimeout(() => {
      notification.classList.remove("show")
    }, duration)
  }

  function showUndoNotification(message, undoCallback, duration = 5000) {
    const notification = document.getElementById("notification")
    const notificationMessage = document.getElementById("notification-message")

    if (!notification || !notificationMessage) return

    // Create undo notification content
    const undoContent = document.createElement("div")
    undoContent.className = "undo-notification"
    undoContent.innerHTML = `
      <span>${message}</span>
      <button class="undo-btn">Undo</button>
    `

    // Clear previous content
    notificationMessage.innerHTML = ""
    notificationMessage.appendChild(undoContent)

    // Add event listener to undo button
    const undoBtn = undoContent.querySelector(".undo-btn")
    undoBtn.addEventListener("click", () => {
      undoCallback()
      notification.classList.remove("show")
    })

    notification.classList.add("show")

    // Set timeout to hide notification
    const timeout = setTimeout(() => {
      notification.classList.remove("show")
    }, duration)

    // Clear timeout if undo is clicked
    undoBtn.addEventListener("click", () => {
      clearTimeout(timeout)
    })
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const options = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString(undefined, options)
  }

  function formatTime(dateTimeString) {
    const date = new Date(dateTimeString)
    const options = { hour: "2-digit", minute: "2-digit" }
    return date.toLocaleTimeString(undefined, options)
  }

  // Request notification permission
  function requestNotificationPermission() {
    return new Promise((resolve) => {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications")
        resolve(false)
      } else if (Notification.permission === "granted") {
        resolve(true)
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          resolve(permission === "granted")
        })
      } else {
        resolve(false)
      }
    })
  }

  // Schedule notification
  function scheduleNotification(title, options, delay) {
    if (Notification.permission !== "granted") return

    setTimeout(() => {
      new Notification(title, options)
    }, delay)
  }

  // Load todos from localStorage
  const todos = getFromLocalStorage("todos", [])

  // Render todos
  renderTodos()

  // Request notification permission
  requestNotificationPermission()

  // Event listeners
  addTodoBtn.addEventListener("click", () => {
    todoFormContainer.classList.remove("hidden")
    document.getElementById("todo-title").focus()
  })

  cancelTodoBtn.addEventListener("click", () => {
    todoFormContainer.classList.add("hidden")
    todoForm.reset()
  })

  todoForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const title = document.getElementById("todo-title").value.trim()
    const priority = document.getElementById("todo-priority").value
    const date = document.getElementById("todo-date").value
    const time = document.getElementById("todo-time").value

    if (!title) return

    const newTodo = {
      id: generateId(),
      title,
      priority,
      date,
      time,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    // Add to todos array
    todos.unshift(newTodo)

    // Save to localStorage
    saveToLocalStorage("todos", todos)

    // Render todos
    renderTodos()

    // Reset form and hide
    todoForm.reset()
    todoFormContainer.classList.add("hidden")

    // Show notification
    showNotification("Task added successfully")

    // Schedule notification if date and time are set
    if (date && time) {
      scheduleTodoReminder(newTodo)
    }
  })

  // Filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      currentFilter = btn.dataset.filter
      renderTodos()
    })
  })

  // Render todos based on current filter
  function renderTodos() {
    if (!todoList) return

    // Filter todos
    let filteredTodos = [...todos]

    if (currentFilter === "active") {
      filteredTodos = todos.filter((todo) => !todo.completed)
    } else if (currentFilter === "completed") {
      filteredTodos = todos.filter((todo) => todo.completed)
    }

    // Clear list
    todoList.innerHTML = ""

    // Show empty state if no todos
    if (filteredTodos.length === 0) {
      todoList.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <p>${
            currentFilter === "all"
              ? "No tasks yet. Add your first task!"
              : currentFilter === "active"
                ? "No active tasks. All done!"
                : "No completed tasks yet."
          }</p>
        </div>
      `
      return
    }

    // Render todos
    filteredTodos.forEach((todo) => {
      const todoItem = document.createElement("div")
      todoItem.className = `todo-item ${todo.completed ? "completed" : ""}`
      todoItem.dataset.id = todo.id

      const dueDate = todo.date ? new Date(`${todo.date}T${todo.time || "00:00"}`) : null
      const isOverdue = dueDate && dueDate < new Date() && !todo.completed

      todoItem.innerHTML = `
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? "checked" : ""}>
        <div class="todo-content">
          <h3 class="todo-title">${todo.title}</h3>
          <div class="todo-meta">
            <span class="todo-priority priority-${todo.priority}">${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}</span>
            ${
              todo.date
                ? `
              <span class="todo-due ${isOverdue ? "overdue" : ""}">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                ${formatDate(todo.date)} ${todo.time ? formatTime(`${todo.date}T${todo.time}`) : ""}
              </span>
            `
                : ""
            }
          </div>
        </div>
        <div class="todo-actions">
          <button class="todo-action-btn edit-todo" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="todo-action-btn delete-todo" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `

      todoList.appendChild(todoItem)

      // Add event listeners
      const checkbox = todoItem.querySelector(".todo-checkbox")
      const editBtn = todoItem.querySelector(".edit-todo")
      const deleteBtn = todoItem.querySelector(".delete-todo")

      checkbox.addEventListener("change", () => {
        toggleTodoComplete(todo.id)
      })

      editBtn.addEventListener("click", () => {
        editTodo(todo.id)
      })

      deleteBtn.addEventListener("click", () => {
        deleteTodo(todo.id)
      })
    })
  }

  // Toggle todo complete status
  function toggleTodoComplete(id) {
    const todoIndex = todos.findIndex((todo) => todo.id === id)

    if (todoIndex !== -1) {
      todos[todoIndex].completed = !todos[todoIndex].completed
      saveToLocalStorage("todos", todos)
      renderTodos()

      showNotification(todos[todoIndex].completed ? "Task completed!" : "Task marked as incomplete")
    }
  }

  // Edit todo
  function editTodo(id) {
    const todo = todos.find((todo) => todo.id === id)

    if (!todo) return

    // Fill form with todo data
    document.getElementById("todo-title").value = todo.title
    document.getElementById("todo-priority").value = todo.priority
    document.getElementById("todo-date").value = todo.date || ""
    document.getElementById("todo-time").value = todo.time || ""

    // Show form
    todoFormContainer.classList.remove("hidden")

    // Focus on title
    document.getElementById("todo-title").focus()

    // Update form submit handler
    const originalSubmitHandler = todoForm.onsubmit
    todoForm.onsubmit = null

    todoForm.addEventListener("submit", function editSubmitHandler(e) {
      e.preventDefault()

      const title = document.getElementById("todo-title").value.trim()
      const priority = document.getElementById("todo-priority").value
      const date = document.getElementById("todo-date").value
      const time = document.getElementById("todo-time").value

      if (!title) return

      // Update todo
      const todoIndex = todos.findIndex((t) => t.id === id)

      if (todoIndex !== -1) {
        todos[todoIndex] = {
          ...todos[todoIndex],
          title,
          priority,
          date,
          time,
          updatedAt: new Date().toISOString(),
        }

        // Save to localStorage
        saveToLocalStorage("todos", todos)

        // Render todos
        renderTodos()

        // Reset form and hide
        todoForm.reset()
        todoFormContainer.classList.add("hidden")

        // Show notification
        showNotification("Task updated successfully")

        // Schedule notification if date and time are set
        if (date && time) {
          scheduleTodoReminder(todos[todoIndex])
        }

        // Remove this event handler
        todoForm.removeEventListener("submit", editSubmitHandler)

        // Restore original handler if it existed
        if (originalSubmitHandler) {
          todoForm.onsubmit = originalSubmitHandler
        }
      }
    })

    // Update cancel button
    cancelTodoBtn.addEventListener("click", function cancelEditHandler() {
      todoFormContainer.classList.add("hidden")
      todoForm.reset()

      // Remove the edit submit handler
      todoForm.removeEventListener("submit", todoForm.onsubmit)

      // Restore original handler if it existed
      if (originalSubmitHandler) {
        todoForm.onsubmit = originalSubmitHandler
      }

      // Remove this event handler
      cancelTodoBtn.removeEventListener("click", cancelEditHandler)
    })
  }

  // Delete todo
  function deleteTodo(id) {
    const todoIndex = todos.findIndex((todo) => todo.id === id)

    if (todoIndex !== -1) {
      const deletedTodo = todos.splice(todoIndex, 1)[0]
      saveToLocalStorage("todos", todos)
      renderTodos()

      // Show notification with undo option
      showUndoNotification("Task deleted", () => {
        todos.splice(todoIndex, 0, deletedTodo)
        saveToLocalStorage("todos", todos)
        renderTodos()
        showNotification("Task restored")
      })
    }
  }

  // Schedule todo reminder
  function scheduleTodoReminder(todo) {
    if (!todo.date || !todo.time) return

    const reminderDate = new Date(`${todo.date}T${todo.time}`)
    const now = new Date()

    if (reminderDate <= now) return

    const delay = reminderDate.getTime() - now.getTime()

    // Request notification permission
    requestNotificationPermission().then((granted) => {
      if (granted) {
        scheduleNotification(
          `Reminder: ${todo.title}`,
          {
            body: `Priority: ${todo.priority}`,
            icon: "images/icons/icon-192x192.png",
          },
          delay,
        )

        showNotification(`Reminder set for ${formatDate(todo.date)} at ${formatTime(`${todo.date}T${todo.time}`)}`)
      } else {
        showNotification("Please enable notifications to receive reminders")
      }
    })
  }
}

