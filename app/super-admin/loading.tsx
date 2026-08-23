import React from "react";

export default function SuperAdminLoading() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 animate-pulse">
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl border border-gray-200 bg-white p-5 space-y-3 shadow-xs">
            <div className="h-4 w-24 bg-gray-200 rounded-md" />
            <div className="h-7 w-32 bg-gray-300 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main Canvas Skeleton */}
      <div className="h-96 rounded-2xl border border-gray-200 bg-white p-6 space-y-4 shadow-xs">
        <div className="h-6 w-48 bg-gray-200 rounded-md" />
        <div className="h-64 w-full bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}
