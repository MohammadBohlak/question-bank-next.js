export const ROLE_MAP = {
  exm_SuperAdmin: 'ADMIN',
  exm_CourseSupervisor: 'COURSE_SUPERVISOR',
} as const

export type AppRole = typeof ROLE_MAP[keyof typeof ROLE_MAP]
