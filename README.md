# 📝 Todo List API

A secure, RESTful API for managing tasks, built with **Node.js**, **Express**, and **Prisma**.
This project demonstrates a complete backend architecture including **JWT Authentication**, **Input Validation**, **Database Management**, and **Interactive Documentation**.

---

## 🚀 Features

- **🔐 User Authentication**: Sign up & Login using JWT (JSON Web Tokens).
- **🛡️ Security**: Password hashing with `bcryptjs`.
- **📝 CRUD Operations**: Create, Read, Update, and Delete tasks.
- **🔄 Dynamic Updates**: Smart PATCH/PUT logic to update specific fields.
- **✅ Validation**: Strict input validation using `Joi`.
- **📚 Documentation**: Interactive API docs generated with **Swagger UI**.
- **🗄️ ORM**: Database interaction using `Prisma` (supports SQLite/PostgreSQL).

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Authentication**: JSON Web Token (JWT)
- **Validation**: Joi
- **Documentation**: Swagger UI Express
- **Security**: Bcrypt.js, CORS

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/hypnotize1/todo-api-express.git
cd todo-api-express
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
Create a .env file in the root directory and add your configuration:
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/todo_db?schema=public"
JWT_SECRET="your_super_secret_key"
```

### 4. Run Database Migrations

```bash
Create the tables in your database:
npx prisma migrate dev
```

### 5. Start the Server

```bash
5. Start the Server
```

## 📖 API Documentation

After starting the server, you can access the full API documentation at:

👉 http://localhost:3000/api-docs
