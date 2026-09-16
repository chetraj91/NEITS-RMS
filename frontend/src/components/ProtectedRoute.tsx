import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  hasPermission,
  hasAnyPermission,
} from "../utils/permissions";

export default function ProtectedRoute({
  permission,
  permissions,
}: {
  permission?: string;
  permissions?: string[];
}) {
  const token =
    sessionStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  let allowed = true;

  if (permission) {
    allowed =
      hasPermission(permission);
  }

  if (
    permissions &&
    permissions.length > 0
  ) {
    allowed =
      hasAnyPermission(
        permissions
      );
  }

  if (!allowed) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}