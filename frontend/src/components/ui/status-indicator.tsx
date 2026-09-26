import React from "react";
import { Badge } from "@/components/ui/badge";
import { ObjectStatus, NodeStatus } from "@/types";

interface ObjectStatusBadgeProps {
  status: ObjectStatus;
  scheme?: string;
}

export function ObjectStatusBadge({ status, scheme = "4+2" }: ObjectStatusBadgeProps) {
  switch (status) {
    case "healthy":
      return (
        <Badge variant="success" dot>
          Healthy ({scheme})
        </Badge>
      );
    case "repairing":
      return (
        <Badge variant="warning" dot>
          Repairing ({scheme})
        </Badge>
      );
    case "degraded":
      return (
        <Badge variant="warning" dot>
          Degraded ({scheme})
        </Badge>
      );
    case "corrupted":
      return (
        <Badge variant="error" dot>
          Corrupted
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

interface NodeStatusBadgeProps {
  status: NodeStatus;
}

export function NodeStatusBadge({ status }: NodeStatusBadgeProps) {
  switch (status) {
    case "online":
      return (
        <Badge variant="success" dot>
          Online
        </Badge>
      );
    case "degraded":
      return (
        <Badge variant="warning" dot>
          Degraded
        </Badge>
      );
    case "offline":
      return (
        <Badge variant="error" dot>
          Offline
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
