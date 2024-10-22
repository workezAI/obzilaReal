import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../../app/PlansModule/Components/types/message.type';
// Definindo o tipo User
type User = {
  id: string;
  email: string;
  full_name?: string;
  password: string;
  plan_id?: string;
};
type Plan = {
  id: string;
  name: string;
  message_limit: number;
  price: number;
  created_at: string;
};


// Configuração do Supabase
const supabaseUrl = 'https://mugpnilbgwfuzhtyizfh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11Z3BuaWxiZ3dmdXpodHlpemZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2NTY1MTYsImV4cCI6MjAzOTIzMjUxNn0.4_xLeNZKLXItRQt9vz4JOuxljPUL20AJESehddUZyuE';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  jwtHelper = new JwtHelperService();

  constructor() {}

  // Método de login
  async login(email: string, password: string): Promise<{ message: string; token: string; user: User } | null> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, password')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.error('Erro: Usuário não encontrado', userError);
        return null;
      }

      let passwordMatch = false;

      // Tentar comparar a senha como se estivesse criptografada
      try {
        passwordMatch = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
        console.warn('Erro ao tentar descriptografar a senha, tentando comparação direta', bcryptError);
      }

      // Se a comparação criptografada falhar, fazer uma comparação direta
      if (!passwordMatch) {
        passwordMatch = password === user.password;
      }

      if (!passwordMatch) {
        console.error('Erro: Senha incorreta');
        return null;
      }

      // Gerar token localmente após login bem-sucedido
      const token = this.generateToken(user);

      // Armazenar o token e o email do usuário no localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', user.email); // Guardando o email do usuário logado

      return { message: 'Login bem-sucedido', token, user };
    } catch (error) {
      console.error('Erro no login:', error);
      return null;
    }
  }
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, plan_id', )
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('Erro ao buscar usuário por ID:', error);
        return null;
      }

      return user as User;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }


  async getAllUsers(): Promise<User[] | null> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name, plan_id');

      if (error || !users) {
        console.error('Erro ao buscar todos os usuários:', error);
        return null;
      }

      return users as User[];
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      return null;
    }
  }
  // Método de registro (signUp)
  async signUp(email: string, password: string, fullName: string, planName?: string): Promise<{ message: string } | null> {
    try {
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        console.error('Erro: Este e-mail já está registrado');
        return null;
      }

      let planId = null;
      if (planName) {
        const { data: planData, error: planError } = await supabase
          .from('plans')
          .select('id')
          .eq('name', planName)
          .single();

        if (planError) {
          console.error('Erro ao buscar plano:', planError.message);
          return null;
        }

        planId = planData ? planData.id : null;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ id: uuidv4(), email, password: hashedPassword,full_name: fullName ,plan_id: planId }])
        .single();

      if (insertError) {
        console.error('Erro ao registrar o usuário:', insertError.message);
        return null;
      }

      return { message: 'Usuário registrado com sucesso!' };
    } catch (error) {
      console.error('Erro no registro:', error);
      return null;
    }
  }

  // Método de logout
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    console.log('Logout bem-sucedido!');
  }

  // Método para verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (token) {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return !!payload && payload.exp > currentTime;
    }
    return false;
  }

  // Método para gerar um token JWT localmente (simulado)
  generateToken(user: User): string {
    const exp = Math.floor(Date.now() / 1000) + 60 * 60; // Expiração em 1 hora
    const payload = { id: user.id, email: user.email, exp };
    const token = btoa(JSON.stringify(payload));
    return token;
  }
  async getPlanById(planId: string): Promise<Plan | null> {
    try {
      const { data: plan, error } = await supabase
        .from('plans')
        .select('id, name, price, message_limit, created_at')
        .eq('id', planId)
        .single();

      if (error || !plan) {
        console.error('Erro ao buscar plano por ID:', error);
        return null;
      }

      return plan as Plan;
    } catch (error) {
      console.error('Erro ao buscar plano por ID:', error);
      return null;
    }
  }
  async getMessages(): Promise<Message[]> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, plan_id, user_id, text, created_at');

      if (error || !messages) {
        console.error('Erro ao buscar mensagens:', error);
        return [];
      }
      console.log('Mensagens:', messages);
      return messages as Message[];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  }

  // async getMessagesById(): Promise<Message[]> {
  //   try{
  //     const { data: messages, error} await supabase
  //     .from('messages')
  //     .select( 'id', 'plan_id, user_id, text, created_at')
  //     .eq('id', id)
  //     .single();
  //   }
  // }

  // Método para decodificar o token
  decodeToken(token: string): { id: string; email: string; exp: number } | null {
    try {
      return JSON.parse(atob(token));
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return null;
    }
  }

  // Método para obter o usuário logado a partir do localStorage
  getCurrentUser(): string {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      throw new Error('Usuário não está logado');
    }
    return userEmail;
  }

