# 💰 Liquid Glass Budget Tracker

A sleek and interactive **Budget Tracker** application built with **HTML, CSS, and pure JavaScript**. It features a modern and dynamic **"Liquid Glass"** UI design, directly inspired by the aesthetic of **iOS 26**, and includes a user-friendly, persistent **Light/Dark Mode** toggle.

---

### ✨ Features

* **Liquid Glass UI (iOS 26 Inspired):** The application utilizes a "glassmorphism" design, employing CSS `backdrop-filter` to create frosted, translucent card, input, and button elements that subtly reflect the background.
* **Full Budget Control:** Easily set your **Total Budget** and track your financial health with real-time updates for **Expenses** and **Remaining Balance**.
* **Dual-Theme Mode:** Seamlessly toggle between **Light Mode** (`light.jpg` background) and **Dark Mode** (`dark.jpg` background). Your preferred theme is saved automatically using `localStorage` for a consistent experience.
* **Complete Expense Management:**
    * Add new expenses with a **Product Title** and **Cost**.
    * View all transactions in a scrollable **Expense List**.
    * **Edit** 📝 or **Delete** 🗑️ individual expense list entries, with the budget totals instantly recalculated.

---

### 🛠️ Technical Overview

The application is structured to demonstrate clean separation of concerns:

| File | Role |
| :--- | :--- |
| `index.html` | Provides the entire structural layout and links to the necessary CSS and JavaScript files. |
| `style.css` | Handles all presentation logic, defining CSS Variables (`--glass-bg`, `--text-primary`, etc.) which are toggled by the `[data-theme="dark"]` attribute for dual-theme support. |
| `index.js` | Contains the core application logic, including budget calculation, expense tracking, list creation, and the **Theme Toggle** functionality. |
| `light.jpg` & `dark.jpg` | High-resolution background images that define the mood for each theme. |

---

### 💻 How to Run Locally

1.  Ensure all five files (`index.html`, `style.css`, `index.js`, `light.jpg`, `dark.jpg`) are in the same folder.
2.  Open `index.html` in any modern web browser.