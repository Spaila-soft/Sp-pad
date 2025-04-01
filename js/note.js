// Note editor functionality
document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("note.html")) {
    return
  }

  initNoteEditor()
})

function initNoteEditor() {
  // DOM elements
  const noteEditor = document.getElementById("note-editor")
  const noteTitle = document.getElementById("note-title")
  const saveNoteBtn = document.getElementById("save-note-btn")
  const boldBtn = document.getElementById("bold-btn")
  const italicBtn = document.getElementById("italic-btn")
  const underlineBtn = document.getElementById("underline-btn")
  const fontSizeSelect = document.getElementById("font-size")
  const undoBtn = document.getElementById("undo-btn")
  const redoBtn = document.getElementById("redo-btn")
  const fileAttachment = document.getElementById("file-attachment")
  const attachmentsContainer = document.getElementById("attachments-container")
  const exportBtn = document.getElementById("export-btn")
  const importBtn = document.getElementById("import-btn")
  const importFile = document.getElementById("import-file")
  const wordCount = document.getElementById("word-count")

  // Current note state
  let currentNote = null
  let attachments = []
  const undoStack = []
  let redoStack = []

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

  function extractTextFromHtml(html) {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  function countWords(text) {
    if (!text) return 0
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }

  function exportAsTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Check if we're editing an existing note
  const urlParams = new URLSearchParams(window.location.search)
  const noteId = urlParams.get("id")

  if (noteId) {
    const notes = getFromLocalStorage("notes", [])
    currentNote = notes.find((note) => note.id === noteId)

    if (currentNote) {
      noteTitle.value = currentNote.title || ""
      noteEditor.innerHTML = currentNote.content || ""
      attachments = currentNote.attachments || []
      renderAttachments()
    }
  }

  // Initialize word counter
  updateWordCount()

  // Save current state for undo
  saveState()

  // Event listeners
  noteEditor.addEventListener("input", () => {
    updateWordCount()
    saveState()
  })

  noteTitle.addEventListener("input", saveState)

  saveNoteBtn.addEventListener("click", () => {
    if (saveNote()) {
      showNotification("Note saved successfully")
    } else {
      showNotification("Failed to save note. Please try again.")
    }
  })

  // Format buttons
  boldBtn.addEventListener("click", () => {
    document.execCommand("bold", false, null)
    updateFormatButtons()
    noteEditor.focus()
    saveState()
  })

  italicBtn.addEventListener("click", () => {
    document.execCommand("italic", false, null)
    updateFormatButtons()
    noteEditor.focus()
    saveState()
  })

  underlineBtn.addEventListener("click", () => {
    document.execCommand("underline", false, null)
    updateFormatButtons()
    noteEditor.focus()
    saveState()
  })

  fontSizeSelect.addEventListener("change", () => {
    document.execCommand("fontSize", false, fontSizeSelect.value)
    noteEditor.focus()
    saveState()
  })

  // Undo/Redo
  undoBtn.addEventListener("click", undo)
  redoBtn.addEventListener("click", redo)

  // File attachment
  fileAttachment.addEventListener("change", handleFileAttachment)

  // Export/Import
  exportBtn.addEventListener("click", exportNote)
  importBtn.addEventListener("click", () => importFile.click())
  importFile.addEventListener("change", importNote)

  // Update format button states on selection change
  noteEditor.addEventListener("mouseup", updateFormatButtons)
  noteEditor.addEventListener("keyup", updateFormatButtons)

  // Auto-save when leaving the page
  window.addEventListener("beforeunload", () => {
    if (noteTitle.value.trim() || noteEditor.innerHTML.trim()) {
      saveNote()
    }
  })

  // Functions
  function updateWordCount() {
    const text = extractTextFromHtml(noteEditor.innerHTML)
    const count = countWords(text)
    wordCount.textContent = count
  }

  function updateFormatButtons() {
    boldBtn.classList.toggle("active", document.queryCommandState("bold"))
    italicBtn.classList.toggle("active", document.queryCommandState("italic"))
    underlineBtn.classList.toggle("active", document.queryCommandState("underline"))
  }

  function saveState() {
    undoStack.push({
      title: noteTitle.value,
      content: noteEditor.innerHTML,
      attachments: [...attachments],
    })

    // Limit undo stack size
    if (undoStack.length > 50) {
      undoStack.shift()
    }

    // Clear redo stack when new changes are made
    redoStack = []
  }

  function undo() {
    if (undoStack.length <= 1) return

    // Save current state to redo stack
    redoStack.push(undoStack.pop())

    // Apply previous state
    const prevState = undoStack[undoStack.length - 1]
    noteTitle.value = prevState.title
    noteEditor.innerHTML = prevState.content
    attachments = [...prevState.attachments]
    renderAttachments()
    updateWordCount()
    updateFormatButtons()
  }

  function redo() {
    if (redoStack.length === 0) return

    // Get state from redo stack
    const nextState = redoStack.pop()

    // Save current state to undo stack
    undoStack.push({
      title: noteTitle.value,
      content: noteEditor.innerHTML,
      attachments: [...attachments],
    })

    // Apply next state
    noteTitle.value = nextState.title
    noteEditor.innerHTML = nextState.content
    attachments = [...nextState.attachments]
    renderAttachments()
    updateWordCount()
    updateFormatButtons()
  }

  function handleFileAttachment(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const attachment = {
        id: generateId(),
        name: file.name,
        type: file.type,
        data: event.target.result,
      }

      attachments.push(attachment)
      renderAttachments()
      saveState()

      // Reset file input
      fileAttachment.value = ""
    }

    reader.readAsDataURL(file)
  }

  function renderAttachments() {
    attachmentsContainer.innerHTML = ""

    attachments.forEach((attachment) => {
      const attachmentEl = document.createElement("div")
      attachmentEl.className = "attachment"

      if (attachment.type.startsWith("image/")) {
        attachmentEl.innerHTML = `
          <img src="${attachment.data}" alt="${attachment.name}">
          <button class="attachment-remove" data-id="${attachment.id}">&times;</button>
        `
      } else if (attachment.type.startsWith("video/")) {
        attachmentEl.innerHTML = `
          <video src="${attachment.data}" controls></video>
          <button class="attachment-remove" data-id="${attachment.id}">&times;</button>
        `
      } else if (attachment.type.startsWith("audio/")) {
        attachmentEl.innerHTML = `
          <audio src="${attachment.data}" controls></audio>
          <button class="attachment-remove" data-id="${attachment.id}">&times;</button>
        `
      } else {
        attachmentEl.innerHTML = `
          <div class="attachment-file">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span>${attachment.name}</span>
          </div>
          <button class="attachment-remove" data-id="${attachment.id}">&times;</button>
        `
      }

      attachmentsContainer.appendChild(attachmentEl)
    })

    // Add event listeners to remove buttons
    document.querySelectorAll(".attachment-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id
        attachments = attachments.filter((a) => a.id !== id)
        renderAttachments()
        saveState()
      })
    })
  }

  function saveNote() {
    const title = noteTitle.value.trim() || "Untitled Note"
    const content = noteEditor.innerHTML
    const text = extractTextFromHtml(content)

    // Get notes from localStorage
    const notes = getFromLocalStorage("notes", [])

    if (currentNote) {
      // Update existing note
      const noteIndex = notes.findIndex((note) => note.id === currentNote.id)

      if (noteIndex !== -1) {
        notes[noteIndex] = {
          ...notes[noteIndex],
          title,
          content,
          text,
          attachments,
          updatedAt: new Date().toISOString(),
        }
      }
    } else {
      // Create new note
      const newNote = {
        id: generateId(),
        title,
        content,
        text,
        attachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        achieved: false,
      }

      notes.unshift(newNote)
      currentNote = newNote

      // Update URL to include note ID
      const url = new URL(window.location.href)
      url.searchParams.set("id", newNote.id)
      window.history.replaceState({}, "", url)
    }

    // Save to localStorage
    return saveToLocalStorage("notes", notes)
  }

  function exportNote() {
    const title = noteTitle.value.trim() || "Untitled Note"
    const text = extractTextFromHtml(noteEditor.innerHTML)

    // Create file content
    const content = `${title}\n\n${text}`

    // Export as text file
    exportAsTextFile(`${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`, content)
  }

  function importNote(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target.result
      const lines = content.split("\n")

      // First line is title, rest is content
      if (lines.length > 0) {
        noteTitle.value = lines[0]

        // Join remaining lines and set as content
        const textContent = lines.slice(1).join("\n").trim()
        noteEditor.innerHTML = textContent

        updateWordCount()
        saveState()

        showNotification("Note imported successfully")
      }
    }

    reader.readAsText(file)

    // Reset file input
    importFile.value = ""
  }
}

