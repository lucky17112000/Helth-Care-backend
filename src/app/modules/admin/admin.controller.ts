import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { AdminService } from "./admin.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface";

//!SECTION-1
const getAllAdmin = catchasync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllAdmin();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin user retrieved successfully",
    data: result,
  });
});

//!SECTION-2
const getAdminById = catchasync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.getAdminById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin user retrieved successfully",
    data: result,
  });
});
//!SECTION-3
const updateAdmin = catchasync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await AdminService.updateAdmin(id as string, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin user updated successfully",
    data: result,
  });
});
//!SECTION-4
const deleteAdmin = catchasync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user;
  const result = await AdminService.deleteAdmin(
    id as string,
    user as IRequestUser,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin user deleted successfully",
    data: result,
  });
});

export const AdminController = {
  getAllAdmin,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
