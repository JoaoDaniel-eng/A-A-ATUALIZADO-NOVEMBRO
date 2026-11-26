# Sacola e finalização em etapas — Plano de Implementação

> **Para quem implementar:** execute as etapas abaixo na ordem, preservando a estrutura e os contratos atuais do projeto.

**Objetivo:** permitir que o cliente adicione vários produtos a uma sacola, revise os itens e escolha entre continuar comprando ou seguir para finalizar o pedido.

**Arquitetura:** estender o fluxo público existente, sem reescrever o carrinho ou o checkout. A navegação passa a distinguir a revisão da sacola da etapa atual de entrega e pagamento; o resumo e o formulário já existentes continuam usando o cálculo local, a validação e o endpoint atuais.

**Stack:** HTML, CSS e JavaScript puro no frontend; Node.js/Express permanece inalterado.

**Especificação:** pedido da usuária nesta conversa: “um com sistema de sacola, onde o cliente vai adicionando os produtos e quando terminar de escolher, ele poder ir em finalizar pedido”.

## Restrições globais

- Adicionar produtos à sacola sem enviar o pedido; o cliente decide quando seguir para a finalização.
- Preservar totalização e descontos, taxa de entrega/retirada, estoque, cupons, persistência local, campos e validação do checkout, criação do pedido e abertura do WhatsApp.
- Preservar rotas, APIs, marca, conteúdo, temas, acessibilidade e seletores consumidos por outros scripts; não alterar painel administrativo nem backend.
- Manter o projeto sem novas dependências.

## Pontos de atenção

- Sacola vazia: impedir avanço para finalizar e manter um caminho claro de volta ao cardápio.
- Persistência e recarga: os itens recuperados devem aparecer na etapa de sacola com a contagem e os valores atualizados.
- Categorias de açaí tradicional, trufados e sorvetes: todas devem conseguir abrir a sacola após adicionar itens.
- Remoção de item, desconto, frete e total: continuar sincronizados com as regras atuais; não duplicar IDs nem criar uma segunda fonte de preço.
- Checkout: campos obrigatórios ocultos na etapa de revisão não podem disparar o envio; somente “Fazer pedido” na etapa de finalização envia o formulário.

## Estrutura e responsabilidades do projeto

- `public/index.html`: estrutura da página pública, indicadores das etapas, resumo do pedido e formulário existente.
- `public/js/site/builder-steps.js`: estado e navegação entre seleção, sacola e checkout; atalhos de cabeçalho/barra móvel e caminhos de retorno.
- `public/js/site/core.js`: renderização existente de itens, contagem, descontos e totais; preservar como fonte visual dos valores.
- `public/js/site/checkout.js`: adicionar/remover itens, validar e enviar pedidos; preservar comportamento e contrato do servidor.
- `public/js/site/cart-storage.js`: persistência local existente da sacola; sem mudança no formato salvo.
- `public/css/styles.css` e `public/css/experience.css`: estados responsivos e acabamento visual coerente com o design atual.
- `public/service-worker.js`: versão do cache e lista de ativos, atualizadas para servir os arquivos novos.

## Design

**Leitura do pedido:** fluxo de pedidos online para clientes da loja, com prioridade ao uso no celular; extensão da interface pública existente, não um redesign.

**Direção existente:** editorial gastronômico brasileiro, acolhedor e centrado nos produtos, conforme `brand-spec.md`. Preservar a assinatura roxo-açaí `#2A1034`, roxo `#55266B`, verde-folha `#A7CF55`, fundos creme/papel, tipografias Sora e DM Sans, cartões arredondados e transições discretas.

**Calibração:** variação visual e movimento acompanham a interface atual; densidade suficiente para revisar itens e total sem sobrecarregar; nenhuma imagem nova necessária; fidelidade de marca 10/10.

**Princípios:** (1) deixar explícito em que momento a pessoa está — escolhendo, revisando ou finalizando; (2) manter sacola, quantidade e total fáceis de encontrar; (3) dar ações diretas para voltar ao cardápio ou prosseguir; (4) tornar os controles confortáveis no celular e compreensíveis por teclado/leitor de tela.

**Interação:** após adicionar um produto, continuar no cardápio; o atalho da sacola mostra a quantidade e o total e abre a revisão. A revisão oferece “Continuar escolhendo” e “Finalizar pedido”. A etapa de finalização mostra os dados de entrega/retirada e pagamento já existentes; apenas o botão de envio atual registra o pedido.

## Implementação

### Etapa 1 — Sacola e finalização separadas

**Arquivos:** modificar `public/index.html`, `public/js/site/builder-steps.js`, `public/css/styles.css`, `public/css/experience.css` e `public/service-worker.js`.

- Introduzir uma etapa clara de “Sacola” antes do checkout, separada de “Entrega e pagamento”, com navegação coerente no desktop e no celular.
- Na sacola, reutilizar o resumo atual de itens e valores, oferecer retorno ao cardápio e botão “Finalizar pedido”. Na finalização, reutilizar o formulário existente e manter o resumo visível.
- Fazer os atalhos existentes de contagem/barra móvel abrirem a sacola, não pularem diretamente para os campos de checkout. Após adicionar itens, manter o cliente no cardápio.
- Preservar o comportamento para açaí tradicional, trufados e sorvetes, além de recuperação da sacola salva e estados vazios.
- Atualizar as referências de versão/cache para que a página e o PWA recebam os novos arquivos.

## Execução

Implementar nesta sessão, pois as mudanças são coesas e dependem do estado de navegação já existente. Depois de aprovada a direção, registrar os resultados em `TODO.md` antes de alterar o código, conforme o fluxo do projeto.
