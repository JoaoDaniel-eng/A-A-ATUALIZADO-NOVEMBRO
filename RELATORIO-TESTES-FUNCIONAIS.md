# Auditoria funcional e técnica — Açaí da Roça

**Data de referência:** 27/11/2026  
**Escopo:** consolidação dos resultados estruturados da auditoria, conferência manual dos achados prioritários e repetição de `npm test`/`npm run lint`. O checkout foi exercitado em navegador local com APIs simuladas; não houve chamada ao banco nem gravação de pedido.

> **Aviso operacional — nada deve ser implantado.** Este relatório registra defeitos confirmados e riscos que precisam de triagem e correção. Não representa aprovação para deploy, publicação ou alteração de dados. Nenhum banco foi acessado ou alterado nesta auditoria; os testes descritos foram os já informados nos resultados de origem.

## Resumo executivo

A evidência disponível combina inspeção de código e testes unitários locais/offline. Diversas funções puras tiveram testes aprovados, mas as rotas dependentes de banco, o fluxo visual no navegador e a execução integrada não foram validados. Portanto, “verificado” nas áreas abaixo significa cobertura estática e/ou unitária delimitada, não validação ponta a ponta nem homologação de produção.

Foram registrados defeitos confirmados em recuperação/autenticação de clientes, transições administrativas de status, atualização parcial de configurações, restauração de backup, lembretes push, apresentação de preço de combo e limites/edição do carrinho, além da mensagem incompatível com os formatos aceitos para fotos de avaliação. Também há riscos que dependem de configuração operacional, concorrência ou execução integrada.

**Conclusão:** não implantar. Primeiro, corrigir e priorizar os defeitos de segurança e integridade de dados; depois, repetir os testes em ambiente de integração isolado, com banco descartável e dados sintéticos, e validar os fluxos em navegador com APIs interceptadas.

## Escala de cobertura

- **Verificado (limitado):** houve inspeção de código e/ou testes unitários, sem implicar execução integrada.
- **Parcial:** parte da lógica foi inspecionada ou testada, mas os fluxos principais permanecem sem execução integrada.
- **Não verificado:** não há evidência de execução funcional suficiente para declarar validação; aplicável especialmente a navegador, HTTP real, dados/configuração implantados e integração com banco.
- **Bloqueado:** a validação foi deliberadamente suspensa por depender de banco, escrita, serviço externo ou ambiente seguro não disponibilizado.

## Tabela de áreas e status

| Área | Status da evidência | Teste executado | Inspeção de código | Não verificado / bloqueio |
|---|---|---|---|---|
| Catálogo público — `/api/menu`, cards, filtros, fotos e valores básicos | Verificado (limitado) | Estoque/disponibilidade: 33 testes aprovados | Rota, mapeamento de preço, filtros, fotos e carregamento no cliente | Rota HTTP real, navegador, consistência com catálogo real e renderização visual bloqueados/não verificados |
| Montador — tamanhos, estoque, opções, quantidades e preços | Parcial | Preços: 27 testes aprovados | Revalidação de itens/preços e estoque no servidor; dois montadores no cliente | HTTP, banco, navegador, carrinho e estoque real não testados |
| Carrinho — operações, persistência, totais e limites | Verificado (limitado) | Precificação/promoções: 31 testes aprovados | `localStorage`, recuperação, expiração, remoção, cálculos e limites do servidor | Persistência real em navegador, API e estoque integrado não testados |
| Criação de pedido — identificação, entrega/retirada, agendamento e pagamento | Parcial | Playwright local com APIs simuladas confirmou que nome e WhatsApp chegam à requisição interceptada | Validações de cliente/servidor e submissão/resposta inspecionadas | POST real, persistência, resposta do servidor, banco e pagamento não testados |
| Clientes — autenticação, perfil, recuperação, favoritos e cupons pessoais | Parcial | Cupom de boas-vindas: 23 testes aprovados com banco falso | JWT, redefinição/troca de senha, perfil, histórico, favoritos e cupom | Cadastro/login/OTP/SMS, rotas integradas e isolamento real não testados |
| Pedidos — acompanhamento, histórico, edição/cancelamento e status | Verificado (limitado) | Helpers: 46 testes aprovados | Rotas e transações, inclusive mudanças administrativas de status | Rotas, concorrência, rollback e autorização integrados não testados |
| Login/admin — autorização, tokens, CSRF/XSS, brute force e CSP | Verificado (limitado) | CSP/limite: 9 testes aprovados | Middleware, JWT, CSP, armazenamento de token e limitador | HTTP, navegador, XSS dinâmico e configuração real de proxy/escala não testados |
| Administração — cardápio, preços, adicionais, zonas e configurações | Verificado (limitado) | Preços: 27 testes aprovados | CRUD e persistência das rotas administrativas | CRUD real em banco isolado não testado |
| Receitas/insumos e gestão de estoque | Verificado (limitado) | Inventário/estoque unitário: 33 testes aprovados | Verificações, reservas, baixas, edição e cancelamento | SQL, transações, concorrência e rotas integradas não testadas |
| Preços, combos, cupons e fidelidade | Verificado (limitado) | Preço/promoções/cupom: 54 testes aprovados | Cálculo, aplicação de cupom e pontuação | Configuração real, índices/constraints e concorrência no banco não verificados |
| Funcionamento da loja, horários, slots, pedido rápido e QR | Verificado (limitado) | Agenda/loja/QR: 19 testes aprovados | Horários, slots, sinalizadores e envio de pedido rápido | Navegador, status real da loja e pedido QR end-to-end não testados |
| Avaliações e fotos | Verificado (limitado) | Reviews/storage: 11 testes aprovados com mocks | Validação, aprovação, rate limit e storage | Envio real, banco, storage, navegador e implantação não testados |
| Caixa, totais, relatórios e filtros | Verificado (limitado) | Caixa: 4 testes aprovados | Funções de cálculo e consultas da rota | Consultas/filtros reais e consistência de relatório não testados |
| Backup/restore, contas developer, logs e operações destrutivas | Parcial | Contas developer: 4 testes aprovados | Formato de backup/restore, proteção e auditoria | Restore e rotas não executados; banco e retenção de produção não verificados |
| Push, inscrições, VAPID e agendamento | Verificado (limitado) | Push/agendamento/chaves: 24 testes aprovados com mocks | Validação, lotes, agendamento e falhas | Dispositivos, chaves implantadas, rede, concorrência e retry real não testados |
| Service worker, PWA, QR e página rápida | Verificado (limitado) | QR: 3 testes aprovados; verificação estática de 42 URLs | Cache, versão, manifesto, registro e rotas | Instalação, atualização, offline e respostas HTTP em navegador/deploy não testadas |

