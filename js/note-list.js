// Note list functionality
document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("note_list.html")) {
    return
  }

  initNoteList()
})

function initNoteList() {
  // DOM elements
  const notesList = document.getElementById("notes-list")
  const emptyNotes = document.getElementById("empty-notes")
  const notesCount = document.getElementById("notes-count")
  const notesProgress = document.getElementById("notes-progress")
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

  function truncateText(text, maxLength) {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const options = { year: "numeric", month: "short", day: "numeric" }
    return date.toLocaleDateString(undefined, options)
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

  function addSwipeGesture(element, callback) {
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
          callback()
        }

        // Reset
        startX = startY = endX = endY = null
        element.classList.remove("swiping", "swipe-right")
      },
      { passive: true },
    )
  }

  // Render notes
  renderNotes()

  // Filter buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
      currentFilter = btn.dataset.filter
      renderNotes()
    })
  })

  // Render notes
  function renderNotes() {
    // Get notes from localStorage
    const notes = getFromLocalStorage("notes", [])

    // Update notes count and progress
    notesCount.textContent = notes.length

    // Calculate progress (max 100 notes)
    const progressPercentage = Math.min((notes.length / 100) * 100, 100)
    notesProgress.style.width = `${progressPercentage}%`

    // Filter notes
    let filteredNotes = [...notes]

    if (currentFilter === "achieved") {
      filteredNotes = notes.filter((note) => note.achieved)
    } else if (currentFilter === "all") {
      filteredNotes = notes
    }

    // Show/hide empty state
    if (filteredNotes.length === 0) {
      notesList.innerHTML = ""
      emptyNotes.classList.remove("hidden")
      return
    } else {
      emptyNotes.classList.add("hidden")
    }

    // Clear list
    notesList.innerHTML = ""

    // Render notes
    filteredNotes.forEach((note) => {
      const noteCard = document.createElement("div")
      noteCard.className = `note-card ${note.achieved ? "achieved" : ""}`
      noteCard.dataset.id = note.id

      const previewText = note.text ? truncateText(note.text, 150) : ""

      noteCard.innerHTML = `
        <div class="note-header">
          <div>
            <h3 class="note-title">${note.title}</h3>
            <div class="note-date">${formatDate(note.updatedAt || note.createdAt)}</div>
          </div>
        </div>
        <div class="note-preview">${previewText}</div>
        <div class="note-actions">
          <button class="note-action-btn edit-note" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="note-action-btn delete-note" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `

      notesList.appendChild(noteCard)

      // Add event listeners
      const editBtn = noteCard.querySelector(".edit-note")
      const deleteBtn = noteCard.querySelector(".delete-note")

      // Open note when clicking on card
      noteCard.addEventListener("click", (e) => {
        if (!e.target.closest(".note-action-btn")) {
          window.location.href = `note.html?id=${note.id}`
        }
      })

      // Edit note
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        window.location.href = `note.html?id=${note.id}`
      })

      // Delete note
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        deleteNote(note.id)
      })

      // Add swipe gesture for "achieved" status
      addSwipeGesture(noteCard, () => {
        toggleNoteAchieved(note.id)
      })
    })
  }

  // Delete note
  function deleteNote(id) {
    const notes = getFromLocalStorage("notes", [])
    const noteIndex = notes.findIndex((note) => note.id === id)

    if (noteIndex !== -1) {
      const deletedNote = notes.splice(noteIndex, 1)[0]
      saveToLocalStorage("notes", notes)
      renderNotes()

      // Show notification with undo option
      showUndoNotification("Note deleted", () => {
        notes.splice(noteIndex, 0, deletedNote)
        saveToLocalStorage("notes", notes)
        renderNotes()
        showNotification("Note restored")
      })
    }
  }

  // Toggle note achieved status
  function toggleNoteAchieved(id) {
    const notes = getFromLocalStorage("notes", [])
    const noteIndex = notes.findIndex((note) => note.id === id)

    if (noteIndex !== -1) {
      notes[noteIndex].achieved = !notes[noteIndex].achieved
      saveToLocalStorage("notes", notes)
      renderNotes()

      showNotification(notes[noteIndex].achieved ? "Note marked as achieved!" : "Note removed from achieved")
    }
  }
}

