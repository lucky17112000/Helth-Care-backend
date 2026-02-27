import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { tokenUtiles } from "../../utiles/token";

const registerPatient = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.registerpatient(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Patient registered successfully",
    data: result,
  });
});

const loginUser = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await authService.LoginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtiles.setAccessTokenCookie(res, accessToken);
  tokenUtiles.setRefreshTokenCookie(res, refreshToken);
  tokenUtiles.setBetterAuthSessionCookie(res, token as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      ...rest,
      accessToken,
      refreshToken,
      token,
    },
  });
});
export const authController = {
  registerPatient,
  loginUser,
};
