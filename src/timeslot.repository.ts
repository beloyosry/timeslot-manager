import { PrismaClient } from "@prisma/client";
import {
    TimeSlot,
    SlotType,
    CreateWeeklySlotDto,
    CreateFlexibleSlotDto,
    CreateDayOnlySlotDto,
    ListSlotsFilter,
} from "./types";
import { DatabaseError, ValidationError } from "./errors";

/**
 * Repository pattern implementation for TimeSlot data access
 * Handles all database operations with Prisma
 */
export class TimeSlotRepository {
    private prisma: PrismaClient;

    constructor(prismaClient?: PrismaClient) {
        this.prisma = prismaClient || new PrismaClient();
    }

    /**
     * Create a weekly recurring time slot
     */
    async createWeekly(dto: CreateWeeklySlotDto): Promise<TimeSlot> {
        this.validateWeeklySlot(dto);

        try {
            const slot = await this.prisma.timeSlot.create({
                data: {
                    type: SlotType.WEEKLY,
                    dayOfWeek: dto.dayOfWeek,
                    startTime: dto.startTime,
                    endTime: dto.endTime,
                    isBooked: false,
                },
            });

            return this.mapToTimeSlot(slot);
        } catch (error) {
            throw new DatabaseError("Failed to create weekly slot", error);
        }
    }

    /**
     * Create a flexible one-time time slot
     */
    async createFlexible(dto: CreateFlexibleSlotDto): Promise<TimeSlot> {
        this.validateFlexibleSlot(dto);

        try {
            const slot = await this.prisma.timeSlot.create({
                data: {
                    type: SlotType.FLEXIBLE,
                    date: dto.date,
                    startTime: dto.startTime,
                    endTime: dto.endTime,
                    isBooked: false,
                },
            });

            return this.mapToTimeSlot(slot);
        } catch (error) {
            throw new DatabaseError("Failed to create flexible slot", error);
        }
    }

    /**
     * Create a day-only slot without specific time
     */
    async createDayOnly(dto: CreateDayOnlySlotDto): Promise<TimeSlot> {
        this.validateDayOnlySlot(dto);

        try {
            const slot = await this.prisma.timeSlot.create({
                data: {
                    type: SlotType.DAY_ONLY,
                    date: dto.date,
                    isBooked: false,
                },
            });

            return this.mapToTimeSlot(slot);
        } catch (error) {
            throw new DatabaseError("Failed to create day-only slot", error);
        }
    }

    /**
     * Find a time slot by ID
     */
    async findById(id: string): Promise<TimeSlot | null> {
        try {
            const slot = await this.prisma.timeSlot.findUnique({
                where: { id },
            });

            return slot ? this.mapToTimeSlot(slot) : null;
        } catch (error) {
            throw new DatabaseError(`Failed to find slot with ID ${id}`, error);
        }
    }

    /**
     * List all time slots with optional filters
     */
    async listAll(filter?: ListSlotsFilter): Promise<TimeSlot[]> {
        try {
            const where: any = {};

            if (filter?.type) where.type = filter.type;
            if (filter?.isBooked !== undefined)
                where.isBooked = filter.isBooked;
            if (filter?.dayOfWeek !== undefined)
                where.dayOfWeek = filter.dayOfWeek;
            if (filter?.date) where.date = filter.date;

            const slots = await this.prisma.timeSlot.findMany({
                where,
                orderBy: [{ date: "asc" }, { startTime: "asc" }],
            });

            return slots.map(this.mapToTimeSlot);
        } catch (error) {
            throw new DatabaseError("Failed to list slots", error);
        }
    }

    /**
     * Update a time slot's booking status
     */
    async updateBookingStatus(
        id: string,
        isBooked: boolean
    ): Promise<TimeSlot> {
        try {
            const slot = await this.prisma.timeSlot.update({
                where: { id },
                data: { isBooked },
            });

            return this.mapToTimeSlot(slot);
        } catch (error) {
            throw new DatabaseError(
                `Failed to update booking status for slot ${id}`,
                error
            );
        }
    }

    /**
     * Delete a time slot
     */
    async delete(id: string): Promise<void> {
        try {
            await this.prisma.timeSlot.delete({
                where: { id },
            });
        } catch (error) {
            throw new DatabaseError(`Failed to delete slot ${id}`, error);
        }
    }

    /**
     * Close Prisma connection
     */
    async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
    }

    // Private validation methods

    private validateWeeklySlot(dto: CreateWeeklySlotDto): void {
        if (dto.dayOfWeek < 0 || dto.dayOfWeek > 6) {
            throw new ValidationError(
                "dayOfWeek must be between 0 (Sunday) and 6 (Saturday)"
            );
        }
        this.validateTime(dto.startTime);
        this.validateTime(dto.endTime);
        this.validateTimeRange(dto.startTime, dto.endTime);
    }

    private validateFlexibleSlot(dto: CreateFlexibleSlotDto): void {
        this.validateDate(dto.date);
        this.validateTime(dto.startTime);
        this.validateTime(dto.endTime);
        this.validateTimeRange(dto.startTime, dto.endTime);
    }

    private validateDayOnlySlot(dto: CreateDayOnlySlotDto): void {
        this.validateDate(dto.date);
    }

    private validateDate(date: string): void {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            throw new ValidationError("Date must be in YYYY-MM-DD format");
        }

        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            throw new ValidationError("Invalid date");
        }
    }

    private validateTime(time: string): void {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            throw new ValidationError("Time must be in HH:MM format (24-hour)");
        }
    }

    private validateTimeRange(startTime: string, endTime: string): void {
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);

        if (start >= end) {
            throw new ValidationError("Start time must be before end time");
        }
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    }

    private mapToTimeSlot(slot: any): TimeSlot {
        return {
            id: slot.id,
            type: slot.type as SlotType,
            dayOfWeek: slot.dayOfWeek,
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: slot.isBooked,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,
        };
    }
}
