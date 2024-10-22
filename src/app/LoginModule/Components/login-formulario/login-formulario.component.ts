import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../../shared/Service/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastComponent } from '../../../../shared/toast/toast.component';

@Component({
  selector: 'app-login-formulario',
  standalone: true,
  imports: [FormsModule, ToastComponent],
  templateUrl: './login-formulario.component.html',
  styleUrls: ['./login-formulario.component.scss']
})
export class LoginFormularioComponent implements OnInit {
  email: string = '';
  password: string = '';
  register: boolean = false;
  full_name: string = '';
  @ViewChild(ToastComponent) toast!: ToastComponent;

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {}
  async login() {
    const data = await this.authService.login(this.email, this.password);
    if (data) {
      console.log('Login bem-sucedido:', data);
      this.showToast('Login bem-sucedido!', 'success');
      setTimeout(() => {
        this.router.navigate(['/dashboard/plans']);
      }, 500); // 5 segundos
    } else {
      console.error('Erro no login.');
      this.showToast('Erro no login.', 'error');
    }
  }

  async signUp() {
    const data = await this.authService.signUp(this.email, this.password, this.full_name);
    if (data) {
      console.log('Registro bem-sucedido:', data);
      this.showToast('Registro bem-sucedido!', 'success');
    } else {
      console.error('Erro no registro.');
      this.showToast('Erro no registro.', 'error');
    }
  }

  async logout() {
    await this.authService.logout();
    console.log('Logout bem-sucedido!');
    this.showToast('Logout bem-sucedido!', 'info');
  }

  toggleRegister() {
    this.register = !this.register;
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;
    setTimeout(() => this.toast.hideToast(), 3000);
  }
}
