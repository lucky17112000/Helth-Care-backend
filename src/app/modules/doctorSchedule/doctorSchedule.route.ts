import { Router } from "express";
import { doctorScheduleController } from "./doctorSchedules.controller";
import { checkAuth } from "../../middlware/cheakAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.post(
  "/create-my-doctor-schedule",
  checkAuth(Role.DOCTOR),
  doctorScheduleController.createDoctorSchedule,
);
router.get(
  "/my-doctor-schedule",
  checkAuth(Role.DOCTOR),
  doctorScheduleController.getMyDoctorSchedule,
);
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  doctorScheduleController.getAllDoctorSchedule,
);

router.get(
  "/:doctorId/schedule/:scheduleId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  doctorScheduleController.getDoctorScheduleById,
);
router.patch(
  "/update-my-doctor-schedule",
  checkAuth(Role.DOCTOR),
  doctorScheduleController.updateDoctorSchedule,
);
router.delete(
  "/delete-my-doctor-schedule/:id",
  checkAuth(Role.DOCTOR),
  doctorScheduleController.deleteDoctorSchedule,
);
export const doctorScheduleRoute = router;
