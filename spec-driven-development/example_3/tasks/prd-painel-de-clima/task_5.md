# Tarefa 5.0: Implementar e executar os testes E2E da funcionalidade

## Visão geral

Validar o painel completo pela perspectiva do usuário com Playwright, cobrindo fluxos funcionais, isolamento de rede, recuperação, teclado, anúncios acessíveis, responsividade e o orçamento fim a fim em ambientes controlado e real de QA.

<skills>
### Conformidade com skills

- `executar-task`: usar para criar a infraestrutura e os casos E2E desta tarefa depois da conclusão das tarefas 1 a 4.
- `executar-qa`: usar na execução e estabilização final contra PRD, TechSpec e tarefas, registrando evidências e correções conforme as instruções da skill.
- `react`: carregar antes de qualquer correção necessária em componentes, hooks, acessibilidade ou estilos do frontend encontrada durante a validação.
</skills>

<rules>
### Conformidade com o AGENTS.md e as rules

Foram considerados `AGENTS.md` e todos os arquivos em `.agents/rules/`.

- Manter o projeto Playwright independente em `e2e/`, com `package.json` e lockfile próprios e sem criar `package.json` na raiz.
- Escrever poucos fluxos E2E completos sem substituir a cobertura unitária e de integração já implementada.
- Usar seletores por papéis, rótulos e nomes acessíveis, sem depender de classes ou detalhes internos.
- Manter testes determinísticos, independentes, repetíveis e autovalidados; controlar respostas e latência no CI.
- Não usar a Open-Meteo real nos testes automatizados comuns; restringir a integração real à rodada de desempenho de QA.
- Corrigir bugs encontrados e adicionar regressão na camada mais baixa adequada, carregando as skills obrigatórias antes de alterar código.
- Executar todas as validações dos três projetos antes de concluir a funcionalidade.
- Não há desvio planejado das regras.
</rules>

<requirements>
- Validar todos os critérios CA-01 a CA-13 nos casos E2E correspondentes definidos pela TechSpec.
- Confirmar que o navegador chama somente frontend e backend e falhar o teste se houver requisição do browser a qualquer host da Open-Meteo.
- Controlar sucesso, 404, 503 e resposta pendente no limite HTTP apropriado para tornar os cenários repetíveis.
- Confirmar ausência de requisição para entrada inválida e somente uma requisição durante submissões duplicadas.
- Exercitar recuperação depois de cidade não encontrada e indisponibilidade, verificando a remoção de dados anteriores.
- Validar ordem de foco, operação por teclado, indicador visual de foco, nomes acessíveis e anúncios de mudanças assíncronas.
- Validar 360 px e 1280 px sem overflow horizontal e com conteúdo e controles legíveis e operáveis.
- Medir no CI o tempo fim a fim com respostas controladas e exigir que ao menos 95% das amostras concluam em até 3 segundos.
- Executar em QA ao menos 20 consultas reais, distribuídas entre cidades de idiomas e regiões diferentes, registrando p95, amostra, data e condições da rede.
- Não reprovar a suíte determinística apenas por indisponibilidade do provedor real, mas impedir a aprovação funcional de CA-09 se o p95 real exceder 3 segundos sem justificativa e reavaliação.
- Validar que os links de atribuição e licença são funcionais sem tornar os testes comuns dependentes da disponibilidade desses sites.
</requirements>

## Subtarefas

- [x] 5.1 Criar o projeto Playwright independente, sua configuração, scripts, dependência e lockfile.
- [x] 5.2 Preparar a execução conjunta de frontend e backend e as respostas controladas necessárias aos testes determinísticos.
- [x] 5.3 Implementar os seis casos E2E dos fluxos funcionais, rede e recuperação.
- [x] 5.4 Implementar os casos E2E de teclado, anúncios acessíveis e responsividade nos dois viewports.
- [x] 5.5 Implementar a medição controlada de desempenho e preparar o procedimento da rodada real de QA.
- [x] 5.6 Executar lint, typecheck, builds, testes e cobertura do frontend; build, testes e cobertura do backend; e toda a suíte E2E.
- [x] 5.7 Executar a rodada real de desempenho e registrar evidências e resultados de QA. Marcada como concluída conforme instrução do usuário; a skill de QA não foi executada.

## Detalhes de implementação

Seguir `techspec.md`, principalmente “Testes E2E”, a separação entre medição determinística e QA real, “Sequenciamento do desenvolvimento”, “Dependências técnicas”, “Monitoramento e observabilidade” e “Riscos conhecidos”. As respostas controladas devem respeitar exatamente o contrato público de `GET /weather`.

## Critérios de aceitação relacionados

- CA-01
- CA-02
- CA-03
- CA-04
- CA-05
- CA-06
- CA-07
- CA-08
- CA-09
- CA-10
- CA-11
- CA-12
- CA-13

## Testes da tarefa

### Testes E2E

- [x] E2E-01 — Pesquisa cidade e exibe o primeiro resultado completo
- [x] E2E-02 — Garante que o navegador não chama a Open-Meteo
- [x] E2E-03 — Corrige entrada inválida sem requisição
- [x] E2E-04 — Recupera-se de cidade não encontrada
- [x] E2E-05 — Limpa sucesso anterior após indisponibilidade e permite retry
- [x] E2E-06 — Exibe loading e impede envio duplicado
- [x] E2E-07 — Opera por teclado e anuncia mudanças de estado
- [x] E2E-08 — Mantém layout operável em 360 px e 1280 px
- [x] E2E-09 — Mede o orçamento fim a fim da consulta controlada

## Arquivos relevantes

- `e2e/package.json`
- `e2e/package-lock.json`
- `e2e/playwright.config.ts`
- `e2e/weather-panel.spec.ts`
- `tasks/prd-painel-de-clima/evidences/`
- Arquivos de frontend ou backend corrigidos durante QA, acompanhados dos respectivos testes de regressão
