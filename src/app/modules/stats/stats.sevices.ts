import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import AppError from "../../middlware/AppError";
import { prisma } from "../../lib/prisma";

const getDashboardStats = async (user: IRequestUser) => {
  let statsData;
  if (user.role === Role.SUPER_ADMIN) {
    statsData = await getSuperAdminStatsData(user);
  } else if (user.role === Role.ADMIN) {
    statsData = await getAdminStatsData(user);
  } else if (user.role === Role.DOCTOR) {
    statsData = await getDoctorStatsData(user);
  } else if (user.role === Role.PATIENT) {
    statsData = await getPatientStatsData(user);
  } else {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to access this resource",
    );
  }
  return statsData;
};
const getSuperAdminStatsData = async (user: IRequestUser) => {
  const appoinmentCount = await prisma.appointment.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const adminCount = await prisma.admin.count();
  const userCount = await prisma.user.count();
  const paymentCount = await prisma.payment.count();
  const superAdminCount = await prisma.admin.count({
    where: {
      user: {
        role: Role.SUPER_ADMIN,
      },
    },
  });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: PaymentStatus.PAID },
  });
  return {
    appoinmentCount,
    doctorCount,
    patientCount,
    adminCount,
    userCount,
    paymentCount,
    superAdminCount,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
};
const getAdminStatsData = async (user: IRequestUser) => {
  const appoinmentCount = await prisma.appointment.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const adminCount = await prisma.admin.count();
  const userCount = await prisma.user.count();
  const paymentCount = await prisma.payment.count();
  //   const superAdminCount = await prisma.admin.count({
  //     where: {
  //       user: {
  //         role: Role.SUPER_ADMIN,
  //       },
  //     },
  //   });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: PaymentStatus.PAID },
  });
  return {
    appoinmentCount,
    doctorCount,
    patientCount,
    adminCount,
    userCount,
    paymentCount,

    totalRevenue: totalRevenue._sum.amount || 0,
  };
};
const getDoctorStatsData = async (user: IRequestUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });
  const reviewCount = await prisma.review.count({
    where: { doctorId: doctorData.id },
  });
  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: { id: true },
    where: { doctorId: doctorData.id },
  });
  const appoinmentCount = await prisma.appointment.count({
    where: { doctorId: doctorData.id },
  });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      appointment: {
        doctorId: doctorData.id,
      },
      status: PaymentStatus.PAID,
    },
  });
  const appoinmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: { id: true },
    where: { doctorId: doctorData.id },
  });

  const formattedAppointmentStatusDistribution =
    appoinmentStatusDistribution.map(({ _count, status }) => ({
      status,
      count: _count.id,
    }));

  return {
    reviewCount,
    patientCount: patientCount.length,
    appoinmentCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    appoinmentStatusDistribution: formattedAppointmentStatusDistribution,
  };
};
const getPatientStatsData = async (user: IRequestUser) => {
  const patientdata = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  const appoinmentCount = await prisma.appointment.count({
    where: { patientId: patientdata.id },
  });
  const reviewCount = await prisma.review.count({
    where: { patientId: patientdata.id },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
    where: {
      patientId: patientdata.id,
    },
  });

  const formattedAppointmentStatusDistribution =
    appointmentStatusDistribution.map(({ _count, status }) => ({
      status,
      count: _count.id,
    }));
  return {
    appoinmentCount,
    reviewCount,
    appointmentStatusDistribution: formattedAppointmentStatusDistribution,
  };
};

export const statsServices = {
  getDashboardStats,
  getSuperAdminStatsData,
  getAdminStatsData,
  getDoctorStatsData,
  getPatientStatsData,
};
