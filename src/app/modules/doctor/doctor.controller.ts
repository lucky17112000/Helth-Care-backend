import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { doctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";

const getAllDoctors = catchasync(async (req: Request, res: Response) => {
  const result = await doctorService.getAllDoctors();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctors retrieved successfully",
    data: result,
  });
});
export const doctorController = {
  getAllDoctors,
};
