"use client"

import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useProfile, useUpdateProfile } from "@/hooks/use-profile"
import { isValidTimeZone } from "@/lib/dates"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toaster"

const COUNTRIES = [
  { code: "US", name: "United States", tz: "America/New_York" },
  { code: "GB", name: "United Kingdom", tz: "Europe/London" },
  { code: "CA", name: "Canada", tz: "America/Toronto" },
  { code: "AU", name: "Australia", tz: "Australia/Sydney" },
  { code: "DE", name: "Germany", tz: "Europe/Berlin" },
  { code: "FR", name: "France", tz: "Europe/Paris" },
  { code: "JP", name: "Japan", tz: "Asia/Tokyo" },
  { code: "BR", name: "Brazil", tz: "America/Sao_Paulo" },
  { code: "IN", name: "India", tz: "Asia/Kolkata" },
  { code: "NL", name: "Netherlands", tz: "Europe/Amsterdam" },
  { code: "ES", name: "Spain", tz: "Europe/Madrid" },
  { code: "IT", name: "Italy", tz: "Europe/Rome" },
  { code: "SE", name: "Sweden", tz: "Europe/Stockholm" },
  { code: "NO", name: "Norway", tz: "Europe/Oslo" },
  { code: "DK", name: "Denmark", tz: "Europe/Copenhagen" },
  { code: "NZ", name: "New Zealand", tz: "Pacific/Auckland" },
  { code: "SG", name: "Singapore", tz: "Asia/Singapore" },
  { code: "KR", name: "South Korea", tz: "Asia/Seoul" },
  { code: "ZA", name: "South Africa", tz: "Africa/Johannesburg" },
  { code: "MX", name: "Mexico", tz: "America/Mexico_City" },
]

function getTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone")
  } catch {
    return COUNTRIES.map((country) => country.tz)
  }
}

const TIMEZONES = Array.from(new Set(["UTC", ...getTimezones()]))

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  country: z.string().max(100).optional(),
  timezone: z.string().refine(isValidTimeZone, "Choose a valid IANA timezone"),
  streakGoal: z.number().int().min(1).max(365),
})

type FormData = z.infer<typeof schema>

export function ProfileForm() {
  const { data, isLoading, isError, error, refetch, isFetching } = useProfile()
  const updateProfile = useUpdateProfile()
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    control,
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

  const selectedTimezone = useWatch({ control, name: "timezone" }) ?? ""
  const countryRegistration = register("country")
  const timezoneOptions = TIMEZONES.includes(selectedTimezone)
    ? TIMEZONES
    : [...TIMEZONES, selectedTimezone].filter(Boolean)

  function handleCountryChange(event: React.ChangeEvent<HTMLSelectElement>) {
    countryRegistration.onChange(event)
    const country = COUNTRIES.find((item) => item.code === event.target.value)
    if (country) setValue("timezone", country.tz, { shouldDirty: true })
  }

  async function onSubmit(formData: FormData) {
    try {
      await updateProfile.mutateAsync({
        name: formData.name,
        country: formData.country || undefined,
        timezone: formData.timezone,
        streakGoal: formData.streakGoal,
      })
      addToast({ message: "Profile updated", variant: "success" })
    } catch (updateError) {
      addToast({
        message: updateError instanceof Error ? updateError.message : "Failed to update profile",
        variant: "error",
      })
    }
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-center">
          <p className="text-sm font-medium text-destructive">Couldn&apos;t load your profile</p>
          <p className="text-xs text-muted-foreground">
            {error?.message || "Your saved settings are unavailable."}
          </p>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Retrying..." : "Retry"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading || !data) {
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
            <label htmlFor="profile-name" className="text-sm font-medium">Name</label>
            <Input id="profile-name" {...register("name")} aria-invalid={!!errors.name} />
            {errors.name && (
              <p id="profile-name-error" className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-country" className="text-sm font-medium">Country</label>
            <Select id="profile-country" {...countryRegistration} onChange={handleCountryChange} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-timezone" className="text-sm font-medium">Timezone</label>
            <Select
              id="profile-timezone"
              {...register("timezone")}
              aria-invalid={!!errors.timezone}
              aria-describedby={errors.timezone ? "profile-timezone-error" : undefined}
            >
              {timezoneOptions.map((timezone) => (
                <option key={timezone} value={timezone}>{timezone}</option>
              ))}
            </Select>
            {errors.timezone && (
              <p id="profile-timezone-error" className="text-xs text-destructive">{errors.timezone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="profile-streak-goal" className="text-sm font-medium">Streak Goal (days)</label>
            <Input
              id="profile-streak-goal"
              type="number"
              min={1}
              max={365}
              {...register("streakGoal", { valueAsNumber: true })}
              aria-invalid={!!errors.streakGoal}
            />
            {errors.streakGoal && (
              <p className="text-xs text-destructive">{errors.streakGoal.message}</p>
            )}
          </div>

          <Button type="submit" disabled={!isDirty || isSubmitting || updateProfile.isPending}>
            {isSubmitting || updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
