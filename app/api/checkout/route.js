// app/api/checkout/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { bookingOperations } from "@/lib/redis";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { bookingId } = await request.json();
    console.log("bookingId", bookingId);
    // Get booking details from Redis
    const booking = await bookingOperations.getBooking(bookingId);
    // console.log("booking", booking);
    // return NextResponse.json({ booking, bookingId });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        // { price: process.env.PRICE, quantity: 1 },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Consultation Booking",
              description: `Meeting with ${booking.fullName || "Client"} on ${
                booking.selectedTime
                  ? new Date(booking.selectedTime).toLocaleDateString()
                  : "TBD"
              }`,
            },
            unit_amount: 14000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/book/${bookingId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/book/${bookingId}/details`,
      metadata: {
        bookingId: bookingId,
      },
    });

    // Update booking with payment session info
    await bookingOperations.updateBooking(bookingId, {
      stripeSessionId: session.id,
      status: "payment-pending",
      step: "payment",
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
