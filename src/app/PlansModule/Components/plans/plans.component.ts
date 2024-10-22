import { Component, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/sidebar/sidebar.component';
import { AuthService } from '../../../../shared/Service/auth.service'; // Importe o AuthService para gerenciar o usuário
import { NgIf } from '@angular/common';
import { ToastComponent } from '../../../../shared/toast/toast.component';
import { Message } from '../types/message.type';
import { ProgressSpinnerModule } from 'primeng/progressspinner'; // Importe o ProgressSpinnerModule

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, NgIf, ToastComponent, ProgressSpinnerModule],
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {
  sidebarVisible: boolean = false;
  @ViewChild(ToastComponent) toast!: ToastComponent;
  userID: string = ''; // Inicializar como string vazia
  planID: string = ''; // Inicializar como string vazia para armazenar o plan_id do usuário
  userPlan: string = ''; // Inicializar como string vazia para armazenar o nome do plano do usuário
  userMessages: Message[] = []; // Inicializar como array vazio para armazenar as mensagens do usuário
  hasPlan: boolean = false; // Propriedade para controlar a exibição da div
  isLoading: boolean = true;
  constructor(private auth: AuthService) { }

  async ngOnInit() {
    this.setUserIDFromToken();
    if (this.userID) {
      try {
        const userData = await this.auth.getUserById(this.userID);
        console.log('User data:', userData);
        if (userData) {
          this.userID = userData.id;
          this.planID = userData.plan_id ?? ''; // Armazenar o plan_id do usuário
          console.log('User ID:', this.userID);
          console.log('Plan ID:', this.planID);
          // Buscar os dados do plano usando o plan_id
          const planData = await this.auth.getPlanById(this.planID);
          console.log('Plan data:', planData);
          if (planData) {
            this.userPlan = planData.name;
            console.log('User plan:', this.userPlan);
            this.hasPlan = true; // Definir hasPlan como true se o usuário tiver um plano
          }
          console.log('cheguei aqui para pegar as mensagens')
          await this.getUserMessages();
        }
      } catch (error) {
        console.error('Error fetching user or plan data:', error);
      } finally {
        this.isLoading = false; // Definir isLoading como false após carregar os dados
      }
    }
  }

  setUserIDFromToken(): void {
    const token = localStorage.getItem('authToken');
    console.log('Token:', token);
    if (token) {
      const decodedToken = this.auth.decodeToken(token);
      console.log('Decoded token:', decodedToken);
      if (decodedToken && decodedToken.id) {
        this.userID = decodedToken.id;
      }
    }
  }
  redirectToCheckout(planName: string) {
    console.log('Redirecionando para o checkout:', planName);
    const planUrls: { [key: string]: string } = {
      basic: 'https://go.perfectpay.com.br/PPU38CP4O1P',
      gold: 'https://go.perfectpay.com.br/PPU38CP4O1Q',
      afiliado: 'https://go.perfectpay.com.br/PPU38CP5530'
    };
console.log('Redirecionando para o checkout:', planName);
    const url = planUrls[planName.toLowerCase()];
    if (url) {
      window.location.href = url;
      console.log('Redirecionando para o checkout:', url);
    } else {
      console.error('Plano inválido:', planName);
    }
  }
  async getUserMessages() {
    try {
      const messages = await this.auth.getMessages();
      if (messages) {
        this.userMessages = messages.filter((message: Message) => message.user_id === this.userID);
        console.log('User messages:', this.userMessages);
      }
    } catch (error) {
      console.error('Error fetching user messages:', error);
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'info') {
    this.toast.message = message;
    this.toast.type = type;
    this.toast.show = true;
    setTimeout(() => this.toast.hideToast(), 3000);
  }
}
