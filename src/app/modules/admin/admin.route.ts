import { Router } from "express";
import { AdminController } from "./admin.controller";
import { validateRequest } from "../../middlware/validateRequest";
import { updateAdminZodSchema } from "./admin.validation";
import { checkAuth } from "../../middlware/cheakAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", AdminController.getAllAdmin);
router.get("/:id", AdminController.getAdminById);

router.patch(
  "/:id",
  validateRequest(updateAdminZodSchema),
  AdminController.updateAdmin,
);
router.delete("/:id", AdminController.deleteAdmin);

router.patch(
  "/change-user-status",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  AdminController.changeUserStatus,
);
router.patch(
  "/change-user-role",
  checkAuth(Role.SUPER_ADMIN),
  AdminController.changeUserRole,
);

export const AdminRoute = router;
