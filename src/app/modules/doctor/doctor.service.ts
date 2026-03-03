import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middlware/AppError";
import { IDoctorUpdate } from "./doctor.interface";
import { QueryBuilder } from "../../utiles/QueryBuilder";
import { iQueryParams } from "../../interfaces/query.interface";
import {
  doctorFilterableFields,
  doctorIncludeConfig,
  doctorSearchableFields,
} from "./doctor.constant";
import { Doctor, Prisma } from "../../../generated/prisma/client";

const getAllDoctors = async (query: iQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Doctor,
    Prisma.DoctorWhereInput,
    Prisma.DoctorInclude
  >(prisma.doctor, query, {
    searchableFields: doctorSearchableFields,
    filterableFields: doctorFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .include({
      user: true,
      specialties: true,
    })
    .dynamicInclude(doctorIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });
  return doctor;
};

const updateDoctor = async (id: string, payload: IDoctorUpdate) => {
  const existingDoctor = await prisma.doctor.findUnique({
    where: { id },
  });
  if (!existingDoctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }
  //speciality sepeate kore pdate korte hobe karon create korar somoy alada korei create kore rekecilam
  const { specialities, ...doctorData } = payload;
  const updatdeDoctor = await prisma.doctor.update({
    where: { id },
    data: doctorData,
    include: {
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });

  // ebar chek korbo speciality body te patanu hoyece kina then update kore dibo
  if (specialities && specialities.length > 0) {
    // prothome existing speciality gula delete kore dibo
    await prisma.doctorSpecialty.deleteMany({
      where: {
        doctorId: id,
      },
    });
    const specialitiesData = specialities?.map((specialityId) => ({
      doctorId: id,
      specialtyId: specialityId,
    }));
    await prisma.doctorSpecialty.createMany({
      data: specialitiesData || [],
    });
    const result = await prisma.doctor.findUnique({
      where: { id },
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });
    return {
      ...result,
      specialties: result?.specialties.map((spec) => spec.specialty),
    };
  }

  return {
    ...updatdeDoctor,
    specialties: updatdeDoctor?.specialties.map((spec) => spec.specialty),
  };
};
export const doctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
};
