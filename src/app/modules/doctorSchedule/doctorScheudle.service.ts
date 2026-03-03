import { iQueryParams } from "../../interfaces/query.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import {
  ICreateDoctorSchedulePayload,
  IUpdateDoctorSchedulePayload,
} from "./doctorSchedule.interfae";

const createDoctorSchedule = (
  user: IRequestUser,
  payload: ICreateDoctorSchedulePayload,
) => {};

const getMyDoctorSchedule = (user: IRequestUser, query: iQueryParams) => {};

const getAllDoctorSchedule = (query: iQueryParams) => {};

const getDoctorScheduleById = (doctorId: string, scheduleId: string) => {};

const updateDoctorSchedule = (
  user: IRequestUser,
  payload: IUpdateDoctorSchedulePayload,
) => {};

const deleteDoctorSchedule = (id: string, user: IRequestUser) => {};

export const doctorScheduleService = {
  createDoctorSchedule,
  getMyDoctorSchedule,
  getAllDoctorSchedule,
  getDoctorScheduleById,
  updateDoctorSchedule,
  deleteDoctorSchedule,
};
