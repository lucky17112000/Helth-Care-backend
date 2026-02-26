import { Router } from "express";
import { SpecialityController } from "./speciality.controller";

const router = Router();
router.post("/", SpecialityController.createSpeciality);

export const SpecialityRoutes = router;
