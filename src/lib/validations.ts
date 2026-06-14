import { z } from "zod"

export const CreateTripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(100, "Name too long").trim(),
  description: z.string().max(500, "Description too long").optional().default(""),
  coverEmoji: z.string().optional().default("✈️"),
})

export const UpdateTripSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).optional(),
  coverEmoji: z.string().optional(),
})

export const CreateCitySchema = z.object({
  name: z.string().min(1, "City name is required").max(100, "Name too long").trim(),
  emoji: z.string().optional().default("📍"),
})

export const UpdateCitySchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  emoji: z.string().optional(),
})

export const CreateHotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required").max(200, "Name too long").trim(),
  url: z.string().url("Must be a valid URL"),
  notes: z.string().max(1000, "Notes too long").optional().default(""),
  pricePerNight: z.number().positive("Price must be positive").optional(),
})

export const UpdateHotelSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  url: z.string().url("Must be a valid URL").optional(),
  notes: z.string().max(1000).optional(),
  pricePerNight: z.number().positive().optional().nullable(),
})

export const ShortlistSchema = z.object({
  hotelId: z.string().min(1, "Hotel ID is required"),
  tripId: z.string().min(1, "Trip ID is required"),
})

export type CreateTripInput = z.infer<typeof CreateTripSchema>
export type UpdateTripInput = z.infer<typeof UpdateTripSchema>
export type CreateCityInput = z.infer<typeof CreateCitySchema>
export type UpdateCityInput = z.infer<typeof UpdateCitySchema>
export type CreateHotelInput = z.infer<typeof CreateHotelSchema>
export type UpdateHotelInput = z.infer<typeof UpdateHotelSchema>
export type ShortlistInput = z.infer<typeof ShortlistSchema>
