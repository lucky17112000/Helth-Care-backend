import { Prisma } from "../../../generated/prisma/client";

export const doctorSearchableFields = [
  "name",
  "email",
  "qualification",
  "designation",
  "currentWorkingPlace",
  "registrationNumber",
  "specialties.specialty.title",
];

export const doctorFilterableFields = [
  "gender",
  "isDeleted",
  "appointmentFee",
  "experience",
  "specialties.specialtyId",
  "currentWorkingPlace",
  "registrationNumber",
  "qualification",
  "designation",
  "user.role",
  "specialties.specialty.title",
];

export const doctorIncludeConfig: Partial<
  Record<
    keyof Prisma.DoctorInclude,
    Prisma.DoctorInclude[keyof Prisma.DoctorInclude]
  >
> = {
  user: true,
  specialties: {
    include: {
      specialty: true,
    },
  },
  appointments: {
    include: {
      patient: true,
      doctor: true,
    },
  },
  doctorSchedules: {
    include: {
      schedule: true,
    },
  },
  prescriptions: true,
  reviews: true,
};
