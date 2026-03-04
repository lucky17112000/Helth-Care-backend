import status from "http-status";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppoinmentPayload } from "./appoinment.interface";
import { v7 as uuidv7 } from "uuid";
import AppError from "../../middlware/AppError";

const bookAppoinment = async (
  payload: IBookAppoinmentPayload,
  user: IRequestUser,
) => {
  //TODO -
  const patientData = await prisma.patient.findFirstOrThrow({
    where: { email: user.email },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSschedules = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: scheduleData.id,
    },
  });

  const videoCallingId = String(uuidv7());
  //TODO -
  //transection use korbo because appoimnet newar shate shate payment tao initiate hoye jabe
  //TODO - transection start from here
  const result = await prisma.$transaction(async (tx) => {
    //
    const appoinment = await tx.appointment.create({
      data: {
        doctorId: payload.doctorId,
        scheduleId: payload.scheduleId,
        patientId: patientData.id,
        videoCallingId,
      },
    });
    //
    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });
    //
    return appoinment;
    //TODO - Payment will be here
  });

  //TODO - transection end here
  return result;
};

//SECTION -  getmy appoinmet start

const getmyAppoinment = async (user: IRequestUser) => {
  //STUB -
  const patientData = await prisma.patient.findUnique({
    where: { email: user?.email },
  });
  const doctorData = await prisma.doctor.findUnique({
    where: { email: user?.email },
  });
  //STUB -

  //STUB - conditional fgetching
  let appoinments: any[] = [];
  if (patientData) {
    appoinments = await prisma.appointment.findMany({
      where: { patientId: patientData?.id },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appoinments = await prisma.appointment.findMany({
      where: { doctorId: doctorData?.id },
      include: {
        patient: true,
        schedule: true,
      },
    });
  } else {
    throw new Error("User not found");
  }
  return appoinments;
  //STUB - conditional fgetching
};
//SECTION -  getmy appoinmet end

//SECTION -> changeappoinment status start

const changeAppoinmentStatus = async (
  appoinmentId: string,
  appoinmentStatus: AppointmentStatus,
  user: IRequestUser,
) => {
  //TODO -
  const appoinmetData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appoinmentId,
    },
    include: {
      doctor: true,
    },
  });
  //TODO -

  if (user?.role === Role.DOCTOR) {
    if (user?.email !== appoinmetData.doctor.email) {
      throw new AppError(status.BAD_REQUEST, "This is not your appointment");
    }
  }
  //TODO - final start update
  return await prisma.appointment.update({
    where: { id: appoinmentId },
    data: { status: appoinmentStatus },
  });
  //TODO - final end update
};
//SECTION -> changeappoinment status end

//SECTION - get single appoinment start

const getMySingleAppointment = async (
  appoinmentId: string,
  user: IRequestUser,
) => {
  //TODO -
  const patientData = await prisma.patient.findUnique({
    where: { email: user?.email },
  });

  const doctorData = await prisma.doctor.findUnique({
    where: { email: user?.email },
  });
  //TODO -

  //TODO Cheaking
  let appoinment;
  if (patientData) {
    appoinment = await prisma.appointment.findFirst({
      where: { id: appoinmentId, patientId: patientData.id },
      include: { doctor: true, schedule: true },
    });
  } else if (doctorData) {
    appoinment = await prisma.appointment.findFirst({
      where: { id: appoinmentId, doctorId: doctorData.id },
      include: {
        patient: true,
        schedule: true,
      },
    });
  }

  if (!appoinment) {
    throw new AppError(status.NOT_FOUND, "Appointment not found");
  }
  //TODO Cheaking
  return appoinment;
};

//SECTION - get single appoinment end

//SECTION - getAllAppoinment start

const getAllAppointments = async () => {
  const appoinment = await prisma.appointment.findMany({
    include: {
      doctor: true,
      patient: true,
      schedule: true,
    },
  });
  return appoinment;
};
//SECTION - getAllAppoinment end

export const AppointmentService = {
  bookAppoinment,
  getmyAppoinment,
  changeAppoinmentStatus,
  getMySingleAppointment,
  getAllAppointments,
};
