"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@/lib/auth-client"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  inviteCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type Schema = z.infer<typeof schema>

function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [inviteOnly, setInviteOnly] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  useEffect(() => {
    fetch("/api/auth/invite-status")
      .then((r) => r.json())
      .then((data) => setInviteOnly(data.inviteOnly))
      .catch(() => setInviteOnly(false))
      .finally(() => setCheckingStatus(false))
  }, [])

  const { register, handleSubmit, formState: { errors }, setError: setFormError } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", inviteCode: "" },
  })

  async function onSubmit(data: Schema) {
    setLoading(true)
    setError(null)

    if (inviteOnly) {
      if (!data.inviteCode) {
        setFormError("root", { message: "Invite code is required" })
        setLoading(false)
        return
      }

      const res = await fetch("/api/auth/validate-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: data.inviteCode, email: data.email }),
      })

      if (!res.ok) {
        const err = await res.json()
        setFormError("root", { message: err.error || "Invalid invite code" })
        setLoading(false)
        return
      }
    }

    const { error: authError } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    })

    setLoading(false)

    if (authError) {
      setFormError("root", { message: authError.message || "Registration failed" })
      return
    }

    router.push("/dashboard")
  }

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {inviteOnly && (
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Invite Code</Label>
          <Input id="inviteCode" {...register("inviteCode")} placeholder="Enter your invite code" />
          {errors.inviteCode && (
            <p className="text-sm text-red-500">{errors.inviteCode.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <ErrorBoundary>
      <RegisterForm />
    </ErrorBoundary>
  )
}
