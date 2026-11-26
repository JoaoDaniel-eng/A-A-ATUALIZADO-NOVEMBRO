# Plano técnico — revisão de qualidade (26/11/2026)

## Objetivo
Corrigir incoerências de cor entre os temas claro/escuro no cardápio redesenhado e resolver defeitos reproduzíveis no fluxo de pedido, sem alterar preço, elegibilidade de produto, políticas de entrega ou regras de negócio existentes.

## Front-end
- Consolidar um conjunto pequeno de tokens semânticos para fundo, superfície, texto, texto secundário, borda, seleção e foco do cardápio/sacola/checkout.
- Aplicar os tokens aos cartões de produto, modal, sacola, campos, opções, estados selecionados e textos auxiliares nos temas claro e escuro; manter a identidade roxa e o acento verde.
- Preservar a preferência de tema já existente e garantir foco claramente visível nos controles do cardápio.
- Manter horário agendado em estado explícito ao navegar entre etapas e submetê-lo no pedido.
- Persistir cada alteração de sacola; atualizar a interface após restaurar a sacola salva; invalidar o desconto em tela quando o carrinho mudar para que o cupom seja validado novamente.
- Após pedido bem-sucedido, limpar estado, fechar o modal e liberar a página; impedir duplo envio enquanto uma solicitação está em andamento.

## Back-end e segurança
- Reforçar a autenticação pública de edição/cancelamento de pedido: exige telefone normalizado com 10–15 dígitos e não permite que pedidos rápidos sem telefone usem essas rotas.
- Não alterar consultas de preço ou operação do estoque nesta rodada: a correção estrutural da concorrência do estoque de ingredientes depende de transação/reservas coerentes com o ciclo `new` → `preparing`, e precisa de integração com PostgreSQL para validar atomicidade.

## Critérios de aceite
1. Cartões, áreas de checkout e controles do cardápio continuam legíveis em ambos os temas, incluindo estados selecionado, hover, desabilitado e foco.
2. Selecionar horário, avançar ao pagamento e enviar mantém o horário no payload; voltar à etapa anterior preserva a seleção.
3. Sacola restaurada atualiza contador/atalho; adicionar, alterar quantidade ou remover itens persiste o estado; a sacola vazia continua vazia após recarregar.
4. Um pedido bem-sucedido limpa e fecha o checkout; falha de rede mantém os dados para nova tentativa, e cliques repetidos não duplicam envio simultâneo.
5. Pedido rápido não pode ser editado/cancelado nas rotas públicas sem um telefone válido; as regras de pedido comum permanecem intactas.
6. Suíte de testes, lint e verificações sintáticas são executados novamente; teste visual headless cobre telas desktop/celular e os dois temas quando o ambiente permitir.


## Validação executada em 26/11/2026
- Playwright/Chromium com servidor Express local e respostas simuladas para loja, cardápio, agendamento e criação de pedidos; sem conexão PostgreSQL e sem pedido real.
- Desktop escuro e celular claro: superfícies calculadas conferidas; cores verificadas no DOM e capturas inspecionadas visualmente.
- Jornada coberta: adicionar item, alterar quantidade, confirmar persistência após recarga e contador restaurado, selecionar horário, avançar até o envio, conferir `scheduledFor` no payload simulado e confirmar fechamento/limpeza após sucesso.
- O teste detectou que `theme-polish.css` não estava efetivamente vinculado às páginas; o link foi incluído em `index.html` e `conta.html`. Também expôs listeners legados em elementos ausentes; as ligações de evento foram tornadas opcionais nos módulos de checkout, acompanhamento, favoritos e atualização ao vivo.
- Resultado do teste visual/funcional: 7 verificações aprovadas, incluindo ausência de exceções não tratadas no console. A validação de banco PostgreSQL e a concorrência do estoque de ingredientes continuam pendentes conforme o escopo acima.
