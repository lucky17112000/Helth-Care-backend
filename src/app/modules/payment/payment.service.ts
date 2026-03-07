import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { generateInvoicePdf } from "./payment.utiles";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";
import { sendEmail } from "../../utiles/email";

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
      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.error("Missing appointmentId or paymentId in session metadata");
        return {
          message: "Missing appointmentId or paymentId in session metadata",
        };
      }
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: true,
          schedule: true,
          payment: true,
        },
      });
      if (!appointment) {
        console.error(`Appointment with id ${appointmentId} not found`);
        return { message: `Appointment with id ${appointmentId} not found` };
      }

      let pdfBuffer: Buffer | null = null;
      //!SECTION
      const result = await prisma.$transaction(async (tx) => {
        //TODO -
        const updateAppoinment = await tx.appointment.update({
          where: { id: appointmentId },
          data: {
            paymentStatus:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
          },
        });

        let invoiceUrl: string | null = null;
        if (session.payment_status === "paid") {
          try {
            pdfBuffer = await generateInvoicePdf({
              invoiceId: appointment.payment?.id || paymentId,
              patientName: appointment.patient.name,
              patientEmail: appointment.patient.email,
              doctorName: appointment.doctor.name,
              appointmentDate: appointment.schedule.startDateTime.toString(),
              amount: appointment.payment?.amount || 0,
              transactionId: appointment.payment?.transactionId || "",
              paymentDate: new Date().toISOString(),
            });

            const cloudinnaryUpload = await uploadFileToCloudinary(
              pdfBuffer,
              `ph-healthcare/invoices/invoice-${paymentId}-${Date.now()}.pdf`,
            );
          } catch (error) {
            console.error("Error generating invoice PDF:", error);
          }
        }

        //TODO -
        //TODO -
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            stripeEventId: event.id,
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
            invoiceUrl: invoiceUrl,
          },
        });
        return { updateAppoinment, updatedPayment, invoiceUrl };
        //TODO -
      });

      if (session.payment_status === "paid") {
        try {
          await sendEmail({
            to: appointment.patient.email,
            subject: `Payment Confirmation & Invoice - Appointment with ${appointment.doctor.name}`,
            templateName: "invoice",
            templateData: {
              patientName: appointment.patient.name,
              invoiceId: appointment.payment?.id || paymentId,
              transactionId: appointment.payment?.transactionId || "",
              paymentDate: new Date().toLocaleDateString(),
              doctorName: appointment.doctor.name,
              appointmentDate: new Date(
                appointment.schedule.startDateTime,
              ).toLocaleDateString(),
              amount: appointment.payment?.amount || 0,
              invoiceUrl: result.invoiceUrl,
            },
            attachments: [
              {
                filename: `Invoice-${paymentId}.pdf`,
                content: pdfBuffer || Buffer.from(""), // Attach PDF if generated, else empty buffer
                contentType: "application/pdf",
              },
            ],
          });

          console.log(`✅ Invoice email sent to ${appointment.patient.email}`);
        } catch (error) {
          console.error("Error uploading invoice PDF to Cloudinary:", error);
        }
      }
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
