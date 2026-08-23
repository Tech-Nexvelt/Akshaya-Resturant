"use client";

import React, { useState } from "react";
import { useAdminStore, ExtendedMenuItem } from "@/lib/admin-store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight, Flame, Utensils, Search } from "lucide-react";

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
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-smoke)]" />
          <input
            type="text"
            placeholder="Search dish name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-void-raised)] border border-[rgba(201,161,90,0.2)] text-xs text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </div>

        {/* Category Pills & Add Dish */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <div className="flex gap-1 bg-[var(--color-void-raised)] p-1 rounded-lg border border-white/5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-medium capitalize transition-all ${
                  selectedCategory === cat
                    ? "bg-[var(--color-gold)] text-[var(--color-void)] font-bold"
                    : "text-[var(--color-smoke)] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)] text-[var(--color-void)] text-xs font-bold hover:brightness-110 transition-all whitespace-nowrap shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Grid of Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`glass-panel p-4 rounded-xl border transition-all ${
              item.available ? "border-[rgba(201,161,90,0.15)]" : "border-red-500/20 bg-red-500/[0.02] opacity-75"
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-gold)]">
                  {item.category_name}
                </span>
                <h4 className="text-sm font-semibold text-[var(--color-ivory)] flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${item.is_veg ? "bg-emerald-400" : "bg-red-400"}`}
                    title={item.is_veg ? "Vegetarian" : "Non-Vegetarian"}
                  />
                  {item.name}
                </h4>
              </div>

              {/* Availability Toggle */}
              <button
                onClick={() => toggleMenuItemAvailability(item.id)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                  item.available
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}
              >
                {item.available ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                <span>{item.available ? "Available" : "Sold Out"}</span>
              </button>
            </div>

            <p className="text-xs text-[var(--color-smoke)] mb-3 line-clamp-2 min-h-[32px]">
              {item.description}
            </p>

            {/* Bottom Price & Controls */}
            <div className="border-t border-white/5 pt-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--color-smoke)] block">Price (INR):</span>
                {editingPriceId === item.id ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(Number(e.target.value))}
                      className="w-20 px-2 py-0.5 rounded bg-[var(--color-void-raised)] border border-[var(--color-gold)] text-xs text-[var(--color-ivory)] font-bold focus:outline-none"
                    />
                    <button
                      onClick={() => handleSavePrice(item.id)}
                      className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingPriceId(null)}
                      className="p-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[var(--color-gold-bright)]">
                      {formatCurrency(item.price)}
                    </span>
                    <button
                      onClick={() => {
                        setEditingPriceId(item.id);
                        setTempPrice(item.price);
                      }}
                      className="text-[var(--color-smoke)] hover:text-[var(--color-gold)] p-0.5"
                      title="Edit Price"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Spice Level indicator */}
              <div className="flex items-center gap-0.5 text-xs text-[var(--color-smoke)]">
                {Array.from({ length: item.spice_level }).map((_, i) => (
                  <Flame key={i} className="w-3 h-3 text-red-400 fill-red-400" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateItem}
            className="glass-panel p-6 rounded-2xl max-w-md w-full border-[var(--color-gold)]/40 shadow-2xl animate-fade-up space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-display font-semibold text-[var(--color-ivory)] text-base">
                Add New Menu Dish
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[var(--color-smoke)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[var(--color-smoke)] font-medium block mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telangana Natukodi Fry"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-void-raised)] border border-[rgba(201,161,90,0.2)] text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[var(--color-smoke)] font-medium block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-void-raised)] border border-[rgba(201,161,90,0.2)] text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)]"
                  >
                    {categories.filter((c) => c !== "all").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[var(--color-smoke)] font-medium block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-void-raised)] border border-[rgba(201,161,90,0.2)] text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[var(--color-smoke)] font-medium block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short description of ingredients and preparation style..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-void-raised)] border border-[rgba(201,161,90,0.2)] text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[var(--color-smoke)] font-medium block mb-1">Spice Level (0-3)</label>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={newItemSpice}
                    onChange={(e) => setNewItemSpice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[var(--color-void-raised)] border border-[rgba(201,161,90,0.2)] text-[var(--color-ivory)]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newItemVeg}
                      onChange={(e) => setNewItemVeg(e.target.checked)}
                      className="accent-[var(--color-gold)]"
                    />
                    <span className="text-[var(--color-ivory)] font-medium">Vegetarian Dish</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-lg glass-panel text-[var(--color-smoke)] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)] text-[var(--color-void)] font-bold hover:brightness-110"
              >
                Create Dish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
