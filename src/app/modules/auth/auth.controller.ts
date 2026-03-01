import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { tokenUtiles } from "../../utiles/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IChangePasswordPayload } from "./auth.interface";
import { cookieUtiles } from "../../utiles/cookie";
import { envVars } from "../../../config/env";
import { auth } from "../../lib/auth";
// import { ca } from "zod/locales";

// import { auth } from "../../lib/auth";

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
const getMe = catchasync(async (req: Request, res: Response) => {
  const user = req.user;
  console.log("user from getMe controller", user);
  const result = await authService.getMe(user as IRequestUser);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const getNewToken = catchasync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const sessionToken = req.cookies["better-auth.session_token"];

  const result = await authService.getNewToken(refreshToken, sessionToken);
  const {
    accessToken,
    refreshToken: newRefreshToken,
    sessionToken: newSessionToken,
  } = result;
  tokenUtiles.setAccessTokenCookie(res, accessToken);
  tokenUtiles.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtiles.setBetterAuthSessionCookie(res, newSessionToken);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "New access token generated successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken: newSessionToken,
    },
  });
});

const changePassword = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await authService.changePassword(
    payload as IChangePasswordPayload,
    sessionToken as string,
  );

  const { accessToken, refreshToken, token, user } = result;
  tokenUtiles.setAccessTokenCookie(res, accessToken);
  tokenUtiles.setRefreshTokenCookie(res, refreshToken);
  tokenUtiles.setBetterAuthSessionCookie(res, token as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: {
      user,
      token,
      accessToken,
      refreshToken,
    },
  });
});

const logoutUser = catchasync(async (req: Request, res: Response) => {
  const sessionToken = req.cookies["better-auth.session_token"];
  const result = await authService.logOutUser(sessionToken as string);
  cookieUtiles.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtiles.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  cookieUtiles.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged out successfully",
    data: result,
  });
});
const verifyEmail = catchasync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await authService.verifyEmail(email, otp);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Email verified successfully",
  });
});
const forgetPassword = catchasync(async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log("email from forgetPassword controller", email);
  await authService.forgetPassword(email);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset OTP sent to email successfully",
  });
});
const resetPassword = catchasync(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  await authService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Password reset successfully",
  });
});

//api/v1/auth/login/google?redirect=/profile

const googleLogin = catchasync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/dashboard";
  const encodedRedirectPath = encodeURIComponent(redirectPath as string);
  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;
  res.render("googleRedirect", {
    callbackURL: callbackURL,
    betterAuthUrl: envVars.BETTER_AUTH_URL,
  });
});

const googleLoginSuccess = catchasync(async (req: Request, res: Response) => {
  const redirectPath = (req.query.redirect as string) || "/dashboard";
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }
  const session = await auth.api.getSession({
    headers: {
      cookie: `better-auth.session_token=${sessionToken}`,
    },
  });
  if (session && !session?.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
  }
  const result = await authService.googleLoginSuccess(
    session as Record<string, any>,
  );
  const { accessToken, refreshToken } = result;
  tokenUtiles.setAccessTokenCookie(res, accessToken);
  tokenUtiles.setRefreshTokenCookie(res, refreshToken);
  const isValidRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";
  res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
});

const handleOAUthError = catchasync(async (req: Request, res: Response) => {
  const error = (req.query.error as string) || "oauth_failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});

export const authController = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLogin,
  googleLoginSuccess,
  handleOAUthError,
};
