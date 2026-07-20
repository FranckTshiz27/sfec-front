export interface User {
  id: string;
  username: string;
  fname: string;
  lname: string;
  codeDemandeur: string;
  role: string;
  email: string;
  createdat: string;
  updatedat: string;
  keycloakId:string;
  intermediaries: any[];
  entreprises?: any[];
  userShop:any;
}
