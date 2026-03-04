import { Router } from "express";
import { scheduleController } from "./schedule.controller";
import { validateRequest } from "../../middlware/validateRequest";
import { ScheduleValidation } from "./schedule.validation";
import { checkAuth } from "../../middlware/cheakAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(ScheduleValidation.createScheduleZodSchema),
  scheduleController.createSchedule,
);
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  scheduleController.getAllSchedule,
);
router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  scheduleController.getScheduleById,
);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(ScheduleValidation.updateScheduleZodSchema),
  scheduleController.updateSchedule,
);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  scheduleController.deleteSchedule,
);

export const scheduleRouter = router;
