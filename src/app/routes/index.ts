import { Router } from "express";
import { SpecialityRoutes } from "../modules/speciality/speciality.route";
import { authRoutes } from "../modules/auth/auth.route";
// import { authRoutes } from "../modules/auth/auth.service";

const router = Router();
router.use("/auth", authRoutes);
router.use("/specialities", SpecialityRoutes);

export const IndexRoutes = router;
