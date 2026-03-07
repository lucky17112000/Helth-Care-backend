import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";
import { ReviewService } from "./review.services";
import { IRequestUser } from "../../interfaces/requestUser.interface";

export const giveReview = catchasync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const result = await ReviewService.giveReview(user as IRequestUser, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review given successfully",
    data: result,
  });
});

const getAllReviews = catchasync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

const myReviews = catchasync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await ReviewService.myReviews(user as IRequestUser);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My reviews retrieved successfully",
    data: result,
  });
});

const updateReview = catchasync(async (req: Request, res: Response) => {
  const user = req.user;
  const reviewId = req.params.id;
  const payload = req.body;
  const result = await ReviewService.updateReview(
    user as IRequestUser,
    reviewId as string,
    payload,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchasync(async (req: Request, res: Response) => {
  const user = req.user;
  const reviewId = req.params.id;
  const result = await ReviewService.deleteReview(
    user as IRequestUser,
    reviewId as string,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});
export const ReviewController = {
  giveReview,
  getAllReviews,
  myReviews,
  updateReview,
  deleteReview,
};
