import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Video, CheckCircle } from "lucide-react";

export default function DescriptionCard(props) {
  return (
    <Card className="h-full w-full rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          30 Minute Consultation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">Book a one-on-one consultation session.</p>

        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Video className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-900">
            Conducted via Zoom video call
          </span>
        </div>

        <div className="text-xs text-gray-500 border-t pt-3">
          Meeting details and calendar invite will be sent after booking
          confirmation.
        </div>
      </CardContent>
    </Card>
  );
}
