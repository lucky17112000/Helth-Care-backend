import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { doctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { IDoctorUpdate } from "./doctor.interface";
import { iQueryParams } from "../../interfaces/query.interface";

const getAllDoctors = catchasync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await doctorService.getAllDoctors(query as iQueryParams);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctors retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getDoctorById = catchasync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await doctorService.getDoctorById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: `Doctor with ID ${id} retrieved successfully`,
    data: result,
  });
});

const updateDoctor = catchasync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const payload = req.body;
  const result = await doctorService.updateDoctor(id as string, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: `Doctor with ID ${id} updated successfully`,
    data: result,
  });
});
export const doctorController = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
};
//doctor123
