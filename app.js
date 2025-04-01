// Sample data for projects and tasks
const projectsData = [
  {
    id: 1,
    title: "Website Redesign",
    description: "Redesign the company website with a modern look and improved user experience.",
    status: "in-progress",
    deadline: "2025-04-15",
    team: [
      { id: 1, avatar: "https://i.pravatar.cc/150?img=1" },
      { id: 2, avatar: "https://i.pravatar.cc/150?img=2" },
      { id: 3, avatar: "https://i.pravatar.cc/150?img=3" },
    ],
  },
  {
    id: 2,
    title: "Mobile App Development",
    description: "Develop a cross-platform mobile application for iOS and Android.",
    status: "in-progress",
    deadline: "2025-05-20",
    team: [
      { id: 2, avatar: "https://i.pravatar.cc/150?img=2" },
      { id: 4, avatar: "https://i.pravatar.cc/150?img=4" },
    ],
  },
  {
    id: 3,
    title: "Marketing Campaign",
    description: "Plan and execute a digital marketing campaign for the new product launch.",
    status: "completed",
    deadline: "2025-03-10",
    team: [
      { id: 1, avatar: "https://i.pravatar.cc/150?img=1" },
      { id: 3, avatar: "https://i.pravatar.cc/150?img=3" },
    ],
  },
]

const tasksData = [
  {
    id: 1,
    title: "Design homepage mockup",
    project: { name: "Website Redesign", color: "#4f46e5" },
    dueDate: "2025-03-25",
    priority: "high",
    completed: false,
  },
  {
    id: 2,
    title: "Set up development environment",
    project: { name: "Mobile App Development", color: "#10b981" },
    dueDate: "2025-03-22",
    priority: "medium",
    completed: true,
  },
  {
    id: 3,
    title: "Create content strategy",
    project: { name: "Marketing Campaign", color: "#f59e0b" },
    dueDate: "2025-03-24",
    priority: "medium",
    completed: false,
  },
  {
    id: 4,
    title: "Review competitor websites",
    project: { name: "Website Redesign", color: "#4f46e5" },
    dueDate: "2025-03-21",
    priority: "low",
    completed: false,
  },
  {
    id: 5,
    title: "Finalize wireframes",
    project: { name: "Website Redesign", color: "#4f46e5" },
    dueDate: "2025-03-23",
    priority: "high",
    completed: false,
  },
]

// DOM Elements
const projectsList = document.getElementById("projects-list")
const tasksList = document.getElementById("tasks-list")
const newProjectModal = document.getElementById("new-project-modal")
const newProjectForm = document.getElementById("new-project-form")
const closeModalBtn = document.querySelector(".close-modal")
const cancelModalBtn = document.querySelector(".cancel-modal")
const newProjectBtn = document.querySelector(".projects-section .btn-primary")
const userProfile = document.querySelector(".user-profile")

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  renderProjects()
  renderTasks()
  setupEventListeners()
})

// Render projects
function renderProjects() {
  projectsList.innerHTML = ""

  projectsData.forEach((project) => {
    const projectCard = document.createElement("div")
    projectCard.className = "project-card"

    const teamHtml = project.team.map((member) => `<img src="${member.avatar}" alt="Team member" />`).join("")

    projectCard.innerHTML = `
            <div class="project-header">
                <div>
                    <h3 class="project-title">${project.title}</h3>
                    <span class="project-status status-${project.status}">${project.status === "in-progress" ? "In Progress" : "Completed"}</span>
                </div>
            </div>
            <p class="project-description">${project.description}</p>
            <div class="project-meta">
                <div class="project-deadline">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                    ${formatDate(project.deadline)}
                </div>
                <div class="project-team">
                    ${teamHtml}
                </div>
            </div>
        `

    projectsList.appendChild(projectCard)
  })
}

// Render tasks
function renderTasks() {
  tasksList.innerHTML = ""

  tasksData.forEach((task) => {
    const taskItem = document.createElement("div")
    taskItem.className = "task-item"

    taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} data-task-id="${task.id}">
            <div class="task-content">
                <h4 class="task-title">${task.title}</h4>
                <div class="task-meta">
                    <div class="task-project">
                        <span class="task-project-indicator" style="background-color: ${task.project.color}"></span>
                        ${task.project.name}
                    </div>
                    <div class="task-due">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                        ${formatDate(task.dueDate)}
                    </div>
                    <span class="task-priority priority-${task.priority}">${capitalizeFirstLetter(task.priority)}</span>
                </div>
            </div>
        `

    tasksList.appendChild(taskItem)
  })

  // Add event listeners to checkboxes
  document.querySelectorAll(".task-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", handleTaskCheckboxChange)
  })
}

// Setup event listeners
function setupEventListeners() {
  // New project button
  newProjectBtn.addEventListener("click", () => {
    openModal(newProjectModal)
  })

  // Close modal button
  closeModalBtn.addEventListener("click", () => {
    closeModal(newProjectModal)
  })

  // Cancel modal button
  cancelModalBtn.addEventListener("click", () => {
    closeModal(newProjectModal)
  })

  // New project form submission
  newProjectForm.addEventListener("submit", handleNewProjectSubmit)

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === newProjectModal) {
      closeModal(newProjectModal)
    }
  })

  // User profile dropdown
  userProfile.addEventListener("click", (e) => {
    e.stopPropagation()
    userProfile.classList.toggle("active")
  })

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    userProfile.classList.remove("active")
  })
}

// Handle task checkbox change
function handleTaskCheckboxChange(e) {
  const taskId = Number.parseInt(e.target.dataset.taskId)
  const taskIndex = tasksData.findIndex((task) => task.id === taskId)

  if (taskIndex !== -1) {
    tasksData[taskIndex].completed = e.target.checked
    renderTasks()
  }
}

// Handle new project form submission
function handleNewProjectSubmit(e) {
  e.preventDefault()

  const projectName = document.getElementById("project-name").value
  const projectDescription = document.getElementById("project-description").value
  const projectDeadline = document.getElementById("project-deadline").value

  // Create new project
  const newProject = {
    id: projectsData.length + 1,
    title: projectName,
    description: projectDescription,
    status: "in-progress",
    deadline: projectDeadline,
    team: [
      { id: 1, avatar: "https://i.pravatar.cc/150?img=1" },
      { id: 2, avatar: "https://i.pravatar.cc/150?img=2" },
    ],
  }

  // Add to projects data
  projectsData.push(newProject)

  // Render projects
  renderProjects()

  // Close modal
  closeModal(newProjectModal)

  // Reset form
  newProjectForm.reset()
}

// Utility functions
function formatDate(dateString) {
  const options = { month: "short", day: "numeric", year: "numeric" }
  return new Date(dateString).toLocaleDateString("en-US", options)
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function openModal(modal) {
  modal.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeModal(modal) {
  modal.classList.remove("active")
  document.body.style.overflow = ""
}

