// model Review {
//     id        String   @id @default(uuid()) @db.Uuid
//     rating    Float    @default(0.0)
//     comment   String?  @db.Text
//     createdAt DateTime @default(now())
//     updatedAt DateTime @updatedAt

import z from "zod";

//     appointmentId String      @unique @db.Uuid
//     appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)

//     patientId String  @db.Uuid
//     patient   Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

//     doctorId String @db.Uuid
//     doctor   Doctor @relation(fields: [doctorId], references: [id], onDelete: Cascade)

//     @@index([appointmentId])
//     @@index([patientId])
//     @@index([doctorId])
//     @@map("reviews")
// }
const createReviewSchema = z.object({
  appointmentId: z.string("Appointment ID is required"),
  rating: z
    .number("Rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string("Comment is required").min(1, "Comment cannot be empty"),
});
const updateReviewZodSchema = z.object({
  rating: z
    .number("Rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5")
    .optional(),
  comment: z
    .string("Comment is required")
    .min(1, "Comment cannot be empty")
    .optional(),
});

export const ReviewValidation = {
  createReviewZodSchema: createReviewSchema,
  updateReviewZodSchema,
};
