"use client";

import { AlertCircleIcon } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Link from "next/link";

interface ExpiredCompanyBannerProps {
  children: React.ReactNode;
}

const ExpiredCompanyBanner = ({ children }: ExpiredCompanyBannerProps) => {
  const { user } = useAuth();

  if (user?.company && !(user.company as any).isActive) {
    return (
      <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center gap-4">
        <AlertCircleIcon className="h-12 w-12 text-red-500" />
        <div className=" text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold text-2xl text-center">
            Your company license has expired!
          </strong>
          <br />
          <span className="block sm:inline text-center">
            {" "}
            Please renew your subscription to continue using our services.
          </span>
        </div>
        <Link
          href="/license"
          className="w-3/5 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg justify-center text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Renew License
        </Link>
      </div>
    );
  } else {
    return <>{children}</>;
  }
};

export default ExpiredCompanyBanner;
