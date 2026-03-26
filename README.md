
# Incentive Calculator Monorepo

This repository contains:

- `incentive-calc-front` → Next.js frontend
- `incentive-calc-back` → Node.js backend (API + Prisma)

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
cd incentive-calc-front && npm install
cd ../incentive-calc-back && npm install
````

---

### 2. Run backend

```bash
cd incentive-calc-back
npm run dev
```

---

### 3. Run frontend

```bash
cd incentive-calc-front
npm run dev
```

---

## 🌐 Default Ports

* Frontend → [http://localhost:3000](http://localhost:3000)
* Backend → [http://localhost:5000](http://localhost:5000) (or your config)

---

## ⚙️ Environment Variables

Each project has its own `.env` file:

* `incentive-calc-front/.env`
* `incentive-calc-back/.env`

---

## 🧠 Notes

* This is a simple monorepo (no turborepo/workspaces yet)
* Frontend and backend are independent apps

