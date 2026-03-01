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
// import { jwtUtiles } from "../../utiles/jwt";
interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}
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
interface ILoginUserPayload {
  email: string;
  password: string;
}

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

export const authService = {
  registerpatient,
  LoginUser,
  getMe,
  getNewToken,
};
