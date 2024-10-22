import { provideRouter, Routes } from '@angular/router';
import { PlansComponent } from './PlansModule/Components/plans/plans.component';
import { SettingsComponent } from './SettingsModule/Components/settings/settings.component';
import { login } from './LoginModule/Components/login/login.component';
import { DashboardComponent } from './DashboardModule/Components/dashboard/dashboard.component';
import { AnalyticsComponent } from './analyticsModule/Components/analytics/analytics.component';
import { ChatComponent } from './chatModule/components/chat/chat.component';
import { AuthGuard } from '../shared/Service/authguard.service';
import { PlanGuard } from '../shared/Service/plan.service';

export const AppRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'plans',
        component: PlansComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'analytics',
        component: AnalyticsComponent
      },
      {
        path: '',
        redirectTo: 'plans',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    component: login
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [AuthGuard, PlanGuard] // Adicione o PlanGuard aqui
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

export const appRoutingProviders = [
  provideRouter(AppRoutes)
];
