/** A Administrador · J Jefe · E Empleado · R Auditor (solo lectura) */
export type Role = "A" | "J" | "E" | "R";

/** Roles que cada rol puede ver, crear, editar y eliminar. */
const MANAGEABLE_ROLES: Record<string, Role[]> = {
  J: ["A", "J", "E", "R"],
  A: ["A", "E", "R"],
  E: ["E", "R"],
  R: [],
};

export const manageableRoles = (actorRole: string): Role[] =>
  MANAGEABLE_ROLES[actorRole] ?? [];

export const canManageRole = (actorRole: string, targetRole: string) =>
  manageableRoles(actorRole).includes(targetRole as Role);
