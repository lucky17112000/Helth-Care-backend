import { NextFunction, Request, Response } from "express";
import { envVars } from "../../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSource } from "../interfaces/error.intefaces";
import AppError from "./AppError";

import { deleteUploadedFileFromGlobalErrorHandler } from "../utiles/deletUploadedFileFromGlobalErrorHandler";
import { Prisma } from "../../generated/prisma/client";
import {
  handlePrismaClientKnownRequestError,
  handlePrismaClientUnknownError,
  handlePrismaClientValidationError,
  handlerPrismaClientRustPanicError,
} from "../errorHelper/handlePrismaErrors";
// import { Prisma } from "../../generated/prisma/browser";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.error("Global Error:", err);
  }

  //!SECTION: image delete for single and mutiple file upload when show any error
  // try {
  //   if (req.file) {
  //     await deleteFileFromCloudinary(req.file.path);
  //   }

  //   if (req.files && Array.isArray(req.files) && req.files.length > 0) {
  //     const imageUrl = req.files.map((file) => file.path);
  //     await Promise.all(imageUrl.map((url) => deleteFileFromCloudinary(url)));
  //   }
  // } catch (deleteError) {
  //   console.error(
  //     "Failed to delete uploaded file(s) from Cloudinary:",
  //     deleteError,
  //   );
  // }
  await deleteUploadedFileFromGlobalErrorHandler(req);
  //!SECTION: image delete
  const errorSources: TErrorSource[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode || status.INTERNAL_SERVER_ERROR;
    message = simplifiedError.message || "Database Error";
    errorSources.push(...simplifiedError.errorSources);
    stack: err.stack;
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    const simplifiedError = handlePrismaClientUnknownError(err);
    statusCode = simplifiedError.statusCode || status.BAD_REQUEST;
    message = simplifiedError.message || "Database Validation Error";
    errorSources.push(...simplifiedError.errorSources);
    stack: err.stack;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(err);
    statusCode = simplifiedError.statusCode || status.BAD_REQUEST;
    message = simplifiedError.message || "Database Validation Error";
    errorSources.push(...simplifiedError.errorSources);
    stack: err.stack;
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    const simplifiedError = handlerPrismaClientRustPanicError();
    statusCode = simplifiedError.statusCode || status.INTERNAL_SERVER_ERROR;
    message = simplifiedError.message || "Database Error";
    errorSources.push(...simplifiedError.errorSources);
    stack: err.stack;
  } else if (err instanceof z.ZodError) {
    statusCode = status.BAD_REQUEST;
    message = "Zod Validation Error";
    err.issues.forEach((issue) => {
      errorSources.push({
        path: issue.path.join(" => "),
        message: issue.message,
      });
    });
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack: err.stack;
    errorSources.push({
      path: "",
      message: err.message,
    });
  }
  res.status(statusCode).json({
    success: false,
    message: message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? err : undefined,
  } as TErrorResponse);
};
