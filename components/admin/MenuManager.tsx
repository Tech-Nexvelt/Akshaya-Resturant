"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight, Flame, Search } from "lucide-react";

export function MenuManager() {
  const { menuItemsList, toggleMenuItemAvailability, updateMenuItemPrice, addMenuItem } = useAdminStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Biryani");
  const [newItemPrice, setNewItemPrice] = useState<number>(300);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemSpice, setNewItemSpice] = useState<number>(2);
  const [newItemVeg, setNewItemVeg] = useState(false);

  const categories = ["all", "Biryani", "Kababs", "Curries", "Cafe", "Desserts"];

  const filteredItems = menuItemsList.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category_name === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSavePrice = (id: string) => {
    if (tempPrice > 0) {
      updateMenuItemPrice(id, tempPrice);
    }
    setEditingPriceId(null);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    addMenuItem({
      category_id: `cat-${newItemCategory.toLowerCase()}`,
      category_name: newItemCategory,
      name: newItemName,
      description: newItemDesc || "Freshly prepared Akshaya specialty dish.",
      price: newItemPrice,
      image_url: null,
      is_veg: newItemVeg,
      spice_level: newItemSpice,
      available: true,
      sort_order: menuItemsList.length + 1,
    });

    setShowAddModal(false);
    setNewItemName("");
    setNewItemDesc("");
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Menu Management</h2>
          <p className="text-xs text-[#6B7280]">Manage food menu items, prices, and live POS item availability</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#F9FAFB] border border-[#E5E7EB] p-1 rounded-xl text-xs font-bold">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1 transition-all cursor-pointer capitalize ${
                  selectedCategory === cat ? "bg-[#2563EB] text-white shadow-2xs" : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add New Dish
          </button>
        </div>
      </div>

      {/* Grid of Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 shadow-xs transition-all bg-white ${
              item.available ? "border-[#E5E7EB]" : "border-rose-200 bg-rose-50/20"
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#2563EB]">
                  {item.category_name}
                </span>
                <h4 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${item.is_veg ? "bg-emerald-500" : "bg-rose-500"}`}
                    title={item.is_veg ? "Vegetarian" : "Non-Vegetarian"}
                  />
                  {item.name}
                </h4>
              </div>

              {/* Availability Toggle */}
              <button
                onClick={() => toggleMenuItemAvailability(item.id)}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border cursor-pointer transition-all ${
                  item.available
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-600 border-rose-200"
                }`}
              >
                {item.available ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                <span>{item.available ? "Available" : "Sold Out"}</span>
              </button>
            </div>

            <p className="text-xs text-[#6B7280] mb-3 line-clamp-2 min-h-[32px]">
              {item.description}
            </p>

            {/* Bottom Price & Controls */}
            <div className="border-t border-[#E5E7EB] pt-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#6B7280] block font-semibold">Price (INR):</span>
                {editingPriceId === item.id ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(Number(e.target.value))}
                      className="w-20 rounded-lg border border-[#2563EB] px-2 py-0.5 text-xs text-[#111827] font-bold focus:outline-none"
                    />
                    <button
                      onClick={() => handleSavePrice(item.id)}
                      className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setEditingPriceId(null)}
                      className="p-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#2563EB]">
                      {formatCurrency(item.price)}
                    </span>
                    <button
                      onClick={() => {
                        setEditingPriceId(item.id);
                        setTempPrice(item.price);
                      }}
                      className="text-[#6B7280] hover:text-[#2563EB] p-0.5 cursor-pointer"
                      title="Edit Price"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Spice Level indicator */}
              <div className="flex items-center gap-0.5 text-xs text-[#6B7280]">
                {Array.from({ length: item.spice_level }).map((_, i) => (
                  <Flame key={i} className="h-3 w-3 text-rose-500 fill-rose-500" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateItem}
            className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">Add New Menu Dish</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-[#111827] p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-[#111827] block mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telangana Natukodi Fry"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                  >
                    {categories.filter((c) => c !== "all").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#111827] block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] font-bold focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of ingredients..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-2.5 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="h-9 rounded-xl border border-[#E5E7EB] bg-white px-4 text-xs font-bold text-[#111827] hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button type="submit" className="h-9 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8]">
                Create Dish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
