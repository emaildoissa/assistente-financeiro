# Plano: Tropical Wealth — Redesign do Assessor Financeiro

## Identidade Visual

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#FCFAF5` | Fundo da página — off-white quente |
| `--color-surface` | `#FFFFFF` | Cards, sidebar, diálogos |
| `--color-surface-hover` | `#F5F0E8` | Hover de cards, inputs, sidebar |
| `--color-text-main` | `#1B3B2D` | Texto principal — verde escuro |
| `--color-text-muted` | `#7A8A7A` | Metadados, labels secundários |
| `--color-primary` | `#C66B3D` | CTAs, links, acentos — terracota |
| `--color-primary-hover` | `#B05A2E` | Hover do primary |
| `--color-secondary` | `#E8C872` | Badges, acentos — ouro suave |
| `--color-success` | `#4A8C5C` | Verde floresta |
| `--color-warning` | `#D4A853` | Âmbar |
| `--color-error` | `#C14A3A` | Tijolo |
| `--color-border` | `#E5DDD3` | Bordas — cinza quente |
| `--color-border-light` | `#F0EAE0` | Bordas sutis |

## Tipografia

- **Display**: Sora (600, 700) — títulos, stats, page headers
- **Body**: Onest (400, 500) — texto, labels, botões
- **Mono**: JetBrains Mono (400) — código, números

## Fundo

- Gradient mesh radial: terracota + areia em opacidade muito baixa
- SVG noise texture a 2.5% opacidade
- Sombras com tom terracota em vez de cinza frio

## Motion

- `animate-fade-up`: fade + translateY(12px) → 0, 0.5s, both
- Stagger: cada card/grupo recebe `animation-delay: index * 0.05s`
- Cards hover: `scale(1.01)` + sombra intensifica

## Componentes

- Button: rounded-xl, primary terracota, focus ring terracota
- Card: shadow-warm-md, border #E5DDD3, rounded-2xl
- Input: bg #F5F0E8, focus ring terracota
- Badge: fundo colorido suave (green-50, red-50 etc)
- Dialog: border-top 3px terracota
- Toast: success #4A8C5C, error #C14A3A, info #1B3B2D
- MonthPicker: bg #F5F0E8, hover primary
- Sidebar: ativo com left-border 3px terracota, icons terracota, bg hover #F5F0E8

## Arquivos para modificar (25)

1. `src/app/globals.css`
2-8. `src/components/ui/*.tsx` (button, card, input, badge, dialog, toast, month-picker)
9. `src/components/layout/sidebar.tsx`
10. `src/app/(authenticated)/layout.tsx`
11. `src/app/(authenticated)/loading.tsx`
12. `src/app/(authenticated)/error.tsx`
13. `src/app/(authenticated)/page.tsx`
14. `src/app/(authenticated)/dashboard/page.tsx`
15. `src/app/(authenticated)/transactions/page.tsx`
16. `src/app/(authenticated)/categories/page.tsx`
17. `src/app/(authenticated)/tasks/page.tsx`
18. `src/app/(authenticated)/reminders/page.tsx`
19. `src/app/(authenticated)/conversations/page.tsx`
20. `src/app/(authenticated)/projects/page.tsx`
21. `src/app/login/page.tsx`
22. `src/app/register/page.tsx`
23. `src/app/page.tsx`
24-28. `src/components/*-form/*.tsx` (5 form components)

## Ordem de implementação

1. globals.css (base do tema)
2. Componentes UI (7 em paralelo)
3. Sidebar
4. Layout + loading + error
5. Páginas CRUD (7 com stagger)
6. Login + register
7. Formulários (5)
8. Build verify
