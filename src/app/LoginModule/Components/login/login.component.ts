import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginFormularioComponent } from '../login-formulario/login-formulario.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,LoginFormularioComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class login implements OnInit {
  loginLoading = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Simula uma requisição de 4 segundos para verificar o token
    setTimeout(() => {
      this.checkUserToken();
    }, 4000);
  }

  checkUserToken() {
    // Simula a verificação do token do usuário
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      // Se o token existir, redireciona para o painel
      this.router.navigate(['/painel']);
    } else {
      // Se não existir, exibe a tela de login
      this.loginLoading = false;
    }
  }

  goToRoute(route: string) {
    this.router.navigate([route]);
  }
}
