import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { checkAuth } from "../../middlware/cheakAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlware/validateRequest";
import { updateDoctorValidationSchema } from "./doctor.validation";

const router = Router();
router.get("/", doctorController.getAllDoctors);
router.get(
  "/:id",
  //   checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR),
  doctorController.getDoctorById,
);
router.patch(
  "/:id",
  validateRequest(updateDoctorValidationSchema),
  doctorController.updateDoctor,
);
export const doctorRoute = router;
