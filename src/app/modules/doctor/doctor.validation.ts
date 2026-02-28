import z from "zod";

export const updateDoctorValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    profilePhoto: z.string().url().optional(),
    contactNumber: z.string().optional(),
    address: z.string().optional(),
    registrationNumber: z.string().optional(),
    experince: z
      .number()
      .int("Experince Must be hold number")
      .nonnegative("Experince Must be a non-negative number")
      .optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    appointmentFee: z
      .number()
      .nonnegative("Appointment fee must be a non-negative number")
      .optional(),
    qualification: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
    specialities: z
      .array(z.uuid("Each speciality must be a valid UUID"))
      .optional(),
  }),
});
