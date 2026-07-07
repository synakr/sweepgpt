# 🗑 SweepGPT

> Bulk delete ChatGPT conversations with multi-select support.

ChatSweep is a lightweight Chrome extension that lets you select and delete multiple ChatGPT conversations at once. Instead of deleting chats one by one, simply scan your conversation list, select the ones you want to remove, and let ChatSweep handle the rest.

---

## ✨ Features

- ✅ Scan all visible conversations
- ✅ Multi-select conversations
- ✅ Select All support
- ✅ Bulk delete with one click
- ✅ Live progress bar
- ✅ Human-like automated interaction
- ✅ Lightweight & fast
- ✅ Runs completely locally (no servers)

---

## 🚀 Installation

### Method 1 — Load Unpacked (Recommended)

1. Clone or download this repository.

```bash
git clone https://github.com/synakr/sweepgpt.git
```

2. Open Chrome.

3. Navigate to:

```
chrome://extensions
```

4. Enable **Developer Mode**.

5. Click **Load unpacked**.

6. Select the extension folder.

7. Pin the extension from Chrome's toolbar.

---

## 📖 Usage

1. Open **ChatGPT**.
2. Click the **ChatSweep** extension icon.
3. Click **🔄 Scan Chats**.
4. Select the conversations you wish to delete.
5. (Optional) Click **✅ Select All**.
6. Click **🗑 Delete Selected**.
7. Confirm the deletion.

The extension will automatically delete the selected conversations one by one while displaying the progress.

---

## ⚠️ Important

During deletion:

- Keep the ChatGPT tab active.
- Do **not** switch tabs or windows.
- Do **not** scroll the page.
- Do **not** click anywhere on ChatGPT.
- Do **not** refresh or close the page.
- Wait until the progress indicator shows **Finished**.

Deleted conversations **cannot be recovered**.

---

## 🔒 Privacy

ChatSweep does **not**:

- collect personal information
- send conversation data anywhere
- require an account
- use external servers

Everything runs locally inside your browser.

---

## 🛠 Tech Stack

- JavaScript
- Chrome Extension Manifest V3
- HTML
- CSS

---

## 📂 Project Structure

```
ChatSweep/
│
├── manifest.json
├── background.js
├── content.js
├── style.css
└── icons/
    └── icon128.png
```

---

## 💡 How It Works

ChatSweep automates the same steps a user performs manually:

1. Locate selected conversations.
2. Hover the conversation.
3. Open the options menu.
4. Click **Delete**.
5. Confirm deletion.
6. Repeat for the remaining selected conversations.

No undocumented APIs or external services are used.

---

## ⚡ Current Limitations

- Only scans conversations currently loaded in the sidebar.
- Relies on the current ChatGPT interface.
- Future ChatGPT UI changes may require updates.
- Requires the ChatGPT tab to remain active while deleting.

---

## 🗺 Roadmap

- [ ] Search conversations
- [ ] Delete by keyword
- [ ] Delete older than X days
- [ ] Skip pinned chats
- [ ] Pause / Resume
- [ ] Dark & Light themes
- [ ] Keyboard shortcuts

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

Feel free to open an issue or submit a pull request.

---

## 📄 License

MIT License

---
