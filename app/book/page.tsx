// app/book/page.jsx
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function BookPage() {
  // Generate booking ID on server
  const bookingId = uuidv4();

  // Redirect to dynamic route
  redirect(`/book/${bookingId}`);
}
