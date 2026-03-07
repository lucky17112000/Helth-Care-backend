import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import AppError from "../../middlware/AppError";
import { ICreateReview, IUpdateReviewPayload } from "./review.interface";

const giveReview = async (user: IRequestUser, payload: ICreateReview) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  const appoinmentData = await prisma.appointment.findUniqueOrThrow({
    where: { id: payload.appointmentId },
  });

  if (appoinmentData.paymentStatus !== PaymentStatus.PAID) {
    throw new AppError(status.BAD_REQUEST, "You can only review after payment");
  }
  if (appoinmentData.patientId !== patientData.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review your own appointments",
    );
  }
  const isReview = await prisma.review.findFirst({
    where: { appointmentId: payload.appointmentId },
  });
  if (isReview) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already reviewed this appointment",
    );
  }
  //!SECTION transection because we have to update all related tables
  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        ...payload,
        patientId: patientData.id,
        doctorId: appoinmentData.doctorId,
      },
    });
    const averageRating = await tx.review.aggregate({
      where: { doctorId: appoinmentData.doctorId },
      _avg: { rating: true },
    });

    await tx.doctor.update({
      where: { id: appoinmentData.doctorId },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });
    return review;
  });
  //!SECTION transection because we have to update all related tables
  return result;
};

const getAllReviews = async () => {
  const reviews = await prisma.review.findMany({
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });
  return reviews;
};

const myReviews = async (user: IRequestUser) => {
  const userExist = await prisma.user.findUniqueOrThrow({
    where: { email: user.email },
  });
  if (!userExist) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (userExist.role === Role.DOCTOR) {
    const doctorReview = await prisma.review.findMany({
      where: { doctorId: userExist.id },
      include: {
        patient: true,
        appointment: true,
      },
    });
    return doctorReview;
  }
  if (userExist.role === Role.PATIENT) {
    const patientReview = await prisma.review.findMany({
      where: { patientId: userExist.id },
      include: {
        doctor: true,
        appointment: true,
      },
    });

    return patientReview;
  }
};

const updateReview = async (
  user: IRequestUser,
  reviewId: string,
  payload: IUpdateReviewPayload,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });
  const reviewData = await prisma.review.findFirstOrThrow({
    where: { id: reviewId },
  });
  if (patientData.id !== reviewData.patientId) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only update your own reviews",
    );
  }
  //!SECTION
  const result = await prisma.$transaction(async (tx) => {
    const updateReview = await tx.review.update({
      where: { id: reviewId },
      data: { ...payload },
    });

    const averageRating = await tx.review.aggregate({
      where: { doctorId: reviewData.doctorId },
      _avg: { rating: true },
    });
    await tx.doctor.update({
      where: { id: reviewData.doctorId },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });
    return updateReview;
  });
  //!SECTION
  return result;
};

const deleteReview = async (user: IRequestUser, reviewId: string) => {
  const patientdata = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });
  const reviewData = await prisma.review.findFirstOrThrow({
    where: { id: reviewId },
  });
  if (patientdata.id !== reviewData.patientId) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only delete your own reviews",
    );
  }
  //!SECTION
  const result = await prisma.$transaction(async (tx) => {
    const deletedReview = await tx.review.delete({
      where: {
        id: reviewId,
      },
    });
    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: deletedReview.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: deletedReview.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });
    return deletedReview;
  });
  //!SECTION
  return result;
};
export const ReviewService = {
  giveReview,
  getAllReviews,
  myReviews,
  updateReview,
  deleteReview,
};
