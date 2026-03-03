import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { scheduleService } from "./schedule.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { request } from "node:http";

//!SECTION
const createSchedule = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await scheduleService.createSchedule(payload);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});
//!SECTION

//TODO -

const getAllSchedule = catchasync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await scheduleService.getAllSchedule(query);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All Schedule retrieved successfully",
    data: result,
  });
});
//TODO -

//!SECTION
const getScheduleById = catchasync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await scheduleService.getScheduleById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: result,
  });
});

//!SECTION

//TODO -

const updateSchedule = catchasync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await scheduleService.updateSchedule(id as string, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Schedule updated successfully",
    data: result,
  });
});
//TODO -

//!SECTION

const deleteSchedule = catchasync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await scheduleService.deleteSchedule(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});
//!SECTION

export const scheduleController = {
  createSchedule,
  getAllSchedule,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
