import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const paresResult = zodSchema.safeParse(req.body);
    if (!paresResult.success) {
      next(paresResult.error);
    }
    //sanitized and validated data
    req.body = paresResult.data;
    next();
  };
};
