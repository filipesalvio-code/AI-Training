# NexoERP Financeiro — visão geral

O NexoERP é um sistema de gestão financeira para pequenas e médias empresas. Este material considera a edição **NexoERP Cloud**, acessada pelo navegador.

O módulo Financeiro reúne:

- contas a pagar;
- contas a receber;
- cadastro de clientes e fornecedores;
- contas bancárias e caixas;
- conciliação bancária;
- fluxo de caixa;
- emissão de boletos;
- relatórios gerenciais;
- integração com notas fiscais e contabilidade.

## Conceitos usados no sistema

**Lançamento** é qualquer valor previsto ou realizado. Uma conta de energia com vencimento no mês seguinte é um lançamento previsto. Depois do pagamento e da baixa, ela passa a compor os valores realizados.

**Baixa** é a confirmação de que uma conta foi paga ou recebida. A baixa altera o saldo da conta financeira escolhida.

**Competência** indica quando a receita ou despesa foi gerada. **Vencimento** indica quando deveria ser paga ou recebida. **Liquidação** indica quando o dinheiro realmente entrou ou saiu.

**Conta financeira** representa onde o dinheiro fica: conta corrente, conta digital, aplicação ou caixa físico.

**Categoria** explica a natureza do lançamento, como Aluguel, Energia, Receita de serviços ou Impostos.

**Centro de custo** identifica a área, unidade ou projeto responsável pela receita ou despesa. Um mesmo lançamento pode ser dividido entre mais de um centro de custo.

## Tela inicial

Ao entrar no módulo Financeiro, o usuário vê o painel com saldo atual, contas vencidas, valores a vencer, valores a receber e projeção de caixa. Os cards respeitam os filtros de empresa, período e conta financeira mostrados no topo da tela.

O saldo atual considera apenas lançamentos baixados. A projeção inclui também os lançamentos previstos dentro do período selecionado.

Os atalhos mais usados são:

1. **Novo pagamento**;
2. **Novo recebimento**;
3. **Importar extrato**;
4. **Emitir boleto**;
5. **Ver fluxo de caixa**.

## Situação dos lançamentos

- **Em aberto**: ainda não foi liquidado e não está vencido.
- **Vencido**: não foi liquidado e a data de vencimento já passou.
- **Pago** ou **Recebido**: possui baixa confirmada.
- **Parcial**: somente parte do valor foi baixada.
- **Agendado**: o pagamento foi enviado ao banco, mas ainda não houve confirmação.
- **Cancelado**: foi invalidado e não afeta saldos nem projeções.

Excluir e cancelar não são a mesma coisa. A exclusão remove o registro e só é permitida quando não existem vínculos. O cancelamento preserva o histórico.

## Ajuda e suporte

O ícone **?** no canto superior direito abre a central de ajuda. Chamados são registrados em **Ajuda > Falar com o suporte**. Ao abrir um chamado, informe a empresa, a tela, o código do lançamento e o horário aproximado do erro.

Nunca envie senha, token bancário ou certificado digital por chamado.
