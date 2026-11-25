# Plano — Açaí da Roça: montador e carrinho

## Escopo proposto para esta entrega

Criar a experiência de compra da loja voltada ao fluxo pedido: explorar categorias, personalizar cada produto, adicionar vários itens ao pedido, revisar/editar o carrinho e só então avançar por etapas de identificação, entrega e pagamento. O projeto original em ZIP mencionado no anexo não foi recebido. Portanto, esta entrega não pode reconstruir ou validar regras existentes, nem alegar que inclui o sistema completo descrito no anexo (backend Node/Express, Neon, autenticação, painéis, estoque real, notificações, pagamentos ou publicação no Render). O catálogo e preços de exemplo serão identificados como conteúdo demonstrativo; o armazenamento local servirá apenas para preservar o carrinho neste navegador, não como banco de dados.

## Abordagem

- Site responsivo mobile-first em React + TypeScript + Vite, executado no runtime gerenciado do WebDev.
- Catálogo demonstrativo dividido em Açaí para montar, Trufados e Sorvetes, com tamanhos, preços-base, opções gratuitas, caldas e adicionais pagos selecionáveis. O preço do produto muda imediatamente conforme tamanho, adicionais e quantidade.
- Montador em etapas/cards, com limites visíveis para acompanhamentos gratuitos, opções selecionadas destacadas, observações e validação antes de adicionar.
- Carrinho fixo no rodapé, com respeito ao `safe-area-inset-bottom` e espaço extra no conteúdo rolável; sempre permite continuar explorando o cardápio.
- Botão de adicionar apenas insere a configuração no carrinho, mostra confirmação e limpa o montador sem iniciar checkout.
- Painel de carrinho com itens personalizados, alteração de quantidade, edição que reabre o montador, remoção, subtotal, campo de cupom com regras demonstrativas, taxa de entrega demonstrativa e total.
- Avanço posterior por interface de checkout em etapas (identificação, entrega/retirada, horário e pagamento), sem capturar dados financeiros reais nem registrar pedidos em servidor nesta etapa.
- Persistência de itens, quantidades e cupom no `localStorage`, por ser preferência/dado temporário do carrinho e permitir sobreviver a atualização da página. Não serão armazenadas informações sensíveis.
- Estados vazios, feedback visual, acessibilidade de teclado/labels, áreas de toque confortáveis e respeito a `prefers-reduced-motion`.
- Os dados demonstrativos serão isolados em módulos próprios para facilitar integração posterior com catálogo e APIs reais.

## Estrutura principal prevista

- `src/main.tsx` — inicialização React.
- `src/App.tsx` — composição da loja, navegação por categoria, montador, carrinho e etapas de checkout.
- `src/data/catalog.ts` — produtos e opções demonstrativas tipadas.
- `src/components/` — cabeçalho, navegação de categorias, cards de produto, montador, barra sticky e painel/modal do carrinho.
- `src/hooks/` — estado do pedido, cálculo de preços e persistência do carrinho.
- `src/styles/` — tokens de marca, layout responsivo e estilos de componentes.
- `public/manus-routes.json` — manifesto de rotas do site.

## Direção visual

Três direções candidatas (probabilidades baixas, alternativas de exploração): “Botânica tropical editorial” (0,04), “Balcão urbano noturno” (0,03), “Mercado artesanal solar” (0,02). Escolhida: **Botânica tropical editorial**.

- **Movimento de design:** editorial gastronômico tropical, com composição assimétrica inspirada em rótulos artesanais contemporâneos, sem aparência de template.
- **Princípios:** produto em primeiro plano; decisões e preços sempre explícitos; hierarquia visual quente e arejada; interações rápidas e reversíveis.
- **Filosofia de cores:** creme de polpa como superfície acolhedora, roxo-açaí profundo como assinatura e verde folha como cor de ação positiva; tons suaves de lavanda apoiam seleções sem competir com fotos.
- **Paradigma de layout:** faixa editorial assimétrica de destaque e navegação por categorias em trilho horizontal; conteúdo de compra em coluna no celular e composição lateralizada em telas amplas; carrinho persistente junto à borda inferior.
- **Elementos de assinatura:** selo circular inspirado em fruta/colheita; pequenas linhas orgânicas de folha como acento; etiquetas “grátis” e “+R$” sempre contrastantes.
- **Filosofia de interação:** seleção com estado visual inequívoco; preço acompanha cada escolha; adicionar não interrompe a compra; carrinho é sempre acessível e editável.
- **Animação:** transições curtas de 160–220 ms para seleção e painéis, sem deslocamentos chamativos; respeitar movimento reduzido.
- **Tipografia:** sans-serif contemporânea e legível com título expressivo de personalidade editorial; tamanhos e pesos com contraste claro entre títulos, preço, instruções e metadados.
- **Essência da marca:** “Açaí feito do seu jeito, sem interromper a vontade de escolher” — acolhedora, caprichosa, direta.
- **Voz da marca:** convidativa e objetiva. Exemplos: “Seu copo, suas combinações.” e “Pode continuar escolhendo — seu pedido fica guardado.”
- **Wordmark/conceito de logo:** nome “Açaí da Roça” acompanhado de um selo-fruta simples desenhado com formas de caroço e folha, aplicado como assinatura visual.
- **Cor de assinatura:** roxo profundo de açaí.

## Construção e entrega

1. Após aprovação deste escopo, registrar outcomes em `TODO.md`, configurar diagnósticos e criar a interface e lógica do carrinho.
2. Se necessário, produzir uma imagem hero personalizada e aplicar ativos apenas em locais definidos.
3. Registrar o manifesto de rotas antes de iniciar o servidor, declarar o comando de desenvolvimento pelo runtime WebDev e verificar que a prévia responde.
4. Executar verificações disponíveis (diagnósticos e build) e corrigir falhas encontradas.
5. Salvar o resultado no fluxo de checkpoint exigido pelo projeto. Publicação não será presumida.

## Decisão pendente

Aprovar este primeiro escopo focado na experiência da loja/carrinho, ou enviar o ZIP original e indicar que a prioridade é reconstruir a plataforma integrada completa descrita no anexo. Sem o ZIP, não há base para preservar comportamento original; sem backend configurado e integrações, a interface de checkout não confirmará pedidos nem processará pagamentos reais.
