import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtiles } from "./jwt";
import { envVars } from "../../config/env";

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
export const tokenUtiles = {
  getAccessToken,
  getRefreshToken,
};
