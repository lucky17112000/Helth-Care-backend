import status from "http-status";
import {
  AppointmentStatus,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppoinmentPayload } from "./appoinment.interface";
import { v7 as uuidv7 } from "uuid";
import AppError from "../../middlware/AppError";
import { stripe } from "../../../config/stripe.config";
import { success } from "zod";
import { envVars } from "../../../config/env";
//NOTE -  paynow book appoinment
const bookAppoinment = async (
  payload: IBookAppoinmentPayload,
  user: IRequestUser,
) => {
  //TODO -

  const patientData = await prisma.patient.findFirstOrThrow({
    where: { email: user.email },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSschedules = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: scheduleData.id,
    },
  });

  const videoCallingId = String(uuidv7());
  //TODO -
  //transection use korbo because appoimnet newar shate shate payment tao initiate hoye jabe
  //TODO - transection start from here
  const result = await prisma.$transaction(async (tx) => {
    //
    const appoinment = await tx.appointment.create({
      data: {
        doctorId: payload.doctorId,
        scheduleId: payload.scheduleId,
        patientId: patientData.id,
        videoCallingId,
      },
    });
    //
    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });
    //
    //TODO - Payment will be here after implemants payment gatway in the system
    const trasactionId = String(uuidv7());
    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appoinment.id,
        amount: doctorData.appointmentFee,
        transactionId: trasactionId,
      },
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appoinment with DR. ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${envVars.FRONTEND_URL}/dashboard/payment-success?appointmentId=${appoinment.id}&paymentId=${paymentData.id}`,
      metadata: {
        appointmentId: appoinment.id,
        paymentId: paymentData.id,
      },
    });

    //TODO - Payment will be here after implemants payment gatway in the system
    return {
      appoinment,
      paymentData,
      payment_url: session.url,
    };
  });

  //TODO - transection end here
  return {
    appoinment: result.paymentData,
    paymentData: result.paymentData,
    paymentUrl: result.payment_url,
  };
};

//SECTION -  getmy appoinmet start

const getmyAppoinment = async (user: IRequestUser) => {
  //STUB -
  const patientData = await prisma.patient.findUnique({
    where: { email: user?.email },
  });
  const doctorData = await prisma.doctor.findUnique({
    where: { email: user?.email },
  });
  //STUB -

  //STUB - conditional fgetching
  let appoinments: any[] = [];
  if (patientData) {
    appoinments = await prisma.appointment.findMany({
      where: { patientId: patientData?.id },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appoinments = await prisma.appointment.findMany({
      where: { doctorId: doctorData?.id },
      include: {
        patient: true,
        schedule: true,
      },
    });
  } else {
    throw new Error("User not found");
  }
  return appoinments;
  //STUB - conditional fgetching
};
//SECTION -  getmy appoinmet end

//SECTION -> changeappoinment status start

const changeAppoinmentStatus = async (
  appoinmentId: string,
  appoinmentStatus: AppointmentStatus,
  user: IRequestUser,
) => {
  //TODO -
  const appoinmetData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appoinmentId,
    },
    include: {
      doctor: true,
    },
  });
  //TODO -

  if (user?.role === Role.DOCTOR) {
    if (user?.email !== appoinmetData.doctor.email) {
      throw new AppError(status.BAD_REQUEST, "This is not your appointment");
    }
  }
  //TODO - final start update
  return await prisma.appointment.update({
    where: { id: appoinmentId },
    data: { status: appoinmentStatus },
  });
  //TODO - final end update
};
//SECTION -> changeappoinment status end

//SECTION - get single appoinment start

const getMySingleAppointment = async (
  appoinmentId: string,
  user: IRequestUser,
) => {
  //TODO -
  const patientData = await prisma.patient.findUnique({
    where: { email: user?.email },
  });

  const doctorData = await prisma.doctor.findUnique({
    where: { email: user?.email },
  });
  //TODO -

  //TODO Cheaking
  let appoinment;
  if (patientData) {
    appoinment = await prisma.appointment.findFirst({
      where: { id: appoinmentId, patientId: patientData.id },
      include: { doctor: true, schedule: true },
    });
  } else if (doctorData) {
    appoinment = await prisma.appointment.findFirst({
      where: { id: appoinmentId, doctorId: doctorData.id },
      include: {
        patient: true,
        schedule: true,
      },
    });
  }

  if (!appoinment) {
    throw new AppError(status.NOT_FOUND, "Appointment not found");
  }
  //TODO Cheaking
  return appoinment;
};

//SECTION - get single appoinment end

//SECTION - getAllAppoinment start

const getAllAppointments = async () => {
  const appoinment = await prisma.appointment.findMany({
    include: {
      doctor: true,
      patient: true,
      schedule: true,
    },
  });
  return appoinment;
};
//SECTION - getAllAppoinment end

//NOTE - pay later and separte payment

const bookAppoinmentWithPayLater = async (
  payload: IBookAppoinmentPayload,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findFirstOrThrow({
    where: { email: user.email },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSschedules = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: scheduleData.id,
    },
  });

  const videoCallingId = String(uuidv7());
  //TODO -
  //transection use korbo because appoimnet newar shate shate payment tao initiate hoye jabe
  //TODO - transection start from here
  const result = await prisma.$transaction(async (tx) => {
    //
    const appoinment = await tx.appointment.create({
      data: {
        doctorId: payload.doctorId,
        scheduleId: payload.scheduleId,
        patientId: patientData.id,
        videoCallingId,
      },
    });
    //
    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = String(uuidv7());

    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appoinment.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    return {
      appoinmentData: appoinment,
      payment: paymentData,
    };
  });
  return { appoinment: result };
};

const initiatePayment = async (appoinmentId: string, user: IRequestUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  const appoinmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appoinmentId,
      patientId: patientData.id,
    },
    include: {
      doctor: true,
      payment: true,
    },
  });

  if (appoinmentData.payment?.status === PaymentStatus.PAID) {
    throw new AppError(
      status.BAD_REQUEST,
      "Payment already completed for this appointment",
    );
  }

  if (appoinmentData.status === AppointmentStatus.CANCELED) {
    throw new AppError(status.BAD_REQUEST, "Appointment is canceled");
  }

  if (!appoinmentData.payment) {
    throw new AppError(status.NOT_FOUND, "Payment record not found");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Appoinment with DR. ${appoinmentData.doctor.name}`,
          },
          unit_amount: appoinmentData.doctor.appointmentFee * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${envVars.FRONTEND_URL}/dashboard/appoinments`,
    metadata: {
      appointmentId: appoinmentData.id,
      paymentId: appoinmentData.payment.id,
    },
  });
  return {
    paymentUrl: session.url,
  };
};

//NOTE - pay later and separte payment

const cancelUnpaidAppoinments = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const unPaidAppoinments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMinutesAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appoinmentCancel = unPaidAppoinments.map((appoinment) => appoinment.id);
  await prisma.$transaction(async (tx) => {
    await tx.appointment.updateMany({
      where: {
        id: {
          in: appoinmentCancel,
        },
      },
      data: {
        status: AppointmentStatus.CANCELED,
      },
    });

    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appoinmentCancel,
        },
      },
    });
    for (const unPaidAmount of unPaidAppoinments) {
      await tx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: unPaidAmount.doctorId,
            scheduleId: unPaidAmount.scheduleId,
          },
        },
        data: {
          isBooked: false,
        },
      });
    }

    //!SECTION transection end
  });

  //!SECTION-> end
};

export const AppointmentService = {
  bookAppoinment,
  getmyAppoinment,
  changeAppoinmentStatus,
  getMySingleAppointment,
  getAllAppointments,
  bookAppoinmentWithPayLater,
  initiatePayment,
  cancelUnpaidAppoinments,
};
