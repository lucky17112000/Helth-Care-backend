import { Router } from "express";
import { UserController } from "./user.controller";

import { validateRequest } from "../../middlware/validateRequest";
import {
  createAdminValidationSchema,
  createDoctorZodeSchema,
} from "./user.validation";

const router = Router();

router.post(
  "/create-doctor",
  validateRequest(createDoctorZodeSchema),
  UserController.createDoctor,
);
router.post(
  "/create-admin",
  validateRequest(createAdminValidationSchema),

  UserController.createAdmin,
);
export const UserRoute = router;
