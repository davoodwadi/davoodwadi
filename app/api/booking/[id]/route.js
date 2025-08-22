// app/api/booking/[id]/route.js
import { NextResponse } from "next/server";
import { bookingOperations } from "@/lib/redis";

// GET - Retrieve booking
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    console.log("GET id", id);
    const booking = await bookingOperations.getBooking(id);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error retrieving booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new booking
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    console.log("POST id", id);

    const data = await request.json();

    const booking = await bookingOperations.createBooking(id, {
      id,
      status: "active",
      ...data,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update booking
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    console.log("PATCH id", id);

    const updates = await request.json();

    const booking = await bookingOperations.updateBooking(id, updates);
    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    if (error.message === "Booking not found") {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete booking
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    console.log("DELETE id", id);

    await bookingOperations.deleteBooking(id);
    return NextResponse.json({ message: "Booking deleted" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
