"use client";

import { useState } from "react";

export default function SimpleBookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/create-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMeeting(data.meeting);
      } else {
        setError(data.error || "Failed to create meeting");
      }
    } catch (err) {
      console.error("Error creating meeting:", err);
      setError("Failed to create meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      date: "",
      time: "",
      message: "",
    });
    setMeeting(null);
    setError("");
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Format date for display
  const formatDateTime = (dateStr, timeStr) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (meeting) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-600 mb-6">
            Meeting Created Successfully!
          </h2>
        </div>

        <div className="space-y-6">
          {/* Meeting Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Meeting Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Meeting Topic:</span>
                <span>{meeting.topic}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date & Time:</span>
                <span>{formatDateTime(formData.date, formData.time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Duration:</span>
                <span>30 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Meeting ID:</span>
                <span className="font-mono">{meeting.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Password:</span>
                <span className="font-mono">{meeting.password}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Attendee:</span>
                <span>{meeting.attendee.name}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a
              href={meeting.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Join Zoom Meeting
            </a>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const subject = encodeURIComponent(
                    `Meeting: ${meeting.topic}`
                  );
                  const body = encodeURIComponent(
                    `Meeting Details:\n\n` +
                      `Topic: ${meeting.topic}\n` +
                      `Date & Time: ${formatDateTime(
                        formData.date,
                        formData.time
                      )}\n` +
                      `Duration: 30 minutes\n` +
                      `Join URL: ${meeting.joinUrl}\n` +
                      `Meeting ID: ${meeting.id}\n` +
                      `Password: ${meeting.password}\n\n` +
                      `See you there!\n\n` +
                      `Best regards,\n${
                        process.env.NEXT_PUBLIC_HOST_NAME || "Your Host"
                      }`
                  );
                  window.location.href = `mailto:${meeting.attendee.email}?subject=${subject}&body=${body}`;
                }}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Email Details
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Meeting: ${meeting.topic}\n` +
                      `Date & Time: ${formatDateTime(
                        formData.date,
                        formData.time
                      )}\n` +
                      `Join URL: ${meeting.joinUrl}\n` +
                      `Meeting ID: ${meeting.id}\n` +
                      `Password: ${meeting.password}`
                  );
                  alert("Meeting details copied to clipboard!");
                }}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Copy Details
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <button
              onClick={resetForm}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Create Another Meeting
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">
        Book a 30-Minute Zoom Meeting
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            min={getMinDate()}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Time *
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (Optional)
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What would you like to discuss?"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-blue-600 text-sm">
              <svg
                className="w-5 h-5 inline mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              This will create a 30-minute Zoom meeting at your specified time.
              You'll receive the meeting details immediately after submission.
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? "Creating Meeting..." : "Create Zoom Meeting"}
        </button>
      </form>
    </div>
  );
}