async getLoggedInUser(): Promise<User | null> {
  const userEmail = this.getCurrentUser();
  const { data: user, error } = await supabase
    .from('users')
    .select('id, full_name, email')  // Ajuste na query, removendo a parte errada do alias
    .eq('email', userEmail)
    .single();

  if (error || !user) {
    console.error('Erro ao buscar o usuário logado:', error);
    return null;
  }

  return user as unknown as User; // Certifique-se de que o tipo esteja correto
}

  // Método para verificar a senha atual
  async verifyCurrentPassword(currentPassword: string): Promise<boolean> {
    const email = this.getCurrentUser();
    const { data, error } = await supabase
      .from('users')
      .select('password')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Erro ao buscar senha do usuário', error);
      return false;
    }

    return bcrypt.compare(currentPassword, data.password);
  }

  // Método para atualizar o nome do usuário
  async updateUserName(newName: string): Promise<boolean> {
    const email = this.getCurrentUser();

    const { error } = await supabase
      .from('users')
      .update({ full_name: newName })
      .eq('email', email);

    if (error) {
      console.error('Erro ao atualizar o nome do usuário', error);
      return false;
    }

    return true;
  }

  // Método para atualizar o email do usuário
  async updateUserEmail(newEmail: string): Promise<boolean> {
    const email = this.getCurrentUser();

    const { error } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('email', email);

    if (error) {
      console.error('Erro ao atualizar o email do usuário', error);
      return false;
    }

    // Atualiza o email no localStorage
    localStorage.setItem('userEmail', newEmail);

    return true;
  }

  // Método para atualizar a senha do usuário
  async updateUserPassword(newPassword: string): Promise<boolean> {
    const email = this.getCurrentUser();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email);

    if (error) {
      console.error('Erro ao atualizar a senha do usuário', error);
      return false;
    }

    return true;
  }
  async getPlans(): Promise<any> {
    const { data, error } = await supabase
      .from('plans')
      .select('id, name');

    if (error) {
      console.error('Erro ao buscar planos:', error);
      return null;
    }
    return data;
  }

  // Função para atualizar o plano do usuário
  async updateUserPlan(userId: string, planId: string): Promise<boolean> {
    if (!userId || !planId) {
      console.error('Erro: userId ou planId está vazio');
      return false;
    }

    const { error } = await supabase
      .from('users')
      .update({ plan_id: planId })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar plano do usuário:', error);
      return false;
    }

    return true;
  }

  async getPlanBasic(planName: string): Promise<{ id: string } | null> {
    try {
      const planName = 'basic'; // ou 'gold'

      const { data, error } = await supabase
        .from('plans')
        .select('id')
        .eq('name', planName) // O nome deve ser 'basic' ou 'gold', como na sua tabela
        .single(); // Garante que apenas uma linha será retornada, já que o 'name' é único

      if (error || !data) {
        console.error('Erro ao buscar plano por nome:', error?.message || 'Nenhum dado encontrado');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar o plano:', error);
      return null;
    }
  }
  async getPlanGold(planName: string): Promise<{ id: string } | null> {
    try {
      const planName = 'gold'; // ou 'gold'

      const { data, error } = await supabase
        .from('plans')
        .select('id')
        .eq('name', planName) // O nome deve ser 'basic' ou 'gold', como na sua tabela
        .single(); // Garante que apenas uma linha será retornada, já que o 'name' é único

      if (error || !data) {
        console.error('Erro ao buscar plano por nome:', error?.message || 'Nenhum dado encontrado');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar o plano:', error);
      return null;
    }
  }


}
