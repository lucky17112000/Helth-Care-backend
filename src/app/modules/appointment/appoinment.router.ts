import { Router } from "express";
import { AppointmentController } from "./appoinment.controller";

const router = Router();

router.post("/book-appointment", AppointmentController.bookAppointment);
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
  AppointmentController.bookAppoinmentWithPayLater,
);
router.post("/initiate-payment/:id", AppointmentController.initiatePayment);

export const AppointmentRoutes = router;
