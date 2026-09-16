import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import api from "../../api/api";

export default function MainLayout() {
  const navigate = useNavigate();

  const user = JSON.parse(
    sessionStorage.getItem("user") || "{}"
  );

  const [showMenu, setShowMenu] =
    useState(false);

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [oldPassword, setOldPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login");
  };

  // =====================================================
  // OPEN CHANGE PASSWORD
  // =====================================================

  const handleOpenPasswordModal = () => {
    setShowMenu(false);

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowPasswordModal(true);
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async () => {
    if (!oldPassword) {
      alert("Please enter your old password.");
      return;
    }

    if (!newPassword) {
      alert("Please enter your new password.");
      return;
    }

    if (!confirmPassword) {
      alert(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "New password and confirm password do not match."
      );
      return;
    }

    if (oldPassword === newPassword) {
      alert(
        "New password must be different from the old password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const res = await api.post(
        "/auth/change-password",
        {
          oldPassword,
          newPassword,
        }
      );

      alert(
        res.data?.message ||
          "Password changed successfully."
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowPasswordModal(false);
    } catch (error: any) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white shadow-md px-8 py-4 flex justify-between items-center">

          <div>
            <h1 className="font-bold text-slate-800">
              NEITS RMS
            </h1>

            <p className="text-sm text-gray-500">
              Repair Management System
            </p>
          </div>

          {/* USER MENU */}
          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setShowMenu(
                  !showMenu
                )
              }
              className="flex items-center gap-3 cursor-pointer"
            >

              <div className="text-right">

                <p className="font-semibold text-gray-800">
                  {user?.fullName || "User"}
                </p>

                <p className="text-sm text-gray-500">
                  {user?.role || ""}
                </p>

              </div>

              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {(user?.fullName || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

            </button>

            {/* DROPDOWN MENU */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">

                <button
                  type="button"
                  onClick={
                    handleOpenPasswordModal
                  }
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700"
                >
                  🔑 Change Password
                </button>

                <div className="border-t border-gray-200" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
                >
                  🚪 Logout
                </button>

              </div>
            )}

          </div>

        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>

      {/* =====================================================
          CHANGE PASSWORD MODAL
          ===================================================== */}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-xl font-bold text-slate-800">
                Change Password
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowPasswordModal(false)
                }
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ×
              </button>

            </div>

            <div className="space-y-4">

              {/* OLD PASSWORD */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Old Password
                </label>

                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) =>
                    setOldPassword(
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter old password"
                  disabled={changingPassword}
                />

              </div>

              {/* NEW PASSWORD */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                  disabled={changingPassword}
                />

              </div>

              {/* CONFIRM PASSWORD */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                  disabled={changingPassword}
                />

              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() =>
                  setShowPasswordModal(false)
                }
                disabled={changingPassword}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleChangePassword
                }
                disabled={changingPassword}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {changingPassword
                  ? "Changing..."
                  : "Change Password"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}