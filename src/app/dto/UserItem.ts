import { IntermediaireItem } from "./IntermediaireItem";
import { PermissionItem } from "./PermissionItem";


export interface UserItem {

    // fieds
     id:string;
     keycloakId:string;
     fname:string;
     lname:string;
     permissions:PermissionItem[]
     intermediaries:IntermediaireItem[]

    // Methodes
}
