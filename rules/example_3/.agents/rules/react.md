# Regras para React

Estas regras se aplicam ao código do frontend React deste projeto.

## Componentes pequenos e reutilizáveis

- Crie componentes com uma única responsabilidade.
- Não crie componentes com mais de 30 linhas. Extraia partes da interface, regras de negócio ou estados para componentes e hooks menores.
- Prefira nomes que expressem o papel do componente, como `StatusCard`, `HealthMessage` e `LoadingIndicator`.
- Reutilize componentes para comportamentos e estruturas visuais comuns, evitando duplicação.

Exemplo de componente pequeno:

```tsx
type StatusCardProps = {
  status: 'online' | 'offline'
}

export function StatusCard({ status }: StatusCardProps) {
  const label = status === 'online' ? 'API online' : 'API offline'
  const color = status === 'online' ? 'text-green-700' : 'text-red-700'

  return (
    <section aria-label="Status da API" className="rounded-lg border p-4">
      <p className={color}>{label}</p>
    </section>
  )
}
```

## Props explícitas

Evite encaminhar props com o spread operator, pois isso esconde a API do componente e pode repassar atributos inesperados:

```tsx
// Evite
function Button(props: ButtonProps) {
  return <button {...props} />
}
```

Declare e utilize as propriedades explicitamente:

```tsx
type ButtonProps = {
  label: string
  onClick: () => void
  disabled?: boolean
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {label}
    </button>
  )
}
```

## Hooks e efeitos

- Prefira componentes funcionais.
- Crie hooks customizados com o prefixo `use`, como `useApiHealth` ou `useUsers`.
- Use `useEffect` somente para sincronizar o React com sistemas externos, como requisições, assinaturas, timers ou APIs do navegador.
- Não use `useEffect` para calcular valores derivados, responder a eventos de clique ou manter estados que podem ser obtidos diretamente de props e estado existente.

Evite um efeito desnecessário:

```tsx
// Evite: o valor pode ser calculado durante a renderização
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])
```

Prefira:

```tsx
const fullName = `${firstName} ${lastName}`
```

## Memoização

Use `useMemo` para evitar cálculos realmente pesados entre re-renders. As dependências devem representar todos os valores usados no cálculo. Não use `useMemo` para operações simples, pois isso aumenta a complexidade sem benefício relevante.

```tsx
const filteredUsers = useMemo(
  () => users.filter((user) => user.name.includes(searchTerm)),
  [users, searchTerm],
)
```

## Acesso ao backend

- Separe o acesso ao backend do código visual do componente.
- Coloque chamadas HTTP e transformação de respostas em módulos próprios, como `src/lib/api/health.ts`.
- Encapsule carregamento, sucesso e erro em hooks customizados.
- O componente deve consumir o estado do hook e cuidar apenas da apresentação e das interações.

Exemplo de módulo de acesso à API:

```ts
export type Health = { status: string }

export async function fetchHealth(): Promise<Health> {
  const response = await fetch('http://localhost:3000/health')
  if (!response.ok) throw new Error('Não foi possível consultar a API')
  return response.json() as Promise<Health>
}
```

Exemplo de hook que contém a lógica de integração:

```tsx
export function useApiHealth() {
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .finally(() => setLoading(false))
  }, [])

  return { health, loading }
}
```

## Acessibilidade

- Sempre forneça propriedades de acessibilidade `aria-*` adequadas ao elemento e ao estado apresentado.
- Prefira elementos semânticos (`button`, `nav`, `main`, `section`, `form`) e complemente-os com `aria-label`, `aria-live`, `aria-busy`, `aria-expanded` ou `aria-pressed` quando aplicável.
- Controles interativos devem indicar seu estado e ter um nome acessível.
- Mensagens assíncronas, de carregamento ou erro devem ser anunciadas quando necessário.

```tsx
function LoadingMessage() {
  return (
    <p role="status" aria-live="polite" aria-busy="true">
      Consultando a API...
    </p>
  )
}
```

## Estilização

- Utilize Tailwind CSS para estilizar os componentes.
- Prefira classes utilitárias diretamente no JSX e variantes condicionais claras.
- Evite CSS inline e folhas de estilo específicas quando as classes Tailwind atenderem ao caso.
- Mantenha classes relacionadas ao componente próximas de sua estrutura e garanta estados de foco, hover, disabled e responsividade.

```tsx
<button
  type="button"
  aria-label="Atualizar status"
  className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Atualizar
</button>
```
