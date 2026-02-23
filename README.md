# 🏠 MafraFinance - Gestão Financeira Multifamiliar

**MafraFinance** é uma aplicação de gestão de despesas compartilhadas com uma arquitetura inovadora de "condomínio". Diferente de apps de finanças comuns, ele permite que múltiplas famílias habitem a mesma "Casa", compartilhando a visão geral de gastos enquanto mantêm a privacidade de suas contas internas.

## 🚀 Funcionalidades Principais

- **Arquitetura Hierárquica:** Organização baseada em Casas (Houses), Famílias (Families) e Membros (Profiles).
- **Multi-tenancy com RLS:** Segurança de nível de linha (Row Level Security) via Supabase, garantindo que uma família não veja os gastos da outra, a menos que o Admin permita.
- **Painel Administrativo Supremo:** - Visão global de todas as despesas da casa.
- Gestão de usuários e permissões.
- Criação e deleção de famílias com códigos de convite únicos.

- **Cálculos Dinâmicos:** Divisão automática de cotas (Minha Cota, Cota Familiar e Total da Casa).
- **Interface Adaptativa:** Dashboard otimizado para Desktop e Mobile, com persistência de abas e estados.
- **Sistema de Convites:** Entrada simplificada via códigos alfanuméricos gerados pelo Admin.

## 🛠️ Tecnologias Utilizadas

- **Front-end:** React.js + Vite
- **Estilização:** Tailwind CSS (UI moderna e responsiva)
- **Banco de Dados & Auth:** Supabase (PostgreSQL)
- **Ícones:** Lucide-React
- **Datas:** date-fns

## 🏗️ Estrutura do Banco de Dados (DNA do Projeto)

A inteligência do MafraFinance reside na sua estrutura de dados relacional:

1. **Houses:** A entidade raiz (O Condomínio).
2. **Families:** Grupos dentro de uma casa (Ex: Família Davi, Família Matheus).
3. **Profiles:** Usuários vinculados a uma família e a uma casa, com papéis de `admin`, `leader` ou `member`.
4. **Expenses:** Registros de contas com vínculo automático à família e casa do criador.

## ⚙️ Configuração Local

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/mafra-finance.git
cd mafra-finance

```

### 2. Instalar dependências

```bash
npm install

```

### 3. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e adicione suas chaves do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

```

### 4. Executar o projeto

```bash
npm run dev

```

## 🔒 Segurança (RLS)

O projeto utiliza políticas rigorosas de PostgreSQL no Supabase para garantir a integridade dos dados. Administradores têm permissão para `SELECT`, `INSERT`, `UPDATE` e `DELETE` em nível de casa, enquanto membros comuns são restritos ao seu `family_id`.

## 📦 Deploy

Este projeto está configurado para deploy contínuo na **Vercel**.
Certifique-se de configurar o arquivo `vercel.json` para suportar o roteamento do React Router:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

Criado por Davi Mafra

---
