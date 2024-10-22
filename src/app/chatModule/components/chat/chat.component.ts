import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { AuthService } from '../../../../shared/Service/auth.service';

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
  aiMode: string = 'normal'; // Inicializa ai_mode com 'normal'

  constructor(private changeDetectorRef: ChangeDetectorRef, private auth: AuthService) {}

  ngOnInit(): void {}

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
      const sendButton = document.getElementById('sendButton') as HTMLElement;
      sendButton.click(); // Simula o clique no botão de envio
    }
  }

  // Método para enviar a mensagem
  sendMessage() {
    const inputElement = document.getElementById('userInput') as HTMLTextAreaElement;
    const sendButton = document.getElementById('sendButton') as HTMLElement;
    const messageText = inputElement.value.trim();

    if (!messageText || !this.canSendMessage) return;

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
      this.appendMessage('bot', botText);

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
        <i class="pi pi-user icon" style="font-size: 24px; color: white; padding: 10px;"></i>
        <div class="text" style="
          background-color: #252525;
          color: white;
          padding: 10px;
          border-radius: 8px;
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
        width: 100%;
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

  // Adiciona um loader com imagem e três pontinhos pulando
  appendLoading() {
    const chatArea = document.getElementById('chatArea');
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('bot-response'); // Adiciona a classe do bot response

    loadingDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 100%;
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
}
