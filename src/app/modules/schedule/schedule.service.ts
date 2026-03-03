import { iQueryParams } from "../../interfaces/query.interface";

const createSchedule = async (payload: any) => {};
const getAllSchedule = async (query: iQueryParams) => {};
const getScheduleById = async (id: string) => {};
const updateSchedule = async (id: string, payload: any) => {};
const deleteSchedule = async (id: string) => {};

export const scheduleService = {
  createSchedule,
  getAllSchedule,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
