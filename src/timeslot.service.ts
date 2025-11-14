import { PrismaClient } from "@prisma/client";
import { TimeSlotRepository } from "./timeslot.repository";
import { TimeSlot, ListSlotsFilter, BookingResult } from "./types";
import {
    SlotNotFoundError,
    SlotAlreadyBookedError,
    SlotNotBookedError,
} from "./errors";

/**
 * Service layer for TimeSlot business logic
 * Implements SOLID principles with clear separation of concerns
 */
export class TimeSlotService {
    private repository: TimeSlotRepository;

    constructor(prismaClient?: PrismaClient) {
        this.repository = new TimeSlotRepository(prismaClient);
    }

    /**
     * Create a weekly recurring time slot
     * @param dayOfWeek - Day of week (0 = Sunday, 6 = Saturday)
     * @param startTime - Start time in HH:MM format
     * @param endTime - End time in HH:MM format
     */
    async createWeekly(
        dayOfWeek: number,
        startTime: string,
        endTime: string
    ): Promise<TimeSlot> {
        return this.repository.createWeekly({ dayOfWeek, startTime, endTime });
    }

    /**
     * Create a flexible one-time time slot
     * @param date - Date in YYYY-MM-DD format
     * @param startTime - Start time in HH:MM format
     * @param endTime - End time in HH:MM format
     */
    async createFlexible(
        date: string,
        startTime: string,
        endTime: string
    ): Promise<TimeSlot> {
        return this.repository.createFlexible({ date, startTime, endTime });
    }

    /**
     * Create a day-only slot without specific time
     * @param date - Date in YYYY-MM-DD format
     */
    async createDayOnly(date: string): Promise<TimeSlot> {
        return this.repository.createDayOnly({ date });
    }

    /**
     * List all time slots with optional filters
     */
    async listAll(filter?: ListSlotsFilter): Promise<TimeSlot[]> {
        return this.repository.listAll(filter);
    }

    /**
     * Get available (non-booked) slots
     */
    async listAvailable(
        filter?: Omit<ListSlotsFilter, "isBooked">
    ): Promise<TimeSlot[]> {
        return this.repository.listAll({ ...filter, isBooked: false });
    }

    /**
     * Get booked slots
     */
    async listBooked(
        filter?: Omit<ListSlotsFilter, "isBooked">
    ): Promise<TimeSlot[]> {
        return this.repository.listAll({ ...filter, isBooked: true });
    }

    /**
     * Get a specific slot by ID
     */
    async getById(id: number): Promise<TimeSlot> {
        const slot = await this.repository.findById(id);
        if (!slot) {
            throw new SlotNotFoundError(id);
        }
        return slot;
    }

    /**
     * Book a time slot
     * @param slotId - The ID of the slot to book
     */
    async book(slotId: number): Promise<BookingResult> {
        const slot = await this.repository.findById(slotId);

        if (!slot) {
            throw new SlotNotFoundError(slotId);
        }

        if (slot.isBooked) {
            throw new SlotAlreadyBookedError(slotId);
        }

        const updatedSlot = await this.repository.updateBookingStatus(
            slotId,
            true
        );

        return {
            success: true,
            slot: updatedSlot,
            message: "Slot booked successfully",
        };
    }

    /**
     * Cancel a booking
     * @param slotId - The ID of the slot to cancel
     */
    async cancel(slotId: number): Promise<BookingResult> {
        const slot = await this.repository.findById(slotId);

        if (!slot) {
            throw new SlotNotFoundError(slotId);
        }

        if (!slot.isBooked) {
            throw new SlotNotBookedError(slotId);
        }

        const updatedSlot = await this.repository.updateBookingStatus(
            slotId,
            false
        );

        return {
            success: true,
            slot: updatedSlot,
            message: "Booking cancelled successfully",
        };
    }

    /**
     * Delete a time slot
     * @param slotId - The ID of the slot to delete
     */
    async delete(slotId: number): Promise<void> {
        const slot = await this.repository.findById(slotId);

        if (!slot) {
            throw new SlotNotFoundError(slotId);
        }

        await this.repository.delete(slotId);
    }

    /**
     * Close the database connection
     */
    async disconnect(): Promise<void> {
        await this.repository.disconnect();
    }
}
