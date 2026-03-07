import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { AppointmentService } from "./appoinment.service";
import { IRequestUser } from "../../interfaces/requestUser.interface";
//!SECTION
const bookAppointment = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  console.log("User email:", user?.email);
  const appointment = await AppointmentService.bookAppoinment(
    payload,
    user as IRequestUser,
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Appointment booked successfully",
    data: appointment,
  });
});
//!SECTION

//!SECTION

const getMyAppointments = catchasync(async (req: Request, res: Response) => {
  const user = req.user;
  const appointments = await AppointmentService.getmyAppoinment(
    user as IRequestUser,
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Appointments retrieved successfully",
    data: appointments,
  });
});
//!SECTION

//!SECTION

const changeAppointmentStatus = catchasync(
  async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const payload = req.body;
    const user = req.user;

    const updatedAppointment = await AppointmentService.changeAppoinmentStatus(
      appointmentId as string,
      payload,
      user as IRequestUser,
    );
    sendResponse(res, {
      success: true,
      httpStatusCode: status.OK,
      message: "Appointment status updated successfully",
      data: updatedAppointment,
    });
  },
);
//!SECTION

const getMySingleAppointment = catchasync(
  async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const user = req.user;

    const appointment = await AppointmentService.getMySingleAppointment(
      appointmentId as string,
      user as IRequestUser,
    );
    sendResponse(res, {
      success: true,
      httpStatusCode: status.OK,
      message: "Appointment retrieved successfully",
      data: appointment,
    });
  },
);

//!SECTION

const getAllAppoinment = catchasync(async (req: Request, res: Response) => {
  const appoinment = await AppointmentService.getAllAppointments();
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "All appointments retrieved successfully",
    data: appoinment,
  });
});
//!SECTION
const bookAppoinmentWithPayLater = catchasync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const appointment = await AppointmentService.bookAppoinmentWithPayLater(
      payload,
      user as IRequestUser,
    );
    sendResponse(res, {
      success: true,
      httpStatusCode: status.CREATED,
      message: "Appointment booked successfully with pay later option",
      data: appointment,
    });
  },
);

const initiatePayment = catchasync(async (req: Request, res: Response) => {
  const appointmentId = req.params.id;
  const user = req.user;
  const paymentResult = await AppointmentService.initiatePayment(
    appointmentId as string,
    user as IRequestUser,
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Payment initiated successfully",
    data: paymentResult,
  });
});
export const AppointmentController = {
  bookAppointment,
  getMyAppointments,
  changeAppointmentStatus,
  getMySingleAppointment,
  getAllAppoinment,
  bookAppoinmentWithPayLater,
  initiatePayment,
};
