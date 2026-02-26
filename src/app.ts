import express, { Application, NextFunction, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { SpecialityRoutes } from "./app/modules/speciality/speciality.route";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middlware/globalErrorHandler";
import { notFound } from "./app/middlware/notFound";

const app: Application = express();
app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use(express.urlencoded({ extended: true })); // Add this line to enable URL-encoded data parsing in the request body
app.use("/api/v1", IndexRoutes);

app.use(globalErrorHandler);
app.use(notFound);
export default app;
