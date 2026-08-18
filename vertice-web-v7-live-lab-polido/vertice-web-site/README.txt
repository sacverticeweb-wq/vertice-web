VÉRTICE WEB — V7 / LIVE LAB + PORTFÓLIO POLIDO
================================================

Versão revisada a partir do projeto atualizado enviado nesta rodada.
A home mantém a identidade Vértice, os Live Viewers do portfólio e agora usa o Vértice Lab como uma segunda janela real para os próprios projetos internos.

ESTRUTURA PRINCIPAL
- index.html
- styles.css
- script.js
- assets/
  - previews/            posters WebP usados como fallback dos Live Viewers
  - logo-icon.webp
- projetos/
  - brasa91/             hamburgueria artesanal
  - cobalto/             barbearia urbana
  - ambar-rua/           moda editorial
  - pingo-pet/           pet shop / banho e tosa
  - torque12/            oficina automotiva
  - shared/              utilidades neutras entre demos

V7 — PRINCIPAIS MUDANÇAS
- Nuvé removido do portfólio, do Vértice Lab, dos posters e da estrutura de projetos.
- Portfólio reorganizado para cinco projetos demonstrativos.
- Vértice Lab deixou de usar um mockup fictício e agora carrega os cinco sites internos de verdade.
- Lab com troca por segmento: Moda, Hamburgueria, Barbearia, Pet shop e Automotivo.
- Lab com alternância Desktop/Mobile e poster WebP durante o carregamento.
- Iframe do Lab só é ativado quando a seção se aproxima da viewport.
- Textos e CTAs receberam contenção de medida, quebra segura e ajustes específicos para telas estreitas.
- Cobalto ganhou processo vertical guiado por scroll: a etapa mais próxima do centro fica nítida e as demais recebem blur/atenuação controlados.
- Blur do processo Cobalto reduzido em mobile para manter leitura e fluidez.
- WhatsApp/Instagram receberam ícones contextuais nas áreas em que fazem parte da ação ou da linguagem da página.
- Imagens remotas das demos tiveram parâmetros de qualidade/dimensão reduzidos para diminuir custo de transferência sem descaracterizar a apresentação.
- Aproximadamente 49 MB de vídeos/frames experimentais não utilizados do Torque 12 foram removidos; nenhum deles era referenciado pelo HTML/CSS/JS atual.
- Assets antigos sem referência (incluindo previews/capas descontinuados) também foram removidos.
- Blur de glassmorphism reduzido em telas pequenas para preservar fluidez.
- Nenhum framework pesado foi adicionado.

VÉRTICE LAB
O Lab usa apenas um iframe ativo por vez e aponta para:
- Âmbar Rua
- BRASA 91
- Cobalto
- Pingo Pet
- Torque 12

CADA PROJETO DEMONSTRATIVO POSSUI
- index.html próprio
- styles.css próprio
- script.js próprio
- branding.txt
- identidade visual e arquitetura próprias
- navegação responsiva
- retorno para o portfólio Vértice
- telefone fictício quando aplicável

TRANSPARÊNCIA
As cinco marcas do portfólio são projetos demonstrativos/conceituais criados para apresentar capacidade de design e desenvolvimento. Não apresente essas marcas como clientes reais sem substituir o conteúdo por trabalhos reais/autorizados.

CONTATOS DO SITE PRINCIPAL
Instagram: @verticeweb.br
WhatsApp: (11) 92533-0433
E-mail: sac.vertice.web@gmail.com

PUBLICAÇÃO
Preserve toda a estrutura de diretórios. O site é estático e pode ser servido por HTTPS em Render, Netlify, Vercel, GitHub Pages ou hospedagem equivalente.
Os Live Viewers dependem dos caminhos relativos em /projetos/.

ANTES DE PUBLICAR
1. Confirme WhatsApp, Instagram e e-mail oficiais.
2. Confirme as condições comerciais exibidas no site.
3. Mantenha a identificação de projetos demonstrativos enquanto forem fictícios.
4. Faça uma passagem em dispositivos físicos e em HTTPS, principalmente para validar imagens externas usadas dentro das demos.
5. Se substituir uma demo por trabalho real, confirme autorização de marca/imagens.

QUALIDADE
Consulte QA-REPORT.txt para as verificações executadas nesta versão.
