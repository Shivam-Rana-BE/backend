import express from "express";
import "dotenv/config";
import path from "path";
import fs from 'fs';
import db from './db/models/index.js';
import errorMiddleware from "./middleware/Error.js";
import router from "./routes/index.js";
import { fileURLToPath, pathToFileURL } from "url";
import swaggerUi from 'swagger-ui-express';
import http from "http";
import { Server } from 'socket.io';
import { socketConfig } from "./socket.js";


const app = express();
const server = http.createServer(app);
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.get("/", (req, res) => {
  res.status(200).json({ status: 200, success: true, message: "working finely" });
});

app.use("/api/v1", router);

// Setting up the Swagger documentation route
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerFilePath = path.resolve(__dirname, "swagger_output.json");

// // Check if the file exists
// if (fs.existsSync(swaggerFilePath)) {
//   const swaggerFileUrl = pathToFileURL(swaggerFilePath).href;
//   const swaggerFile = await import(swaggerFileUrl, { assert: { type: "json" } });
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile.default));
// }
// Middleware to serve Swagger JSON
app.get('/api-docs/swagger.json', (req, res) => {
  if (fs.existsSync(swaggerFilePath)) {
    const swaggerFile = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf-8'));
    res.json(swaggerFile);
  }
});

// Setup Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
  swaggerUrl: '/api-docs/swagger.json'
}));

app.use((req, res, next) => {
  return res.status(404).json({ status: 404, success: false, message: "Page not found on the server" });
});
const io = new Server(server, {
  cors: {
    origin: '*',
    transports: ['websocket', 'polling'],
    methods: ['GET', 'POST']
  }
})
io.on("connection", async (socket) => {
  console.log("A user connected", socket.id)
  await socketConfig(io, socket)
})
app.use(errorMiddleware);

// Ensure the database is connected
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully!');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

server.listen(port, () => console.log(`server is running on port ${port}`));
