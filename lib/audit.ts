export function audit(event: string, detail?: Record<string, unknown>) {
  const timestamp = new Date().toISOString()
  const message = JSON.stringify({ level: "audit", timestamp, event, ...detail })
  console.log(message)
}
