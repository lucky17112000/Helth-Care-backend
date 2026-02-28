import { Router } from "express";
import { AdminController } from "./admin.controller";
import { validateRequest } from "../../middlware/validateRequest";
import { updateAdminZodSchema } from "./admin.validation";

const router = Router();

router.get("/", AdminController.getAllAdmin);
router.get("/:id", AdminController.getAdminById);

router.patch(
  "/:id",
  validateRequest(updateAdminZodSchema),
  AdminController.updateAdmin,
);
router.delete("/:id", AdminController.deleteAdmin);

export const AdminRoute = router;
