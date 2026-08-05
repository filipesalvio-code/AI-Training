# Boletos, notas fiscais e integrações

## Integração bancária

Há dois tipos de conexão:

**Leitura de extrato**: importa saldos e transações para conciliação.

**Cobrança e pagamento**: registra boletos ou envia pagamentos ao banco, conforme o convênio contratado.

A integração é configurada em **Configurações > Integrações bancárias** por um administrador. A disponibilidade depende do banco e do plano do NexoERP.

Uma conta pode exibir o estado **Atenção necessária** quando a autorização bancária expira. Nesse caso, clique em **Reconectar**. A reconexão não apaga o histórico.

## Boletos

Antes da primeira emissão, cadastre a carteira, o beneficiário, juros, multa e instruções. Faça uma cobrança de valor baixo para homologar a configuração.

Estados possíveis de uma cobrança:

- processando;
- registrada;
- paga;
- vencida;
- cancelamento solicitado;
- cancelada;
- rejeitada.

Um boleto rejeitado não deve ser enviado ao cliente. Abra os detalhes para ver o código retornado pelo banco. Causas comuns: documento do pagador inválido, CEP incompleto, carteira não homologada e convênio incorreto.

A baixa bancária pode levar até o próximo dia útil para aparecer, dependendo do banco. PIX associado ao boleto costuma ser confirmado em poucos minutos, mas também pode sofrer atraso.

## Nota fiscal de serviço

O NexoERP envia NFS-e para municípios integrados. É necessário configurar certificado digital, inscrição municipal, regime tributário e código do serviço.

A receita financeira pode existir sem nota fiscal. Para emitir, abra a receita e selecione **Ações > Emitir NFS-e**.

Situações da nota:

- rascunho;
- na fila;
- enviada;
- autorizada;
- rejeitada;
- cancelada.

Uma nota rejeitada não altera o contas a receber. Corrija os dados e reenvie. Não crie uma segunda receita apenas para tentar emitir novamente.

O cancelamento de NFS-e obedece ao prazo e às regras da prefeitura. Cancelar a nota não cancela automaticamente a receita, o boleto ou o recebimento.

## Importação de XML

XML de nota de entrada pode criar fornecedor, despesa, itens e impostos. Acesse **Compras > Importar XML**.

Revise categoria, centro de custo, vencimentos e condição de pagamento antes de confirmar. O XML informa os dados fiscais, mas nem sempre contém a classificação financeira usada pela empresa.

O sistema alerta quando a chave de acesso já foi importada. Uma nota complementar possui chave própria e não é considerada duplicada.

## Integração contábil

A exportação contábil usa o plano de contas vinculado às categorias financeiras. Categorias sem conta contábil ficam no relatório de pendências.

O fechamento do período bloqueia edição, exclusão, baixa e estorno anteriores à data de fechamento. Administradores podem reabrir o período, mas a ação fica registrada na auditoria.

## API

Clientes do plano Integração podem usar a API para cadastrar pessoas, lançamentos e consultar baixas. Tokens são criados em **Configurações > Integrações > API**.

O token é exibido apenas uma vez. Se ele for perdido, revogue-o e crie outro. Nunca coloque o token em planilhas, chamados de suporte ou código executado no navegador.
