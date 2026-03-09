import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middlware/AppError";
import {
  iChangeUserRolePayload,
  IChangeUserStatusPayload,
  IUpdateAdminPayload,
} from "./admin.interface";

import { IRequestUser } from "../../interfaces/requestUser.interface";
import { Role, UserStatus } from "../../../generated/prisma/enums";
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

const changeUserStatus = async (
  user: IRequestUser,
  payload: IChangeUserStatusPayload,
) => {
  const isAdminExist = await prisma.admin.findUniqueOrThrow({
    where: { email: user.email },
    include: { user: true },
  });
  const { userId, userStatus } = payload;
  const userTochangeStatus = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  const selfCheak = isAdminExist.userId === userId;
  if (selfCheak) {
    throw new AppError(
      status.BAD_REQUEST,
      "Admin user cannot change its own status",
    );
  }
  if (
    isAdminExist.user.role === Role.ADMIN &&
    userTochangeStatus.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Admin user cannot change super admin user status",
    );
  }
  if (
    isAdminExist.user.role === Role.ADMIN &&
    userTochangeStatus.role === Role.ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Admin user cannot change another admin user status",
    );
  }
  if (userStatus === UserStatus.DELETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot set user status to deleted. To delete a user, you have to use role specific delete api. For example, to delete an doctor user, you have to use delete doctor api which will set the user status to deleted and also set isDeleted to true and also delete the user session and account",
    );
  }

  const updateUser = await prisma.user.update({
    where: { id: userId },
    data: {
      status: userStatus,
    },
  });
  return updateUser;
};
const changeUserRole = async (
  user: IRequestUser,
  payload: iChangeUserRolePayload,
) => {
  const isSuperAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email,
      user: { role: Role.SUPER_ADMIN },
    },
    include: { user: true },
  });

  const { userId, role } = payload;
  const userToChangeRole = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  const selfCheak = isSuperAdminExists.userId === userId;
  if (selfCheak) {
    throw new AppError(
      status.BAD_REQUEST,
      "Super admin user cannot change its own role",
    );
  }
  if (
    userToChangeRole.role === Role.DOCTOR ||
    userToChangeRole.role === Role.PATIENT
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the role of doctor or patient user. If you want to change the role of doctor or patient user, you have to delete the user and recreate with new role",
    );
  }

  const updateRole = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  return updateRole;
};
export const AdminService = {
  getAllAdmin,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  changeUserStatus,
  changeUserRole,
};
