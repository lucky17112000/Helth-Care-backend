import { Router } from "express";
import { AppointmentController } from "./appoinment.controller";
import { checkAuth } from "../../middlware/cheakAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/book-appointment",
  checkAuth(Role.PATIENT),
  AppointmentController.bookAppointment,
);
router.get("/my-appointments", AppointmentController.getMyAppointments);
router.patch(
  "/change-appointment-status/:id",
  AppointmentController.changeAppointmentStatus,
);
router.get(
  "/my-single-appointment/:id",
  AppointmentController.getMySingleAppointment,
);
router.get("/all-appointments", AppointmentController.getAllAppoinment);
router.post(
  "/book-appointment-with-pay-later",
  checkAuth(Role.PATIENT),
  AppointmentController.bookAppoinmentWithPayLater,
);
router.post(
  "/initiate-payment/:id",
  checkAuth(Role.PATIENT),
  AppointmentController.initiatePayment,
);

export const AppointmentRoutes = router;
