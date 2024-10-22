import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PlanGuard implements CanActivate {
  userId = '';
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  async canActivate(): Promise<boolean> {
    this.setUserIDFromToken();
    const userId = this.userId;

    console.log(userId, 'aaaaaaaaaaaaaaaaaaaa');
    if (!userId) {
      this.toastr.warning('Você não está autenticado.', 'Acesso Negado');
      return false;
    }

    const user = await this.authService.getUserById(userId);
    if (user && user.plan_id) {
      return true;
    } else {
      this.toastr.warning('Você não possui nenhum plano para acessar o chat.', 'Acesso Negado');
      return false;
    }
  }

  setUserIDFromToken(): void {
    const token = localStorage.getItem('authToken');
    console.log('Token:', token);
    if (token) {
      const decodedToken = this.authService.decodeToken(token);
      console.log('Decoded token:', decodedToken);
      if (decodedToken && decodedToken.id) {
        this.userId = decodedToken.id;
      }
    }
  }
}
