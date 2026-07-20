import { User } from 'src/app/models/user';
import { ActionType } from 'src/app/enum/ActionType';

export interface HistoryDto {
  objectId: string;
  objectName: string;
  ip: string;
  details: string;
  actionType: ActionType;
  usercreate: User;
}
