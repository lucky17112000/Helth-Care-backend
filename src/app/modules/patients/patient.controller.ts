import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { PatientService } from "./pateint.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";

const updateMyProfile = catchasync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const payload = req.body;

  const result = await PatientService.updateMyProfile(user, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Patient profile updated successfully",
    data: result,
  });
});

export const PatientController = {
  updateMyProfile,
};
