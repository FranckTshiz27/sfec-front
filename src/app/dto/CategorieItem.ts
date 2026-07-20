import { Branch } from '../models/branch';

export interface CategorieItem
{
  id: string;
  name: string;
  code: string;
  branch: Branch;
  nameArca: string;
}
