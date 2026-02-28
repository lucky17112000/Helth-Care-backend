import { Router } from "express";
import { SpecialityRoutes } from "../modules/speciality/speciality.route";
import { authRoutes } from "../modules/auth/auth.route";
import { UserRoute } from "../modules/user/user.route";
import { doctorRoute } from "../modules/doctor/doctor.route";
import { AdminRoute } from "../modules/admin/admin.route";
// import { authRoutes } from "../modules/auth/auth.service";

const router = Router();
router.use("/auth", authRoutes);
router.use("/specialities", SpecialityRoutes);
router.use("/users", UserRoute);
router.use("/doctors", doctorRoute);
router.use("/admin", AdminRoute);

export const IndexRoutes = router;
