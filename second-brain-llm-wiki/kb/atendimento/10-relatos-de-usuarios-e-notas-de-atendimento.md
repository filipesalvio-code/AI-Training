# Relatos de usuários e notas de atendimento

Compilado de observações recebidas em treinamentos e chamados. O texto abaixo preserva o jeito informal dos relatos e pode conter hipóteses dos usuários, não conclusões técnicas.

## Relato 1842 — pagamento sumiu do painel

> Paguei o aluguel ontem e hoje ele sumiu do card de contas a pagar. Procurei no contas a pagar e achei como pago. Achei que o sistema tinha excluído.

Nota do atendimento: o painel estava filtrado para **Em aberto**. Ao mudar para **Todas as situações**, o lançamento apareceu. Explicamos que a baixa retira o item da pendência, mas não apaga o histórico.

## Relato 1870 — total do caixa diferente do banco

> O Nexo mostra R$ 800 a mais do que o aplicativo do banco. Fiz a conciliação toda e não resolveu.

Nota do atendimento: havia um cheque registrado como recebido, mas ainda não compensado. A baixa tinha sido feita diretamente na conta corrente. O cliente decidiu estornar e registrar o recebimento primeiro na conta `Cheques a compensar`.

## Relato 1901 — cobrança duplicada

> Cliquei para emitir o boleto, demorou, então cliquei de novo. Agora o cliente recebeu dois links.

Nota do atendimento: uma cobrança ficou registrada e a outra foi rejeitada pelo banco. Confirmamos o identificador da cobrança válida e cancelamos a tentativa excedente. Orientação: aguardar enquanto estiver **Processando**.

## Relato 1944 — parcelas futuras não mudaram

> Troquei a categoria da parcela de junho, mas julho e agosto continuaram na categoria antiga.

Nota do atendimento: o usuário editou apenas uma parcela. Repetimos a alteração escolhendo **Aplicar também às parcelas futuras**. Parcelas já pagas não foram modificadas.

## Relato 2013 — DRE não bate com fluxo de caixa

> Meu DRE dá lucro no mês, mas o caixa caiu. Qual relatório está errado?

Nota do atendimento: nenhum estava necessariamente errado. O DRE estava por competência e havia pagamento de compras feitas em meses anteriores, além de parcelas de empréstimo. Mostramos a diferença entre resultado econômico e movimentação financeira.

## Relato 2057 — transferência virou receita

> Mandei dinheiro da conta do banco para a conta digital e classifiquei a entrada como receita. Agora parece que vendemos mais.

Nota do atendimento: cancelamos a receita e a despesa criadas manualmente e registramos uma transferência entre contas próprias. Depois disso, o saldo das contas permaneceu correto e a falsa receita saiu do DRE.

## Relato 2088 — usuário desligado ainda aparecia

> Removi a pessoa da empresa, mas o nome dela continua no histórico dos pagamentos.

Nota do atendimento: comportamento esperado. O acesso estava bloqueado, e o histórico mantém o autor original para auditoria. O usuário não conseguia mais entrar.

## Relato 2140 — nota cancelada, boleto aberto

> Cancelei a nota na prefeitura e pensei que o boleto seria cancelado junto.

Nota do atendimento: NFS-e, boleto e lançamento financeiro possuem ciclos independentes. O boleto precisou ser cancelado na área de Cobranças, e a receita foi cancelada separadamente.

## Relato 2196 — exportação não recebida

> Pedi uma planilha de dois anos e não chegou no meu e-mail.

Nota do atendimento: a exportação tinha 32 mil linhas e foi processada em segundo plano. O arquivo estava disponível no sino de Notificações. O cliente esperava recebimento por e-mail porque versões antigas do processo funcionavam assim.

## Relato 2241 — recorrência encerrada mas contas continuam

> Cancelei a recorrência do aluguel, porém ainda aparecem duas contas futuras.

Nota do atendimento: encerrar a recorrência impede novas gerações, mas não remove lançamentos já criados. As duas contas foram revisadas e canceladas individualmente.

## Padrões percebidos pela equipe

- usuários confundem filtro com exclusão;
- caixa e competência precisam ser explicados com exemplos;
- integrações bancárias não são sempre instantâneas;
- ações em boleto, nota fiscal e lançamento não se propagam automaticamente;
- recorrência e parcelamento parecem iguais para novos usuários;
- é melhor pedir identificadores e horários do que longas descrições sem contexto.
