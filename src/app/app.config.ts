import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutes } from './app-routing.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(AppRoutes),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-custom', // Classe personalizada para a posição
      preventDuplicates: true,
      progressAnimation: 'increasing',
    }))
  ]
};
