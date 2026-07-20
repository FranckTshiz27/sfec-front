import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';
import { IntermediaireItem } from './IntermediaireItem';

export interface ColumnIntermediaireItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<IntermediaireItem> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<IntermediaireItem> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
}
