# 💰 Expense Tracker Vault

A secure, personal expense tracking web application designed to help you manage your finances with privacy, clarity, and control.

---

## 📦 Project Overview

Expense Tracker Vault is a lightweight, user-authenticated app that allows you to log, categorize, and analyze your expenses. Built for personal use, it ensures that your financial data remains private and accessible only to you.

---

## 🚀 Features

- 🔐 **Secure Login**: Password-protected access with JWT authentication
- 🧾 **Expense Logging**: Add, edit, and delete transactions
- 📊 **Analytics**: Monthly and yearly summaries with category breakdowns
- 📁 **Categories**: Organize expenses (e.g., Food, Transport, Utilities)
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🧮 **Budget Insights**: Track spending trends and set monthly limits

---

## 🛠️ Tech Stack

| Layer       | Technology                      |
|-------------|----------------------------------|
| Frontend    | React.js                         |
| Backend     | Node.js                          |
| Database    | PostgreSQL                       |
| Auth        | JWT + bcrypt                     |
| Deployment  | Vercel                           |

---

## 🔐 Security Highlights

- Passwords hashed with **bcrypt**
- JWT-based session management
- HTTPS enforced for all traffic
- Role-based access control (admin-only access)
- Environment variables used for sensitive config
- Optional 2FA integration (future enhancement)

---

## 🧪 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/tmm-tech/Expense-Tracker.git
cd expense-tracker-vault
