import { ActionItem } from "./ActionItem";

export interface PermissionItem {
  id: string;
  user: any;
  action: ActionItem;
  status: boolean;
}
