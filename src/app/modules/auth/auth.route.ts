import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middlware/cheakAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.post("/register", authController.registerPatient);
router.post("/login", authController.loginUser);
router.get(
  "/me",
  checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
  authController.getMe,
);

export const authRoutes = router;
