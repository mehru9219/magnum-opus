import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSyncedAt?: number;
}

interface PlatformConnectionCardProps {
  platform: Platform;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function PlatformConnectionCard({
  platform,
  onConnect,
  onDisconnect,
}: PlatformConnectionCardProps) {
  return (
    <Card className={platform.connected ? "border-green-500" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{platform.icon}</span>
            <div>
              <CardTitle className="text-base">{platform.name}</CardTitle>
              <CardDescription className="text-xs">
                {platform.description}
              </CardDescription>
            </div>
          </div>
          {platform.connected ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {platform.connected ? (
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              Connected
            </Badge>
            {platform.lastSyncedAt && (
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(platform.lastSyncedAt).toLocaleDateString()}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={onConnect}
          >
            Connect
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
