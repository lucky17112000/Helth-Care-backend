import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middlware/AppError";
import { IDoctorUpdate } from "./doctor.interface";

const getAllDoctors = async () => {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });
  return doctors;
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
  return {
    doctor,
    // specialities: doctor?.specialties.map((spec) => spec.specialty),
    // specialties: doctor?.specialties.map((s) => s.specialty),
  };
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
