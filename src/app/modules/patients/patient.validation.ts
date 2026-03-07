import z, { date } from "zod";
import { BloodGroup, Gender } from "../../../generated/prisma/enums";

const updatePateintProfileZodValidation = z.object({
  patientInfo: z
    .object({
      name: z
        .string("Name Must be a string")
        .min(2, "Name must be at least 2 characters long")
        .optional(),
      profilePhoto: z.url("Profile Photo must be a valid URL").optional(),
      contactNumber: z
        .string("Contact Number Must be a string")
        .min(10, "Contact Number must be at least 10 characters long")
        .optional(),
      address: z
        .string("Address Must be a string")
        .min(5, "Address must be at least 5 characters long")
        .optional(),
    })
    .optional(),
  patientHealthData: z
    .object({
      gender: z.enum([Gender.FEMALE, Gender.MALE, Gender.OTHER]).optional(),
      dateOfBirth: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)))
        .optional(),
      bloodGroup: z
        .enum([
          BloodGroup.A_POSITIVE,
          BloodGroup.A_NEGATIVE,
          BloodGroup.B_POSITIVE,
          BloodGroup.B_NEGATIVE,
          BloodGroup.AB_POSITIVE,
          BloodGroup.AB_NEGATIVE,
          BloodGroup.O_POSITIVE,
          BloodGroup.O_NEGATIVE,
        ])
        .optional(),
      hasAllergies: z.boolean().optional(),
      hasDiabetes: z.boolean().optional(),
      height: z.string().optional(),
      weight: z.string().optional(),
      smokingStatus: z.boolean().optional(),
      dietaryPreferences: z.string().optional(),
      pregnancyStatus: z.boolean().optional(),
      mentalHealthHistory: z.string().optional(),
      immunizationStatus: z.string().optional(),
      hasPastSurgeries: z.boolean().optional(),
      recentAnxiety: z.boolean().optional(),
      recentDepression: z.boolean().optional(),
      maritalStatus: z.string().optional(),
    })
    .optional(),

  medicalReports: z
    .array(
      z.object({
        shouldDelete: z.boolean().optional(),
        reportId: z.uuid().optional(),
        reportName: z.string().optional(),
        reportLink: z.url("Report Link must be a valid URL").optional(),
      }),
    )
    .optional()
    .refine(
      (reports) => {
        if (!reports || reports.length === 0) return true;
        for (const report of reports) {
          if (report.shouldDelete && !report.reportId) {
            return false;
          }
          if (report.reportId && !report.shouldDelete) {
            return false;
          }
          if (report.reportLink && !report.reportName) {
            return false;
          }
          if (report.reportName && !report.reportLink) {
            return false;
          }
          return true;
        }
      },
      {
        message:
          "Each report must have either both reportId and shouldDelete or neither, and if reportLink is provided, reportName must also be provided, and vice versa.",
      },
    ),
});

export const PatientValidation = {
  updatePateintProfileZodValidation,
};
