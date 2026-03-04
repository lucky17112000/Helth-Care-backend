export interface IBookAppoinmentPayload {
  doctorId: string;
  scheduleId: string;
}

export interface IUpdateAppoinmentPayload {
  doctorId?: string;
  scheduleId?: string;
  status?: string;
}
