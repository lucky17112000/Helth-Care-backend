import { NextFunction, Request, RequestHandler, Response } from "express";
import { specialityService } from "./speciality.service";
import { catchasync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";

const createSpeciality = catchasync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    icon: req.file?.path,
  };
  const result = await specialityService.createSpeciality(payload);
  // console.log(req.body);
  console.log(req.file);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Speciality Created Succesfully",
    data: result,
  });
});

const getAllSpecialities = catchasync(async (req: Request, res: Response) => {
  const result = await specialityService.getAllSpecialities();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "specialities retrive succesfully",
    data: result,
  });
});

const deleteSpeciaity = catchasync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await specialityService.deleteSpeciality(id as string);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Speciality Delete Succesfully",
    data: result,
  });
});

export const SpecialityController = {
  createSpeciality,
  getAllSpecialities,
  deleteSpeciaity,
};
