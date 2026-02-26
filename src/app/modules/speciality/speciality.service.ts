import { Speciality } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpeciality = async (payload: Speciality): Promise<Speciality> => {
  const speciality = await prisma.speciality.create({
    data: payload,
  });
  return speciality;
};
//getAllSpecialities()
const getAllSpecialities = async (): Promise<Speciality[]> => {
  const speciality = await prisma.speciality.findMany();
  return speciality;
};
//deleteSpeciality
const deleteSpeciality = async (id: string): Promise<Speciality> => {
  const speciality = await prisma.speciality.delete({
    where: { id },
  });
  return speciality;
};
export const specialityService = {
  createSpeciality,
  getAllSpecialities,
  deleteSpeciality,
};
