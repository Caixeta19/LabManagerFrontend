# LabManager — Front

Interface do LabManager: reserva de laboratórios, check-in por QR Code e empréstimo de equipamentos.
Consome a API do repositório `LabManagerBackend` (Spring Boot).

## Como rodar

1. Suba o back (veja o README dele). Ele precisa aceitar a origem do front em `CORS_ALLOWED_ORIGINS`.
2. `cp .env.example .env` e aponte `VITE_API_URL` para o back.
3. `npm install`
4. `npm run dev`: abre em http://localhost:5173. Para outra porta, use `PORT=5174 npm run dev`.

`npm run build` gera o `dist/`. Ele não checa tipos: rode também `npx tsc --noEmit`.

## Estrutura

- `src/api/client.ts`: único ponto que chama `fetch`. Coloca o token e transforma o corpo de erro em `ApiError`.
- `src/api/mappers.ts`: converte DTOs do back nos tipos do front (`ALUNO` ↔ `student`, `dataHoraInicio` ↔ `date` + `startTime`).
- `src/api/*.ts`: um serviço por recurso.
- `src/context.tsx`: `useApp()` guarda sessão, `state` global, navegação e mutações.
- `src/utils.ts`: datas no fuso de Brasília, buscas por id e regras de senha.
- `src/pages/`: uma tela por arquivo. `src/components/ui.tsx` tem os componentes base.

## Convenções

- Não há React Router: a navegação é por estado, com `navigate("pagina", { id })`. A única URL lida é `/redefinir-senha?token=...`.
- As telas leem `state` e chamam as mutações do contexto. Elas não usam `fetch` diretamente.
- As mutações são assíncronas e lançam `ApiError`. No `catch`, use `handleError(e)` para o aviso padrão, ou `e.fields` para mostrar os erros no formulário.
- Datas e horas da API são horário de Brasília sem fuso (`yyyy-MM-ddTHH:mm:ss`). Trate como texto: nunca use `toISOString()`, que converte para UTC. Para "hoje", use `todayISO()`.
- As regras de negócio ficam no back. O front só valida para dar retorno rápido ao usuário.

## Estilo

Tailwind CSS v4 pelo plugin `@tailwindcss/vite`; o tema fica em `src/index.css`. Preserve o visual existente.
