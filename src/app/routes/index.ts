import { Router } from "express";
import { SpecialityRoutes } from "../modules/speciality/speciality.route";
import { authRoutes } from "../modules/auth/auth.service";

const router = Router();
router.use("/specialities", SpecialityRoutes);
router.use("/auth", authRoutes);

export const IndexRoutes = router;
