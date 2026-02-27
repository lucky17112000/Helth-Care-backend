import { Router } from "express";
import { UserController } from "./user.controller";

import { validateRequest } from "../../middlware/validateRequest";
import { createDoctorZodeSchema } from "./user.validation";

const router = Router();

router.post(
  "/create-doctor",
  validateRequest(createDoctorZodeSchema),
  UserController.createDoctor,
);
export const UserRoute = router;
