import { NextFunction, Request, RequestHandler, Response } from "express";
import { specialityService } from "./speciality.service";
import { catchasync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";

const createSpeciality = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await specialityService.createSpeciality(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "User Created Succesfully",
    data: result,
  });
});

// const catchasync = (fn: RequestHandler) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await fn(req, res, next);
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Failed Deleteed Fetch",
//         error: error instanceof Error ? error.message : "Unknown error",
//       });
//     }
//   };
// };

// const sum = (a: number, b: number , c:number) => {
//   return a * b;
// };
// sum(10, 20);

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
