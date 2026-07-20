import { NzTableSortOrder, NzTableSortFn, NzTableFilterList, NzTableFilterFn } from 'ng-zorro-antd/table';
import { Policy } from './Policy';

export interface ColumnPolicyItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<Policy> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<Policy> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
  colWidth:string
}
