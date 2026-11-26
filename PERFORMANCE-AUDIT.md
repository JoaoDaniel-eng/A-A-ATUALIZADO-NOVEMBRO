# Auditoria de desempenho — Açaí da Roça

**Data:** 26/11/2026  
**Site observado:** <https://a-a-atualizado-novembro.onrender.com/>

## Diagnóstico observado antes da publicação das correções

- Uma primeira abertura da página levou aproximadamente **7,4 s**. Em medições posteriores, o TTFB variou entre **1,4 e 2,1 s**.
- O endpoint `GET /api/menu` variou entre aproximadamente **1,4 e 3,3 s**; os produtos apareceram entre **6 e 10 s** em algumas tentativas.
- A variação é compatível com atraso de inicialização do serviço e/ou reativação/conexão ao banco, mas não é possível atribuir a causa com certeza sem métricas internas do Render e do Neon.
- A resposta pública do menu continha 8 produtos; todos estavam sem `image_url`. Vários produtos também vinham classificados como `traditional`, e esse fallback era aplicado antes do nome do produto, repetindo a foto tradicional.

## Alterações locais

1. Incluído preload prioritário de `/api/menu` no HTML para iniciar a busca antes da execução dos scripts do cardápio.
2. Aplicado cache de um ano, `immutable`, apenas a CSS/JS cuja query `v` corresponde ao `BUILD_ID` atual. Links com versão fixa ou sem versão ficam com `max-age=0`; HTML, APIs, imagens e service worker não recebem cache imutável.
3. Corrigida a precedência da seleção de fotos: o nome do produto é avaliado antes do fallback por categoria, inclusive para os nomes presentes na resposta pública observada.

## Verificações

- `npm test`: **186 testes aprovados, 0 falhas**.
- `npm run lint`: concluído sem erros.
- Em servidor local: CSS/JS com `v=<BUILD_ID>` retornaram `max-age=31536000, immutable`; CSS/JS sem essa versão, imagens e HTML secundário permaneceram em `max-age=0` ou `no-cache`.
- Reprodução controlada com os dados públicos: foram renderizados 8 cards com **8 URLs de imagem distintas**. Os oito arquivos de imagem correspondentes responderam HTTP 200 no site publicado.
- Em um único par de execuções no navegador, o preload iniciou `/api/menu` cerca de 12 ms após a navegação, contra cerca de 3,6 s sem preload; cada execução fez uma única requisição ao endpoint. O tempo total até os cards foi 4,2 s com preload e 5,4 s sem preload nessa amostra. Como é apenas um par e a rede varia, o tempo total não deve ser tratado como ganho garantido.
- `npm run format:check` não passou no estado existente do projeto: a configuração aponta para `tests/**/*.js`, que não existe, e reporta divergências de formatação em muitos arquivos. Nenhuma formatação em massa foi aplicada.

## Segurança dos dados e publicação

Nenhuma gravação ou alteração foi feita no banco Neon. Pedidos, clientes, estoque e configurações permaneceram intocados. Não houve commit, push nem deploy. As alterações estão apenas no projeto local; o site publicado continuará com a versão atual até que o projeto seja publicado pelo usuário.

A otimização do frontend pode antecipar o início do carregamento, mas não elimina inicialização fria do serviço nem latência do banco. Depois da publicação, compare novamente TTFB, `/api/menu` e tempo até os cards sob condições equivalentes.
