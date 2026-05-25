import { Routes } from '@angular/router';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { RecetasPage } from './pages/recetas-page/recetas-page';
import { ProduccionPage } from './pages/produccion-page/produccion-page';
import { VentasPage } from './pages/ventas-page/ventas-page';
import { AbastecimientoPage } from './pages/abastecimiento-page/abastecimiento-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'recetas', component: RecetasPage },
  { path: 'produccion', component: ProduccionPage },
  { path: 'ventas', component: VentasPage },
  { path: 'abastecimiento', component: AbastecimientoPage },
  { path: '**', component: NotFoundPage }
];
