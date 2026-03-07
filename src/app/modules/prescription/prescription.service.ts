import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  ICreatePrescriptionPayload,
  IUpdatePrescriptionPayload,
} from "./prescription.interface";
import AppError from "../../middlware/AppError";
import status from "http-status";
import generatePrescriptionPDF from "./prescription.utils";
import {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../../config/cloudinary.config";
import { sendEmail } from "../../utiles/email";
import { spec } from "node:test/reporters";
import { Role } from "../../../generated/prisma/enums";

const givePrescription = async (
  user: IRequestUser,
  payload: ICreatePrescriptionPayload,
) => {
  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: { email: user.email },
  });
  const appoinmentData = await prisma.appointment.findFirstOrThrow({
    where: { id: payload.appointmentId },
    include: {
      patient: true,
      doctor: {
        include: {
          specialties: true,
        },
      },
      schedule: true,
    },
  });
  if (appoinmentData.doctorId !== doctorData.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "You are not authorized to give prescription for this appointment",
    );
  }

  const isAlreadyPrescribed = await prisma.prescription.findFirst({
    where: { appointmentId: payload.appointmentId },
  });
  if (isAlreadyPrescribed) {
    throw new AppError(
      status.BAD_REQUEST,
      "A prescription already exists for this appointment",
    );
  }
  const data = await prisma.$transaction(async (tx) => {
    const followUpdate = new Date(payload.followUpDate);

    const result = await tx.prescription.create({
      data: {
        ...payload,
        followUpDate: followUpdate,
        doctorId: doctorData.id,
        patientId: appoinmentData.patientId,
      },
    });
    //pdf gebrate koro and cloudinary teuplaod koroand link nia pdf url update koro
    const pdfBuffer = await generatePrescriptionPDF({
      doctorName: doctorData.name,
      patientName: appoinmentData.patient.name,
      appointmentDate: appoinmentData.schedule.startDateTime,
      issuedDate: new Date().toLocaleDateString(),

      instructions: payload.instructions,
      followUpDate: followUpdate,
      doctorEmail: doctorData.email,
      patientEmail: appoinmentData.patient.email,
      prescriptionId: result.id,
      createdAt: new Date(),
    });

    const fileName = `prescription_${Date.now()}.pdf`;
    const uploadedFile = await uploadFileToCloudinary(pdfBuffer, fileName);
    const pdfUrl = uploadedFile.secure_url;
    const updatedPrescriptiion = await tx.prescription.update({
      where: { id: result.id },
      data: { pdfUrl },
    });

    //prescription email pathao patient ke with pdf link
    try {
      const patient = appoinmentData.patient;
      const doctor = appoinmentData.doctor;
      await sendEmail({
        to: patient.email,
        subject: "New Prescription from Dr. " + doctor.name,
        templateName: "prescription",
        templateData: {
          doctorName: doctor.name,
          patientName: patient.name,
          specialization: doctor.specialties
            .map((s: any) => s.title)
            .join(", "),
          appointmentDate:
            appoinmentData.schedule.startDateTime.toLocaleString(),
          followUpDate: followUpdate.toLocaleDateString(),
          pdfUrl: pdfUrl,
        },
        attachments: [
          {
            filename: fileName,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (error) {
      console.error("Error sending prescription email:", error);
    }
    return updatedPrescriptiion;
  });
  return data;
};

const myPrescriptions = async (user: IRequestUser) => {
  const userExists = await prisma.user.findUnique({
    where: { email: user.email },
  });
  if (!userExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (userExists.role === Role.DOCTOR) {
    const result = await prisma.prescription.findMany({
      where: {
        doctor: { email: user.email },
      },
      include: {
        doctor: true,
        patient: true,
        appointment: true,
      },
    });
    return result;
  }
  if (userExists.role === Role.PATIENT) {
    const result = await prisma.prescription.findMany({
      where: {
        patient: { email: user.email },
      },
      include: {
        doctor: true,
        patient: true,
        appointment: true,
      },
    });
    return result;
  }
};

const getAllPrescriptions = async () => {
  const result = await prisma.prescription.findMany({
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });
  return result;
};
const updatePrescription = async (
  user: IRequestUser,
  prescriptionId: string,
  payload: IUpdatePrescriptionPayload,
) => {
  const isUserExists = await prisma.user.findUnique({
    where: { email: user.email },
  });
  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  const prescriptiondata = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      doctor: true,
      patient: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });
  if (user?.email !== prescriptiondata?.doctor.email) {
    throw new AppError(
      status.UNAUTHORIZED,
      "You are not authorized to update this prescription",
    );
  }
  //!SECTION
  const updatedInstructions =
    payload.instructions || prescriptiondata?.instructions;
  const updatedFollowUpdate = payload.followUpDate
    ? new Date(payload.followUpDate)
    : prescriptiondata?.followUpDate;

  //TODO -  generate new pfd
  const pdfBuffer = await generatePrescriptionPDF({
    doctorName: prescriptiondata?.doctor.name,
    patientName: prescriptiondata?.patient.name,
    appointmentDate: prescriptiondata?.appointment.schedule.startDateTime,
    issuedDate: new Date().toLocaleDateString(),
    instructions: updatedInstructions,
    followUpDate: updatedFollowUpdate,
    doctorEmail: prescriptiondata?.doctor.email,
    patientEmail: prescriptiondata?.patient.email,
    prescriptionId: prescriptiondata?.id,
    createdAt: new Date(),
  });
  //upload pdf to cloudinary
  const filename = `prescription-update-${Date.now()}.pdf`;
  const uploadFile = await uploadFileToCloudinary(pdfBuffer, filename);
  const pdfUrl = uploadFile.secure_url;

  //i hveto delete old prescription pdf from cloudinary
  if (prescriptiondata?.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptiondata.pdfUrl);
    } catch (error) {
      console.error("Error deleting old prescription PDF:", error);
    }
  }
  //update prescription database
  const result = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      instructions: updatedInstructions,
      followUpDate: updatedFollowUpdate,
      pdfUrl: pdfUrl,
    },
    include: {
      doctor: true,
      patient: true,
      appointment: {
        include: {
          schedule: true,
        },
      },
    },
  });
  //send update email to patient with new pdf link
  try {
    await sendEmail({
      to: result.patient.email,
      subject: "Updated Prescription from Dr. " + result.doctor.name,
      templateName: "prescription",
      templateData: {
        patientName: result.patient.name,
        doctorName: result.doctor.name,
        specialization: "Healthcare Provider",
        prescriptionId: result.id,
        appointmentDate: new Date(
          result.appointment.schedule.startDateTime,
        ).toLocaleString(),
        issuedDate: new Date(result.createdAt).toLocaleDateString(),
        followUpDate: new Date(result.followUpDate).toLocaleDateString(),
        instructions: result.instructions,
        pdfUrl: pdfUrl,
      },
      attachments: [
        {
          filename: `Prescription-${result.id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (error) {
    console.error("Error sending updated prescription email:", error);
  }
  //!SECTION
  return result;
};
const deletePrescription = async (
  user: IRequestUser,
  prescriptionId: string,
) => {
  const userExists = await prisma.user.findMany({
    where: { email: user.email },
  });
  if (!userExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  const prescriptiondata = await prisma.prescription.findUniqueOrThrow({
    where: { id: prescriptionId },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });
  if (user?.email !== prescriptiondata?.doctor.email) {
    throw new AppError(
      status.UNAUTHORIZED,
      "You are not authorized to delete this prescription",
    );
  }
  if (prescriptiondata?.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescriptiondata.pdfUrl);
    } catch (error) {
      console.error("Error deleting prescription PDF from cloudinary:", error);
    }
  }
  const result = await prisma.prescription.delete({
    where: { id: prescriptionId },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });
  return result;
};

export const PrescriptionService = {
  givePrescription,
  myPrescriptions,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
};
