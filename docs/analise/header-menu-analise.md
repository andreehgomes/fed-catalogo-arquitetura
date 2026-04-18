# Análise Técnica: Componente Header e Sistema de Menu

## Visão Geral

O sistema de menu do header é composto por três camadas:

1. **Dados** — `NavService` define o array `MENUITEMS` com a estrutura de toda a navegação
2. **Renderização** — `MenuComponent` converte os dados em HTML usando templates recursivos
3. **Variantes** — `HeaderComponent` seleciona qual variante de header renderizar (`header-one` a `header-four`) com base no estilo do layout ativo

---

## Arquivos Envolvidos

| Arquivo | Responsabilidade |
|---|---|
| `src/app/shared/services/nav.service.ts` | **Fonte única de dados do menu** — onde adicionar/remover itens |
| `src/app/shared/components/menu/menu.ts` | Lógica de abertura/fechamento e estado ativo dos itens |
| `src/app/shared/components/menu/menu.html` | Template de renderização (loops recursivos) |
| `src/app/shared/components/header/header.ts` | Componente-roteador que seleciona a variante do header |
| `src/app/shared/components/header/header.html` | Switch `@if` para renderizar a variante correta |
| `src/app/shared/components/header/header-one/` | Variante `"simple"` |
| `src/app/shared/components/header/header-two/` | Variante `"basic"` (top bar + header) |
| `src/app/shared/components/header/header-three/` | Variante `"classic"` (mínimo + modal login) |
| `src/app/shared/components/header/header-four/` | Variante `"standard"` (menu map-header) |
| `src/app/shared/data/layout.ts` | Configurações de layout — define qual estilo/variante de header usar por rota |

---

## Interface `IMenu`

```typescript
// src/app/shared/services/nav.service.ts
export interface IMenu {
  title?: string;       // Texto exibido no menu
  path?: string;        // Rota Angular (para type: 'link') ou URL externa (type: 'extTabLink')
  icon?: string;        // Nome do ícone Feather (apenas itens de nível 1)
  type?: string;        // 'sub' | 'link' | 'extTabLink'
  active?: boolean;     // Estado de expansão atual (gerenciado em runtime)
  level?: number;       // Profundidade: 1 (raiz) até 4 (mais profundo)
  children?: IMenu[];   // Subitens para menus dropdown comuns
  megaMenu?: boolean;   // Se true, renderiza como mega menu em grid
  section?: IMenu[];    // Usado em mega menu para agrupar colunas sem título pai
  right?: boolean;      // Alinha o dropdown para a direita (evitar overflow)
  badge?: boolean;      // Exibe badge de texto
  badgeText?: string;   // Texto do badge (ex: "New")
  badgeIcon?: boolean;  // Exibe ícone de badge no lugar de texto
  image?: string;       // Imagem opcional para o item
  items?: IMenu[];      // Alias alternativo para children (pouco usado)
}
```

---

## Estrutura Atual do `MENUITEMS`

```
home            (type: sub, level: 1)         → 12 filhos (links diretos)
listing         (type: sub, level: 1)         → 3 filhos (grid view, list view, tab layout)
  grid view     (type: sub, level: 2)         → 8 filhos (2grid, 3grid, slider, map...)
    2 grid      (type: sub, level: 3)         → 3 filhos (left/right/no sidebar)
    ...
  list view     (type: sub, level: 2)         → 5 filhos
  tab layout    (type: sub, level: 2)         → 3 filhos
property        (type: sub)                   → 9 filhos (links diretos)
pages           (type: sub, megaMenu: true)   → 5 colunas em grid
  Portfolio     (coluna)                      → 15 filhos
  Blog page     (coluna)                      → 16 filhos
  section[0]    (2 sub-colunas)               → blog detail + breadcrumb
  section[1]    (2 sub-colunas)               → Agency + Email template + User panel
  other pages   (coluna)                      → 15 filhos
modules         (type: sub, level: 1, right: true) → 14 filhos (links diretos)
agent           (type: sub, level: 1, right: true) → 4 filhos
contact         (type: sub, level: 1, right: true) → 3 filhos
```

---

## Como Adicionar um Item de Menu

### Caso 1 — Link direto em um menu existente

Adicione um objeto ao array `children` do item pai em `nav.service.ts`:

```typescript
// Exemplo: adicionar "Meu Imóvel" em "property"
{
  title: "property",
  type: "sub",
  children: [
    // ... itens existentes ...
    {
      title: "Meu Imóvel",
      path: "/property/meu-imovel",
      type: "link",
    },
  ],
}
```

### Caso 2 — Novo item de nível raiz

Adicione um novo objeto diretamente ao array `MENUITEMS`:

```typescript
public MENUITEMS: IMenu[] = [
  // ... itens existentes ...
  {
    title: "favoritos",
    icon: "heart",          // ícone Feather
    type: "sub",
    active: false,
    level: 1,
    right: true,            // dropdown alinhado à direita
    children: [
      {
        title: "Meus Favoritos",
        path: "/page/user/favourite",
        type: "link",
      },
    ],
  },
];
```

