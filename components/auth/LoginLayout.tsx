"use client";

import React from "react";
import { ShieldCheck, Zap, TrendingUp, Lock } from "lucide-react";

interface LoginLayoutProps {
  children: React.ReactNode;
}

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] antialiased text-slate-900 overflow-x-hidden">
      {/* LEFT PANEL — BRANDING & VALUE PROP (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] relative overflow-hidden flex-col justify-between p-12 xl:p-16 text-white select-none">
        {/* Abstract Soft Geometric Mesh / Glowing Ambient Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-blue-400/20 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-blue-950/20">
              A
            </div>
            <span className="font-semibold text-lg tracking-wide text-white/90">
              Akshaya
            </span>
          </div>

          <div className="pt-4 max-w-md">
            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
              Akshaya Platform
            </h1>
            <p className="text-blue-100/90 text-sm xl:text-base mt-3 leading-relaxed font-normal">
              Manage your business operations with real-time control.
            </p>
          </div>
        </div>

        {/* Value Prop Highlights */}
        <div className="relative z-10 space-y-5 my-auto max-w-md pt-8">
          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 transition-all hover:bg-white/10">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-white shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Secure & Reliable</h3>
              <p className="text-xs text-blue-100/80 mt-0.5 leading-relaxed">
                Enterprise-grade security and role enforcement to protect operational data.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 transition-all hover:bg-white/10">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-white shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Real-time Control</h3>
              <p className="text-xs text-blue-100/80 mt-0.5 leading-relaxed">
                Live updates and order insights dispatched continuously across your console.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10 transition-all hover:bg-white/10">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-white shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Scalable System</h3>
              <p className="text-xs text-blue-100/80 mt-0.5 leading-relaxed">
                Built to scale seamlessly as your orders, banquets, and staff grow.
              </p>
            </div>
          </div>
        </div>

        {/* Left Footer */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-blue-200/70">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-200/90" />
            <span>End-to-End Encrypted Session</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Akshaya</span>
        </div>
      </div>

      {/* RIGHT PANEL — LOGIN CARD CONTAINER */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between items-center p-4 sm:p-6 md:p-10 min-h-screen bg-[#F8FAFC]">
        {/* Mobile-only header brand badge */}
        <div className="lg:hidden pt-4 pb-2 text-center flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center font-bold text-lg text-white shadow-md">
            A
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">
            Akshaya Platform
          </span>
        </div>

        {/* Centered Login Card Slot */}
        <div className="w-full my-auto flex items-center justify-center">
          {children}
        </div>

        {/* Right Footer */}
        <div className="py-4 text-center text-xs text-slate-400">
          Protected by enterprise security. All rights reserved.
        </div>
      </div>
    </div>
  );
}
