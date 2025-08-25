"use client";

import Link from "next/link";

export default function HostLandingPage() {
  return (
    <div className="min-h-screen mt-20 px-4 py-12">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Become a Host</h1>
        <p className="text-gray-600">
          Share your facilities and equipment with customers. Create a company,
          add facilities and inventory, and start taking bookings.
        </p>
        <div className="pt-4">
          <Link
            href="/user/host"
            className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg"
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
}
