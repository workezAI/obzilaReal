export class Profile {
  id: string;          // UUID do usuário (referência da tabela auth.users)
  full_name: string;    // Nome completo do usuário
  email: string;        // Email do usuário (único)
  password?: string;    // Senha (opcional porque o Supabase a gerencia separadamente)
  plan_id?: string;     // UUID do plano adquirido (opcional)
  created_at: Date;     // Data de criação do perfil

  constructor(
    id: string,
    full_name: string,
    email: string,
    password?: string,
    plan_id?: string,
    created_at?: Date
  ) {
    this.id = id;
    this.full_name = full_name;
    this.email = email;
    this.password = password;
    this.plan_id = plan_id;
    this.created_at = created_at || new Date();
  }
}