## Evidências e limites

### Testes executados conforme resultados fornecidos

Os resultados informam os seguintes comandos e aprovações: `unitStock.test.js` e `inventory.test.js` (33); `pricing.test.js` (27); `pricing.test.js` e `promotions.test.js` (31); `welcomeCoupon.test.js` (23); helpers de inventário, código de pedido, rate limit, estoque unitário e busca (46); CSP e rate limit (9); `pricing`, `promotions` e `welcomeCoupon` (54); `schedule`, `store` e QR (19); `reviews` e `photoStorage` (11); caixa (4); contas developer (4); push, agendamento e geração de VAPID (24); QR (3).

Esses números pertencem a execuções de escopos distintos e podem se sobrepor; não devem ser somados como contagem de testes únicos. Os resultados descrevem testes unitários/offline ou com fakes/mocks. Não demonstram que as rotas HTTP, o navegador, o banco real ou serviços externos funcionem de ponta a ponta.

### Inspeção estática

Foram inspecionados trechos dos arquivos de rotas, serviços, middleware e cliente mencionados nas evidências originais. Essa inspeção identifica comportamentos no código, mas não substitui execução de integração. Em particular, configurações implantadas, dados efetivos do catálogo, permissões reais, comportamento concorrente e respostas de serviços externos não foram verificados.

### Não verificado e bloqueios transversais

- Houve teste Playwright do checkout local com APIs simuladas: nome e telefone foram enviados à requisição interceptada, sem gravação em servidor ou banco. Não houve validação visual abrangente nem submissão real de pedido.
- Não foram chamadas rotas HTTP que consultem ou gravem no banco; não foi conectada instância de banco e nenhum dado real foi acessado ou alterado.
- Não foram testadas configurações reais de produção/staging, proxy/TLS, múltiplas instâncias ou armazenamento compartilhado de limitadores.
- Fluxos de upload/envio push não foram executados contra serviços externos; os testes informados usam mocks/fakes.
- Os resultados registram ausência de `.git` na raiz examinada, impedindo confirmação de estado Git por `git status`.

## Riscos e defeitos confirmados

### Segurança e integridade — prioridade alta

1. **Redefinição de senha sem prova de posse.** `src/routes/customers.js:85-105` permite redefinir senha com telefone, sem sessão, senha atual, OTP ou outra prova. Além disso, a resposta 404 para telefone inexistente pode permitir enumeração de contas. É um defeito confirmado por inspeção; não houve teste dinâmico.
2. **Tokens de cliente não invalidados após troca/reset de senha.** Os trechos indicados atualizam o hash, enquanto os JWTs podem continuar válidos por até 30 dias. Um token comprometido pode sobreviver à troca de senha. O logout remove o token apenas do armazenamento local; não revoga cópias existentes.
3. **Transições administrativas de pedido sem grafo de estados.** `src/routes/admin.js:364-390, 411-478` valida o nome do status, mas não as transições de origem-destino. Foi identificado o caminho de pedido entregue para cancelado, que pode devolver insumos ao estoque e liberar cupom indevidamente; também são aceitos saltos como novo para entregue. Não foi reproduzido em banco.
4. **Restore pode apagar inventário quando o backup é incompleto.** `src/services/backup.js:60-61, 73-76, 89-92` remove tabelas de inventário e permite arrays ausentes virarem vazios, embora a validação de completude não exija esses grupos. Um backup legado/incompleto aceito pode causar perda de inventário. Restore não foi executado.

