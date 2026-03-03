import { Router } from "express";
import { SpecialityRoutes } from "../modules/speciality/speciality.route";
import { authRoutes } from "../modules/auth/auth.route";
import { UserRoute } from "../modules/user/user.route";
import { doctorRoute } from "../modules/doctor/doctor.route";
import { AdminRoute } from "../modules/admin/admin.route";
import { scheduleRouter } from "../modules/schedule/schedual.router";
import { doctorScheduleRoute } from "../modules/doctorSchedule/doctorSchedule.route";
// import { authRoutes } from "../modules/auth/auth.service";

const router = Router();
router.use("/auth", authRoutes);
router.use("/specialities", SpecialityRoutes);
router.use("/users", UserRoute);
router.use("/doctors", doctorRoute);

router.use("/admin", AdminRoute);
router.use("/schedules", scheduleRouter);
router.use("/doctor-schedules", doctorScheduleRoute);

export const IndexRoutes = router;
