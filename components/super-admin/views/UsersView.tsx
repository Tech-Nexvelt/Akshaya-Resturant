"use client";

import React, { useState } from "react";
import { Plus, Search, Trash2, ChevronDown, X } from "lucide-react";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";

export function UsersView() {
  const { users, addUser, updateUserRole, deleteUser, businesses } = useSuperAdminStore();

  const [search, setSearch] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Admin");
  const [newUserBusiness, setNewUserBusiness] = useState(businesses[0]?.name || "The Grand Kitchen");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.businessName.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserRole(userId, newRole);
    setActiveDropdown(null);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const matchedBiz = businesses.find((b) => b.name === newUserBusiness);

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      businessId: matchedBiz ? matchedBiz.id : null,
      businessName: newUserBusiness,
      status: "Active",
    });

    setNewUserName("");
    setNewUserEmail("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Users</h2>
          <p className="text-xs text-[#6B7280]">Manage platform users, business assignments, and staff RBAC roles</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user..."
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredUsers.length} of {users.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#111827]">{u.name}</td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        u.role === "Super Admin"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : u.role === "Owner"
                          ? "bg-blue-50 text-[#2563EB] border border-blue-200"
                          : u.role === "Admin"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-[#111827]">{u.businessName}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        u.status === "Active" ? "bg-emerald-50 text-[#10B981]" : "bg-red-50 text-[#EF4444]"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right relative">
                    <div className="inline-flex items-center gap-2">
                      {/* Role Change Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-bold text-[#111827] hover:bg-[#F9FAFB] cursor-pointer"
                        >
                          <span>{u.role}</span>
                          <ChevronDown className="h-3 w-3 text-[#6B7280]" />
                        </button>

                        {activeDropdown === u.id && (
                          <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-lg text-left">
                            {["Super Admin", "Owner", "Admin", "Staff"].map((r) => (
                              <button
                                key={r}
                                onClick={() => handleRoleChange(u.id, r)}
                                className="block w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-[#111827] hover:bg-[#EFF6FF] hover:text-[#2563EB] cursor-pointer"
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1 text-[#6B7280] hover:text-[#EF4444] transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">Add Platform User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#111827]">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. vikram@akshaya.com"
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Assign Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Owner">Owner</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111827]">Assign Business</label>
                <select
                  value={newUserBusiness}
                  onChange={(e) => setNewUserBusiness(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 rounded-xl border border-[#E5E7EB] bg-white px-4 text-xs font-bold text-[#111827] hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-9 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8]">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
