# Integração do modelo de cardápio e sacola

## Objetivo
Usar literalmente o modelo React enviado em `acai-da-roca-personalizado.zip` para a página pública do projeto, mantendo as APIs, preços, estoque, checkout e backend existentes.

## Estratégia
- Transplantar `App.tsx`, `CustomerPortal.tsx`, `api.ts`, `main.tsx` e `styles.css` do modelo.
- Adicionar configuração Vite/TypeScript e dependências React necessárias.
- Gerar o frontend compilado em `public/app` e apontar a página pública para ele sem alterar rotas administrativas.
- Copiar somente os assets visuais usados pelo modelo.
- Validar build, sintaxe, testes existentes e chamadas API.

## Restrições
- Não copiar `.env`, credenciais ou banco.
- Não alterar regras de preços, estoque ou criação real de pedidos.
- O envio real continua sendo realizado apenas pelo checkout existente/API `/api/orders`.