### Funcionalidade, operação e consistência

5. **Desconto de combo não refletido em um montador.** `public/js/site/model-order-ui.js:58,65` calcula/exibe subtotal sem o desconto, enquanto validação/servidor o aplicam (`src/routes/public.js:83-88`; `src/services/pricing.js:165-166,193`). Em pedidos elegíveis, o cliente pode ver preço maior que o total recalculado pelo servidor.
6. **Carrinho sem edição de quantidade na sacola.** A interface apresenta remoção, mas não controle de quantidade; para alterar é preciso remover e adicionar novamente.
7. **Carrinho pode exceder o limite de linhas aceito pela API.** O cliente adiciona linhas sem aplicar o teto de 30 linhas imposto em `src/routes/orders.js:61-65`; o usuário pode montar um carrinho que será recusado ao enviar.
8. **Configurações podem ser gravadas parcialmente apesar de erro.** `src/routes/admin.js:808-852` persiste cada campo validado sem transação; um campo válido seguido de um inválido pode deixar alteração parcial. Defeito inferido diretamente do fluxo estático; rota não executada.
9. **Falha de envio push não é retentada no mesmo dia.** `runDailyPush` marca a data antes da entrega, e falhas individuais são capturadas sem relançar; timeout/erro transitório pode suprimir o lembrete diário.
10. **Mensagem de formato de imagem contradiz a validação.** `src/services/reviews.js:12-14` promete JPG, PNG ou WebP, mas valida apenas JPEG; PNG/WebP são rejeitados.

## Riscos adicionais que exigem validação

- **Estoque de ingredientes sem reserva ao criar pedido:** pedidos pendentes concorrentes podem consumir coletivamente mais que o saldo antes de iniciar preparo; a baixa ocorre na transição para preparo. Não reproduzido em integração.
- **Admin/developer:** tokens em `localStorage` ficam acessíveis a JavaScript da origem; CSP reduz superfície, mas não elimina risco de XSS. O rate limiter em memória perde estado em reinicialização e não agrega entre instâncias. A configuração real de `trust proxy` não foi validada.
- **Avaliações/storage:** falha de insert após upload ou falha ao apagar mídia pode deixar arquivos órfãos; download pode alocar resposta acima do limite antes da rejeição se cabeçalho/tamanho declarado não for confiável. Limite de envios em memória não é global entre instâncias.
- **Backup/auditoria:** tentativas rejeitadas não são registradas pela tabela de auditoria descrita; gravação assíncrona pode falhar. Backups contêm dados pessoais e hashes de senha, exigindo custódia protegida.
- **Pedido rápido:** a rota parece não aplicar fechamento manual/horário, apenas `quick_orders_enabled`; não está confirmado se é defeito ou regra operacional intencional.
- **PWA:** `/rapido` e recursos não estão no app shell e dependem de rede; pode ser intencional. Uma falha em qualquer recurso pré-cacheado pode impedir a instalação do novo service worker; comportamento real não testado.
- **Catálogo:** dois caminhos de renderização podem resolver fotos de forma diferente; não foi confirmado se ambos estão ativos na mesma página.
- **Cupom welcome:** proteção contra requisições concorrentes e normalização de telefones depende de constraints/estado real do banco, não verificados.

## Próximo passo recomendado

1. **Manter bloqueio de implantação.** Não publicar, implantar nem executar restore até triagem e correção dos defeitos confirmados, especialmente recuperação de senha, invalidação de sessão, transições de status e integridade de backup.
2. **Preparar ambiente de integração explicitamente isolado**, com banco descartável, schema/migrações reproduzidos e fixtures sintéticas. Confirmar por configuração que nenhuma conexão alcança banco ou serviços de produção; não usar dados reais.
3. **Adicionar/regredir testes para cada defeito confirmado**, incluindo testes de rota com rollback/fixtures e casos negativos, sem operações no ambiente real.
4. **Executar testes de navegador com APIs interceptadas** para catálogo, montador, carrinho, checkout, login/recuperação, painel, avaliações e PWA; conferir consistência visual e de preço.
5. **Validar condições operacionais em staging isolado** (proxy, múltiplas instâncias, limitadores, push, storage e restore de backup sintético), com autorização explícita e critérios de abortagem.
6. **Reauditar e produzir nova evidência** após as correções. Só então considerar uma decisão separada de implantação; este relatório não a autoriza.
