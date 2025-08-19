import { useRouter, useSearchParams } from "next/navigation";

export const useRedirect = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const storeIntendedUrl = () => {
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem("intendedUrl", currentUrl);
  };

  const getRedirectUrl = () => {
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo) {
      return decodeURIComponent(redirectTo);
    }

    const intendedUrl = sessionStorage.getItem("intendedUrl");
    if (intendedUrl) {
      sessionStorage.removeItem("intendedUrl");
      return intendedUrl;
    }

    return "/";
  };

  const redirectToLogin = () => {
    storeIntendedUrl();
    router.push("/auth/sign-in");
  };

  const redirectAfterLogin = () => {
    const redirectUrl = getRedirectUrl();
    router.push(redirectUrl);
  };

  return {
    storeIntendedUrl,
    getRedirectUrl,
    redirectToLogin,
    redirectAfterLogin,
  };
};
