import express, { Application, NextFunction, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { SpecialityRoutes } from "./app/modules/speciality/speciality.route";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middlware/globalErrorHandler";
import { notFound } from "./app/middlware/notFound";
import AppError from "./app/middlware/AppError";
import { stat } from "node:fs";
import status from "http-status";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from "cors";
import { envVars } from "./config/env";
import qs from "qs";

const app: Application = express();
app.set("queries parser", (str: string) => qs.parse(str));
app.set("views", path.resolve(process.cwd(), "src/app/templates"));
app.use(
  cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
app.all("/api/auth/*path", toNodeHandler(auth));
app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Add this line to enable URL-encoded data parsing in the request body
app.use("/api/v1", IndexRoutes);

//basic route
app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  throw new AppError(
    status.BAD_REQUEST,
    "This is a sample error from the root route",
  );
  res.status(200).json({
    success: true,
    message: "Welcome to PH Healthcare API",
  });
});

app.use(globalErrorHandler);
app.use(notFound);
export default app;
