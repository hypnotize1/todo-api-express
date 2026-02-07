import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Todo List API",
      version: "1.0.0",
      description: "API for managing tasks with JWT Authentication",
    },
    servers: [{ url: "http://localhost:3000", description: "Local Server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            email: { type: "string" },
          },
        },
        Todo: {
          type: "object",
          properties: {
            id: { type: "integer" },
            task: { type: "string" },
            completed: { type: "boolean" },
            userId: { type: "integer" },
          },
        },
      },
    },
    paths: {
      // --- AUTH ---
      "/api/auth/register": {
        post: {
          summary: "Register new user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User created" },
            400: { description: "Email already exists" },
          },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Login user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful (Returns Token)" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      // --- TODOS ---
      "/api/todos": {
        get: {
          summary: "Get all user tasks",
          tags: ["Todos"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "List of tasks" },
          },
        },
        post: {
          summary: "Create a new task",
          tags: ["Todos"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["task"],
                  properties: {
                    task: { type: "string" },
                    completed: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Task created" },
          },
        },
      },
      "/api/todos/{id}": {
        get: {
          summary: "Get a single task",
          tags: ["Todos"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            200: { description: "Task details" },
            404: { description: "Not found" },
          },
        },
        put: {
          summary: "Update a task",
          tags: ["Todos"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    task: { type: "string" },
                    completed: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Task updated" },
          },
        },
        delete: {
          summary: "Delete a task",
          tags: ["Todos"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            204: { description: "Task deleted" },
          },
        },
      },
    },
  },
  apis: [],
};
