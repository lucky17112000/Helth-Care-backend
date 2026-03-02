import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    const paresResult = zodSchema.safeParse(req.body);
    if (!paresResult.success) {
      next(paresResult.error);
    }
    //sanitized and validated data
    req.body = paresResult.data;
    next();
  };
};
