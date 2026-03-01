import status from "http-status";
import { Role, User, UserStatus } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../middlware/AppError";
import { tokenUtiles } from "../../utiles/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { jwtUtiles } from "../../utiles/jwt";
import { envVars } from "../../../config/env";
import { JwtPayload } from "jsonwebtoken";
import {
  IChangePasswordPayload,
  ILoginUserPayload,
  IRegisterPatientPayload,
} from "./auth.interface";
// import { jwtUtiles } from "../../utiles/jwt";

const registerpatient = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      //default values for new patient
      //   needPasswordChange:false,
      //   role: Role.PATIENT,
    },
  });
  if (!data.user) {
    // throw new Error("Failed to register patient");
    throw new AppError(status.BAD_REQUEST, "Failed to register patient");
  }
  try {
    const patient = await prisma.$transaction(async (tx) => {
      const patientTx = await tx.patient.create({
        data: {
          userId: data.user.id,
          name: name,
          email: email,
        },
      });
      return patientTx;
    });
    return { ...data, patient };
  } catch (error) {
    console.log(error);
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

const LoginUser = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  if (data.user.status === UserStatus.BLOCKED) {
    // throw new Error("User is blocked");
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    // throw new Error("User is deleted");
    throw new AppError(status.FORBIDDEN, "User is deleted");
  }
  const accessToken = tokenUtiles.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });
  const refreshToken = tokenUtiles.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  });
  return { ...data, accessToken, refreshToken };
};

const getMe = async (user: IRequestUser) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    include: {
      patient: {
        include: {
          appointments: true,
          reviews: true,
          prescriptions: true,
          medicalReports: true,
          patientHealthData: true,
        },
      },
      doctor: {
        include: {
          specialties: true,
          appointments: true,
          reviews: true,
          prescriptions: true,
        },
      },
      admin: true,
    },
  });
  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return isUserExist;
};

const getNewToken = async (refreshToken: string, sessionToken: string) => {
  //exiting session token er time barate hobe new session token amader die make kora possible na karon session token ase better auth theke but amra time barai dite pari
  //manually session token getting proccess  change passsword e  better auth er away te access kora hoyece so duitai same kaj kore
  const isSessonTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });
  if (!isSessonTokenExists) {
    throw new AppError(status.UNAUTHORIZED, "User is not logged in");
  }

  const verifiedRefreshToken = jwtUtiles.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );
  if (!verifiedRefreshToken) {
    throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifiedRefreshToken.data as JwtPayload;

  const newAccessToken = tokenUtiles.getAccessToken({
    userId: data.id,
    role: data.role,
    name: data.name,
    email: data.email,
    emailVerified: data.emailVerified,
    status: data.status,
    isDeleted: data.isDeleted,
  });
  const newRefreshToken = tokenUtiles.getRefreshToken({
    userId: data.id,
    role: data.role,
    name: data.name,
    email: data.email,
    emailVerified: data.emailVerified,
    status: data.status,
    isDeleted: data.isDeleted,
  });
  const updatedSession = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), //! 1 days
      updatedAt: new Date(),
    },
  });

  //!SECTION end
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: updatedSession.token,
  };
};

const changePassword = async (
  payload: IChangePasswordPayload,
  sessionToken: string,
) => {
  const sesison = await auth.api.getSession({
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  if (!sesison) {
    throw new AppError(status.UNAUTHORIZED, "User is not logged in");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true, //NOTE - baki jotot device ase sob jayga teke logout hgoye jabe
    },
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  //!SECTION : je user k admin create kore dibe tar ispaasswrod change true thakbe etake ekhane update kore dibo
  if (sesison.user.needPasswordChange) {
    await prisma.user.update({
      where: { id: sesison.user.id },
      data: {
        needPasswordChange: false,
      },
    });
  }
  //!SECTION : je user k admin create kore dibe tar ispaasswrod change true thakbe etake ekhane update kore dibo
  const newAccessToken = tokenUtiles.getAccessToken({
    userId: sesison.user.id,
    role: sesison.user.role,
    name: sesison.user.name,
    email: sesison.user.email,
    emailVerified: sesison.user.emailVerified,
    status: sesison.user.status,
    isDeleted: sesison.user.isDeleted,
  });
  const newRefreshToken = tokenUtiles.getRefreshToken({
    userId: sesison.user.id,
    role: sesison.user.role,
    name: sesison.user.name,
    email: sesison.user.email,
    emailVerified: sesison.user.emailVerified,
    status: sesison.user.status,
    isDeleted: sesison.user.isDeleted,
  });

  //!SECTION end
  return {
    ...result,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const logOutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: {
      Authorization: `Bearer ${sessionToken}`,
    },
  });
  return result;
};

const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });
  //!SECTION result section end 0beeter auth function
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        emailVerified: true,
      },
    });
  }
  //!SECTION if section end

  //!SECTION end of the main scope
};

const forgetPassword = async (email: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email is not verified");
  }
  if (isUserExist.status === UserStatus.DELETED || isUserExist.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "User is deleted");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email: email,
    },
  });
};

const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: email },
  });
  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError(status.BAD_REQUEST, "Email is not verified");
  }
  if (isUserExist.status === UserStatus.DELETED || isUserExist.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "User is deleted");
  }

  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: { email: email },
      data: {
        needPasswordChange: false,
      },
    });
  }

  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id,
    },
  });
};

const googleLoginSuccess = async (session: Record<string, any>) => {
  const ispatientExist = await prisma.patient.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!ispatientExist) {
    await prisma.patient.create({
      data: {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });
  }

  const accessToken = tokenUtiles.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
  });
  const refreshToken = tokenUtiles.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
  });
  return {
    accessToken,
    refreshToken,
  };
};

export const authService = {
  registerpatient,
  LoginUser,
  getMe,
  getNewToken,
  changePassword,
  logOutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess,
};
