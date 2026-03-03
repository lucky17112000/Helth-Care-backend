import { Router } from "express";
import { scheduleController } from "./schedule.controller";

const router = Router();

router.post("/", scheduleController.createSchedule);
router.get("/", scheduleController.getAllSchedule);
router.get("/:id", scheduleController.getScheduleById);
router.put("/:id", scheduleController.updateSchedule);
router.delete("/:id", scheduleController.deleteSchedule);

export const scheduleRouter = router;
