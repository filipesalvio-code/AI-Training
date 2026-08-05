# Manual de contas a receber

## Criar uma receita

Entre em **Financeiro > Contas a receber > Nova receita**. Informe cliente, descrição, valor, competência, vencimento e categoria.

O cadastro do cliente precisa ter CPF ou CNPJ válido para emissão de boleto ou nota fiscal. Receitas sem cobrança bancária podem ser criadas para clientes sem documento.

## Formas de recebimento

O campo forma de recebimento aceita dinheiro, PIX, transferência, boleto, cartão, cheque e outros. A escolha serve para relatórios e pode habilitar campos adicionais.

Em vendas no cartão, registre o valor bruto da venda e a taxa separadamente. Se a integração com a adquirente estiver ativa, o NexoERP cria a taxa e a previsão de recebimento automaticamente.

## Registrar recebimento

Abra a receita e clique em **Registrar recebimento**. Confirme a data, a conta financeira e o valor recebido.

Quando o cliente paga somente parte da dívida, informe o valor efetivo. O lançamento fica **Parcial**. Novas baixas podem ser feitas até o saldo chegar a zero.

Para conceder desconto, preencha o campo **Desconto** durante a baixa. O desconto reduz o saldo do cliente, mas não aumenta o saldo bancário.

Exemplo: título de R$ 1.000, recebimento de R$ 950 e desconto de R$ 50. O cliente fica sem saldo pendente e a conta financeira recebe R$ 950.

## Boleto

Depois de salvar a receita, use **Ações > Emitir boleto**. É necessário ter uma carteira de cobrança configurada em **Configurações > Integrações bancárias**.

O boleto pode levar alguns segundos para ser registrado. Enquanto isso, a situação da cobrança aparece como **Processando**. Não clique repetidamente em emitir.

O cancelamento do lançamento não cancela automaticamente um boleto já registrado. Primeiro cancele a cobrança em **Cobranças > Boletos**, depois cancele o lançamento financeiro.

## Cobrança por e-mail

Em **Ações > Enviar cobrança**, escolha o modelo de mensagem e os destinatários. O e-mail inclui o valor, o vencimento e o link de pagamento.

Lembretes automáticos podem ser enviados 5 dias antes, no dia do vencimento e 3 dias depois. Os intervalos são configurados em **Configurações > Cobranças > Lembretes**.

Clientes marcados com **Não enviar cobrança automática** não recebem lembretes, mesmo quando a régua está ativa.

## Renegociação

Para renegociar títulos vencidos, selecione os lançamentos do mesmo cliente e clique em **Renegociar**. Informe entrada, número de parcelas, juros e primeiro vencimento.

Os títulos originais passam para **Renegociado** e deixam de aparecer como dívida aberta. A operação cria novos títulos vinculados ao acordo. Cancelar o acordo reabre os títulos originais, desde que nenhuma parcela do acordo tenha sido recebida.

## Inadimplência

O relatório de inadimplência fica em **Relatórios > Financeiro > Títulos vencidos**. Ele pode ser agrupado por cliente, vendedor ou faixa de atraso.

O relatório usa a data de vencimento, não a data de competência. Valores recebidos parcialmente aparecem apenas pelo saldo que continua em aberto.
