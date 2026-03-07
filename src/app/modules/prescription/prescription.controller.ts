import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { PrescriptionService } from "./prescription.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const givePrescription = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const result = await PrescriptionService.givePrescription(
    user as IRequestUser,
    payload,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
});

const myPrescriptions = catchasync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await PrescriptionService.myPrescriptions(
    user as IRequestUser,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Prescription fetched successfully",
    data: result,
  });
});

const getAllPrescriptions = catchasync(async (req: Request, res: Response) => {
  const result = await PrescriptionService.getAllPrescriptions();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Prescriptions retrieval successfully",
    data: result,
  });
});

const updatePrescription = catchasync(async (req: Request, res: Response) => {
  const user = req.user;
  const prescriptionId = req.params.id;
  const payload = req.body;
  const result = await PrescriptionService.updatePrescription(
    user as IRequestUser,
    prescriptionId as string,
    payload,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Prescription updated successfully",
    data: result,
  });
});

const deletePrescription = catchasync(async (req: Request, res: Response) => {
  const user = req.user;
  const prescriptionId = req.params.id;
  await PrescriptionService.deletePrescription(
    user as IRequestUser,
    prescriptionId as string,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Prescription deleted successfully",
  });
});

export const PrescriptionController = {
  givePrescription,
  myPrescriptions,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
};
