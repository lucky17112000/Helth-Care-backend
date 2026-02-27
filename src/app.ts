import express, { Application, NextFunction, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { SpecialityRoutes } from "./app/modules/speciality/speciality.route";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middlware/globalErrorHandler";
import { notFound } from "./app/middlware/notFound";
import AppError from "./app/middlware/AppError";
import { stat } from "node:fs";
import status from "http-status";

const app: Application = express();
app.use(express.json()); // Add this line to enable JSON parsing in the request body
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
