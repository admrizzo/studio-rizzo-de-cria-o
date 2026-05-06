

# Upgrade Visual: Templates Profissionais de Alto Impacto

## Problema Identificado

Os 20 templates atuais compartilham a mesma estrutura repetitiva:
- Foto no topo (ou fundo) + bloco de texto empilhado + stats em linha + preço + assinatura
- Nenhum elemento decorativo (molduras, formas geométricas, texturas, padrões)
- Paletas de cores genéricas sem sofisticação
- Layouts quase idênticos entre si -- só muda a cor de fundo
- Falta de hierarquia visual sofisticada e "respiro" (negative space)

## O Que Vai Mudar

### 1. Novos Elementos Decorativos (criar `TemplateDecorations.tsx`)
- Molduras elegantes com cantos decorativos (linhas finas douradas/brancas)
- Formas geométricas como acento visual (losangos, arcos, círculos)
- Linhas decorativas e separadores com personalidade
- Padrões sutis de fundo (grid points, linhas diagonais via CSS)

### 2. Reescrever 10 Templates Stories (S1-S11) com Layouts Distintos

| Template | Conceito Novo | Diferencial Visual |
|----------|--------------|-------------------|
| S1 | **Moldura Luxo** | Foto full-bleed com moldura interna dourada fina (8px das bordas), preço em caixa translúcida centralizada |
| S2 | **Magazine Cover** | Foto full-bleed, título enorme sobreposto com mix de peso (light + black), stats em pills horizontais no rodapé |
| S3 | **Galeria** | Fundo creme com foto em formato retrato com borda branca grossa (como foto impressa), tipografia serif elegante |
| S4 | **Faixa Diagonal** | Foto com faixa vermelha diagonal cruzando o canvas com texto em ângulo, urgência real |
| S5 | **Arquitecto** | Grid modular com linhas finas, foto em um módulo, dados em outros, estética blueprint |
| S6 | **Ouro Noir** | Foto com overlay de gradiente dourado lateral, textura de ruído sutil, tipografia condensada |
| S7 | **Glass Card** | Glassmorphism com card central grande, foto atrás desfocada, bordas arredondadas premium |
| S8 | **Duo Tone** | Canvas dividido em diagonal com foto de um lado e cor sólida do outro, texto na intersecção |
| S10 | **Earth Tones** | Paleta terracota com elementos circulares, foto em formato circular grande, organic feel |
| S11 | **Ficha Técnica** | Layout de "ficha" com grid rigoroso, foto em moldura, dados organizados como formulário premium |

### 3. Reescrever 10 Templates Post (P1-P10) com Layouts Distintos

| Template | Conceito Novo | Diferencial Visual |
|----------|--------------|-------------------|
| P1 | **Hero Split** | Foto ocupa 60% da esquerda com cantos arredondados, dados à direita em fundo teal escuro |
| P2 | **Preço Statement** | Preço gigante (140px+) como elemento central com foto pequena recortada em círculo acima |
| P3 | **Editorial Spread** | 2 fotos pequenas lado a lado + texto abaixo em layout de revista, serif headings |
| P4 | **Texto Protagonista** | Fundo de cor sólida vibrante, frase conceitual em tipografia dramática, foto minúscula como acento |
| P5 | **Corretor Card** | Card branco com sombra sobre fundo escuro, foto do corretor + dados do imóvel integrados |
| P6 | **Dashboard** | Layout inspirado em UI/data com cards de métricas, feel de "análise de investimento" |
| P7 | **Clean White** | Fundo branco puro, foto com cantos arredondados, tipografia preta minimalista, green accents |
| P8 | **Cinematic** | Foto full com barras pretas cinema (letterbox), texto sobre as barras |
| P9 | **Alert Banner** | Faixa vermelha no topo + rodapé, foto no centro, estética de notificação urgente |
| P10 | **Bold Tipo** | Título do imóvel ocupa 70% do canvas em tipografia monumental, foto pequena no canto |

### 4. Melhorias Transversais em Todos os Templates

- **Negative space**: Margens maiores (80px+), mais respiro entre elementos
- **Tipografia rica**: Misturar pesos (300 + 900) para contraste dramático, usar Playfair Display (já importado) para headings elegantes em templates editoriais
- **Sombras e profundidade**: Box-shadows sutis nos cards, drop-shadows nos textos sobre fotos
- **Elementos decorativos**: Linhas finas, pontos, molduras como elementos de design (não apenas separadores)
- **Cores com personalidade**: Cada template com paleta única e sofisticada (não apenas #080808 + accent)

## Arquivos Modificados

1. **Criar** `src/components/templates/TemplateDecorations.tsx` -- componentes decorativos reutilizáveis
2. **Reescrever** `src/components/templates/TemplatesSet1.tsx` -- S1 a S5
3. **Reescrever** `src/components/templates/TemplatesSet2.tsx` -- P1 a P5
4. **Reescrever** `src/components/templates/TemplatesSet3.tsx` -- S6-S11, P6-P10

## Resultado Esperado

Templates que parecem feitos por um designer sênior com horas de trabalho -- cada um visualmente único, com personalidade própria, elementos decorativos sofisticados e composições que se destacam no feed do Instagram.

