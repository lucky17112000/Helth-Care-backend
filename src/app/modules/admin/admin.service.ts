import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middlware/AppError";
import { IUpdateAdminPayload } from "./admin.interface";
import { is } from "zod/locales";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { UserStatus } from "../../../generated/prisma/enums";
//!SECTION -1
const getAllAdmin = async () => {
  const admin = await prisma.admin.findMany({
    include: {
      user: true,
    },
  });
  return admin;
};

//!SECTION-2

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });
  return admin;
};
//!SECTION-3

const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
  //SECTION - Validate who is updating the admin user. Only super admin can update admin user and only super admin can update super admin user but admin user cannot update super admin user

  const isAdminExist = await prisma.admin.findUnique({
    where: { id },
  });
  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin user not found");
  }

  const { admin } = payload;
  const updateAdmin = await prisma.admin.update({
    where: { id },
    data: {
      ...admin,
    },
  });

  //NOTE - last
  return updateAdmin;
};
//!SECTION-4

const deleteAdmin = async (id: string, user: IRequestUser) => {
  //SECTION - Validate who is updating the admin user. Only super admin can update admin user and only super admin can update super admin user but admin user cannot update super admin user
  const isAdminExist = await prisma.admin.findUnique({
    where: { id },
  });
  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin user not found");
  }
  if (isAdminExist.id === user?.userId) {
    throw new AppError(status.BAD_REQUEST, "Admin user cannot delete itself");
  }
  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    //ANCHOR - admin update ses

    await tx.user.update({
      where: { id: isAdminExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });
    //ANCHOR - user update ses

    await tx.session.deleteMany({
      where: { userId: isAdminExist.userId },
    });

    //ANCHOR - session delete ses

    await tx.account.deleteMany({
      where: { userId: isAdminExist.userId },
    });
    //ANCHOR - account delete ses

    const admin = getAdminById(id);

    //NOTE - last
    return admin;
  });

  //NOTE - last
  return result;
};

export const AdminService = {
  getAllAdmin,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
