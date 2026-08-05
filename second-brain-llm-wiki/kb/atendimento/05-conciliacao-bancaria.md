# Guia de conciliação bancária

Conciliação é a comparação entre o extrato do banco e os lançamentos do NexoERP. O objetivo é confirmar que cada entrada ou saída bancária possui uma contrapartida correta no sistema.

## Antes de começar

Confira se a conta financeira possui banco, agência, conta e saldo inicial corretos. O saldo inicial deve representar o valor do banco no dia anterior ao primeiro dia controlado no NexoERP.

Não altere o saldo inicial para corrigir diferenças atuais. Use a conciliação para localizar a origem da diferença.

## Importar um extrato

Acesse **Financeiro > Conciliação bancária**, escolha a conta e clique em **Importar extrato**.

Formatos aceitos:

- OFX;
- CSV no modelo do NexoERP;
- integração bancária automática.

O período máximo por arquivo OFX é de 90 dias. Arquivos com movimentações de mais de uma conta devem ser separados antes da importação.

O sistema detecta duplicidade pelo identificador da transação, data, valor e conta. Reimportar o mesmo arquivo normalmente não duplica movimentos.

## Sugestões automáticas

O NexoERP procura lançamentos com mesmo valor e data até três dias antes ou depois da transação bancária. Descrição, CPF/CNPJ e número do documento aumentam a confiança da sugestão.

A sugestão não é uma baixa. O usuário deve revisar e confirmar.

## Conciliar com lançamento existente

Selecione a transação do extrato, confira a sugestão e clique em **Conciliar**. Se não houver sugestão, use **Localizar lançamento** e pesquise por valor, período ou pessoa.

Uma transação pode ser vinculada a vários lançamentos. Isso é útil para depósitos que agrupam diferentes vendas. Da mesma forma, várias transações podem ser vinculadas a um lançamento, como um pagamento dividido.

A soma dos itens precisa ser igual ao valor do extrato. Diferenças de tarifa devem ser registradas como um novo lançamento.

## Criar lançamento pelo extrato

Quando não existir registro no sistema, selecione **Criar e conciliar**. Escolha receita, despesa ou transferência e informe a categoria.

Evite classificar transferência entre contas próprias como receita ou despesa. Escolha **Transferência** e indique a conta de destino ou origem. Assim o movimento não infla o resultado.

## Ignorar um movimento

A opção **Ignorar** serve para linhas informativas sem impacto financeiro, como saldo do dia incluído em alguns arquivos. Não use Ignorar para tarifas, juros ou pagamentos reais.

## Desfazer conciliação

Abra a aba **Conciliados**, localize a transação e clique em **Desfazer conciliação**. O movimento volta a ficar pendente.

Se a baixa foi criada durante a conciliação, o sistema pergunta se ela também deve ser estornada. Leia a confirmação com atenção: manter a baixa pode ser correto quando apenas o vínculo com o extrato estava errado.

## Diferença entre saldo do sistema e saldo do banco

Verifique, nesta ordem:

1. data do filtro;
2. saldo inicial;
3. transações pendentes de conciliação;
4. lançamentos baixados na conta errada;
5. duplicidades;
6. transferências registradas como receita ou despesa;
7. tarifas bancárias não cadastradas.

Movimentos futuros não explicam diferenças no saldo atual, mas aparecem na projeção de caixa.
