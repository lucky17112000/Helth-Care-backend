import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  //!SECTION

  const existingPayment = await prisma.payment.findFirst({
    where: { stripeEventId: event.id },
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }
  //!SECTION
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const appointmentId = session.metadata?.appoinmentId;
      const paymentId = session.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.error("Missing appointmentId or paymentId in session metadata");
        return {
          message: "Missing appointmentId or paymentId in session metadata",
        };
      }
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });
      if (!appointment) {
        console.error(`Appointment with id ${appointmentId} not found`);
        return { message: `Appointment with id ${appointmentId} not found` };
      }
      //!SECTION
      await prisma.$transaction(async (tx) => {
        //TODO -
        await tx.appointment.update({
          where: { id: appointmentId },
          data: {
            paymentStatus:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
          },
        });
        //TODO -
        //TODO -
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            stripeEventId: event.id,
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
          },
        });
        //TODO -
      });
      //!SECTION
      console.log(
        `Payment for appointment ${appointmentId} updated to ${session.payment_status}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      console.log(`Checkout session ${session.id} expired`);
      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      console.log(`Payment intent ${session.id} failed`);
      break;
    }
    default:
      console.log(`Unhandle event type ${event.type}`);
  }
  return { message: `WebHook Event ${event.id} processed successfully` };
};
export const PaymentService = {
  handleStripeWebhookEvent,
};
