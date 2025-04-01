// Main app functionality
document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme toggle
  initThemeToggle()

  // Set active nav item based on current page
  setActiveNavItem()
})

// Initialize theme toggle
function initThemeToggle() {
  const themeSwitch = document.getElementById("theme-switch")

  if (!themeSwitch) return

  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem("theme")
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.body.classList.add("dark-theme")
    themeSwitch.checked = true
  }

  // Toggle theme when switch is clicked
  themeSwitch.addEventListener("change", () => {
    if (themeSwitch.checked) {
      document.body.classList.add("dark-theme")
      localStorage.setItem("theme", "dark")
    } else {
      document.body.classList.remove("dark-theme")
      localStorage.setItem("theme", "light")
    }
  })
}

// Set active nav item
function setActiveNavItem() {
  const currentPath = window.location.pathname
  const navItems = document.querySelectorAll(".nav-item")

  navItems.forEach((item) => {
    const href = item.getAttribute("href")

    if (currentPath.includes("index.html") || currentPath === "/" || currentPath.endsWith("/")) {
      if (href.includes("index.html")) {
        item.classList.add("active")
      } else {
        item.classList.remove("active")
      }
    } else if (currentPath.includes("note.html")) {
      if (href.includes("note.html")) {
        item.classList.add("active")
      } else {
        item.classList.remove("active")
      }
    } else if (currentPath.includes("note_list.html")) {
      if (href.includes("note_list.html")) {
        item.classList.add("active")
      } else {
        item.classList.remove("active")
      }
    }
  })
}

