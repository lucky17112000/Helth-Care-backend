import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { statsServices } from "./stats.sevices";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { send } from "node:process";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";

const getDasboardStatsdata = catchasync(async (req: Request, res: Response) => {
  const user = req.user;
  const getDashboardStatsdata = await statsServices.getDashboardStats(
    user as IRequestUser,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Dashboard Stats data fetched successfully",
    data: getDashboardStatsdata,
  });
});
export const statsController = {
  getDasboardStatsdata,
};
