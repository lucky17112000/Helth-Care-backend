import { Role, Speciality } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "./user.interface";
//ekhane doctor create kora dorker .tai amra better auth die doctor k signin korie shatre shate doctor er data ekhan thekei create kore felbo by transection and amader doctor create korar somoy speciality o nite hobe tai speciality er id gula niye ashte hobe and check korte hobe je speciality gula ache kina .tarpor doctor create korbo and doctor er shathe speciality o link kore debo accorading to my database design

const createDoctor = async (payload: ICreateDoctorPayload) => {
  const specialities: Speciality[] = [];
  for (const specialityId of payload.specialities) {
    const speciality = await prisma.speciality.findUnique({
      where: {
        id: specialityId,
      },
    });
    if (speciality) specialities.push(speciality);
    else throw new Error(`Speciality with id ${specialityId} not found`);
  }
  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.doctor.email,
    },
  });
  if (userExists)
    throw new Error(`User with email ${payload.doctor.email} already exists`);
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.doctor.email,
      password: payload.password,
      role: Role.DOCTOR,
      name: payload.doctor.name,
      needPasswordChange: true,
    },
  });

  //transaction for create doctor
  try {
    const result = await prisma.$transaction(async (tx) => {
      const doctorData = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...payload.doctor,
        },
      });

      const doctorSpecialityData = specialities.map((speciality) => {
        return {
          doctorId: doctorData.id,
          specialityId: speciality.id,
        };
      });
      await tx.doctorSpecilaity.createMany({
        data: doctorSpecialityData,
      });
      const doctor = await tx.doctor.findUnique({
        where: {
          id: doctorData.id,
        },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          phone: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experince: true,
          gender: true,
          appointmentFee: true,
          qualification: true,
          currentWorkingPlace: true,
          designation: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              emailVerified: true,
              createdAt: true,
              updatedAt: true,
              image: true,
              isDeleted: true,
              deletedAt: true,
            },
          },
          specialities: {
            select: {
              speciality: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });
      return doctor;
    });

    return result;
  } catch (error) {
    console.error("Error creating doctor:", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
  }
};

export const UserService = {
  createDoctor,
};
