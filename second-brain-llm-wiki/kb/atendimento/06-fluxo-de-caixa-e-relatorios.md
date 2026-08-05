# Fluxo de caixa e relatórios financeiros

## Fluxo de caixa

O relatório fica em **Financeiro > Fluxo de caixa**. Ele apresenta saldo inicial, entradas, saídas e saldo final por dia, semana ou mês.

No modo **Realizado**, entram somente valores baixados. No modo **Previsto**, entram lançamentos em aberto e baixados. No modo **Previsto x realizado**, os dois valores aparecem lado a lado.

O filtro **Data de caixa** usa vencimento para itens em aberto e liquidação para itens baixados. O filtro **Competência** usa a data em que a receita ou despesa foi reconhecida.

Por isso, um aluguel de janeiro pago em fevereiro aparece em janeiro no relatório por competência e em fevereiro no relatório realizado por caixa.

## Projeção

A projeção começa no saldo atual das contas selecionadas e aplica entradas e saídas futuras. Lançamentos sem conta financeira prevista entram no total geral, mas não na projeção de uma conta específica.

Itens vencidos são considerados no primeiro dia da projeção. Para simular que um título vencido será pago em outra data, altere temporariamente o vencimento ou use o cenário de simulação.

## Cenários

O recurso **Simular cenário** permite alterar datas e valores sem editar os lançamentos originais. Também é possível adicionar uma receita ou despesa hipotética.

Cenários são privados por padrão. O autor pode compartilhá-los com usuários de consulta ou gestão. Um cenário não gera lançamentos reais.

## Demonstrativo de resultado

O DRE gerencial fica em **Relatórios > Financeiro > DRE**. Ele usa categorias configuradas como receita, custo, despesa, imposto e resultado financeiro.

O DRE deve ser analisado por competência. Se uma categoria não estiver associada a um grupo do DRE, o valor aparece em **Não classificado**.

Transferências entre contas próprias não fazem parte do DRE. Aportes e retiradas de sócios aparecem apenas quando suas categorias estiverem configuradas para isso.

## Relatórios disponíveis

- contas a pagar por fornecedor;
- contas a receber por cliente;
- títulos vencidos;
- pagamentos por categoria;
- recebimentos por categoria;
- resultado por centro de custo;
- extrato de conta financeira;
- posição diária de caixa;
- DRE gerencial;
- auditoria de alterações.

## Exportação

As listas podem ser exportadas em XLSX ou CSV. Relatórios formatados também oferecem PDF.

A exportação mantém os filtros aplicados na tela. Antes de exportar, confira empresa, período, situação e contas selecionadas.

Arquivos com mais de 20 mil linhas são processados em segundo plano. O link para download aparece em **Notificações** e permanece disponível por sete dias.

## Números diferentes em relatórios

Dois relatórios podem apresentar números diferentes sem haver erro. Compare:

1. regime de caixa ou competência;
2. período;
3. empresas selecionadas;
4. situação dos lançamentos;
5. consideração de cancelados;
6. categorias e centros de custo;
7. data de atualização do painel.

O painel inicial usa cache de até cinco minutos. Relatórios detalhados consultam os dados no momento da abertura. Use **Atualizar painel** para antecipar a atualização.
