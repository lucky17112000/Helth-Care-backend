// import { Speciality } from "../../../generated/prisma/client";
import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpeciality = async (payload: Specialty): Promise<Specialty> => {
  const speciality = await prisma.specialty.create({
    data: payload,
  });
  return speciality;
};
//getAllSpecialities()
const getAllSpecialities = async (): Promise<Specialty[]> => {
  const speciality = await prisma.specialty.findMany();
  return speciality;
};
//deleteSpeciality
const deleteSpeciality = async (id: string): Promise<Specialty> => {
  const speciality = await prisma.specialty.delete({
    where: { id },
  });
  return speciality;
};
export const specialityService = {
  createSpeciality,
  getAllSpecialities,
  deleteSpeciality,
};
