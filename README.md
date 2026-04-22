# Project Management Tool

A full-stack Trello/Asana-style project management application with real-time collaboration.

## Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, React Router, Axios, Zustand, Socket.io-client, Vite
**Backend:** Node.js, Express.js, TypeScript, MongoDB (Mongoose), JWT, bcrypt, Socket.io

## Features

- JWT authentication (register / login / logout, protected routes)
- Projects with role-based permissions (owner / admin / member)
- Invite system (create invite, accept/reject, add to project)
- Kanban board with drag & drop (To Do / In Progress / Done)
- Tasks: CRUD, assign users, priority, due date, ordering
- Comments (chat-style UI with avatars & timestamps)
- Notifications (task assigned, new comment, member joined, invite accepted)
- Real-time updates via Socket.io (live tasks, comments, notifications)
- Dark mode, responsive, loading states, error handling

## Repository layout

```
client/   # React + Vite frontend
server/   # Express + Mongoose backend
```

## Quick start

### Backend

```bash
cd server
cp .env.example .env   # then edit values
npm install
npm run dev            # starts on http://localhost:4000
```

### Frontend

```bash
cd client
cp .env.example .env   # defaults to http://localhost:4000
npm install
npm run dev            # starts on http://localhost:5173
```

### Environment variables

**server/.env**

| Variable      | Description                                  |
| ------------- | -------------------------------------------- |
| `PORT`        | HTTP port (default `4000`)                   |
| `MONGODB_URI` | MongoDB connection string                    |
| `JWT_SECRET`  | Secret used to sign JWTs                     |
| `CLIENT_URL`  | Allowed CORS origin (default `http://localhost:5173`) |

**client/.env**

| Variable        | Description                           |
| --------------- | ------------------------------------- |
| `VITE_API_URL`  | Backend base URL (default `http://localhost:4000`) |

## Development

```bash
# backend
cd server && npm run lint && npm run typecheck && npm run build

# frontend
cd client && npm run lint && npm run typecheck && npm run build
```
