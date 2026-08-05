# Problemas comuns e soluções rápidas

Documento interno da equipe de atendimento. Revisão: maio.

## Tela em branco depois do login

1. Atualizar a página com `Ctrl+Shift+R` ou `Cmd+Shift+R`.
2. Testar janela anônima.
3. Desabilitar extensões de bloqueio somente para o endereço do NexoERP.
4. Confirmar se data e hora do computador estão automáticas.
5. Se persistir, coletar navegador, horário e captura da tela.

Navegadores suportados: versões atuais do Chrome, Edge, Firefox e Safari. Internet Explorer não é suportado.

## Código de acesso não chegou

Confirmar endereço de e-mail e pasta de spam. Aguardar dois minutos antes de reenviar. Muitos reenvios invalidam os códigos anteriores: somente o código mais recente funciona.

## Botão Registrar pagamento desabilitado

Possíveis causas:

- usuário sem permissão de baixa;
- período contábil fechado;
- lançamento cancelado;
- pagamento aguardando aprovação;
- outra pessoa editando o registro naquele momento.

Passe o mouse sobre o botão para ver o motivo apresentado pela tela.

## Erro "competência anterior ao período permitido"

A data está dentro de período fechado. Não recomende trocar a data apenas para contornar o bloqueio. O financeiro deve consultar o contador e pedir reabertura ou orientação para lançamento de ajuste.

## Extrato OFX não importa

Verificar se o arquivo é realmente OFX e se pertence à conta selecionada. Alguns bancos entregam HTML com extensão `.ofx`; abra em editor de texto e confirme se o conteúdo começa com cabeçalho OFX.

Arquivos acima de 5 MB ou com período maior que 90 dias devem ser divididos. Se houver mensagem de conta incompatível, conferir banco, agência e número da conta no cadastro.

## Extrato importado em duplicidade

Primeiro verifique se são transações realmente duplicadas ou se o banco forneceu identificadores diferentes. Não exclua baixas em massa antes dessa conferência.

Para remover uma importação ainda não conciliada, acesse **Histórico de importações > Desfazer importação**. Se já houve conciliação, desfaça os vínculos antes.

## Boleto preso em Processando

Aguardar até 15 minutos. Depois, atualizar a situação da cobrança. Não emitir outro boleto para a mesma receita enquanto o primeiro estiver processando.

Se ultrapassar 30 minutos, abrir chamado com ID da cobrança, banco, carteira e horário. Não anexar certificado, senha ou token.

## Boleto rejeitado por endereço

Conferir CEP com oito números, cidade, estado, rua e número do cliente. Alguns bancos não aceitam número `0` ou `S/N`; nesse caso, usar a orientação específica do convênio bancário.

## Saldo duplicado após transferência

Geralmente a transferência foi registrada e também foram criadas manualmente uma receita e uma despesa. Localizar os três registros pelo valor e pela data. Manter a transferência e cancelar os lançamentos duplicados, após confirmação do usuário.

## Relatório exportado não chegou

Exportações grandes não são enviadas por e-mail. Elas aparecem no sino de **Notificações**. O processamento pode levar alguns minutos e o arquivo fica disponível por sete dias.

## Mensagem "registro alterado por outro usuário"

O NexoERP impediu que uma edição antiga sobrescrevesse dados mais novos. Atualizar a tela, conferir as mudanças feitas pela outra pessoa e repetir apenas o ajuste necessário.

## Dados mínimos para escalar ao suporte técnico

- empresa e CNPJ;
- usuário afetado;
- URL ou nome da tela;
- identificador do lançamento, cobrança ou importação;
- data e hora com fuso;
- passos realizados;
- resultado esperado e resultado observado;
- captura de tela sem dados sensíveis.

Nunca pedir senha, código 2FA, token de API, chave PIX ou acesso remoto ao banco.
