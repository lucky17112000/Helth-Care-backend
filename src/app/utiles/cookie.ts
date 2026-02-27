import { CookieOptions, Request, Response } from "express";

const setCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(key, value, options);
};

const getCookie = (req: Request, key: string) => {
  return req.cookies[key];
};
// jodi amra ptanur por cookie clear korte chai amra ani respone er moddo die cokkie browser e jay or user je jaygat theke request patay sekhan theke
const clearCookie = (res: Response, key: string, options: CookieOptions) => {
  res.clearCookie(key, options);
};
export const cookieUtiles = {
  setCookie,
  getCookie,
  clearCookie,
};
