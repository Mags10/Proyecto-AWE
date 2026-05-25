import { Component } from '@angular/core';
import { KpiCard } from '../../components/dashboard/kpi-card/kpi-card';
import { ChartCard } from '../../components/dashboard/chart-card/chart-card';
import { AlertsTable } from '../../components/dashboard/alerts-table/alerts-table';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [KpiCard, ChartCard, AlertsTable],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css'
})
export class DashboardPage {}
