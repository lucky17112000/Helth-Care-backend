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

export const AppointmentRoutes = router;
