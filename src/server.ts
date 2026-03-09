import { Server } from "node:http";
import app from "./app";
import { seedSuperAdmin } from "./app/utiles/seed";
import { envVars } from "./config/env";
let server: Server;

const bootstrap = async () => {
  try {
    await seedSuperAdmin();
    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};
//SIGTERM handling
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
//sigint signal handling
process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  if (server) {
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
//uncaught exception handling
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception detected shutting down server:", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
//unhandled rejection handling
process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection detected shutting down server:", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

bootstrap();
