export function canUseDeveloperEditor(user: { role?: string | null; accountStatus?: string | null } | null | undefined) {
  return user?.role === "admin" && user.accountStatus === "active";
}
