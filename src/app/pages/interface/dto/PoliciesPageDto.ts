import { Policy } from "../Policy";

export interface PoliciesPageDto
{
  currentpage : number;
  size:number;
  total:number;
  pages:number;
  data: Policy[];
}
