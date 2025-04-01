// Utility functions for the SpàiláCPAD app

// Show notification
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

// Show notification with undo button
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

// Format date
function formatDate(date) {
  if (!date) return ""
  const options = { year: "numeric", month: "short", day: "numeric" }
  return new Date(date).toLocaleDateString(undefined, options)
}

// Format time
function formatTime(time) {
  if (!time) return ""
  const options = { hour: "2-digit", minute: "2-digit" }
  return new Date(time).toLocaleTimeString(undefined, options)
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// Truncate text
function truncateText(text, maxLength) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}

// Count words in text
function countWords(text) {
  if (!text) return 0
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}

// Extract plain text from HTML
function extractTextFromHtml(html) {
  if (!html) return ""
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ""
}

// Save data to localStorage
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (error) {
    console.error("Error saving to localStorage:", error)
    return false
  }
}

// Get data from localStorage
function getFromLocalStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (error) {
    console.error("Error getting from localStorage:", error)
    return defaultValue
  }
}

// Export text as file
function exportAsTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Request notification permission
async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

// Show browser notification
function showBrowserNotification(title, options = {}) {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, options)
    return notification
  }
  return null
}

// Schedule notification
function scheduleNotification(title, options = {}, delay) {
  if (Notification.permission !== "granted") return

  setTimeout(() => {
    showBrowserNotification(title, options)
  }, delay)
}

// Theme toggle functionality
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

// Add swipe gesture detection
function addSwipeGesture(element, onSwipeRight) {
  let startX, startY, endX, endY
  const minSwipeDistance = 100

  element.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      element.classList.add("swiping")
    },
    { passive: true },
  )

  element.addEventListener(
    "touchmove",
    (e) => {
      if (!startX || !startY) return

      endX = e.touches[0].clientX
      endY = e.touches[0].clientY

      const diffX = endX - startX
      const diffY = endY - startY

      // If horizontal swipe is greater than vertical swipe
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          // Right swipe
          element.classList.add("swipe-right")
        } else {
          // Left swipe
          element.classList.remove("swipe-right")
        }
      }
    },
    { passive: true },
  )

  element.addEventListener(
    "touchend",
    () => {
      if (!startX || !startY || !endX || !endY) {
        element.classList.remove("swiping", "swipe-right")
        return
      }

      const diffX = endX - startX

      if (diffX > minSwipeDistance) {
        // Completed right swipe
        onSwipeRight()
      }

      // Reset
      startX = startY = endX = endY = null
      element.classList.remove("swiping", "swipe-right")
    },
    { passive: true },
  )
}

