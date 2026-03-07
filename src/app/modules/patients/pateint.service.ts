import { deleteFileFromCloudinary } from "../../../config/cloudinary.config";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";

import {
  IUpdatePatientHealthDataPayload,
  iUpdatePatientProfilePayload,
} from "./patient.interface";
import { convertToDateToTime } from "./patient.util";

const updateMyProfile = async (
  user: IRequestUser,
  payload: iUpdatePatientProfilePayload,
) => {
  //!SECTION
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
    include: {
      patientHealthData: true,
      medicalReports: true,
    },
  });
  //!SECTION
  //!SECTION transection start
  const result = await prisma.$transaction(async (tx) => {
    if (payload.patientInfo) {
      await tx.patient.update({
        where: { id: patientData.id },
        data: { ...payload.patientInfo },
      });
    }
    if (payload.patientInfo?.name || payload.patientInfo?.profilePhoto) {
      const userData = {
        name: payload.patientInfo?.name
          ? payload.patientInfo.name
          : patientData.name,
        image: payload.patientInfo?.profilePhoto
          ? payload.patientInfo.profilePhoto
          : patientData.profilePhoto,
      };
      //!SECTION
      await tx.user.update({
        where: {
          id: patientData.userId,
        },
        data: {
          ...userData,
        },
      });
      //!SECTION
    }
    if (payload.patientHealthData) {
      const helthDataToSave: IUpdatePatientHealthDataPayload = {
        ...payload.patientHealthData,
      };
      if (payload.patientHealthData.dateOfBirth) {
        helthDataToSave.dateOfBirth = convertToDateToTime(
          typeof helthDataToSave.dateOfBirth === "string"
            ? helthDataToSave.dateOfBirth
            : undefined,
        ) as Date;
      }
      await tx.patientHealthData.upsert({
        where: { patientId: patientData.id },
        update: helthDataToSave,
        create: {
          patientId: patientData.id,
          ...helthDataToSave,
        },
      });
    }
    if (
      payload.medicalReports &&
      Array.isArray(payload.medicalReports) &&
      payload.medicalReports.length > 0
    ) {
      for (const report of payload.medicalReports) {
        if (report.shouldDelete && report.reportId) {
          const deleteReport = await tx.medicalReport.delete({
            where: {
              id: report.reportId,
            },
          });
          if (deleteReport.reportLink) {
            await deleteFileFromCloudinary(deleteReport.reportLink);
          }
        } else if (report.reportName && report.reportLink) {
          await tx.medicalReport.create({
            data: {
              patientId: patientData.id,
              reportName: report.reportName,
              reportLink: report.reportLink,
            },
          });
        }
      }
    }
  });
  //!SECTION transection end
  const resultData = await prisma.patient.findUnique({
    where: { id: patientData.id },
    include: {
      user: true,
      patientHealthData: true,
      medicalReports: true,
    },
  });
  return resultData;
};
export const PatientService = {
  updateMyProfile,
};
