import { NextFunction, Request, Response, Router } from "express";
import { checkAuth } from "../../middlware/cheakAuth";
import { Role } from "../../../generated/prisma/enums";
import { PatientController } from "./patient.controller";
import { validateRequest } from "../../middlware/validateRequest";
import { PatientValidation } from "./patient.validation";
import { multerUpload } from "../../../config/multer.config";
import { iUpdatePatientProfilePayload } from "./patient.interface";
import { PatientMiddleware } from "./patient.middlware";

const router = Router();

router.patch(
  "/update-my-profile",

  checkAuth(Role.PATIENT),
  multerUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalReports", maxCount: 10 },
  ]),
  PatientMiddleware.updateMyProfilePatientMiddleware,

  validateRequest(PatientValidation.updatePateintProfileZodValidation),
  PatientController.updateMyProfile,
);
export const PatientRoute = router;
