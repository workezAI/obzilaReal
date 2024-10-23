import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../../../shared/Service/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login-formulario',
  standalone: true,
  imports: [FormsModule, ButtonModule, NgIf],
  templateUrl: './login-formulario.component.html',
  styleUrls: ['./login-formulario.component.scss']
})
export class LoginFormularioComponent implements OnInit {
  email: string = '';
  password: string = '';
  register: boolean = false;
  full_name: string = '';
  loading: boolean = false;

  @ViewChild('loginButton', { static: false }) loginButton!: ElementRef;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  async ngOnInit() {}

  async login() {
    this.loading = true;
    try {
      const data = await this.authService.login(this.email, this.password);
      if (data) {
        console.log('Login bem-sucedido:', data);
        setTimeout(() => {
          this.router.navigate(['/dashboard/plans']);
        }, 50); // 5 segundos
      }
    } catch (error: any) {
      console.error('Erro no login:', error.message);
    } finally {
      this.loading = false;
    }
  }

  async signUp() {
    try {
      const data = await this.authService.signUp(this.email, this.password, this.full_name);
      if (data) {
        console.log('Registro bem-sucedido:', data);
        this.toastr.success('Registro bem-sucedido!', 'Sucesso');
        this.register = false;
        setTimeout(() => {
          this.loginButton.nativeElement.click();
        }, 500); // Clicar no botão de login automaticamente
      } else {
      }
    } catch (error: any) {
      console.error('Erro no registro:', error.message);
      this.toastr.error('Erro no registro: ' + error.message, 'Erro');
    }
  }

  async logout() {
    await this.authService.logout();
    console.log('Logout bem-sucedido!');
    this.toastr.success('Logout bem-sucedido!', 'Sucesso');
  }

  toggleRegister() {
    this.register = !this.register;
  }
}
