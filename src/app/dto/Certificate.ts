import { Unit } from './Unit';
export interface Certificate
{
  id: string;
  envid: string;
  certificateNumber: string;
  name: string;
  reference: string;
  mark: string;
  weight: string;
  unsta: Unit;
  description_cargo: string;
  netPremium: string;
  lta: string;
  nbColis: string;
  navy: string;
  from: string;
  to: string;
  via: string;
  insuranceValue: string;
  tripDate: string;
  vatValue: string;
  arcaValue: string;
  accessory: string;
  vatPercent: string;
  arcaPercent: string;
  status: string;
  ratePremiumRO: number;
  netPremiumRO: number;
  ratePremiumRG: number;
  netPremiumRG: number;
  ratePremiumSU: number;
  netPremiumSU: number;
  totalPremium: number;
  createdat: Date;
  usercreate: any;
  garantie: string;
  statusArca: string;
  message: string;
  msgcode: string;
  sent_date: Date;
  received_date: Date;
  waiting_time: number;
  policyNumber:string;
  assure :string
}
