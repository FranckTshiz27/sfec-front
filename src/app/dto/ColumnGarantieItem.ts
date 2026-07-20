import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';
import { GarantieItem } from './GarantieItem';

export interface ColumnGarantieItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<GarantieItem> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<GarantieItem> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
}
