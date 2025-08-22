import axios from "axios";

class ZoomService {
  constructor() {
    this.accountId = process.env.ZOOM_ACCOUNT_ID;
    this.clientId = process.env.ZOOM_CLIENT_ID;
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
    this.userEmail = process.env.ZOOM_USER_EMAIL;
    this.baseURL = "https://api.zoom.us/v2";
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        "https://zoom.us/oauth/token",
        new URLSearchParams({
          grant_type: "account_credentials",
          account_id: this.accountId,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${this.clientId}:${this.clientSecret}`
            ).toString("base64")}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;
      return this.accessToken;
    } catch (error) {
      console.error(
        "Error getting access token:",
        error.response?.data || error.message
      );
      throw new Error("Failed to authenticate with Zoom");
    }
  }

  async createMeeting(meetingData) {
    try {
      const token = await this.getAccessToken();

      const payload = {
        topic:
          meetingData.topic ||
          `Meeting with ${meetingData.attendeeName || "Guest"}`,
        type: 2, // Scheduled meeting
        start_time: meetingData.start_time,
        duration: 30, // Fixed 30 minutes
        timezone: "UTC",
        password: Math.random().toString(36).substring(2, 8),
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          use_pmi: false,
          approval_type: 2,
          audio: "both",
          auto_recording: "none",
        },
      };

      const response = await axios.post(
        `${this.baseURL}/users/${this.userEmail}/meetings`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error creating Zoom meeting:",
        error.response?.data || error.message
      );
      throw new Error("Failed to create Zoom meeting");
    }
  }
}

export default new ZoomService();
