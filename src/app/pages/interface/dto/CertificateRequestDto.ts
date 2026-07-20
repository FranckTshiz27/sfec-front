import { Policy } from "../Policy";
import { Risk } from "../Risk";

export interface CertificatRequestDto
{
 policy : Policy
 risks: Risk[]
}
