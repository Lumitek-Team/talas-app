"use client";
import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
  const interval = setInterval(() => {
    const title = document.querySelector(".cl-headerTitle");
    const footer = document.querySelector(".cl-footer");
    const imgBox = document.querySelector(".cl-logoBox") as HTMLElement;
    const img = document.querySelector(".cl-logoImage");
    const googleLogo = document.querySelector(".cl-socialButtonsProviderIcon");
    const googleButton = document.querySelector(".cl-socialButtons") as HTMLElement;
    const buttonText = document.querySelector(".cl-socialButtonsBlockButtonText") as HTMLElement;

    if (buttonText) {
        buttonText.style.fontWeight = "bold";
        buttonText.style.fontSize = "14px";
    }

    if (googleButton) {
        googleButton.style.borderRadius = '10px';
        googleButton.style.height = '40px';
        googleButton.style.backgroundColor = '#53B253';
    }

    if (googleLogo) {
        googleLogo.removeAttribute('srcSet');
        googleLogo.setAttribute('src', '/logo/social-google.svg');
    }

    if (imgBox) {
        imgBox.style.height = "200px"
    }

    if (img) {
        img.removeAttribute('srcSet');
        img.setAttribute('src', '/logo/talas-logo.svg');
        img.setAttribute('style', 'height: 100% !important');
    }

    if (title) {
      title.textContent = "Join Talas and \n Showcase Your Creations!";
      title.setAttribute("style", "font-size: 16px")
    }

    if (footer) {
      footer.setAttribute("style", "display: none;");
    }

    // Stop polling jika sudah keduanya ketemu
    if (title && footer) {
      clearInterval(interval);
    }
  }, 100);

  return () => clearInterval(interval);
}, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-[url('/img/auth-bg.jpg')] bg-cover bg-center" />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <SignIn
            appearance={{
              elements: {
                card: "bg-white/5 backdrop-blur-md rounded-xl  border border-[1px] border-solid border-[#68DE68]",
                headerTitle: "text-2xl font-bold text-center text-white mb-2",
                formButtonPrimary: "bg-green-500 hover:bg-green-600 text-white",
                socialButtonsGoogleButton: "bg-green-500 hover:bg-green-600 text-white border-none",
                logoBox: "bg-[url('/logo/logo-talas.svg')] bg-center bg-contain bg-no-repeat h-16",
              },
              variables: {
                colorPrimary: "#68DE68",
                colorBackground: "transparent",
                colorText: "#FFFFFF",
                fontFamily: "Comfortaa, sans-serif",
                borderRadius: "0.75rem",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
