# Primeiro acesso, usuários e permissões

## Acesso inicial

O endereço padrão é `https://app.nexoerp.exemplo`. Cada pessoa deve usar seu próprio usuário. O login compartilhado prejudica a auditoria e não é recomendado.

No primeiro acesso:

1. informe o e-mail usado no convite;
2. crie uma senha com no mínimo 10 caracteres;
3. aceite os termos de uso;
4. confirme o código enviado por e-mail;
5. escolha a empresa que deseja acessar.

O código de confirmação expira em 15 minutos. Se ele expirar, clique em **Reenviar código**. O envio pode levar até dois minutos.

## Autenticação em dois fatores

A autenticação em dois fatores, chamada de 2FA, pode ser ativada em **Meu perfil > Segurança**. O sistema aceita aplicativo autenticador. SMS não está disponível.

Administradores podem tornar o 2FA obrigatório para toda a empresa em **Configurações > Segurança**. Depois de ativada a obrigatoriedade, usuários sem 2FA terão de configurá-lo no acesso seguinte.

Guarde os códigos de recuperação fora do computador. Cada código funciona uma única vez.

## Perfis padrão

**Administrador**: configura a empresa, cria usuários, altera permissões e acessa todos os dados.

**Financeiro**: cria e edita lançamentos, faz baixas, concilia extratos e emite relatórios. Não administra usuários por padrão.

**Aprovador**: visualiza pagamentos aguardando aprovação e pode aprovar ou rejeitar conforme o limite definido.

**Consulta**: apenas visualiza telas e relatórios autorizados. Não cria, edita ou baixa lançamentos.

**Contador**: consulta relatórios, documentos e exportações contábeis. O acesso a dados bancários pode ser desabilitado.

## Criar um usuário

Acesse **Configurações > Usuários > Convidar usuário**. Informe nome, e-mail, perfil e empresas permitidas. O convite vale por 72 horas.

Se o convite vencer, abra o cadastro e selecione **Reenviar convite**. Não é necessário excluir e cadastrar o usuário novamente.

## Aprovação de pagamentos

A empresa pode exigir aprovação para despesas acima de determinado valor. A regra fica em **Configurações > Financeiro > Aprovações**.

Exemplo: pagamentos até R$ 1.000 não exigem aprovação; de R$ 1.000,01 a R$ 10.000 exigem um aprovador; acima de R$ 10.000 exigem dois aprovadores.

Quem criou o lançamento pode ser impedido de aprová-lo. Essa separação é configurável. Um pagamento rejeitado volta para a situação **Em aberto** com o motivo da rejeição.

## Bloqueio e recuperação de senha

Após cinco tentativas incorretas, o login fica bloqueado por 20 minutos. A opção **Esqueci minha senha** envia um link válido por 30 minutos.

Administradores não conseguem visualizar a senha de outro usuário. Eles podem apenas bloquear o acesso, encerrar sessões ativas ou disparar uma redefinição.

## Desligamento de colaborador

Não exclua o usuário. Use **Bloquear acesso** para preservar o histórico de auditoria. Também encerre as sessões ativas e transfira tarefas de aprovação pendentes para outro aprovador.
