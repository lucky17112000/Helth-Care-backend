import { Router } from "express";
import { statsController } from "./stats.controller";
import { checkAuth } from "../../middlware/cheakAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.DOCTOR, Role.PATIENT),
  statsController.getDasboardStatsdata,
);
export const statsRoutes = router;
