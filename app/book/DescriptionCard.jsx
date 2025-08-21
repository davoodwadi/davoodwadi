import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DescriptionCard(props) {
  return (
    <Card className="h-full w-full rounded-none">
      <CardHeader>
        <CardTitle>30 Minute Meeting</CardTitle>
      </CardHeader>
      <CardContent>30 Minute Meeting</CardContent>
    </Card>
  );
}
