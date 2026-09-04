# 🎨 DrawText.io

<div align="center">

![DrawText.io Banner](https://img.shields.io/badge/DrawText.io-Pro%20Workspace-6366f1?style=for-the-badge&logo=penpot&logoColor=white)
![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**The Next-Generation Infinite Whiteboard, Smart Notebook, PDF Annotator & Real-Time Collaborative Workspace.**

[Features](#-key-features) • [Architecture](#-architecture--tech-stack) • [Folder Structure](#-project-structure) • [Quick Start](#-getting-started) • [API Reference](#-api-routes--endpoints) • [Collaboration](#-websocket-events)

</div>

---

## 🌟 Key Features

### 1. 🖌️ Infinite Whiteboard Studio
- **Ultra-Smooth Pen Engine**: Variable-width pressure-sensitive brush strokes powered by `perfect-freehand` and `react-konva`.
- **Comprehensive Tool Palette**: Fineliner pen, highlighter with alpha blend, laser pointer with auto-fading trails, shape generators (rectangles, circles, triangles, stars, arrows, connectors), and eraser with stroke-level collision detection.
- **Customizable Paper Grids**: Dot grid, square grid, ruled notebook paper, and isometric drafting backgrounds with custom opacity and spacing.
- **Transform & Selection**: Freeform lasso and rectangular marquee selection, multi-object grouping, drag, rotate, resize, copy/paste, and layer z-ordering.

### 2. 📓 Multi-Page Smart Notebooks
- Create paginated multi-page documents combining rich text titles, structured notes, and drawing canvas overlays.
- Page navigation, reordering, duplicate page, and individual page clear.

### 3. 📄 PDF Document Annotator
- Load and view multi-page PDF documents.
- Draw annotations, highlight key paragraphs, stamp sticky notes, and export marked-up documents.

### 4. 🗂️ Flashcard Study Decks
- Create interactive study card sets with front/back cards.
- Flip animation, study progress tracker, answer rating (Easy, Good, Hard), and mastery statistics.

### 5. 🧮 LaTeX Mathematical Equations
- Real-time LaTeX equation editor with instant KaTeX typesetting.
- Direct placement of mathematical formulas, fractions, matrices, and symbols directly on canvas.

### 6. 🎙️ Voice Audio Memos
- Record voice memos directly inside canvas notes using Web Audio API.
- Integrated audio player with duration tracking and persistent cloud attachment.

### 7. 👥 Real-Time Multi-User Collaboration
- Room-based live collaboration with Socket.io.
- Real-time cursor tracking with user name tags and colors.
- Live stroke broadcasting with delta synchronization.

### 8. 💾 Export & Cloud Backup
- **PNG Image Export**: High-resolution canvas snapshot with transparent or solid background.
- **Vector PDF Export**: Scalable PDF generation using `jspdf`.
- **DrawText JSON Scene**: Portable `.drawtext.json` file export and import.
- **Full Workspace Backup**: One-click complete JSON backup and restoration.

---

## 🏗 Architecture & Tech Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │                    DrawText.io Client                   │
   │  React 19 • Vite • Konva / React-Konva • Perfect-Freehand│
   │      KaTeX • jsPDF • Lucide Icons • Zustand Store       │
   └────────────┬─────────────────────────────┬──────────────┘
                │ HTTP REST (Axios)           │ WebSockets (Socket.io)
                ▼                             ▼
   ┌─────────────────────────────────────────────────────────┐
   │                    DrawText.io Server                   │
   │       Node.js (ESM) • Express 4 • Socket.io 4           │
   │        Mongoose • JWT Auth • Multer • Zod               │
   └────────────────────────────┬────────────────────────────┘
                                │
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │                     Data Persistence                    │
   │  MongoDB Cluster / In-Memory Mongo Fallback • Storage   │
   └─────────────────────────────────────────────────────────┘
```

### Client Technologies
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Canvas Rendering**: [Konva](https://konvajs.org/) & [react-konva](https://github.com/konvajs/react-konva)
- **Stroke Smoothing**: [perfect-freehand](https://github.com/steveruizok/perfect-freehand)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [TailwindCSS 3](https://tailwindcss.com/) + Custom Glassmorphic Dark Theme
- **Math Typesetting**: [KaTeX](https://katex.org/)
- **Exporting**: [jsPDF](https://github.com/parallax/jsPDF) & HTML5 Canvas API
- **Icons**: [Lucide React](https://lucide.dev/)

### Server Technologies
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 4](https://expressjs.com/)
- **Real-Time Engine**: [Socket.io](https://socket.io/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) (with automatic fallback to `mongodb-memory-server` for instant local development)
- **Authentication**: JWT (JSON Web Tokens) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **File Handling**: [Multer](https://github.com/expressjs/multer) Local Storage Adapter
- **Security**: [Helmet](https://helmetjs.github.io/) & [CORS](https://github.com/expressjs/cors)

---

## 📁 Project Structure

```text
DrawText.io/
├── frontend/                         # Frontend React + Vite Application
│   ├── public/                       # Static public assets & favicons
│   ├── src/
│   │   ├── assets/                   # Vector graphics & illustration assets
│   │   ├── components/
│   │   │   ├── auth/                 # Authentication & login screens
│   │   │   │   └── AuthScreen.jsx
│   │   │   ├── canvas/               # Whiteboard engine components
│   │   │   │   ├── AudioMemoRecorder.jsx
│   │   │   │   ├── BackgroundLayer.jsx
│   │   │   │   ├── BottomColorBar.jsx
│   │   │   │   ├── CanvasSettingsPopover.jsx
│   │   │   │   ├── CanvasStage.jsx
│   │   │   │   ├── FloatingPenTray.jsx
│   │   │   │   ├── FormulaModal.jsx
│   │   │   │   ├── ShareCollabModal.jsx
│   │   │   │   ├── TopToolbar.jsx
│   │   │   │   └── WhiteboardEditor.jsx
│   │   │   ├── cardset/              # Flashcard & study deck studio
│   │   │   │   └── CardSetEditor.jsx
│   │   │   ├── common/               # Shared reusable components & branding
│   │   │   │   └── DrawTextLogo.jsx
│   │   │   ├── dashboard/            # Workspace dashboard & file manager
│   │   │   │   ├── HeaderBar.jsx
│   │   │   │   ├── NewNoteModal.jsx
│   │   │   │   ├── NoteCard.jsx
│   │   │   │   ├── NoteGrid.jsx
│   │   │   │   ├── SidebarNav.jsx
│   │   │   │   └── SortLayoutDropdown.jsx
│   │   │   ├── notebook/             # Multi-page notebook document editor
│   │   │   │   └── NotebookEditor.jsx
│   │   │   ├── pdf/                  # PDF annotation tool
│   │   │   │   └── PdfAnnotator.jsx
│   │   │   └── settings/             # User preferences & subscription tiers
│   │   │       ├── PaymentCheckoutModal.jsx
│   │   │       └── SettingsModal.jsx
│   │   ├── services/                 # API client & WebSocket connections
│   │   │   ├── api.js                # Centralized Axios instance with auth interceptor
│   │   │   └── socket.js             # Socket.io client setup & event emitters
│   │   ├── store/                    # Zustand global state slices
│   │   │   ├── useAuthStore.js       # Auth tokens, user session & subscriptions
│   │   │   ├── useCanvasStore.js     # Canvas strokes, shapes, history & viewport
│   │   │   └── useNotesStore.js      # Notes, folders, search & filtering
│   │   ├── App.jsx                   # Root application routing & view switcher
│   │   ├── index.css                 # Design system, theme tokens & custom styles
│   │   └── main.jsx                  # React application entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                          # Backend Node.js + Express + Socket.io
│   ├── src/
│   │   ├── config/                   # Server environment & database connections
│   │   │   ├── db.js                 # Mongoose connection with MemoryServer fallback
│   │   │   └── environment.js        # Environment variable bindings
│   │   ├── controllers/              # REST API controllers
│   │   │   ├── audioController.js
│   │   │   ├── authController.js
│   │   │   ├── billingController.js
│   │   │   ├── canvasController.js
│   │   │   ├── folderController.js
│   │   │   └── noteController.js
│   │   ├── middlewares/              # Express middlewares (JWT auth, error handler)
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/                   # Mongoose data schemas
│   │   │   ├── AudioMemo.js
│   │   │   ├── CanvasData.js
│   │   │   ├── Folder.js
│   │   │   ├── Note.js
│   │   │   └── User.js
│   │   ├── routes/                   # Express endpoint routers
│   │   │   ├── audioRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── billingRoutes.js
│   │   │   ├── canvasRoutes.js
│   │   │   ├── folderRoutes.js
│   │   │   ├── index.js
│   │   │   └── noteRoutes.js
│   │   ├── services/                 # Business logic services
│   │   ├── sockets/                  # Socket.io collaboration handler
│   │   │   └── collabHandler.js
│   │   ├── storage/                  # File storage adapter (local uploads)
│   │   │   └── storageAdapter.js
│   │   └── server.js                 # HTTP server bootstrap & WebSocket attachment
│   ├── uploads/                      # Uploaded files & audio memos
│   └── package.json
│
└── README.md                         # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- *(Optional)* **MongoDB**: Local MongoDB instance or MongoDB Atlas URI (if omitted, server runs on embedded in-memory database automatically).

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/rahulsingh289/DrawText.io.git
cd DrawText.io
```

---

### Step 2: Install Dependencies

**Install Backend Dependencies:**
```bash
cd backend
npm install
```

**Install Frontend Dependencies:**
```bash
cd ../frontend
npm install
```

---

### Step 3: Configure Environment Variables

**Backend Configuration (`backend/.env`):**
Create `backend/.env` (optional, default fallbacks are pre-configured):
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/drawtext_db
JWT_SECRET=super_secret_jwt_key_drawtext_app_2026_scalable
CORS_ORIGIN=http://localhost:5173
STORAGE_TYPE=local
```

**Frontend Configuration (`frontend/.env`):**
Create `frontend/.env` (optional):
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

---

### Step 4: Run the Application

**Start Backend Server:**
```bash
cd backend
npm run dev
# Server will start on http://localhost:5001
```

**Start Frontend Client:**
```bash
cd frontend
npm run dev
# Frontend will start on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser to launch DrawText.io!

---

## 📡 API Routes & Endpoints

All endpoints are prefixed with `/api`. Protected routes require a valid JWT Bearer Token in the `Authorization` header (`Bearer <token>`).

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/auth/register` | Register a new user account |
| **Auth** | `POST` | `/auth/login` | Login and receive JWT access token |
| **Auth** | `GET` | `/auth/me` | Fetch authenticated user profile |
| **Notes** | `GET` | `/notes` | Get all notes (supports `type`, `folderId`, `favorite`, `trash`, `search` filters) |
| **Notes** | `POST` | `/notes` | Create a new whiteboard / notebook / card set note |
| **Notes** | `GET` | `/notes/:id` | Get note metadata by ID |
| **Notes** | `PUT` | `/notes/:id` | Update note title, color, folder, or favorite status |
| **Notes** | `DELETE` | `/notes/:id` | Move note to trash or permanently delete |
| **Canvas** | `GET` | `/canvas/:noteId` | Load canvas elements, background settings, and layers |
| **Canvas** | `POST` | `/canvas/:noteId` | Save canvas state and auto-generate thumbnail |
| **Folders** | `GET` | `/folders` | List all user folders |
| **Folders** | `POST` | `/folders` | Create a new organized folder |
| **Folders** | `DELETE` | `/folders/:id` | Delete a folder |
| **Audio** | `POST` | `/audio/upload` | Upload audio voice memo linked to note |
| **Billing** | `POST` | `/billing/upgrade` | Upgrade subscription tier (`plan_a`, `plan_b`, `plan_c`) |

---

## 🔌 WebSocket Events

Real-time collaboration is managed over Socket.io on the root server namespace:

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join_room` | Client ➔ Server | `{ roomId, user: { name, color, avatar } }` | Join collaboration canvas room |
| `leave_room` | Client ➔ Server | `{ roomId }` | Leave canvas room |
| `cursor_move` | Client ➔ Server ➔ Room | `{ x, y, user }` | Broadcast pointer position |
| `draw_stroke` | Client ➔ Server ➔ Room | `{ stroke }` | Stream drawing stroke points in real time |
| `element_update` | Client ➔ Server ➔ Room | `{ elements }` | Broadcast shape/text/formula modifications |
| `user_joined` | Server ➔ Room | `{ users }` | Updated list of active users in room |
| `user_left` | Server ➔ Room | `{ userId }` | Notification when a collaborator disconnects |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>V</kbd> | Select / Transform Tool |
| <kbd>P</kbd> | Pen / Brush Tool |
| <kbd>H</kbd> | Highlighter Tool |
| <kbd>E</kbd> | Eraser Tool |
| <kbd>L</kbd> | Laser Pointer Tool |
| <kbd>T</kbd> | Text Box Tool |
| <kbd>R</kbd> | Rectangle Shape |
| <kbd>O</kbd> | Circle Shape |
| <kbd>A</kbd> | Arrow / Connector Tool |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> / <kbd>Cmd</kbd> + <kbd>Z</kbd> | Undo |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> / <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo |
| <kbd>Ctrl</kbd> + <kbd>+</kbd> / <kbd>-</kbd> | Zoom In / Zoom Out |
| <kbd>Ctrl</kbd> + <kbd>0</kbd> | Reset Zoom to 100% |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete Selected Elements |
| <kbd>Space</kbd> + <kbd>Drag</kbd> | Pan Canvas Viewport |

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.