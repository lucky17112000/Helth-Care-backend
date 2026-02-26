import { Role, User, UserStatus } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
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
    throw new Error("Failed to register patient");
  }
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
    throw new Error("User is blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new Error("User is deleted");
  }

  return data;
};

export const authService = {
  registerpatient,
  LoginUser,
};
