qual é o tamanho ideal da tarefa para execução?
devo limpar a janela de contexto entre a execução das tasks?
de quanto em quanto tempo?

rodando cada tarefa isoladamente em uma janela de contexto:

task 1: 107k 1M
task 2: 126k 3M
task 3: 105k 1.5M
task 4: 158k 5M
task 5: 153k 6M

total: 650k
cache: 16M

rodando todas ao mesmo tempo, em sequência:

total: 240k
cache: 10M

vantagens e desvantagens em não limpar a janela de contexto entre as tasks:

+ vantagens:
* reuso de cache
* evitar leitura repetitiva

- desvantagens
* contexto maior
* compactação
* tempo de inferência
* mistura de skills
