import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import joi from "joi";

import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { swaggerOptions } from "./configs/swagger.js";

// read .env file
dotenv.config();

// const express = require("express");
const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(cors());
// express.json() middleware get chunks , collect, translate with Json.parse(), link to req.body
//
app.use(express.json());

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// (C)reate: create new user (signup)
// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().min(6).max(30).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    // check if the user has registered or not
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already in use" });

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    // create user in database
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    // return success message
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(500).json({ error: "Error during registration" });
  }
});

/**
 * (R)ead: User Login
 * POST /api/auth/login
 */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check the inputs
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // compare the passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // send token to client
    res.json({ token: token });
  } catch (error) {
    res.status(500).json({ error: "Error during login" });
  }
});

// check the token and if was valid set req.user

function authenticationToken(req, res, next) {
  // get authorization header
  const authHeader = req.headers["authorization"];

  // format header: "Bearer TOKEN"
  const token = authHeader && authHeader.split(" ")[1];

  // if token didn't exist , do not allow to login
  if (!token) {
    return res.status(401).json({ error: "Access denied: No token provided" });
  }

  // token verification
  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      // if token has mistake or expired
      return res.status(403).json({ error: "Access denied: Invalid token" });
    }
    // add user data to req
    req.user = userPayload;

    // let main root run
    next();
  });
}

// GET /api/todos - (R)ead: read all tasks from database
app.get("/api/todos", authenticationToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const todos = await prisma.todo.findMany({ where: { userId: userId } });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Error at receiving tasks!" });
  }
});

// POST /api/todo/create - (C)reate : create task at database
app.post("/api/todos", authenticationToken, async (req, res) => {
  try {
    const schema = joi.object({
      task: joi.string().min(3).required(),
      completed: joi.boolean(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const taskText = req.body.task;
    // Check if the user sending the task text

    const userId = req.user.userId;

    // Create a new object at in database
    const newTodo = await prisma.todo.create({
      data: { task: taskText, completed: false, userId: userId },
    });

    // return new created task with 201 status code
    res.status(201).json(newTodo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error at creating task!" });
  }
});

// GET‌ /api/todos/id - (R)ead: read a single task
app.get("/api/todos/:id", authenticationToken, async (req, res) => {
  try {
    // read id from rout parameters
    const id = parseInt(req.params.id);
    const userId = req.user.userId;

    // finding task
    const todo = await prisma.todo.findUnique({
      where: { id: id, userId: userId },
    });

    // if task did not find
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    // return todo if find
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "Error in receiving task!" });
  }
});

// PUT /api/todos/:id - (U)pdate: update a certain task
app.put("/api/todos/:id", authenticationToken, async (req, res) => {
  try {
    // Read id from rout parameters
    const id = parseInt(req.params.id);
    const userId = req.user.userId;
    // Read new data from body
    const { task, completed } = req.body;
    const updateData = {};

    if (task !== undefined) {
      updateData.task = task;
    }
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    // Check if any update data is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    // Create object for updated task
    const updatedTodo = await prisma.todo.update({
      where: { id: id, userId: userId },
      data: updateData,
    });

    // Return updated Task and with status 200
    res.status(200).json(updatedTodo);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(500).json({ error: "Todo not found" });
    }
    res.status(500).json({ error: "Error at receiving task!" });
  }
});

app.delete("/api/todos/:id", authenticationToken, async (req, res) => {
  try {
    // Read id from rout parameters
    const id = parseInt(req.params.id);
    const userId = req.user.userId;

    // remove task from database
    await prisma.todo.delete({
      where: { id: id, userId: userId },
    });
    // Return success status
    return res.status(204).end();
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Todo not found" });
    res.status(500).json({ error: "Error at receiving task!" });
  }
});

// console.log("JWT SECRET:", process.env.JWT_SECRET);

// Running server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
