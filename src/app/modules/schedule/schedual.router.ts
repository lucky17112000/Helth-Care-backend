import { Router } from "express";
import { scheduleController } from "./schedule.controller";
import { validateRequest } from "../../middlware/validateRequest";
import { ScheduleValidation } from "./schedule.validation";

const router = Router();

router.post(
  "/",
  validateRequest(ScheduleValidation.createScheduleZodSchema),
  scheduleController.createSchedule,
);
router.get("/", scheduleController.getAllSchedule);
router.get("/:id", scheduleController.getScheduleById);
router.put(
  "/:id",
  validateRequest(ScheduleValidation.updateScheduleZodSchema),
  scheduleController.updateSchedule,
);
router.delete("/:id", scheduleController.deleteSchedule);

export const scheduleRouter = router;
