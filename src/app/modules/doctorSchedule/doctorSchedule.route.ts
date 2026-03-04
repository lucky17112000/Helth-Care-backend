import { Router } from "express";
import { doctorScheduleController } from "./doctorSchedules.controller";

const router = Router();
router.post(
  "/create-my-doctor-schedule",
  doctorScheduleController.createDoctorSchedule,
);
router.get("/my-doctor-schedule", doctorScheduleController.getMyDoctorSchedule);
router.get("/", doctorScheduleController.getAllDoctorSchedule);
router.get(
  "/:doctorId/schedule/:scheduleId",
  doctorScheduleController.getDoctorScheduleById,
);
router.patch(
  "/update-my-doctor-schedule",
  doctorScheduleController.updateDoctorSchedule,
);
router.delete(
  "/delete-my-doctor-schedule/:id",
  doctorScheduleController.deleteDoctorSchedule,
);
export const doctorScheduleRoute = router;
