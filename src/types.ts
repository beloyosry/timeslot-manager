/**
 * Enum for time slot types
 */
export enum SlotType {
    WEEKLY = "WEEKLY",
    FLEXIBLE = "FLEXIBLE",
    DAY_ONLY = "DAY_ONLY",
}

/**
 * Base TimeSlot interface
 */
export interface TimeSlot {
    id: number;
    type: SlotType;
    dayOfWeek: number | null;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    isBooked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Create TimeSlot DTOs
 */
export interface CreateWeeklySlotDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface CreateFlexibleSlotDto {
    date: string;
    startTime: string;
    endTime: string;
}

export interface CreateDayOnlySlotDto {
    date: string;
}

/**
 * Filter and query options
 */
export interface ListSlotsFilter {
    type?: SlotType;
    isBooked?: boolean;
    dayOfWeek?: number;
    date?: string;
}

export interface BookingResult {
    success: boolean;
    slot?: TimeSlot;
    message?: string;
}
