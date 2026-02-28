import { Gender } from "../../../generated/prisma/enums";

export interface IDoctorUpdate {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  registrationNumber?: string;
  experince?: number;
  gender?: Gender;
  appointmentFee?: number;
  qualification?: string;
  currentWorkingPlace?: string;
  designation?: string;
  specialities?: string[];
}
