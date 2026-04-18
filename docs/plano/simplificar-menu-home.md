# Plano: Simplificar Menu — Apenas "Home" com rota `/`

## Objetivo

Remover todos os itens do menu, deixando somente o item **home** que redireciona para a rota `/`.

---

## Arquivo a modificar

| Arquivo | Ação |
|---|---|
| `src/app/shared/services/nav.service.ts` | Substituir todo o array `MENUITEMS` por um único item |

> Nenhum outro arquivo precisa ser alterado. O `MenuComponent` e os templates de header consomem `MENUITEMS` via `BehaviorSubject` — a mudança nos dados é suficiente.

---

## Passos

### 1. Abrir `nav.service.ts`

Arquivo: `src/app/shared/services/nav.service.ts`

### 2. Substituir o array `MENUITEMS`

Substituir todo o conteúdo do array (linhas 28–993) pelo seguinte:

```typescript
public MENUITEMS: IMenu[] = [
  {
    title: "home",
    icon: "home",
    type: "link",
    path: "/",
    active: false,
    level: 1,
  },
];
```

**Diferenças em relação ao item original:**

| Propriedade | Antes | Depois | Motivo |
|---|---|---|---|
| `type` | `"sub"` | `"link"` | Não há submenu; é um link direto |
| `children` | array com 12 filhos | removido | Não há filhos |
| `path` | ausente | `"/"` | Rota de destino |

### 3. Verificar o template de renderização

O template `menu.html` usa `@if (item.type == 'sub')` para renderizar o dropdown e `@if (item.type == 'link')` para renderizar um `<a [routerLink]>`. Como o item passará a ser `type: "link"`, o template já renderiza corretamente um link direto — **nenhuma alteração no template é necessária**.

---

## Resultado esperado

- O menu exibirá apenas o item **home** com ícone Feather `home`
- Clicar em "home" navegará para `/` via `[routerLink]`
- Nenhum dropdown será exibido
- Comportamento mobile preservado (o item será exibido no menu lateral sem expansão)

---

## Itens removidos

| Item | Tipo |
|---|---|
| listing | sub (3 níveis de filhos) |
| property | sub (9 filhos) |
| pages | sub + megaMenu (5 colunas) |
| modules | sub (14 filhos) |
| agent | sub (4 filhos) |
| contact | sub (3 filhos) |
