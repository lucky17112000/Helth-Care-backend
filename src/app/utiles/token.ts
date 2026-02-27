import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtiles } from "./jwt";
import { envVars } from "../../config/env";
import { CookieOptions, Response } from "express";
import { cookieUtiles } from "./cookie";
// import { ms } from "ms";
//creating token for access token and refresh token
const getAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtiles.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions,
  );
  return accessToken;
};
const getRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtiles.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions,
  );
  return refreshToken;
};
//set in cookie access token and refresh token
const setAccessTokenCookie = (res: Response, token: string) => {
  //   const maxAge = ms(Number(envVars.ACCESS_TOKEN_EXPIRES_IN));
  cookieUtiles.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1000, // ms return number but cookie expect number in ms so we need to convert it to number
  });
};
const setRefreshTokenCookie = (res: Response, token: string) => {
  //   const maxAge = ms(Number(envVars.REFRESH_TOKEN_EXPIRES_IN));
  cookieUtiles.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1000 * 7, // ms return number but cookie expect number in ms so we need to convert it to number
  });
};
//better auth csesiin manually set kkore dicci
const setBetterAuthSessionCookie = (res: Response, token: string) => {
  //   const maxAge = ms(Number(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN));
  cookieUtiles.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1000, // ms return number but cookie expect number in ms so we need to convert it to number
  });
};

export const tokenUtiles = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
};
