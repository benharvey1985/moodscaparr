"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useProfile, useUpdateProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"
import { useToast } from "@/components/ui/toaster"

const COUNTRIES = [
  { code: "US", name: "United States", tz: "America/New_York", fmt: "MM/DD/YYYY" },
  { code: "GB", name: "United Kingdom", tz: "Europe/London", fmt: "DD/MM/YYYY" },
  { code: "CA", name: "Canada", tz: "America/Toronto", fmt: "MM/DD/YYYY" },
  { code: "AU", name: "Australia", tz: "Australia/Sydney", fmt: "DD/MM/YYYY" },
  { code: "DE", name: "Germany", tz: "Europe/Berlin", fmt: "DD/MM/YYYY" },
  { code: "FR", name: "France", tz: "Europe/Paris", fmt: "DD/MM/YYYY" },
  { code: "JP", name: "Japan", tz: "Asia/Tokyo", fmt: "YYYY/MM/DD" },
  { code: "BR", name: "Brazil", tz: "America/Sao_Paulo", fmt: "DD/MM/YYYY" },
  { code: "IN", name: "India", tz: "Asia/Kolkata", fmt: "DD/MM/YYYY" },
  { code: "NL", name: "Netherlands", tz: "Europe/Amsterdam", fmt: "DD/MM/YYYY" },
  { code: "ES", name: "Spain", tz: "Europe/Madrid", fmt: "DD/MM/YYYY" },
  { code: "IT", name: "Italy", tz: "Europe/Rome", fmt: "DD/MM/YYYY" },
  { code: "SE", name: "Sweden", tz: "Europe/Stockholm", fmt: "DD/MM/YYYY" },
  { code: "NO", name: "Norway", tz: "Europe/Oslo", fmt: "DD/MM/YYYY" },
  { code: "DK", name: "Denmark", tz: "Europe/Copenhagen", fmt: "DD/MM/YYYY" },
  { code: "NZ", name: "New Zealand", tz: "Pacific/Auckland", fmt: "DD/MM/YYYY" },
  { code: "SG", name: "Singapore", tz: "Asia/Singapore", fmt: "DD/MM/YYYY" },
  { code: "KR", name: "South Korea", tz: "Asia/Seoul", fmt: "YYYY/MM/DD" },
  { code: "ZA", name: "South Africa", tz: "Africa/Johannesburg", fmt: "DD/MM/YYYY" },
  { code: "MX", name: "Mexico", tz: "America/Mexico_City", fmt: "DD/MM/YYYY" },
]

function getTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone")
  } catch {
    return COUNTRIES.map((c) => c.tz).filter((v, i, a) => a.indexOf(v) === i)
  }
}

const TIMEZONES = getTimezones()

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  country: z.string().max(100).optional(),
  timezone: z.string().max(64),
  streakGoal: z.number().int().min(1).max(365),
})

type FormData = z.infer<typeof schema>

export function ProfileForm() {
  const { data, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: data
      ? {
          name: data.user.name || "",
          country: data.profile?.country || "",
          timezone: data.profile?.timezone || "UTC",
          streakGoal: data.profile?.streakGoal || 7,
        }
      : undefined,
  })

  const selectedCountry = watch("country")

  useEffect(() => {
    if (selectedCountry) {
      const country = COUNTRIES.find((c) => c.code === selectedCountry)
      if (country) {
        setValue("timezone", country.tz)
      }
    }
  }, [selectedCountry, setValue])

  async function onSubmit(formData: FormData) {
    try {
      await updateProfile.mutateAsync({
        name: formData.name,
        country: formData.country || undefined,
        timezone: formData.timezone,
        streakGoal: formData.streakGoal,
      })
      addToast({ message: "Profile updated", variant: "success" })
    } catch {
      addToast({ message: "Failed to update profile", variant: "error" })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Country</label>
            <Select {...register("country")}>
              <option value="">Select a country...</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Timezone</label>
            <Select {...register("timezone")}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Streak Goal (days)</label>
            <Input type="number" min={1} max={365} {...register("streakGoal", { valueAsNumber: true })} />
            {errors.streakGoal && (
              <p className="text-xs text-destructive">{errors.streakGoal.message}</p>
            )}
          </div>

          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