### Caso 3 — Link externo (abre em nova aba)

Use `type: "extTabLink"` com a URL completa em `path`:

```typescript
{
  title: "Documentação",
  path: "https://exemplo.com/docs",
  type: "extTabLink",
}
```

### Caso 4 — Item com badge

```typescript
{
  title: "Novo recurso",
  path: "/alguma/rota",
  type: "link",
  badge: true,
  badgeText: "New",   // texto do badge
  // ou:
  badgeIcon: true,    // exibe ícone no lugar de texto
}
```

### Caso 5 — Nova coluna em mega menu (`pages`)

O mega menu usa dois formatos para as colunas:

**Coluna com título (`title` + `children`):**
```typescript
{
  title: "Minha Seção",
  active: false,
  children: [
    { title: "Item 1", path: "/rota/item-1", type: "link" },
    { title: "Item 2", path: "/rota/item-2", type: "link" },
  ],
},
```

**Agrupamento sem título pai (`section`)** — divide uma coluna em duas sub-colunas:
```typescript
{
  section: [
    {
      title: "Sub-seção A",
      active: false,
      children: [ /* ... */ ],
    },
    {
      title: "Sub-seção B",
      active: false,
      children: [ /* ... */ ],
    },
  ],
},
```

---

## Como Remover um Item de Menu

Simplesmente remova o objeto correspondente do array em `nav.service.ts`.

**Remover um item folha** (link direto): delete o objeto do array `children` do pai.

**Remover um submenu inteiro**: delete o objeto (com todos os seus `children`) do array onde está inserido.

**Remover uma coluna inteira do mega menu**: delete o objeto da lista `children` do item `pages`.

> Não há lógica dependente de IDs ou índices — o menu é renderizado puramente por iteração do array, então remoções são seguras.

---

## Como o Menu é Renderizado (Funcionamento Interno)

### Fluxo de dados

```
NavService.MENUITEMS
  → NavService.items (BehaviorSubject<IMenu[]>)
  → MenuComponent (assina via items$)
  → Template (@for + ng-template recursivo)
```

### Tipos de renderização

O template em `menu.html` bifurca em dois caminhos com base em `megaMenu`:

- **`megaMenu: false`** (padrão): dropdown vertical com `<ul class="nav-submenu">` e template `#recursiveMenu` recursivo
- **`megaMenu: true`**: container Bootstrap (`row`) com colunas `col-*` para cada entrada de `children` ou `section`

### Estado ativo

O método `openMenu(item)` em `menu.ts` gerencia o estado de expansão:
- Fecha todos os itens irmãos recursivamente
- Alterna `item.active` no item clicado
- No mobile, usa `isOpenMenu` para controlar o menu lateral

### Menu mobile

- Botão `<div class="toggle-nav">` chama `openSideMenu()`
- Adiciona classe `.open` ao container `.nav-menu`
- Itens expandem/contraem via `ngClass` com `item.active && isOpenMenu`
- Ícones `+`/`-` mostram estado de expansão

---

## Variantes de Header e o Menu

| Variante | Estilo em `layout.ts` | Input `[menuRight]` | Observação |
|---|---|---|---|
| `header-one` | `"simple"` | não usado | Header padrão com logo + menu + widgets |
| `header-two` | `"basic"` | não usado | Top bar + header separado |
| `header-three` | `"classic"` | não usado | Menu + ícone de usuário (abre modal de login) |
| `header-four` | `"standard"` | `true` | Menu alinhado à direita (usado em map-header) |

O `MenuComponent` aceita o input `[icon]` (booleano) para mostrar ou ocultar ícones Feather nos itens de nível 1.

A variante ativa é determinada pelo campo `style` do objeto `ILayout` correspondente à rota atual, definido em `src/app/shared/data/layout.ts`.

---

## Restrições e Comportamentos a Considerar

- **Profundidade máxima testada**: 4 níveis (`level: 1` → `level: 4`). O template recursivo suporta aninhamento adicional, mas o CSS pode não tratar bem além de 4 níveis.
- **Mega menu**: funciona apenas no item de nível 1 com `megaMenu: true`. Não funciona em subníveis.
- **`right: true`**: necessário em itens próximos ao fim da barra de navegação para evitar overflow do dropdown para fora da viewport.
- **`active: false`**: sempre inicialize com `false`; o estado é gerenciado em runtime pelo `MenuComponent`.
- **Links externos**: use `type: "extTabLink"` — o template renderiza um `<a target="_blank">` em vez de `[routerLink]`.
- **Sem guards no menu**: a visibilidade dos itens não é controlada por roles/autenticação no `NavService`. Controle de acesso deve ser feito nas rotas Angular (`CanActivate`), não no menu.
