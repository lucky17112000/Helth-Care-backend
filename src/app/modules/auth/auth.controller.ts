import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendReponse";

const registerPatient = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.registerpatient(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Patient registered successfully",
    data: result,
  });
});

const loginUser = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.LoginUser(payload);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});
export const authController = {
  registerPatient,
  loginUser,
};
