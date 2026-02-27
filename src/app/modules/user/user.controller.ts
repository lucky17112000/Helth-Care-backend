import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";

//21 minute 20 second
const createDoctor = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await UserService.createDoctor(payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});
export const UserController = {
  createDoctor,
};
