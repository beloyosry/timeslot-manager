// Main exports
export { TimeSlotService } from "./timeslot.service";
export { TimeSlotRepository } from "./timeslot.repository";

// Type exports
export {
    TimeSlot,
    SlotType,
    CreateWeeklySlotDto,
    CreateFlexibleSlotDto,
    CreateDayOnlySlotDto,
    ListSlotsFilter,
    BookingResult,
} from "./types";

// Error exports
export {
    TimeSlotError,
    SlotNotFoundError,
    SlotAlreadyBookedError,
    SlotNotBookedError,
    ValidationError,
    DatabaseError,
} from "./errors";
