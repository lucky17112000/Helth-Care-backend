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

const router = Router();
router.post("/", SpecialityController.createSpeciality);
router.get(
  "/",
  checkAuth(Role.PATIENT),
  SpecialityController.getAllSpecialities,
);
router.delete("/:id", SpecialityController.deleteSpeciaity);

export const SpecialityRoutes = router;
