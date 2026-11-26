# TODO — Sacola e finalização em etapas

Pedido de referência: “queria um sistema de delivery melhor, um com sistema de sacola, onde o cliente vai adicionando os produtos e quando terminar de escolher, ele poder ir em finalizar pedido”.

## Sacola para adicionar e revisar produtos

- [x] “um com sistema de sacola, onde o cliente vai adicionando os produtos”: deixar o cliente adicionar produtos à sacola sem enviar imediatamente o pedido e continuar escolhendo outros produtos.
- [x] A sacola deve exibir os itens e os valores calculados pelo fluxo existente e oferecer ações claras para continuar escolhendo ou prosseguir.
- [x] Os atalhos atuais de sacola, inclusive o atalho móvel, devem abrir a revisão da sacola; os itens recuperados do armazenamento local também devem continuar aparecendo.

## Passagem da sacola para finalizar pedido

- [x] “quando terminar de escolher, ele poder ir em finalizar pedido”: oferecer uma ação explícita “Finalizar pedido” na sacola, levando aos campos existentes de entrega/retirada e pagamento.
- [x] Somente a ação de envio existente na etapa de finalização deve registrar o pedido e iniciar o fluxo de WhatsApp; revisar a sacola, voltar ao cardápio ou alterar a navegação não deve enviar pedido.
- [x] Preservar as regras atuais de preço, descontos, frete, estoque, persistência da sacola, validação do checkout e endpoints.

## Evidências de validação

- `npm test`: 186 testes passaram.
- `node --check` em todos os arquivos JavaScript; ESLint e Prettier direcionados ao JavaScript alterado passaram.
- Auditoria estática confirmou IDs únicos, etapas 1–4, ação da sacola separada do envio e versões do PWA sincronizadas.
- O lint e a checagem de formatação globais já reportam problemas preexistentes no projeto; o arquivo indicado pelo ESLint foi confirmado no ZIP original. Não foi feito teste visual em navegador nem teste com banco real.
