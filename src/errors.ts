/**
 * Base error class for TimeSlot operations
 */
export class TimeSlotError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TimeSlotError";
        Object.setPrototypeOf(this, TimeSlotError.prototype);
    }
}

/**
 * Error thrown when a slot is not found
 */
export class SlotNotFoundError extends TimeSlotError {
    constructor(slotId: number) {
        super(`Time slot with ID ${slotId} not found`);
        this.name = "SlotNotFoundError";
        Object.setPrototypeOf(this, SlotNotFoundError.prototype);
    }
}

/**
 * Error thrown when attempting to book an already booked slot
 */
export class SlotAlreadyBookedError extends TimeSlotError {
    constructor(slotId: number) {
        super(`Time slot with ID ${slotId} is already booked`);
        this.name = "SlotAlreadyBookedError";
        Object.setPrototypeOf(this, SlotAlreadyBookedError.prototype);
    }
}

/**
 * Error thrown when attempting to cancel a slot that is not booked
 */
export class SlotNotBookedError extends TimeSlotError {
    constructor(slotId: number) {
        super(`Time slot with ID ${slotId} is not booked`);
        this.name = "SlotNotBookedError";
        Object.setPrototypeOf(this, SlotNotBookedError.prototype);
    }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends TimeSlotError {
    constructor(message: string) {
        super(`Validation error: ${message}`);
        this.name = "ValidationError";
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Error thrown when database operations fail
 */
export class DatabaseError extends TimeSlotError {
    constructor(message: string, public originalError?: unknown) {
        super(`Database error: ${message}`);
        this.name = "DatabaseError";
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}
