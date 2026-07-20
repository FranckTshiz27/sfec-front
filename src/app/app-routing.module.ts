import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './pages/user/user.component';
import { AuthGuard } from './guards/auth.guard';
import { IntermediaireNewComponent } from './pages/intermediaire/intermediaire-new.component';
import { villeComponent } from './pages/ville/ville.component';
import { communeComponent } from './pages/commune/commune.component';
import { StatusComponent } from './pages/status/status.component';
import { InvoiceListComponent } from './pages/invoices/invoice-list.component';
import { ShopComponent } from './pages/shop/shop.component';
import { TransactionListDoneComponent } from './pages/transaction/transaction-list-done.component';
import { RapportComponent } from './pages/rapport/rapport.component';
import { ExchangeRateComponent } from './pages/exchange-rate/exchange-rate.component';
import { EntrepriseComponent } from './pages/entreprise/entreprise.component';

const routes: Routes = [
  { path: '', redirectTo: 'home/invoice', pathMatch: 'full' },
  {
    path: 'home',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'invoice',
        pathMatch: 'full',
      },
      {
        path: 'invoice',
        component: InvoiceListComponent,
      },
      {
        path: 'transaction',
        component: TransactionListDoneComponent,
      },
    ],
  },

  { path: 'user', component: UserComponent },
  { path: 'intermediaire', component: IntermediaireNewComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'ville', component: villeComponent },
  { path: 'rapports', component: RapportComponent },
  { path: 'commune', component: communeComponent },
  { path: 'status', component: StatusComponent },
  { path: 'taux', component: ExchangeRateComponent },
  { path: 'entreprise', component: EntrepriseComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
