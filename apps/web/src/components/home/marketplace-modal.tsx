"use client";

import React, { useState } from "react";
import { X, Search, ShoppingBag, Star, MapPin, Tag, Check, Sparkles, ArrowRight } from "lucide-react";
import { MARKETPLACE_PRODUCTS } from "@/data/teammate-data";
import { Product } from "@/types/teammate";

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "all", label: "All Items (সব পণ্য)" },
  { id: "farming", label: "🌾 Farming & Crops (কৃষি ও ধান)" },
  { id: "handicrafts", label: "🧵 Handicrafts (হস্তশিল্প)" },
  { id: "dairy", label: "🥛 Dairy & Ghee (দুগ্ধ ও ঘি)" },
  { id: "fisheries", label: "🐟 Fisheries (চিংড়ি ও মাছ)" },
  { id: "spices", label: "🌶️ Spices & Honey (মসলা ও মধু)" },
  { id: "fruits", label: "🥭 Organic Fruits (ফলমূল)" },
];

export function MarketplaceModal({ isOpen, onClose }: MarketplaceModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  if (!isOpen) return null;

  const filteredProducts = MARKETPLACE_PRODUCTS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.bengaliName && item.bengaliName.includes(searchQuery)) ||
      (item.artisanDistrict && item.artisanDistrict.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.product.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.product.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((p) => p.product.id !== productId));
  };

  const totalItems = cart.reduce((acc, c) => acc + c.quantity, 0);
  const totalPrice = cart.reduce((acc, c) => acc + c.product.priceBDT * c.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-5xl h-[90vh] bg-[#F7F4EC] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#0D382A]/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#0A2C22] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
                Authentic Village Marketplace (গ্রামীণ হাট ও মেলা)
              </h2>
              <p className="text-xs text-emerald-300/90">
                Direct fair-trade handicrafts and pure farm-fresh produce from verified rural producers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative bg-[#0E392B] hover:bg-[#154D3B] text-white px-3.5 py-2 rounded-full border border-emerald-500/30 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-300" />
              <span>Bag (ঝুলি)</span>
              {totalItems > 0 && (
                <span className="bg-emerald-400 text-[#061D15] text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 bg-white border-b border-[#0D382A]/10 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name, artisan, district (e.g., Ghee, Nakshi, Mango, Bogura)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <span className="text-xs text-slate-500 font-semibold hidden sm:inline whitespace-nowrap">
              Showing {filteredProducts.length} of {MARKETPLACE_PRODUCTS.length} authentic items
            </span>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#0D382A] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid or Cart Drawer View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {orderConfirmed ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-emerald-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-700" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#0A2C22] mb-2">Order Confirmed! (অর্ডার সফল হয়েছে)</h3>
              <p className="text-sm text-slate-600 max-w-md mb-6">
                Your direct fair-trade purchase from rural producers has been placed. You will receive SMS updates with courier tracking.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCart([]);
                  setOrderConfirmed(false);
                  setIsCartOpen(false);
                }}
                className="bg-[#0D382A] hover:bg-[#154D3B] text-white font-bold px-6 py-2.5 rounded-full text-sm cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : isCartOpen ? (
            /* Cart View */
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-lg font-bold text-[#0A2C22] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  Your Shopping Bag ({totalItems} items)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                >
                  ← Back to Products
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm">Your shopping bag is empty.</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{product.name}</h4>
                          <span className="text-[11px] text-slate-500">
                            ৳{product.priceBDT} x {quantity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong className="text-sm font-extrabold text-emerald-800">
                          ৳{(product.priceBDT * quantity).toLocaleString()}
                        </strong>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-700">Total Price:</span>
                    <span className="text-2xl font-extrabold text-[#0D382A]">
                      ৳ {totalPrice.toLocaleString()} BDT
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOrderConfirmed(true)}
                    className="w-full bg-[#0D382A] hover:bg-[#154D3B] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer mt-4 flex items-center justify-center gap-2"
                  >
                    <span>Confirm Order (Cash on Delivery / bKash)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-600/40 shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="relative h-36 bg-slate-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {item.discountPercent && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                        -{item.discountPercent}%
                      </span>
                    )}
                    {item.artisanDistrict && (
                      <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                        {item.artisanDistrict}
                      </span>
                    )}
                  </div>

                  <div className="p-3 flex flex-col flex-1">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-800 transition-colors">
                      {item.name}
                    </h4>
                    {item.bengaliName && (
                      <p className="text-[11px] text-slate-500 font-serif line-clamp-1 mt-0.5">
                        {item.bengaliName}
                      </p>
                    )}

                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-[#0D382A]">
                          ৳ {item.priceBDT.toLocaleString()}
                        </div>
                        {item.originalPriceBDT && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ৳{item.originalPriceBDT}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="bg-[#0E392B] hover:bg-[#154D3B] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
