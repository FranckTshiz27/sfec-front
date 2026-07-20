import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';
import { DtoGarantieItem } from './DtoGarantieItem';

export interface ColumnDtoGarantieItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<DtoGarantieItem> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<DtoGarantieItem> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
}
