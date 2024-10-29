import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { AuthService } from '../../../../shared/Service/auth.service';
import { Message } from '../../../PlansModule/Components/types/message.type';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, NavbarComponent], // Adiciona o CommonModule para usar ngClass
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  userQuestions: string[] = [];
  aiResponses: string[] = [];
  canSendMessage: boolean = true; // Controla se o envio de mensagem é permitido
  shouldScroll: boolean = true; // Controla se o chat deve rolar automaticamente para o fim
  aiMode: string = 'normal';
  userMessages: Message[] = []; // Inicializa ai_mode com 'normal'
  userID = '';
  user: any;
  plan: any; // Variável para armazenar os dados do plano
  dailyMessageCount: number = 0; // Variável para contar as mensagens diárias

  constructor(private changeDetectorRef: ChangeDetectorRef, private auth: AuthService) {}

  async ngOnInit() {
    this.setUserIDFromToken();
    await this.getUser();
    await this.getUserMessages();
    this.changeDetectorRef.detectChanges();
  }

  async getUser() {
    try {
      this.user = await this.auth.getUserById(this.userID);

      if (this.user && this.user.plan_id) {
        await this.getPlanById(this.user.plan_id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async getPlanById(planID: string) {
    try {
      this.plan = await this.auth.getPlanById(planID);
    } catch (error) {
      console.error('Error fetching plan data:', error);
    }
  }

  async postMessages(mensagem: string) {
    try {
      const plan_id = this.user.plan_id;
      const user_id = this.user.id;
      const data_envio = new Date().toISOString(); // Data de envio atual

      const message = await this.auth.postMessagens(mensagem, plan_id, user_id, data_envio);
    } catch (error) {
      console.error('Error posting message data:', error);
    }
  }

  async getUserMessages() {
    try {
      const messages = await this.auth.getMessagesById(this.user.id);

      if (messages.length > 0) {
        const envioDate = new Date(messages[0].data_envio).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        if (envioDate < today) {
          await this.resetMessageCountOnServer();
        } else {
          this.dailyMessageCount = parseInt(messages[0].message_count, 10);
        }
      } else {
        this.dailyMessageCount = 0;
      }
    } catch (error) {
      console.error('Error fetching user messages:', error);
    }
  }

  // Método para verificar se o chat está no final
  onChatScroll(event: any) {
    const chatArea = event.target;
    const isAtBottom = Math.abs(chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight) < 10;
    this.shouldScroll = isAtBottom;
  }

  // Adiciona event listener para o Enter, diretamente no template agora
  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.canSendMessage && !event.shiftKey) {
      event.preventDefault();  // Previne a quebra de linha
      this.sendMessage(); // Chama o método de envio de mensagem
    }
  }

  setUserIDFromToken(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = this.auth.decodeToken(token);
      if (decodedToken && decodedToken.id) {
        this.userID = decodedToken.id;
      }
    }
  }

  // Método para enviar a mensagem
  async sendMessage() {
    const inputElement = document.getElementById('userInput') as HTMLTextAreaElement;
    const sendButton = document.getElementById('sendButton') as HTMLElement;
    const messageText = inputElement.value.trim();

    if (!messageText || !this.canSendMessage) return;

    // Verificar o limite de mensagens
    if (this.plan && this.dailyMessageCount >= this.plan.message_limit) {
      this.appendMessage('bot', 'Você atingiu o limite diário de mensagens.');
      this.canSendMessage = false; // Desabilita o envio de novas mensagens
      sendButton.style.opacity = '0.5'; // Opacidade reduzida
      return;
    }

    // Desabilita o envio de novas mensagens
    this.canSendMessage = false;
    sendButton.style.opacity = '0.5'; // Opacidade reduzida

    // Limpa o input e esconde a mensagem de boas-vindas
    inputElement.value = '';
    const messageBox = document.getElementById('messageBox');
    const chatArea = document.getElementById('chatArea');

    if (messageBox) {
      messageBox.style.display = 'none';
      chatArea!.style.display = 'flex';
    }

    // Exibe a mensagem do usuário no chat
    this.userQuestions.push(messageText);
    this.appendMessage('user', messageText);

    // Exibe o loader
    this.appendLoading();

    // Posta a mensagem do usuário no banco de dados
    await this.postMessages(messageText);

    // Atualiza a contagem de mensagens diárias
    this.dailyMessageCount++;

    // Envia a mensagem e os arrays de perguntas e respostas para o webhook
    fetch('https://webhook.workez.online/webhook/fe8ee5ca-1a13-449f-bc2c-54fca1795da6', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userQuestions: this.userQuestions,
        aiResponses: this.aiResponses,
        ai_mode: this.aiMode // Inclua `ai_mode` aqui
      })
    })
    .then(response => response.json())
    .then(data => {
      this.removeLoading();

      let botText = this.getBotResponseText(data);
      this.aiResponses.push(botText);
      this.appendMessageGradually('bot', this.stripHtmlTags(botText));

      // Atualiza o ai_mode com base na resposta do servidor
      if (data.obizillaSettings && data.obizillaSettings.ai_mode) {
        this.aiMode = data.obizillaSettings.ai_mode;
      }

      // Reativa o envio de mensagens após a resposta
      this.canSendMessage = true;
      sendButton.style.opacity = '1'; // Opacidade normal

      // Garante que o chat seja rolado para o final após a resposta
      this.scrollToBottom(chatArea);  // Adiciona o scroll para o final
    })
    .catch(error => {
      console.error('Erro:', error);
      this.removeLoading();
      this.appendMessage('bot', 'Ocorreu um erro. Tente novamente.');
      this.canSendMessage = true;
      sendButton.style.opacity = '1'; // Opacidade normal

      // Rolagem para o final, mesmo em caso de erro
      this.scrollToBottom(chatArea);
    });
  }

  // Método para exibir mensagem no chat
  appendMessage(sender: 'user' | 'bot', text: string) {
    const chatArea = document.getElementById('chatArea');
    let messageDiv = document.createElement('div');

    // Verifica se o remetente é o usuário ou o bot
    if (sender === 'user') {
      // Mensagem do usuário dentro do chatArea
      messageDiv.classList.add('user-message');
      messageDiv.innerHTML = `
      <style>
      .user-message{
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      }
      </style>
        <div class="text" style="
          background-color: white;
          color: black;
          padding: 12px 15px;
          border-radius: 999px;
          max-width: 70%;
          word-wrap: break-word;
          white-space: pre-wrap;
          display: inline-block;
        ">${text}</div>
      `;
      chatArea?.appendChild(messageDiv); // Adiciona a mensagem do usuário dentro do chatArea
    } else {
      // Mensagem do bot dentro do chatArea
      messageDiv.classList.add('bot-message');
      messageDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        width: 50%;
        align-items: center;
        border: 1px solid #394AA3;
        padding: 20px 20px 20px 30px;
        border-radius: 21px 21px 0 0;
        border-bottom: none;
        justify-content: flex-start;
      `;
      messageDiv.innerHTML = `
        <img src="../../../../assets/icons/obizilla favicon 1.png" alt="Mascote" class="mascote">
        <div class="text">
          ${text}
        </div>
      `;
      chatArea?.appendChild(messageDiv); // Adiciona a mensagem do bot dentro do chatArea
    }

    // Garante que o chat seja rolado para o final após adicionar a nova mensagem
    this.scrollToBottom(chatArea);
  }

  // Método para exibir mensagem do bot gradualmente
  appendMessageGradually(sender: 'bot', text: string) {
    const chatArea = document.getElementById('chatArea');
    let messageDiv = document.createElement('div');

    // Mensagem do bot dentro do chatArea
    messageDiv.classList.add('bot-message');
    messageDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 50%;
      align-items: center;
      border: 1px solid #394AA3;
      padding: 20px 20px 20px 30px;
      border-radius: 21px 21px 0 0;
      border-bottom: none;
      justify-content: flex-start;
    `;
    messageDiv.innerHTML = `
      <img src="../../../../assets/icons/obizilla favicon 1.png" alt="Mascote" class="mascote">
      <div class="text"></div>
    `;
    chatArea?.appendChild(messageDiv); // Adiciona a mensagem do bot dentro do chatArea

    const textElement = messageDiv.querySelector('.text') as HTMLElement;
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        textElement.innerHTML += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20); // Ajuste o intervalo conforme necessário para a velocidade de digitação

    // Garante que o chat seja rolado para o final após adicionar a nova mensagem
    this.scrollToBottom(chatArea);
  }

  // Função para remover tags HTML de uma string
  stripHtmlTags(text: string): string {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
  }

  // Adiciona um loader com imagem e três pontinhos pulando
  appendLoading() {
    const chatArea = document.getElementById('chatArea');
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('bot-response'); // Adiciona a classe do bot response

    loadingDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 50%;
      align-items: center;
      border: 1px solid #394AA3;
      padding: 20px 20px 20px 30px;
      border-radius: 21px 21px 0 0;
      border-bottom: none;
      justify-content: flex-start;
    `;

    loadingDiv.innerHTML = `
      <style>
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
      }

      .loading .dot {
        width: 8px;
        height: 8px;
        background-color: #888;
        border-radius: 50%;
        margin: 0 3px;
        animation: bounce 0.6s infinite alternate;
      }

      .loading .dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .loading .dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes bounce {
        to {
          opacity: 0.3;
          transform: translateY(-10px); /* Pulo mais visível */
        }
      }
      </style>
      <img src="../../../../assets/icons/obizilla favicon 1.png" alt="Mascote" class="mascote">
      <div class="loading">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;

    chatArea?.appendChild(loadingDiv);
    this.scrollToBottom(chatArea);
  }

  // Remove o loader
  removeLoading() {
    const chatArea = document.getElementById('chatArea');
    const loadingDiv = chatArea?.querySelector('.bot-response');
    if (loadingDiv) chatArea?.removeChild(loadingDiv);
  }

  // Método para pegar a resposta do bot
  getBotResponseText(data: any): string {
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else if (data.message?.content) {
      return data.message.content;
    } else {
      return "Texto não disponível";
    }
  }

  // Função para rolar a área de chat até o final com scroll suave
  scrollToBottom(chatArea: HTMLElement | null) {
    setTimeout(() => {
      if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
      }
    }, 100); // Atraso de 100ms para garantir que a mensagem tenha sido renderizada
  }

  // Função para resetar a contagem de mensagens diárias se for um novo dia
  async resetDailyMessageCountIfNewDay(data_envio: string) {
    const today = new Date().toISOString().split('T')[0];
    const envioDate = data_envio.split('T')[0];

    if (today !== envioDate) {
      this.dailyMessageCount = 0;
      await this.resetMessageCountOnServer();
    }
  }

  // Função para resetar a contagem de mensagens no servidor
  async resetMessageCountOnServer() {
    try {
      await this.auth.resetMessageCount(this.user.id);
    } catch (error) {
      console.error('Error resetting message count on server:', error);
    }
  }
}
