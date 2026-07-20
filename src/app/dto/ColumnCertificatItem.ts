import {  NzTableFilterFn,  NzTableFilterList,  NzTableSortFn,  NzTableSortOrder,} from 'ng-zorro-antd/table';
import { Certificate } from './Certificate';

export interface ColumnCertificate {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<Certificate> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<Certificate> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
}
