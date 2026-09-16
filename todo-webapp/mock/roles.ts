// specs/design/security.json → roles[].name. This app has one role, so
// mock/auth.ts's `?role=` switch is only ever used to sign in or out
// (`?auth=out`) — there is no second role to compare screens against.
export const mockRoles = ["User"];
