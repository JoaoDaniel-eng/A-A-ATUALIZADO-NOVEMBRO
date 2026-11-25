# Entregas aprovadas

## [x] 1. Montagem e navegação do cardápio
- Oferecer categorias demonstrativas para Açaí para montar, Trufados e Sorvetes.
- Organizar a montagem em cards separados: tamanho; acompanhamentos gratuitos; caldas gratuitas; adicionais pagos; quantidade; botão adicionar ao pedido.
- Utilizar seletores visuais modernos, com indicação clara das opções selecionadas.
- Mostrar claramente quais opções são gratuitas e quais possuem cobrança adicional.
- Respeitar o limite demonstrativo de acompanhamentos gratuitos e atualizar os preços automaticamente conforme as escolhas.
- Permitir continuar navegando pelo cardápio depois de adicionar cada produto.

## [x] 2. Adição ao pedido e carrinho persistente
- O botão “Adicionar ao pedido” adiciona o produto personalizado ao carrinho e não encaminha diretamente ao checkout.
- Após adicionar, exibir confirmação visual, atualizar quantidade de itens e valor total, limpar o montador para nova seleção quando apropriado e permitir continuar navegando pelo cardápio.
- Implementar uma barra fixa na parte inferior durante a navegação pelo cardápio, exibindo ícone de carrinho, quantidade total, valor acumulado e botão “Finalizar pedido”.
- Adaptar a barra para dispositivos móveis, respeitar áreas seguras e não cobrir conteúdo ou botões do cardápio.
- Preservar o carrinho ao atualizar a página, usando armazenamento local somente para este dado temporário e não sensível.

## [x] 3. Revisão do pedido
- Ao clicar em “Finalizar pedido”, abrir painel de carrinho com todos os produtos adicionados.
- Permitir editar personalizações, alterar quantidades, remover produtos e adicionar mais produtos.
- Exibir subtotal, aplicar cupom demonstrativo, visualizar descontos, taxa de entrega demonstrativa e total.
- Só depois da revisão permitir avançar para as etapas demonstrativas de identificação, entrega/retirada, agendamento e pagamento.
- Não alegar registro de pedido em servidor nem processamento de pagamento real.

## [x] 4. Interface e acessibilidade
- Implementar experiência mobile-first com identidade Açaí da Roça em roxo-açaí, creme e verde.
- Usar estados e mensagens de feedback claros, controles acessíveis por teclado, rótulos de formulário, áreas de toque confortáveis e respeito à preferência por movimento reduzido.
- Identificar catálogo, preços, cupons e taxas como dados demonstrativos, pois não foi fornecido o ZIP nem uma fonte de dados real.


## Atualização do cardápio conforme `pasted_content_2.txt`
- Açaí tradicional: 300 ml R$ 12, 400 ml R$ 16, 500 ml R$ 19, 700 ml R$ 23, pote de 1 litro R$ 38 e copo especial R$ 35.
- Acompanhamentos grátis: Paçoca, Granola, Amendoim, Granulado, Flocos de arroz, Chocobool, Sucrilhos, Leite em pó, Aveia e Jujuba; limite cinco por açaí.
- Caldas grátis, uma por açaí: Morango, Chocolate, Menta, Uva, Banana caramelizada e Maracujá.
- Adicionais pagos exatos: Nutella R$ 6, Creme de paçoca R$ 6, Creme de avelã R$ 5, Creme de beijinho R$ 6, Ovomaltine R$ 5, Doce de leite R$ 4; mousses de maracujá, morango e limão R$ 5 cada.
- Trufados prontos sem personalização: Morango com Chocolate, Ninho com Chocolate, Ninho com Morango, Ninho com Maracujá e Ninho com Paçoca; 400 ml R$ 20 e 500 ml R$ 25.
- Sorvetes independentes: Pistache, Flocos e Ninho Trufado; usam tamanhos/preços do açaí tradicional.
- O painel administrativo e a validação de preços no servidor permanecem fora do escopo demonstrativo aprovado; dados atualmente ficam no catálogo front-end.
