import { addHours, addMilliseconds, addMinutes, format } from "date-fns";
import { iQueryParams } from "../../interfaces/query.interface";
import { ICreateSchedulePayload } from "./schedule.Interface";
import { convertDateTime } from "./schedule.util";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utiles/QueryBuilder";
import { Prisma, Schedule } from "../../../generated/prisma/client";
import { scheduleIncludeConfig } from "./schedule.constant";
//!SECTION
const createSchedule = async (payload: ICreateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const interval = 30;
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  const schedules = [];

  while (currentDate <= lastDate) {
    //   const startDateTime = new Date(
    //     addMinutes(
    //       addHours(
    //         `${format(currentDate, "yyyy-MM-dd")}`,
    //         Number(startTime.split(":")[0])
    //       ),//ANCHOR - addHours end
    //       Number(startTime.split(":")[1])
    //     )//ANCHOR - addminute end
    //   )
    // }

    const formattedStartDateTimeStart = format(currentDate, "yyyy-MM-dd"); // "2026-03-03"
    const baseDate = new Date(formattedStartDateTimeStart); // 2026-03-03 00:00:00
    const timeParts = startTime.split(":"); // ["09", "00"]
    const hourString = timeParts[0]; // "09"
    const minuteString = timeParts[1]; // "00"
    const hour = Number(hourString); // 9
    const minute = Number(minuteString); // 0
    const dateWithHour = addHours(baseDate, hour); // 2026-03-03 09:00:00

    const finalDate = addMinutes(dateWithHour, minute);
    let startDateTime = finalDate;

    const formattedDateTimeEnd = format(currentDate, "yyyy-MM-dd"); // "2026-03-03"
    const baseDateEnd = new Date(formattedDateTimeEnd); // 2026-03-03 00:00:00
    const timePartsEnd = endTime.split(":"); // ["17", "00"]
    const hourStringEnd = timePartsEnd[0]; // "17"
    const minuteStringEnd = timePartsEnd[1]; // "00"
    const hourEnd = Number(hourStringEnd);
    const minuteEnd = Number(minuteStringEnd);
    const dateWithHourEnd = addHours(baseDateEnd, hourEnd); // 2026-03-03 17:00:00
    const finalDateEnd = addMinutes(dateWithHourEnd, minuteEnd);
    const endDateTime = finalDateEnd;

    while (startDateTime < endDateTime) {
      const slotEnd = addMinutes(startDateTime, interval);
      const s = await convertDateTime(startDateTime); // convert in utc
      const e = await convertDateTime(slotEnd); // convert in utc
      const scheduleData = {
        startDateTime: s,
        endDateTime: e,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });
      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }
      //!SECTION data create

      startDateTime = slotEnd; //increment by 30 in inner loop
    }
    //NOTE - inner whileloop end
    currentDate.setDate(currentDate.getDate() + 1); //increment by 1 day in outer loop
  }
  //NOTE - outer whileloop end
  return schedules;
};
//!SECTION
const getAllSchedule = async (query: iQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Schedule,
    Prisma.ScheduleWhereInput,
    Prisma.ScheduleInclude
  >(prisma.schedule, query, {
    searchableFields: ["id"],
    filterableFields: [],
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(scheduleIncludeConfig)
    .sort()
    .fields()
    .execute();
  return result;
};

//TODO -
const getScheduleById = async (id: string) => {
  const result = await prisma.schedule.findUnique({
    where: {
      id: id,
    },
  });
  return result;
};
//TODO -
const updateSchedule = async (id: string, payload: any) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  const formattedStartDateTimeStart = format(currentDate, "yyyy-MM-dd"); // "2026-03-03"
  const baseDate = new Date(formattedStartDateTimeStart); // 2026-03-03 00:00:00
  const timeParts = startTime.split(":"); // ["09", "00"]
  const hourString = timeParts[0]; // "09"
  const minuteString = timeParts[1]; // "00"
  const hour = Number(hourString); // 9
  const minute = Number(minuteString); // 0
  const dateWithHour = addHours(baseDate, hour); // 2026-03-03 09:00:00

  const finalDate = addMinutes(dateWithHour, minute);
  const startDateTime = finalDate;

  const formattedDateTimeEnd = format(currentDate, "yyyy-MM-dd"); // "2026-03-03"
  const baseDateEnd = new Date(formattedDateTimeEnd); // 2026-03-03 00:00:00
  const timePartsEnd = endTime.split(":"); // ["17", "00"]
  const hourStringEnd = timePartsEnd[0]; // "17"
  const minuteStringEnd = timePartsEnd[1]; // "00"
  const hourEnd = Number(hourStringEnd);
  const minuteEnd = Number(minuteStringEnd);
  const dateWithHourEnd = addHours(baseDateEnd, hourEnd); // 2026-03-03 17:00:00
  const finalDateEnd = addMinutes(dateWithHourEnd, minuteEnd);
  const endDateTime = finalDateEnd;

  const result = await prisma.schedule.update({
    where: {
      id: id,
    },
    data: {
      startDateTime: startDateTime,
      endDateTime: endDateTime,
    },
  });
  return result;
};
const deleteSchedule = async (id: string) => {
  const result = await prisma.schedule.delete({
    where: {
      id: id,
    },
  });
  return {
    success: true,
    data: result,
  };
};

export const scheduleService = {
  createSchedule,
  getAllSchedule,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
