import { Role } from "../../generated/prisma/enums";

export interface IRequestuser {
  userId: string;
  role: Role;
  email: string;
}
