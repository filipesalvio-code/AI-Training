# Clima agora

## Direção

Interface de operação para consultas rápidas de clima atual. A composição usa uma coluna de orientação em azul petróleo e uma superfície clara para concentrar a tarefa, evitando o padrão de dashboard carregado.

## Sistema visual

- Azul petróleo (`#163f4b`) conduz a navegação e os controles primários.
- Fundo azul-neblina (`#edf3f4`) separa a tarefa do bloco introdutório.
- Amarelo solar (`#f4c95d`) sinaliza identidade, foco e destaque de temperatura.
- Avenir Next, Avenir ou Trebuchet MS formam a voz tipográfica, com pesos fortes para títulos e métricas.
- Bordas suaves, sombras amplas e cantos de 12 a 16 px definem superfícies de interação.

## Comportamento

O formulário permanece editável, anuncia carregamento e erros por regiões vivas e remove o resultado anterior quando uma nova consulta começa. Em telas estreitas, a coluna introdutória precede a consulta e os controles ocupam a largura disponível.

## Acessibilidade

Todos os controles têm rótulos persistentes, foco visível, mensagens associadas por `aria-describedby`, `aria-invalid` para entrada inválida e `aria-busy` durante a consulta. Resultados e atribuição usam texto, não apenas cor ou ícone.
