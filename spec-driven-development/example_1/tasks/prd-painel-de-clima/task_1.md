# Tarefa 1.0: Configurar testes e reorganizar o runtime do backend

## Visão geral

Preparar a base testável do backend, separar a composição Express da abertura da porta, preservar o health check e estabelecer configuração, tratamento de erros, observabilidade e desligamento controlado para as próximas entregas.

<skills>
### Conformidade com skills

- `executar-task`: usar para implementar esta tarefa e atualizar seu estado em `tasks.md` somente após todas as validações passarem.
- Não há skill técnica específica de backend em `.agents/skills/`; as regras de Node.js e TypeScript do projeto são a fonte normativa desta tarefa.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`.

- Preservar a separação entre os aplicativos e executar dependências e comandos dentro de `backend/`.
- Respeitar o fluxo `configuração → rotas → serviços → dados`, sem dependências circulares.
- Manter arquivos `.ts` com até 100 linhas, funções com até 30 linhas e no máximo três parâmetros.
- Usar tipagem explícita, `const`, comparações estritas, módulos ES, `unknown` em fronteiras e nunca `any`.
- Centralizar logs, não registrar dados sensíveis ou a cidade pesquisada e tratar `SIGTERM` e `SIGINT` de forma idempotente.
- Cobrir todo código novo com testes automatizados e exigir no mínimo 80% de cobertura em lines, functions, branches e statements.
- Não há desvio planejado das regras.
</rules>

<requirements>
- Configurar Vitest, cobertura V8, Supertest e os scripts `test` e `test:coverage` no backend.
- Extrair a composição do Express para uma aplicação que possa ser testada sem `listen`.
- Extrair e preservar `GET /health` como liveness local, sem consultar dependências externas.
- Manter `src/index.ts` responsável apenas por configuração, inicialização do servidor e graceful shutdown.
- Centralizar erros esperados e inesperados em um envelope público estável, sem expor detalhes internos.
- Centralizar logs estruturados e preparar o contexto de `requestId`, sem persistir ou registrar dados desnecessários.
- Ler e validar configurações de ambiente na inicialização, mantendo valores documentados em `.env.example` e nenhum segredo no repositório.
- Corrigir os erros preexistentes de parâmetros não utilizados sem desabilitar `noUnusedParameters`.
</requirements>

## Subtarefas

- [x] 1.1 Adicionar as dependências de teste do backend, atualizar o lockfile e configurar scripts e limiares de cobertura.
- [x] 1.2 Extrair a aplicação Express e o health check sem alterar o contrato público existente.
- [x] 1.3 Implementar a configuração de ambiente, o erro de aplicação, o middleware de erros e o logger estruturado.
- [x] 1.4 Simplificar a inicialização e implementar graceful shutdown idempotente.
- [x] 1.5 Criar o teste de integração do health check e testes complementares para todo comportamento novo desta base.
- [x] 1.6 Executar build, testes e cobertura do backend.

## Detalhes de implementação

Seguir `techspec.md`, principalmente “Arquitetura do sistema”, “Endpoints da API — GET /health”, “Sequenciamento do desenvolvimento”, “Monitoramento e observabilidade” e “Conformidade com o AGENTS.md e as rules”. Nesta tarefa, `app.ts` deve permanecer extensível para o registro de `/weather` na tarefa 2.

## Critérios de aceitação relacionados

Nenhum critério do PRD é validado diretamente nesta entrega. Ela preserva o health check existente e estabelece a infraestrutura necessária para os critérios funcionais posteriores.

## Testes da tarefa

Além do caso mapeado abaixo, devem existir testes complementares suficientes para cobrir configuração, tratamento de erros, logging e desligamento sempre que houver comportamento observável, respeitando a cobertura mínima de 80%.

### Testes de integração

- [x] TI-BE-05 — Preserva o health check isolado

## Arquivos relevantes

- `backend/package.json`
- `backend/package-lock.json`
- `backend/tsconfig.json`
- `backend/vitest.config.ts`
- `backend/.env.example`
- `backend/src/index.ts`
- `backend/src/app.ts`
- `backend/src/config/environment.ts`
- `backend/src/routes/health-route.ts`
- `backend/src/errors/app-error.ts`
- `backend/src/middleware/error-handler.ts`
- `backend/src/observability/logger.ts`
- Testes `*.test.ts` próximos aos módulos correspondentes
