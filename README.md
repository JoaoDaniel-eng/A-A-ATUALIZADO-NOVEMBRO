# Açaí da Roça — versão integrada em desenvolvimento

Este pacote combina o frontend React/Vite aprovado com o backend Express/PostgreSQL e os painéis administrativos do projeto original. Requer Node.js 20+ e PostgreSQL compatível (Neon recomendado).

## Estado desta versão

- A interface React e o cardápio visual foram preservados; os componentes de admin (`/admin`) e desenvolvedor (`/dev`) e as APIs originais foram incorporados.
- O backend tem migrações/seeds, regras server-side para preços, pedidos, horários, cupons, estoque e permissões; essas funções requerem `DATABASE_URL` funcional.
- A loja consulta `/api/menu`, autentica clientes e integra o portal de conta (histórico, favoritos, fidelidade, avaliações, tracking, cancelamento e repetição), valida cupom e envia pedidos via `POST /api/orders`. O backend recalcula valores e regras; o fluxo operacional exige `DATABASE_URL` válido. A integração de compra, admin/dev e persistência não foi validada ponta a ponta nesta entrega por falta de banco isolado.
- Nenhuma credencial ou banco Neon foi incluído. `npm ci`, `npm test` (186 testes), `npm run build` e smoke test de `npm start`/`GET /api/health` foram executados. Testes de integração com PostgreSQL não foram executados por falta de banco de teste isolado; nenhum banco de produção foi usado.
- Pagamento online não é suportado pelo backend original. Pedidos usam o método escolhido e podem gerar conteúdo Pix se uma chave estiver configurada; a confirmação ocorre fora da plataforma.

## Executar

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DEV_EMAIL`, `DEV_PASSWORD` e `WHATSAPP_NUMBER`. Não compartilhe nem envie `.env` ao GitHub.
2. Instale dependências com `npm install`.
3. Rode `npm start` para iniciar a aplicação em `http://localhost:3000` (o comando compila o frontend antes de iniciar o Express). Em desenvolvimento, use `npm run dev`.
4. Acesse `/admin` e `/dev`. As contas são provisionadas na inicialização do banco a partir das variáveis de ambiente; configure senhas fortes e únicas.
5. `npm test` executa testes unitários. Testes de rotas com banco exigem um banco isolado de testes; nunca aponte testes destrutivos ao Neon de produção.

O schema é inicializado pelo servidor quando `DATABASE_URL` existe. Antes de publicar, confirme os preços, horários, bairros, taxas, WhatsApp e políticas comerciais no painel. As zonas e alguns padrões iniciais do seed original podem ser exemplos que exigem revisão.

## Neon e Render

O `.env.example` lista as variáveis esperadas. Para Neon, use a connection string PostgreSQL com SSL. No Render, configure `DATABASE_URL`, `JWT_SECRET`, e as credenciais de administrador/desenvolvedor como variáveis secretas; o `render.yaml` oferece uma configuração inicial. O Dockerfile instala dependências, compila o frontend e inicia o Express. Health check: `/api/health`; verificação de banco: `/api/health/db`.

O backup JSON do painel `/dev` é manual e não substitui os backups do provedor PostgreSQL. A exportação/restauração foi ajustada para incluir tabelas operacionais disponíveis e evitar substituição incompleta do inventário; restauração completa não foi testada contra banco isolado nesta entrega.

## Arquitetura

- `src/` — React/TypeScript na raiz da interface; Express em `app.js`/`server.js`; `db/`, `routes/`, `middleware/`, `services/` e `tools/` do backend original.
- `public/admin.html`, `public/dev.html` e `public/rapido.html` — interfaces originais administrativas e pedido rápido.
- `public/` — recursos estáticos/PWA originais, mais o manifesto de rotas.
- `Dockerfile`, `render.yaml`, `.env.example` — configuração inicial de deploy/ambiente.

Consulte os módulos e documentação do backend antes de operar estoque, caixa, cancelamentos, backup ou dados pessoais.
