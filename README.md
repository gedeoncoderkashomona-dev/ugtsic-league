# ⚽ UGTSIC League — Plataforma de Gestão de Futebol Corporativo (Society)

Aplicação web **Mobile-First** desenvolvida para gerenciar as partidas semanais de futebol society da equipe de desenvolvimento e tecnologia da **UGTSIC / SESAP / G Trigueiro** (Natal/RN).

O sistema automatiza todo o fluxo da pelada: **credenciamento de atletas no 1º acesso**, **confirmação de presença (check-in)**, **sorteio equilibrado de equipes (Snake Draft)**, **súmula ao vivo com placar e artilharia**, **votação pós-jogo (1 a 5 estrelas)**, **ranking por posição** e **exportação de relatórios em PDF e WhatsApp**.

---

## 🚀 Principais Funcionalidades

### 1. Credenciamento no 1º Acesso & Perfil com Foto (Até 100MB)
- Na primeira visita, o integrante preenche seu **Nome**, **Apelido na Camisa**, **Número (`1–99`)**, **Função no Setor** (`Dev SESAP`, `Frontend`, `Backend`, `Fullstack`, `Tech Lead`, `DevOps`, `QA`, `UX/UI`), **Posição em Campo** e **Foto de Perfil**.
- **Processamento de Imagem Client-Side (`Canvas API`)**: Suporta fotos direto da câmera do celular de até **100MB**, aplicando recorte central circular automático (estilo Instagram/WhatsApp) e compressão otimizada em WebP/JPEG antes de persistir no banco.

### 2. Check-in & Sorteio Equilibrado (`Snake Draft`)
- Confirmação de presença escolhendo entre **Linha**, **Goleiro** ou **Reserva**.
- Algoritmo de balanceamento técnico (`drawBalancedTeams`) que separa goleiros declarados e distribui os jogadores de linha alternadamente pelo **Overall Rating / Estrelas** entre **Time Azul (Galácticos)** e **Time Vermelho (Guerreiros)**:
  - **Formato 4+1**: 4 jogadores na linha + 1 goleiro por equipe (8 a 9 jogadores de linha confirmados).
  - **Formato 5+1**: 5 jogadores na linha + 1 goleiro por equipe (10+ jogadores de linha confirmados), com alocação automática de até **3 reservas por equipe**.

### 3. Placar Ao Vivo & Súmula Oficial
- Painel responsivo para acompanhamento do placar em tempo real no celular ou desktop.
- Registro de gols vinculados ao **autor do gol (artilheiro)**, **autor do passe (garçom)** e **minuto da partida**, atualizando automaticamente as estatísticas individuais da temporada no banco de dados.

### 4. Avaliação 5 Estrelas & Hall da Fama (6 Troféus Oficiais)
- Sistema de votação pós-jogo de **1.0 a 5.0 estrelas** (com suporte a meia estrela).
- Cálculo automático das 6 premiações da temporada:
  1. **Craque Geral (MVP)**
  2. **Artilheiro da Liga**
  3. **Garçom de Ouro (Assistências)**
  4. **Melhor Goleiro**
  5. **Melhor Zagueiro**
  6. **Melhor Meio-Campo**

### 5. Exportação em PDF (A4) & Compartilhamento no WhatsApp
- **Súmula da Partida (PDF)**: Documento A4 gerado com `jsPDF` contendo placar, escalações de Time Azul e Time Vermelho, linha do tempo de gols e destaques.
- **Planilha de Classificação (PDF)**: Tabela oficial com ranking completo de estrelas, OVR, gols, assistências e vitórias.
- **Resumo para WhatsApp**: Formatação limpa e direta enviada via `api.whatsapp.com/send` e copiada automaticamente para a área de transferência.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) + React 18 |
| **Linguagem** | TypeScript |
| **Estilização** | Tailwind CSS + Animações SVG/CSS Semânticas |
| **Banco de Dados** | Supabase (PostgreSQL + Row Level Security) |
| **Relatórios PDF** | jsPDF |
| **Testes Unitários** | Vitest |

---

## 🗄️ Estrutura do Banco de Dados (Supabase PostgreSQL)

O schema completo encontra-se em [`supabase/schema.sql`](./supabase/schema.sql) e contempla 5 tabelas relacionais:
- `public.profiles`: Cadastro dos atletas, foto de perfil, posição favorita, camisa e estatísticas acumuladas (`overall_rating`, `stars_rating`, `goals`, `assists`, `victories`, `mvp_count`).
- `public.matches`: Dados da partida, placar ao vivo, status e JSONB de presenças/eventos sincronizados.
- `public.match_presences`: Controle de check-in, preferência de atuação (`linha`, `goleiro`, `reserva`) e equipe sorteada (`azul`, `vermelho`).
- `public.match_events`: Súmula de gols e assistências da partida.
- `public.match_votes`: Avaliações pós-jogo de 1.0 a 5.0 estrelas.

---

## ⚙️ Como Executar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente (`.env.local`):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
   ```

3. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

4. **Execute a suíte de testes unitários:**
   ```bash
   npm test
   ```

---

## 🌐 Deploy em Produção (Netlify / Vercel)

O projeto já inclui o arquivo [`netlify.toml`](./netlify.toml) configurado para deploy imediato:
1. Suba este repositório para o **GitHub**.
2. No painel da **Netlify** (`Add new site` → `Import an existing project`), selecione o repositório do GitHub.
3. Em **Environment variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Clique em **Deploy site** para gerar seu domínio público HTTPS pronto para uso no celular pelos integrantes da pelada.
