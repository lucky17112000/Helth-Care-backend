import { BloodGroup, Gender } from "../../../generated/prisma/enums";

export interface IUpdatePatientInfroPayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
}

export interface IUpdatePatientHealthDataPayload {
  gender: Gender;
  dateOfBirth: Date;
  bloodGroup: BloodGroup;
  hasAllergies: boolean;
  hasDiabetes: boolean;
  height: string;
  weight: string;
  smokingStatus: boolean;
  dietaryPreferences?: string;
  pregnancyStatus: boolean;
  mentalHealthHistory?: string;
  immunizationStatus?: string;
  hasPastSurgeries: boolean;
  recentAnxiety: boolean;
  recentDepression: boolean;
  maritalStatus?: string;
}

export interface iUpdatePateintMedicalReportPayload {
  reportName?: string;
  reportLink?: string;
  shouldDelete?: boolean;
  reportId?: string;
}

export interface iUpdatePatientProfilePayload {
  patientInfo?: IUpdatePatientInfroPayload;
  patientHealthData?: IUpdatePatientHealthDataPayload;
  medicalReports?: iUpdatePateintMedicalReportPayload[];
}
