import { NextFunction, Request, Response, Router } from "express";
import { SpecialityController } from "./speciality.controller";
import { cookieUtiles } from "../../utiles/cookie";
import AppError from "../../middlware/AppError";
import status from "http-status";
import { jwtUtiles } from "../../utiles/jwt";
import { envVars } from "../../../config/env";
// import { cheakAuth } from "../../middlware/cheakAuth";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlware/cheakAuth";
import { multerUpload } from "../../../config/multer.config";
import { validateRequest } from "../../middlware/validateRequest";
import { SpecialityValidation } from "./speciality.validation";

const router = Router();
router.post(
  "/",
  multerUpload.single("file"),
  validateRequest(SpecialityValidation.createSpecialityZodSchema),

  SpecialityController.createSpeciality,
);
router.get(
  "/",
  // checkAuth(Role.PATIENT, Role.DOCTOR, Role.ADMIN),
  SpecialityController.getAllSpecialities,
);
router.delete("/:id", SpecialityController.deleteSpeciaity);

export const SpecialityRoutes = router;
