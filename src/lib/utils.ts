import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

export function getTripGradient(name: string): string {
  const hue1 = hashCode(name) % 360
  const hue2 = (hue1 + 40) % 360
  return `radial-gradient(ellipse at 20% 50%, hsl(${hue1},70%,30%) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, hsl(${hue2},60%,25%) 0%, transparent 60%), #1A1A24`
}

export function detectBookingSource(url: string): string {
  const lower = url.toLowerCase()
  if (lower.includes("agoda.com")) return "Agoda"
  if (lower.includes("makemytrip.com")) return "MakeMyTrip"
  if (lower.includes("goibibo.com")) return "Goibibo"
  if (lower.includes("booking.com")) return "Booking.com"
  if (lower.includes("airbnb.com") || lower.includes("airbnb.co.in")) return "Airbnb"
  if (lower.includes("oyorooms.com")) return "OYO"
  if (lower.includes("trivago.in") || lower.includes("trivago.com")) return "Trivago"
  if (lower.includes("expedia.co.in") || lower.includes("expedia.com")) return "Expedia"
  return "Other"
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function truncateUrl(url: string, maxLength: number = 40): string {
  try {
    const parsed = new URL(url)
    const display = parsed.hostname + parsed.pathname
    return display.length > maxLength ? display.slice(0, maxLength) + "..." : display
  } catch {
    return url.length > maxLength ? url.slice(0, maxLength) + "..." : url
  }
}
