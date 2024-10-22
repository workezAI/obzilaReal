import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/sidebar/sidebar.component';
import { AuthService } from '../../../../shared/Service/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastComponent } from '../../../../shared/toast/toast.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, FormsModule, ToastComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements AfterViewInit {
  newName: string = '';
  newEmail: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  @ViewChild(ToastComponent) toast!: ToastComponent;

  originalName: string = ''; // Armazena o nome original
  originalEmail: string = ''; // Armazena o email original

  @ViewChild('pwHolder') pwHolder!: ElementRef;
  @ViewChild('resetPw') resetPw!: ElementRef;
  @ViewChild('mailHolder') mailHolder!: ElementRef;
  @ViewChild('changeMail') changeMail!: ElementRef;
  @ViewChild('nameHolder') nameHolder!: ElementRef;
  @ViewChild('changeName') changeName!: ElementRef;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Puxar os dados do usuário logado quando o componente for carregado
    this.authService.getLoggedInUser().then(user => {
      if (user) {
        this.newName = user.full_name ?? ''; // Fornece um valor padrão se user.name for undefined
        this.newEmail = user.email ?? ''; // Fornece um valor padrão se user.email for undefined
        this.originalName = user.full_name ?? ''; // Fornece um valor padrão se user.name for undefined
        this.originalEmail = user.email ?? ''; // Fornece um valor padrão se user.email for undefined
      } else {
        this.showToast('Erro ao carregar os dados do usuário logado', 'error');
        console.error('Erro ao carregar os dados do usuário logado');
      }
    }).catch(error => {
      this.showToast('Erro ao buscar usuário', 'error');
      console.error('Erro ao buscar usuário:', error);
    });
  }

  ngAfterViewInit() {
    // Verificar se os elementos foram carregados
    console.log('pwHolder:', this.pwHolder);
    console.log('resetPw:', this.resetPw);
  }

  // Função genérica de alteração de visualização de elementos
  toggleElementVisibility(holder: ElementRef, changer: ElementRef, show: boolean) {
    if (holder && changer) {
      holder.nativeElement.style.display = show ? 'none' : 'flex';
      changer.nativeElement.style.display = show ? 'flex' : 'none';
    }
  }

  changeMailActive() {
    this.toggleElementVisibility(this.mailHolder, this.changeMail, true);
  }

  changeNameActive() {
    this.toggleElementVisibility(this.nameHolder, this.changeName, true);
  }

  changePwActive() {
    this.toggleElementVisibility(this.pwHolder, this.resetPw, true);
  }

  // Função para salvar alterações
  async saveChanges() {
    try {
      // Verifica se o nome foi alterado
      if (this.newName !== this.originalName) {
        await this.authService.updateUserName(this.newName);
        this.originalName = this.newName; // Atualiza o valor original
        this.toggleElementVisibility(this.nameHolder, this.changeName, false);
      }

      // Verifica se o email foi alterado
      if (this.newEmail !== this.originalEmail) {
        await this.authService.updateUserEmail(this.newEmail);
        this.originalEmail = this.newEmail; // Atualiza o valor original
        this.toggleElementVisibility(this.mailHolder, this.changeMail, false);
      }

      // Verifica se a senha foi alterada
      if (this.newPassword && this.currentPassword) {
        const isCurrentPasswordValid = await this.authService.verifyCurrentPassword(this.currentPassword);
        if (isCurrentPasswordValid) {
          await this.authService.updateUserPassword(this.newPassword);
          // Limpar campos de senha após a alteração
          this.currentPassword = '';
          this.newPassword = '';
          this.toggleElementVisibility(this.pwHolder, this.resetPw, false);
        } else {
          this.showToast('Senha atual inválida', 'error');
          console.error('Senha atual inválida');
        }
      }
      this.showToast('Alterações salvas com sucesso!', 'success');
      console.log('Alterações salvas com sucesso!');
    } catch (error) {
      this.showToast('Erro ao salvar alterações', 'error');
      console.error('Erro ao salvar alterações:', error);
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;
    setTimeout(() => this.toast.hideToast(), 3000);
  }
}
