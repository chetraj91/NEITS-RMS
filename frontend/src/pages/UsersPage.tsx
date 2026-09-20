import {
  useEffect,
  useState,
} from "react";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../api/user";

type User = {
  id: string;
  fullName: string;
  username: string;
  role: string;
  active: boolean;
  permissions: string[];
};

type Permission = {
  key: string;
  label: string;
  group: string;
};

const PERMISSIONS: Permission[] = [
  // =====================================================
  // MAIN
  // =====================================================

  {
    key: "dashboard",
    label: "Dashboard",
    group: "Main",
  },
  {
    key: "customers",
    label: "Customers",
    group: "Main",
  },
  {
    key: "repair-jobs",
    label: "Repair Jobs",
    group: "Main",
  },
  {
    key: "repair-jobs.details",
    label: "Repair Job Details",
    group: "Main",
  },
  {
    key: "repair-jobs.edit",
    label: "Edit Repair Jobs",
    group: "Main",
  },
  {
    key: "repair-board",
    label: "Repair Board",
    group: "Main",
  },
 {
  key: "inventory",
  label: "Inventory",
  group: "Main",
},
{
  key: "inventory.edit",
  label: "Edit Inventory",
  group: "Main",
},
  {
    key: "suppliers",
    label: "Suppliers",
    group: "Main",
  },
  {
    key: "sales",
    label: "Sales",
    group: "Main",
  },
{
  key: "purchases",
  label: "Purchases",
  group: "Main",
},

  {
    key: "technicians",
    label: "Technicians",
    group: "Main",
  },

  // =====================================================
  // ACCOUNTS
  // =====================================================

  {
    key: "accounts.customer-ledger",
    label: "Customer Ledger",
    group: "Accounts",
  },
  {
    key: "accounts.supplier-ledger",
    label: "Supplier Ledger",
    group: "Accounts",
  },
  {
    key: "accounts.purchase-party-ledger",
    label: "Purchase Party Ledger",
    group: "Accounts",
  },
  {
    key: "accounts.cash-book",
    label: "Cash Book",
    group: "Accounts",
  },
  {
    key: "accounts.expenses",
    label: "Expenses",
    group: "Accounts",
  },
  {
    key: "accounts.reports",
    label: "Reports",
    group: "Accounts",
  },

  // =====================================================
  // SETTINGS
  // =====================================================

  {
  key: "settings.payment-methods",
  label: "Payment Methods",
  group: "Settings",
},
  
  {
    key: "settings.device-types",
    label: "Device Types",
    group: "Settings",
  },
  {
    key: "settings.brands",
    label: "Brands",
    group: "Settings",
  },
  {
    key: "settings.device-fields",
    label: "Device Fields",
    group: "Settings",
  },
  {
    key: "settings.device-type-fields",
    label: "Device Type Fields",
    group: "Settings",
  },
  {
    key: "settings.accessories",
    label: "Accessories",
    group: "Settings",
  },
  {
    key: "settings.users",
    label: "Users",
    group: "Settings",
  },
  {
    key: "settings.company",
    label: "Company",
    group: "Settings",
  },
  {
    key: "settings.whatsapp",
    label: "WhatsApp",
    group: "Settings",
  },
  {
    key: "settings.backup",
    label: "Backup",
    group: "Settings",
  },
 {
  key: "settings.system",
  label: "System",
  group: "Settings",
},

{
  key: "settings.feedback",
  label: "Feedback Settings",
  group: "Settings",
},

{
  key: "settings.messages",
  label: "Messages",
  group: "Settings",
},

{
  key: "settings.messages.manage",
  label: "Manage SMS Settings",
  group: "Settings",
},

{
  key: "settings.messages.test",
  label: "Test SMS",
  group: "Settings",
},

{
  key: "messages.send",
  label: "Send SMS",
  group: "Messages",
},

{
  key: "messages.send-custom",
  label: "Send Custom SMS",
  group: "Messages",
},

{
  key: "messages.view-history",
  label: "View SMS History",
  group: "Messages",
},

{
  key: "messages.manage-templates",
  label: "Manage Message Templates",
  group: "Messages",
},

{
  key: "messages.bulk-send",
  label: "Send Bulk SMS",
  group: "Messages",
},

];

const ROLES = [
  "Administrator",
  "Manager",
  "Accountant",
  "Sales",
  "Technician",
  "Reception",
  "User",
];

