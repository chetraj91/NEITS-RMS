export function getCurrentUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem(
        "user"
      ) || "{}"
    );
  } catch {
    return {};
  }
}

export function isAdministrator() {
  const user =
    getCurrentUser();

  return (
    user?.role ===
    "Administrator"
  );
}

export function hasPermission(
  permission: string
) {
  const user =
    getCurrentUser();

  if (
    user?.role ===
    "Administrator"
  ) {
    return true;
  }

  const permissions =
    Array.isArray(
      user?.permissions
    )
      ? user.permissions
      : [];

  return permissions.includes(
    permission
  );
}

export function hasAnyPermission(
  permissions: string[]
) {
  return permissions.some(
    (permission) =>
      hasPermission(permission)
  );
}

export function hasSettingsPermission() {
  return hasAnyPermission([
    "settings.device-types",
    "settings.brands",
    "settings.device-fields",
    "settings.device-type-fields",
    "settings.accessories",
    "settings.users",
    "settings.company",
    "settings.whatsapp",
    "settings.backup",
    "settings.system",
  ]);
}