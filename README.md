# 🚀 API Template

A reusable **Node.js + Express API template** designed with a strong focus on **modularity**, **low coupling**, and **scalability**.

This project combines **Feature-Based Architecture** with **Ports & Adapters (Hexagonal Architecture)** to serve as a solid foundation for building maintainable APIs that can evolve over time.

---

## 🎯 Project Goals

- 📦 Feature-based modular structure
- 🔌 High decoupling using Ports & Adapters
- ♻️ Reusable as a base template for multiple projects
- 🧩 Plug-and-play features (enable only what you need)
- 🧪 Test-friendly architecture
- 📈 Scalable and maintainable codebase

---

## 🧠 Architectural Approach

This template is built using **a combination of architectures**:

### 1️⃣ Feature-Based Architecture
The system is organized by **features**, not by technical layers.

Each feature owns:
- Its routes
- Business logic
- Domain interfaces (ports)
- Infrastructure implementations (adapters)

This keeps related code **together**, improving readability and maintainability.

---

### 2️⃣ Ports & Adapters (Hexagonal Architecture)

The core business logic is **isolated from external dependencies**.

- **Ports** define *what the application needs*
- **Adapters** define *how those needs are fulfilled*

This allows:
- Easy replacement of databases, frameworks, or services
- Better testability
- Framework-agnostic business logic

> Express, databases, and external services are **details**, not the core.

---

## 🛠️ Tech Stack

- **Node.js**
- **Express**
- **JavaScript / TypeScript** (configurable)
- **dotenv** – environment configuration
- **cors** (COMING SOON)
- **morgan / winston** – logging (COMING SOON)
- **Validation library** (Zod / Joi / express-validator) (COMING SOON)
- **JWT / Cookies** (optional)
- **Database layer** via adapters (ORM or query builder)
