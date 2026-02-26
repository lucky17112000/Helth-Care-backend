import { NextFunction, Request, RequestHandler, Response } from "express";

export const catchasync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed Deleteed Fetch",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
};