export default function UsersPage() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [fullName, setFullName] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("User");

  const [active, setActive] =
    useState(true);

  const [selectedPermissions, setSelectedPermissions] =
    useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  // =====================================================
  // LOAD USERS
  // =====================================================

  async function loadUsers() {
    try {
      setLoading(true);

      const response =
        await getUsers();

      const data =
        Array.isArray(response)
          ? response
          : response?.data ?? [];

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load users:",
        error
      );

      alert(
        "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // OPEN CREATE FORM
  // =====================================================

  function openCreate() {
    setEditingUser(null);

    setFullName("");
    setUsername("");
    setPassword("");
    setRole("User");
    setActive(true);

    setSelectedPermissions([]);

    setShowForm(true);
  }

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  function openEdit(user: User) {
    setEditingUser(user);

    setFullName(
      user.fullName
    );

    setUsername(
      user.username
    );

    setPassword("");

    setRole(
      user.role
    );

    setActive(
      user.active
    );

    setSelectedPermissions(
      Array.isArray(
        user.permissions
      )
        ? user.permissions
        : []
    );

    setShowForm(true);
  }

  // =====================================================
  // CLOSE FORM
  // =====================================================

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingUser(null);
  }

  // =====================================================
  // TOGGLE PERMISSION
  // =====================================================

  function togglePermission(
    key: string
  ) {
    setSelectedPermissions(
      (current) =>
        current.includes(key)
          ? current.filter(
              (item) =>
                item !== key
            )
          : [
              ...current,
              key,
            ]
    );
  }

  // =====================================================
  // SELECT ALL IN GROUP
  // =====================================================

  function toggleGroup(
    group: string
  ) {
    const keys =
      PERMISSIONS
        .filter(
          (permission) =>
            permission.group ===
            group
        )
        .map(
          (permission) =>
            permission.key
        );

    const allSelected =
      keys.every(
        (key) =>
          selectedPermissions.includes(
            key
          )
      );

    if (allSelected) {
      setSelectedPermissions(
        (current) =>
          current.filter(
            (key) =>
              !keys.includes(key)
          )
      );
    } else {
      setSelectedPermissions(
        (current) =>
          Array.from(
            new Set([
              ...current,
              ...keys,
            ])
          )
      );
    }
  }

  // =====================================================
  // SELECT ALL
  // =====================================================

  function selectAllPermissions() {
    setSelectedPermissions(
      PERMISSIONS.map(
        (permission) =>
          permission.key
      )
    );
  }

  function clearAllPermissions() {
    setSelectedPermissions([]);
  }

  // =====================================================
  // SAVE USER
  // =====================================================

  async function handleSave() {
    if (!fullName.trim()) {
      alert(
        "Full name is required."
      );
      return;
    }

    if (!username.trim()) {
      alert(
        "Username is required."
      );
      return;
    }

    if (!editingUser && !password) {
      alert(
        "Password is required."
      );
      return;
    }

    if (
      password &&
      password.length < 4
    ) {
      alert(
        "Password must be at least 4 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const payload: any = {
        fullName:
          fullName.trim(),

        username:
          username.trim(),

        role,

        active,

        permissions:
          selectedPermissions,
      };

      if (password) {
        payload.password =
          password;
      }

      const response =
        editingUser
          ? await updateUser(
              editingUser.id,
              payload
            )
          : await createUser(
              payload
            );

      alert(
        response?.message ||
          "User saved successfully."
      );

      setShowForm(false);
      setEditingUser(null);

      await loadUsers();
    } catch (error: any) {
      console.error(
        "Save user error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to save user."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE USER
  // =====================================================

  async function handleDelete(
    user: User
  ) {
    if (
      user.username ===
      "admin"
    ) {
      alert(
        "The main admin user cannot be deleted."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete user "${user.fullName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteUser(
        user.id
      );

      alert(
        "User deleted successfully."
      );

      await loadUsers();
    } catch (error: any) {
      console.error(
        "Delete user error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to delete user."
      );
    }
  }

  // =====================================================
  // GROUPS
  // =====================================================

  const permissionGroups =
    Array.from(
      new Set(
        PERMISSIONS.map(
          (permission) =>
            permission.group
        )
      )
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Users
          </h1>

          <p className="text-gray-500 mt-1">
            Manage system users and page permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreate
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
        >
          + Add User
        </button>

      </div>

      {/* USER TABLE */}

      <div className="bg-white rounded-2xl shadow border overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="border p-4 text-left">
                  Full Name
                </th>

                <th className="border p-4 text-left">
                  Username
                </th>

                <th className="border p-4 text-left">
                  Role
                </th>

                <th className="border p-4 text-center">
                  Status
                </th>

                <th className="border p-4 text-center">
                  Permissions
                </th>

                <th className="border p-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-gray-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(
                  (user) => (
                    <tr
                      key={
                        user.id
                      }
                      className="border-t hover:bg-gray-50"
                    >

                      <td className="p-4 font-semibold">
                        {
                          user.fullName
                        }
                      </td>

                      <td className="p-4">
                        {
                          user.username
                        }
                      </td>

                      <td className="p-4">
                        {
                          user.role
                        }
                      </td>

                      <td className="p-4 text-center">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            user.active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>

                      <td className="p-4 text-center">
                        {
                          user.permissions
                            ?.length ??
                          0
                        }
                      </td>

                      <td className="p-4 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              user
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              user
                            )
                          }
                          disabled={
                            user.username ===
                            "admin"
                          }
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          USER FORM MODAL
      ================================================= */}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-7">

            <div className="flex justify-between items-center mb-7">

              <div>
                <h2 className="text-2xl font-bold">
                  {editingUser
                    ? "Edit User"
                    : "Add User"}
                </h2>

                <p className="text-gray-500 mt-1">
                  Configure user details and access permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeForm
                }
                disabled={saving}
                className="text-2xl text-gray-500 hover:text-gray-800"
              >
                ×
              </button>

            </div>

            {/* USER INFORMATION */}

            <div className="bg-slate-50 rounded-xl border p-5 mb-6">

              <h3 className="text-lg font-bold mb-4">
                User Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={
                      fullName
                    }
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    className="border rounded-lg p-3 w-full mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Username
                  </label>

                  <input
                    type="text"
                    value={
                      username
                    }
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                      )
                    }
                    className="border rounded-lg p-3 w-full mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Password
                  </label>

                  <input
                    type="password"
                    value={
                      password
                    }
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    className="border rounded-lg p-3 w-full mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Role
                  </label>

                  <select
                    value={
                      role
                    }
                    onChange={(e) =>
                      setRole(
                        e.target.value
                      )
                    }
                    className="border rounded-lg p-3 w-full mt-1"
                  >
                    {ROLES.map(
                      (item) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {
                            item
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>

              <label className="flex items-center gap-3 mt-5 cursor-pointer">

                <input
                  type="checkbox"
                  checked={
                    active
                  }
                  onChange={(e) =>
                    setActive(
                      e.target.checked
                    )
                  }
                  className="w-5 h-5"
                />

                <span className="font-medium">
                  User Active
                </span>

              </label>

            </div>

            {/* PERMISSIONS */}

            <div className="mb-7">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">

                <div>
                  <h3 className="text-lg font-bold">
                    Page Permissions
                  </h3>

                  <p className="text-sm text-gray-500">
                    Select the pages this user can access.
                  </p>
                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={
                      selectAllPermissions
                    }
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    onClick={
                      clearAllPermissions
                    }
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Clear All
                  </button>

                </div>

              </div>

              <div className="space-y-5">

                {permissionGroups.map(
                  (group) => {

                    const groupPermissions =
                      PERMISSIONS.filter(
                        (
                          permission
                        ) =>
                          permission.group ===
                          group
                      );

                    const allSelected =
                      groupPermissions.every(
                        (
                          permission
                        ) =>
                          selectedPermissions.includes(
                            permission.key
                          )
                      );

                    return (
                      <div
                        key={
                          group
                        }
                        className="border rounded-xl overflow-hidden"
                      >

                        <div className="bg-gray-100 px-5 py-3 flex justify-between items-center">

                          <h4 className="font-bold text-gray-800">
                            {group}
                          </h4>

                          <button
                            type="button"
                            onClick={() =>
                              toggleGroup(
                                group
                              )
                            }
                            className="text-sm text-blue-600 font-semibold"
                          >
                            {allSelected
                              ? "Clear Group"
                              : "Select Group"}
                          </button>

                        </div>

                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                          {groupPermissions.map(
                            (
                              permission
                            ) => (
                              <label
                                key={
                                  permission.key
                                }
                                className="flex items-center gap-3 border rounded-lg p-3 hover:bg-slate-50 cursor-pointer"
                              >

                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(
                                    permission.key
                                  )}
                                  onChange={() =>
                                    togglePermission(
                                      permission.key
                                    )
                                  }
                                  className="w-4 h-4"
                                />

                                <span className="text-sm font-medium">
                                  {
                                    permission.label
                                  }
                                </span>

                              </label>
                            )
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={
                  closeForm
                }
                disabled={saving}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-7 py-2.5 rounded-lg font-semibold"
              >
                {saving
                  ? "Saving..."
                  : editingUser
                  ? "Update User"
                  : "Create User"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}