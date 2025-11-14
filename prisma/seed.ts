import { PrismaClient } from "@prisma/client";
import { SlotType } from "../src/types";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await prisma.timeSlot.deleteMany();

    // Create weekly slots (Monday to Friday, 9 AM to 5 PM)
    const weeklySlots = [];
    for (let day = 1; day <= 5; day++) {
        for (let hour = 9; hour < 17; hour++) {
            weeklySlots.push({
                type: SlotType.WEEKLY,
                dayOfWeek: day,
                startTime: `${hour.toString().padStart(2, "0")}:00`,
                endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
                isBooked: false,
            });
        }
    }

    await prisma.timeSlot.createMany({
        data: weeklySlots,
    });

    console.log(`✅ Created ${weeklySlots.length} weekly slots`);

    // Create some flexible slots for next week
    const today = new Date();
    const flexibleSlots = [];

    for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        flexibleSlots.push(
            {
                type: SlotType.FLEXIBLE,
                date: dateStr,
                startTime: "10:00",
                endTime: "11:00",
                isBooked: false,
            },
            {
                type: SlotType.FLEXIBLE,
                date: dateStr,
                startTime: "14:00",
                endTime: "15:00",
                isBooked: false,
            }
        );
    }

    await prisma.timeSlot.createMany({
        data: flexibleSlots,
    });

    console.log(`✅ Created ${flexibleSlots.length} flexible slots`);

    // Create day-only slots
    const dayOnlySlots = [];
    for (let i = 8; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        dayOnlySlots.push({
            type: SlotType.DAY_ONLY,
            date: dateStr,
            isBooked: false,
        });
    }

    await prisma.timeSlot.createMany({
        data: dayOnlySlots,
    });

    console.log(`✅ Created ${dayOnlySlots.length} day-only slots`);
    console.log("✨ Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
