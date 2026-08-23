"use client";

import React, { useState } from "react";
import { Plus, Search, UtensilsCrossed, Edit2, X } from "lucide-react";
import { useBusinessAdminStore, BusinessMenuItem } from "@/store/useBusinessAdminStore";

export function BusinessMenuView() {
  const { menuItems, addMenuItem, toggleMenuItemAvailability, updateMenuItem } = useBusinessAdminStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessMenuItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState<BusinessMenuItem["category"]>("Main Course");
  const [price, setPrice] = useState(220);

  const categories = ["All", "Main Course", "Starters", "South Indian", "Desserts", "Breads"];

  const filteredItems = menuItems.filter((m) => {
    const matchesCategory = selectedCategory === "All" ? true : m.category === selectedCategory;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addMenuItem({
      name: name.trim(),
      category,
      price: Number(price) || 100,
      isAvailable: true,
    });

    setName("");
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !name.trim()) return;

    updateMenuItem(editingItem.id, {
      name: name.trim(),
      category,
      price: Number(price),
    });

    setEditingItem(null);
  };

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto p-2 sm:p-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Menu Management</h2>
          <p className="text-xs text-[#6B7280]">Manage food menu items, prices, and live POS item availability</p>
        </div>

        <button
          onClick={() => {
            setName("");
            setCategory("Main Course");
            setPrice(220);
            setIsAddModalOpen(true);
          }}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Menu Item
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#F9FAFB] border border-[#E5E7EB] p-1 rounded-xl text-xs font-bold">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${
                  selectedCategory === cat ? "bg-[#2563EB] text-white shadow-2xs" : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#111827] flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-[#2563EB]" />
                    <span>{item.name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{item.category}</td>
                  <td className="px-4 py-3.5 font-bold text-[#111827]">₹ {item.price}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => toggleMenuItemAvailability(item.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer ${
                        item.isAvailable
                          ? "bg-emerald-50 text-[#10B981] border border-emerald-200"
                          : "bg-rose-50 text-rose-600 border border-rose-200"
                      }`}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setName(item.name);
                        setCategory(item.category);
                        setPrice(item.price);
                      }}
                      className="p-1 text-gray-400 hover:text-[#2563EB] transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-[#111827] p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={editingItem ? handleEditSubmit : handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#111827]">Dish Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Butter Chicken"
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="Main Course">Main Course</option>
                  <option value="Starters">Starters</option>
                  <option value="South Indian">South Indian</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Breads">Breads</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111827]">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="h-9 rounded-xl border border-[#E5E7EB] bg-white px-4 text-xs font-bold text-[#111827] hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-9 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8]">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
