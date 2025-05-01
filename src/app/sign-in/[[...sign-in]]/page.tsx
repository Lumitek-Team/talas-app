"use client"
import { SignIn, useAuth } from "@clerk/nextjs"
import { redirect } from "next/navigation"

const LoginPage = () => {
    const { isSignedIn } = useAuth()
    if (isSignedIn) { redirect("/") }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <SignIn />
        </div>
    )
}

export default LoginPage