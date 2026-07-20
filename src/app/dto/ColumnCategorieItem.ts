import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder, } from 'ng-zorro-antd/table';
import { CategorieItem } from './CategorieItem';

export interface ColumnCategorieItem
{
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<CategorieItem> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<CategorieItem> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
}
