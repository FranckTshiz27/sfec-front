import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';
import { ClientItem } from './ClientItem';

export interface ColumnClientItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<ClientItem> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<ClientItem> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
}
