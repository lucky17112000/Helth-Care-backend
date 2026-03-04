import { iQueryParams } from "../../interfaces/query.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utiles/QueryBuilder";
import { doctorIncludeConfig } from "../doctor/doctor.constant";
import {
  doctorScheduleFilterableFields,
  doctorScheduleIncludeConfig,
  doctorScheduleSearchableFields,
} from "./doctorSchedule.constant";
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
const getMyDoctorSchedule = async (user: IRequestUser, query: iQueryParams) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });
  //!SECTION query builderstart
  const queryBuilder = new QueryBuilder(
    prisma.doctorSchedules,
    {
      doctorId: doctorData.id,
      ...query,
    },
    {
      filterableFields: doctorScheduleFilterableFields,
      searchableFields: doctorScheduleSearchableFields,
    },
  );

  const doctorSchedules = await queryBuilder
    .search()
    .filter()
    .paginate()
    .include(doctorScheduleIncludeConfig)
    .sort()
    .fields()
    .execute();
  return doctorSchedules;

  //!SECTION query builderend
};

const getAllDoctorSchedule = async (query: iQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.doctorSchedules, query, {
    searchableFields: doctorScheduleSearchableFields,
    filterableFields: doctorScheduleFilterableFields,
  });

  const doctorSchedules = await queryBuilder
    .search()
    .filter()
    .paginate()
    .include(doctorScheduleIncludeConfig)
    .sort()
    .fields()
    .execute();

  return doctorSchedules;
};

const getDoctorScheduleById = (doctorId: string, scheduleId: string) => {
  const result = prisma.doctorSchedules.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId,
        scheduleId,
      },
    },
    include: {
      doctor: true,
      schedule: true,
    },
  });
  return result;
};

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

const deleteDoctorSchedule = async (id: string, user: IRequestUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });
  return await prisma.doctorSchedules.deleteMany({
    where: {
      isBooked: false,
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: id,
      },
    },
  });
};

export const doctorScheduleService = {
  createDoctorSchedule,
  getMyDoctorSchedule,
  getAllDoctorSchedule,
  getDoctorScheduleById,
  updateDoctorSchedule,
  deleteDoctorSchedule,
};
