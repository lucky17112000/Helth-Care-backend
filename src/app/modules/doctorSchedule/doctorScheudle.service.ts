import { iQueryParams } from "../../interfaces/query.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  ICreateDoctorSchedulePayload,
  IUpdateDoctorSchedulePayload,
} from "./doctorSchedule.interfae";
//TODO -  start: implement doctor schedule service functions
const createDoctorSchedule = async (
  user: IRequestUser,
  payload: ICreateDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  //
  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));
  const result = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });
  return result;
};
//TODO -  end: implement doctor schedule service functions
const getMyDoctorSchedule = (user: IRequestUser, query: iQueryParams) => {};

const getAllDoctorSchedule = (query: iQueryParams) => {};

const getDoctorScheduleById = (doctorId: string, scheduleId: string) => {};

const updateDoctorSchedule = async (
  // id: string,
  user: IRequestUser,
  payload: IUpdateDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: {
      email: user.email,
    },
  });

  const deleteIds = payload.scheduleIds
    .filter((schedule) => schedule.shouldDelete)
    .map((schedule) => schedule.id);

  const createIds = payload.scheduleIds
    .filter((schedule) => !schedule.shouldDelete)
    .map((schedule) => schedule.id);

  const result = await prisma.$transaction(async (tx) => {
    //!SECTION
    await tx.doctorSchedules.deleteMany({
      where: {
        doctorId: doctorData.id,
        scheduleId: {
          in: deleteIds,
        },
      },
    });
    //!SECTION

    //!SECTION

    const doctorScheduleData = createIds.map((scheduleIds) => ({
      doctorId: doctorData.id,
      scheduleId: scheduleIds,
    }));
    const result = await tx.doctorSchedules.createMany({
      data: doctorScheduleData,
    });
    return result;
    //!SECTION
  });
  //
  return result;
};

const deleteDoctorSchedule = (id: string, user: IRequestUser) => {};

export const doctorScheduleService = {
  createDoctorSchedule,
  getMyDoctorSchedule,
  getAllDoctorSchedule,
  getDoctorScheduleById,
  updateDoctorSchedule,
  deleteDoctorSchedule,
};
