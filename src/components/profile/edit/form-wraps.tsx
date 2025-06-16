import React from "react";

interface FormWrapperProps {
  children: React.ReactNode;
}

export function FormWrapper({ children }: FormWrapperProps) {
  return (
    <div className=" mx-auto pt-10 text-white p-8 rounded-xl shadow-lg">
      <form className="flex flex-col gap-4">
        {children}
      </form>
    </div>
  );
}
