import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { doctorScheduleService } from "./doctorScheudle.service";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";

const createDoctorSchedule = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const result = await doctorScheduleService.createDoctorSchedule(
    user as IRequestUser,
    payload,
  );
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Doctor Schedule created successfully",
    data: result,
  });
});

//!SECTION
const getMyDoctorSchedule = catchasync(async (req: Request, res: Response) => {
  const query = req.query;
  const user = req.user;
  const result = await doctorScheduleService.getMyDoctorSchedule(
    user as IRequestUser,
    query,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor Schedule fetched successfully",
    data: result,
  });
});
//!SECTION

const getAllDoctorSchedule = catchasync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await doctorScheduleService.getAllDoctorSchedule(query);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor Schedule fetched successfully",
    data: result,
  });
});

//!SECTION
const getDoctorScheduleById = catchasync(
  async (req: Request, res: Response) => {
    const doctorId = req.params.doctorId;
    const scheduleId = req.params.scheduleId;
    const result = await doctorScheduleService.getDoctorScheduleById(
      doctorId as string,
      scheduleId as string,
    );
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Doctor Schedule fetched successfully",
      data: result,
    });
  },
);
//!SECTION

const updateDoctorSchedule = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const result = await doctorScheduleService.updateDoctorSchedule(
    user as IRequestUser,
    payload,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor Schedule updated successfully",
    data: result,
  });
});

//!SECTION
const deleteDoctorSchedule = catchasync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = req.user;
  await doctorScheduleService.deleteDoctorSchedule(
    id as string,
    user as IRequestUser,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor Schedule deleted successfully",
  });
});

//!SECTION

export const doctorScheduleController = {
  createDoctorSchedule,
  getMyDoctorSchedule,
  getAllDoctorSchedule,
  getDoctorScheduleById,
  updateDoctorSchedule,
  deleteDoctorSchedule,
};
