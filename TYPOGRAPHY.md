# Sistema de Tipografia Responsiva

Este projeto implementa um sistema de tipografia responsiva usando variáveis CSS e a função `clamp()` para criar escalas de fonte que se adaptam automaticamente ao tamanho da tela.

## Variáveis de Fonte Disponíveis

| Variável | Tamanho Mínimo | Tamanho Máximo | Uso Recomendado |
|----------|----------------|----------------|------------------|
| `--font-xs` | 12px | 14px | Textos pequenos, legendas, mensagens de erro |
| `--font-sm` | 14px | 16px | Labels, textos secundários |
| `--font-base` | 16px | 18px | Texto principal, inputs |
| `--font-lg` | 18px | 20px | Subtítulos |
| `--font-xl` | 20px | 22px | Títulos secundários, botões de fechar |
| `--font-2xl` | 22px | 24px | Títulos principais |
| `--font-3xl` | 24px | 28px | Títulos de modais, cabeçalhos |
| `--font-4xl` | 28px | 32px | Títulos grandes, hero text |

## Variáveis de Espaçamento Responsivo

| Variável | Tamanho Mínimo | Tamanho Máximo | Uso Recomendado |
|----------|----------------|----------------|------------------|
| `--spacing-xs` | 4px | 6px | Margens pequenas |
| `--spacing-sm` | 8px | 12px | Espaçamentos entre elementos |
| `--spacing-md` | 12px | 16px | Margens médias |
| `--spacing-lg` | 16px | 20px | Espaçamentos grandes |
| `--spacing-xl` | 20px | 24px | Margens grandes |
| `--spacing-2xl` | 24px | 32px | Espaçamentos muito grandes |

## Como Usar

### Em CSS
```css
.titulo {
  font-size: var(--font-2xl);
  margin-bottom: var(--spacing-md);
}
```

### Em React (inline styles)
```jsx
<h1 style={{ fontSize: 'var(--font-3xl)' }}>Título</h1>
<p style={{ fontSize: 'var(--font-base)', margin: 'var(--spacing-sm) 0' }}>Texto</p>
```

## Benefícios

1. **Responsividade Automática**: Os tamanhos se ajustam automaticamente conforme o viewport
2. **Consistência**: Todas as fontes seguem a mesma escala proporcional
3. **Manutenibilidade**: Mudanças centralizadas nas variáveis CSS
4. **Performance**: Não requer JavaScript para cálculos responsivos
5. **Acessibilidade**: Respeita as preferências de zoom do usuário

## Implementação Técnica

O sistema usa a função CSS `clamp(min, preferred, max)` onde:
- `min`: Tamanho mínimo em telas pequenas
- `preferred`: Valor baseado em viewport width (vw) para escalonamento
- `max`: Tamanho máximo em telas grandes

Exemplo:
```css
--font-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
```

Isso garante que a fonte nunca seja menor que 16px nem maior que 18px, escalando suavemente entre esses valores.