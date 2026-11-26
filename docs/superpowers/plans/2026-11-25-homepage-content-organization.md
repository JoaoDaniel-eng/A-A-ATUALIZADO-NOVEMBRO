# Organização da Página Inicial Implementation Plan

> **For agentic workers:** Use the native implementation approach for this plan.

**Goal:** Manter na página inicial o hero, a promoção de cadastro, a faixa de entrega, o cardápio, as avaliações e o Instagram, movendo login e cadastro para uma página dedicada acessível pelo menu das três barras.

**Architecture:** Preservar o `meu-acai-main` nativo em HTML/CSS/JavaScript. A home continuará concentrando descoberta e compra; uma página dedicada `conta.html` exibirá a área de autenticação e conta, usando os mesmos scripts e APIs existentes para não duplicar lógica de login.

**Tech Stack:** HTML nativo, CSS existente, JavaScript nativo, Express static, APIs atuais.

**Spec:** Requisitos confirmados pela usuária em 2026-11-25.

## Global Constraints

- Manter o `meu-acai-main` como base.
- Não substituir o frontend por React.
- Preservar backend, autenticação, APIs, cardápio, sacola e checkout.
- Página inicial mantém: hero, promoção de cadastro, faixa de entrega, cardápio, avaliações e Instagram.
- Login e cadastro ficam em área/página dedicada aberta pelo menu das três barras.
- Não fazer deploy.

## Review Focus

- A home não deve exibir a seção de conta/login/cadastro nem o Clube da Roça.
- Links de login/cadastro devem levar a `/conta.html` com foco no formulário correspondente.
- A página de conta deve manter formulários e scripts funcionais.
- Sacola e checkout devem continuar acessíveis a partir da home.
- Navegação de retorno para a home deve funcionar em desktop e mobile.

---

### Task 1: Separar a área de conta

**Files:**
- Create: `public/conta.html`
- Modify: `public/css/styles.css` ou novo bloco de estilos da página de conta, se necessário.

- [ ] Criar página dedicada reaproveitando o shell e a marca existentes, exibindo visualmente apenas a área de conta.
- [ ] Manter login, cadastro, recuperação de senha e estado autenticado com os mesmos IDs usados por `account.js`.
- [ ] Incluir navegação clara de retorno ao cardápio.

### Task 2: Ajustar a home e a navegação

**Files:**
- Modify: `public/index.html`
- Modify: `public/js/site/sidemenu.js`
- Modify: `public/js/site/main.js` somente se necessário.

- [ ] Remover visualmente da home o Clube da Roça e a seção de conta.
- [ ] Manter hero, promoção, entrega, cardápio, avaliações e Instagram.
- [ ] Alterar links e ações de login/cadastro para `/conta.html#customer-login-form` e `/conta.html#customer-register-form`.
- [ ] Fazer o menu das três barras navegar para a página dedicada.

### Task 3: Validar regressões e pacote

**Files:**
- Modify: cache versions em `public/index.html` e `public/conta.html`.

- [ ] Validar navegação no preview, responsividade básica, sacola e conta.
- [ ] Rodar `node --check` nos scripts alterados.
- [ ] Rodar `npm test` e confirmar 186 testes aprovados.
- [ ] Regenerar e validar o ZIP final.
