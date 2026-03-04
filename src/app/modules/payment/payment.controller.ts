import { Request, Response } from "express";
import { catchasync } from "../../shared/catchAsync";
import { envVars } from "../../../config/env";
import { stripe } from "../../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendReponse";
import status from "http-status";

const handleStripeWebhookEvent = catchasync(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string;
    const webHookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
    if (!signature || !webHookSecret) {
      console.error("Missing Stripe signature or webhook secret");
      return res
        .status(400)
        .json({ message: "Missing Stripe signature or webhook secret" });
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webHookSecret,
      );
    } catch (error: any) {
      console.error("Error verifying Stripe webhook signature", error);
      return res
        .status(400)
        .json({ message: "Invalid Stripe webhook signature" });
    }

    try {
      const result = await PaymentService.handleStripeWebhookEvent(event);
      sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      console.error("Error handling Stripe webhook event", error);
      return res
        .status(500)
        .json({ message: "Error handling Stripe webhook event" });
    }
  },
);

export const PaymentController = {
  handleStripeWebhookEvent,
};
