# Manual de contas a pagar

## Incluir uma despesa

Acesse **Financeiro > Contas a pagar** e clique em **Nova despesa**.

Campos principais:

- fornecedor;
- descrição;
- valor;
- data de competência;
- data de vencimento;
- categoria;
- centro de custo;
- conta financeira prevista;
- forma de pagamento;
- número do documento;
- anexo.

Fornecedor, descrição, valor, vencimento e categoria são obrigatórios. A conta financeira pode ficar em branco enquanto o pagamento ainda não foi planejado.

O campo **Número do documento** é usado para localizar duplicidades. Quando o mesmo fornecedor, número e valor já existem, o sistema exibe um alerta. O alerta não impede a gravação porque pode haver documentos legítimos com os mesmos dados.

## Parcelas

Para dividir uma compra, marque **Parcelado** e informe quantidade, primeiro vencimento e intervalo. O sistema sugere parcelas mensais e acrescenta `/01`, `/02` e assim por diante ao número do documento.

A diferença de arredondamento fica na última parcela. Uma compra de R$ 100 dividida em três partes gera R$ 33,33, R$ 33,33 e R$ 33,34.

Alterar apenas uma parcela não modifica as demais. Para alterar a série, selecione **Aplicar também às parcelas futuras**.

## Recorrência

Use recorrência para despesas repetidas sem quantidade definida, como aluguel e assinatura. As opções são semanal, mensal, bimestral, trimestral, semestral e anual.

O NexoERP cria os lançamentos recorrentes 45 dias antes de cada vencimento. Encerrar a recorrência não apaga lançamentos que já foram gerados.

Parcelamento representa uma única obrigação dividida. Recorrência representa obrigações independentes. Essa diferença afeta relatórios e cancelamentos.

## Anexos

São aceitos PDF, PNG, JPG, XML e arquivos de texto, com até 10 MB por arquivo. O limite é de cinco anexos por lançamento. Arquivos executáveis e pastas compactadas não são aceitos.

## Baixar uma conta

Abra o lançamento e clique em **Registrar pagamento**. Informe:

1. data do pagamento;
2. valor pago;
3. conta financeira;
4. juros, multa ou desconto, se houver;
5. observação opcional.

Se o valor informado for menor, o lançamento fica **Parcial** e mantém o saldo em aberto. Se for maior, o sistema exige que a diferença seja classificada como juros ou acréscimo.

Juros e multa usam a categoria da despesa por padrão, mas podem ser direcionados para categorias específicas nas configurações financeiras.

## Estornar um pagamento

Abra a conta paga, acesse **Histórico de baixas** e selecione **Estornar**. O estorno devolve o lançamento à situação anterior e corrige o saldo da conta financeira.

Não é possível estornar uma baixa incluída em período contábil fechado. Um administrador deve reabrir o período ou registrar um lançamento de ajuste no período atual.

## Pagamento em lote

Na lista de contas, marque os itens e selecione **Ações > Pagar em lote**. Todos os itens precisam usar a mesma conta financeira e a mesma data de pagamento. Despesas em moedas diferentes não podem ficar no mesmo lote.

O lote comporta até 200 lançamentos. Caso algum item exija aprovação, o lote inteiro fica aguardando aprovação.
