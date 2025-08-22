import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export async function POST(request) {
  try {
    const { booking, meeting } = await request.json();

    if (!booking || !meeting) {
      return NextResponse.json(
        { error: "Booking and meeting details are required" },
        { status: 400 }
      );
    }

    // Create transporter using Gmail SMTP - FIXED: createTransport not createTransporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Format the date and time
    const appointmentDate = format(
      new Date(booking.selectedTime),
      "EEEE, MMMM do, yyyy"
    );
    const appointmentTime = formatInTimeZone(
      new Date(booking.selectedTime),
      booking.selectedTimezone || "America/Los_Angeles",
      "h:mm a"
    );

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .meeting-details { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .button { background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: #28a745; margin: 0;">✅ Booking Confirmed!</h1>
              <p>Your consultation appointment has been successfully scheduled</p>
            </div>
            
            <div class="content">
              <p>Dear ${booking.fullName},</p>
              
              <p>Thank you for booking your consultation! Your appointment has been confirmed and payment has been processed successfully.</p>
              
              <h3>📅 Appointment Details</h3>
              <ul>
                <li><strong>Date:</strong> ${appointmentDate}</li>
                <li><strong>Time:</strong> ${appointmentTime} ${
      booking.selectedTimezone || "PST"
    }</li>
                <li><strong>Duration:</strong> ${meeting.duration} minutes</li>
                <li><strong>Client:</strong> ${booking.fullName}</li>
                <li><strong>Email:</strong> ${booking.email}</li>
              </ul>
              
              <div class="meeting-details">
                <h3>💻 Meeting Details</h3>
                <p><strong>Meeting Topic:</strong> ${meeting.topic}</p>
                <p><strong>Meeting ID:</strong> ${meeting.id}</p>
                ${
                  meeting.password
                    ? `<p><strong>Password:</strong> ${meeting.password}</p>`
                    : ""
                }
                <p style="margin-top: 15px;">
                  <a href="${
                    meeting.joinUrl
                  }" class="button">Join Zoom Meeting</a>
                </p>
                <p><small>Or copy this link: ${meeting.joinUrl}</small></p>
              </div>
              
              <h3>📝 What's Next?</h3>
              <ul>
                <li>Save this email for your records</li>
                <li>A calendar invite has been added to your calendar</li>
                <li>Join the meeting using the link above at your scheduled time</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
              </ul>
              
              <p>We look forward to speaking with you!</p>
            </div>
            
            <div class="footer">
              <p>This is an automated confirmation email. Please save this information for your records.</p>
              <p>If you have any questions, please reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create plain text version
    const textContent = `
Booking Confirmed!

Dear ${booking.fullName},

Thank you for booking your consultation! Your appointment has been confirmed and payment has been processed successfully.

APPOINTMENT DETAILS
Date: ${appointmentDate}
Time: ${appointmentTime} ${booking.selectedTimezone || "PST"}
Duration: ${meeting.duration} minutes
Client: ${booking.fullName}
Email: ${booking.email}

MEETING DETAILS
Meeting Topic: ${meeting.topic}
Meeting ID: ${meeting.id}
${meeting.password ? `Password: ${meeting.password}` : ""}
Join URL: ${meeting.joinUrl}

WHAT'S NEXT
- Save this email for your records
- A calendar invite has been added to your calendar
- Join the meeting using the link above at your scheduled time
- If you need to reschedule, please contact us at least 24 hours in advance

We look forward to speaking with you!

This is an automated confirmation email. Please save this information for your records.
If you have any questions, please reply to this email.
    `;

    // Email options
    const mailOptions = {
      from: `"Davood Wadi" <${process.env.GMAIL_EMAIL}>`,
      to: booking.email,
      subject: `Consultation Confirmed - ${appointmentDate} at ${appointmentTime}`,
      text: textContent,
      html: htmlContent,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: "Confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json(
      {
        error: "Failed to send confirmation email",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
