import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder, } from 'ng-zorro-antd/table';
import { BrancheItem } from './BrancheItem';

export interface ColumnBrancheItem
{
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<BrancheItem> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<BrancheItem> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
}
