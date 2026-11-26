# Diagnóstico de carregamento — Açaí da Roça

**Data:** 26/11/2026  
**Escopo:** catálogo, fotos, front-end, hospedagem e PostgreSQL.

## O que foi confirmado no código

A inicialização de `public/js/site/model-order-ui.js` aguardava, com `Promise.all`, três respostas antes de desenhar qualquer cartão: `/api/store`, `/api/menu` e `/api/schedule-slots`. Portanto, mesmo quando os produtos já tinham chegado, um atraso apenas nos dados da loja ou nos horários mantinha o catálogo vazio. O endpoint de horários não é necessário para exibir produtos.

A tela agora renderiza o catálogo assim que `/api/menu` responde. Loja e horários continuam sendo buscados em paralelo; quando os horários chegam, o seletor é atualizado sem reconstruir o formulário aberto. Enquanto o cardápio carrega, há uma mensagem de estado visível.

O hero principal pesava 155,4 KiB e a imagem de fallback dos produtos trufados pesava 257,0 KiB. Foram criadas versões WebP menores, preservando os arquivos originais: `acai-hero-flutuando-720.webp` (50,3 KiB) e `ninho-trufado-chocolate-640.webp` (67,9 KiB). Em conjunto, essas duas imagens caíram de 412,4 KiB para 118,2 KiB, redução de aproximadamente 71%. As imagens dos cartões também passaram a usar decodificação assíncrona. O Service Worker foi atualizado para a nova versão do cache e para pré-carregar o hero otimizado.

## Medição sintética antes/depois

Teste Chromium no preview local com API simulada; cada variante foi executada em cinco contextos limpos. As respostas foram deliberadamente atrasadas em 50 ms para `/api/menu`, 1 s para `/api/store` e 1,5 s para `/api/schedule-slots`. A métrica foi o tempo até o primeiro cartão do catálogo ficar visível.

| Variante | Cinco tempos | Mediana |
|---|---:|---:|
| Inicialização anterior, aguardando as três respostas | 2,135; 1,956; 2,002; 1,993; 1,976 s | 1,993 s |
| Inicialização progressiva, sem bloquear o catálogo | 0,308; 0,289; 0,296; 0,287; 0,281 s | 0,289 s |

Neste cenário controlado, a mediana caiu 1,704 s (aproximadamente 85,5%). **Esses números são de teste sintético com APIs simuladas; não representam o tempo do site publicado nem do banco real.**

## O que ainda não pode ser atribuído a Render ou Neon

O código de `/api/menu` executa cinco consultas PostgreSQL em paralelo. O projeto também registra que o Neon pode suspender o banco após inatividade, o que torna plausível uma demora na primeira consulta; isso, porém, não prova que o banco seja a causa do atraso observado pelo cliente. O trabalho não alterou SQL, índices, pool ou configuração da hospedagem: sem tempos reais e plano de execução, essas alterações seriam especulativas.

Não foi fornecido o domínio publicado. Por isso não foram medidos TTFB do HTML, duração real de `/api/menu`, `/api/store` e `/api/schedule-slots`, transferência das imagens em produção, latência de Render/Neon nem diferenças entre primeira visita e visitas seguintes. Também não se pode concluir se a lentidão restante ocorre no navegador, na hospedagem, na conexão com PostgreSQL ou na própria execução das consultas.

## Próxima medição necessária

Para fechar o diagnóstico de produção, é necessário o endereço público do site. Com ele, medir numa mesma sessão e em condições registradas: (1) TTFB do documento; (2) tempo de cada endpoint público; (3) transferência/decodificação das imagens e cache; e (4) primeira visita após inatividade versus visitas seguintes. Se o documento demora antes da aplicação responder, investigar Render; se os endpoints demoram, correlacionar logs do servidor e tempos de conexão/consulta do Neon; se APIs respondem rápido e as imagens não, investigar rede, tamanho e cache. Qualquer ajuste PostgreSQL deve ser sustentado pelos tempos reais e pelo plano de execução das consultas.

## Verificações executadas

- `npm test`: 186 testes aprovados, nenhum falhou.
- `npm run lint`: concluído sem erros.
- `node --check` nos arquivos JavaScript alterados: passou.
- Playwright no preview demonstrativo: catálogo, montagem, sacola, avanço do checkout e chegada tardia dos horários verificados; o seletor passou de 1 para 3 opções sem perder o formulário.
- Service Worker ativo e novo cache observado no preview.
- `npm run format:check` não é uma verificação verde do repositório atual: encontra um caminho `tests/**/*.js` inexistente no `package.json` e relata dezenas de outros arquivos já fora do padrão Prettier. Isso não foi usado como justificativa para reformatar arquivos não relacionados.

O preview usa dados simulados: não conecta ao PostgreSQL real e não grava pedidos.