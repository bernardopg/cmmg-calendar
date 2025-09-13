# 📸 Guia Visual - Screenshots e Mockups

> 🎨 Esta pasta contém todas as imagens e elementos visuais da documentação

---

## 📁 Estrutura de Imagens

```
docs/images/
├── 🏠 homepage/
│   ├── main-interface.png      # Interface principal
│   ├── file-upload.png         # Upload de arquivo
│   └── analysis-results.png    # Resultados da análise
├── 📱 google-calendar/
│   ├── import-step1.png        # Passo 1 da importação
│   ├── import-step2.png        # Passo 2 da importação
│   ├── calendar-view.png       # Visualização final
│   └── mobile-sync.png         # Sincronização mobile
├── ⚡ thunderbird/
│   ├── import-process.png      # Processo de importação
│   ├── calendar-setup.png      # Configuração do calendário
│   └── event-details.png       # Detalhes dos eventos
├── 🔧 installation/
│   ├── terminal-setup.png      # Setup via terminal
│   ├── windows-install.png     # Instalação Windows
│   └── success-screen.png      # Tela de sucesso
└── 🎨 branding/
    ├── logo.svg                # Logo principal
    ├── favicon.ico             # Favicon
    └── banner.png              # Banner para README
```

---

## 🖼️ Screenshots Necessários

### 🏠 Interface Principal

#### `main-interface.png`
- **Resolução**: 1920x1080
- **Conteúdo**: Interface principal com menu lateral
- **Status**: 📝 Pendente

#### `file-upload.png`
- **Resolução**: 1200x800
- **Conteúdo**: Área de drag & drop ativa
- **Status**: 📝 Pendente

#### `analysis-results.png`
- **Resolução**: 1200x800
- **Conteúdo**: Dashboard com estatísticas
- **Status**: 📝 Pendente

---

### 📱 Google Calendar

#### `import-step1.png`
- **Resolução**: 1200x800
- **Conteúdo**: Menu "Outros calendários" + botão "+"
- **Status**: 📝 Pendente

#### `import-step2.png`
- **Resolução**: 1200x800
- **Conteúdo**: Dialog de importação com arquivo selecionado
- **Status**: 📝 Pendente

#### `calendar-view.png`
- **Resolução**: 1200x800
- **Conteúdo**: Calendário com eventos importados
- **Status**: 📝 Pendente

---

### ⚡ Thunderbird

#### `import-process.png`
- **Resolução**: 1200x800
- **Conteúdo**: Wizard de importação do Thunderbird
- **Status**: 📝 Pendente

#### `calendar-setup.png`
- **Resolução**: 1200x800
- **Conteúdo**: Propriedades do calendário
- **Status**: 📝 Pendente

---

## 🎨 Assets de Design

### 🎯 Paleta de Cores

```css
:root {
  /* Primary Colors */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;

  /* Secondary Colors */
  --secondary-50: #f0f9ff;
  --secondary-500: #0ea5e9;
  --secondary-900: #0c4a6e;

  /* Success/Error/Warning */
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;

  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-500: #6b7280;
  --gray-900: #111827;
}
```

### 📐 Dimensões Padrão

| Tipo | Dimensão | Uso |
|------|----------|-----|
| **Banner** | 1200x400 | README principal |
| **Screenshot** | 1200x800 | Guias passo a passo |
| **Mobile** | 375x667 | Interface mobile |
| **Thumbnail** | 300x200 | Prévia pequena |
| **Logo** | 512x512 | Ícone principal |

---

## 📋 Checklist para Screenshots

### ✅ Qualidade
- [ ] Resolução mínima 1200px largura
- [ ] Formato PNG para interface
- [ ] JPG para fotos gerais
- [ ] SVG para logos e ícones

### ✅ Conteúdo
- [ ] Interface limpa (sem dados pessoais)
- [ ] Dados de exemplo consistentes
- [ ] Cursor não visível
- [ ] Foco no elemento principal

### ✅ Anotações
- [ ] Setas indicativas quando necessário
- [ ] Numeração para passos
- [ ] Destacar botões importantes
- [ ] Legendas explicativas

---

## 🖌️ Ferramentas Recomendadas

### 📸 Captura de Tela
- **Linux**: Flameshot, GNOME Screenshot
- **Windows**: Snipping Tool, ShareX
- **macOS**: Command+Shift+4

### ✏️ Edição de Imagem
- **Simples**: GIMP (gratuito)
- **Avançado**: Figma (design)
- **Anotações**: Skitch, Annotate

### 🎨 Design
- **Logos**: Figma, Inkscape
- **Mockups**: Figma, Adobe XD
- **Ícones**: Feather Icons, Lucide

---

## 📱 Responsive Screenshots

### 📱 Mobile (375px)
- Interface principal mobile
- Upload em dispositivos móveis
- Resultados em tela pequena

### 💻 Desktop (1200px+)
- Interface completa
- Multi-colunas
- Sidebar expandida

### 🖥️ Large (1920px+)
- Visão panorâmica
- Múltiplos painéis
- Layout completo

---

## 🎥 GIFs Demonstrativos

### 🔄 Processo de Upload
- **Duração**: 5-10 segundos
- **FPS**: 30
- **Tamanho**: <2MB
- **Formato**: GIF otimizado

### 📊 Navegação na Interface
- **Duração**: 5-15 segundos
- **Mostra**: Transições suaves
- **Destaque**: Elementos interativos

---

## 📝 Templates de Anotação

### ➡️ Setas e Indicadores
```html
<!-- Seta indicativa -->
<div style="
  position: relative;
  display: inline-block;
  color: #ef4444;
  font-size: 24px;
">
  ➡️
</div>
```

### 🔢 Numeração de Passos
```css
.step-number {
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
```

---

## 🚀 Geração Automática

### 📷 Script de Screenshot
```bash
#!/bin/bash
# generate_screenshots.sh
# Gera screenshots automaticamente da interface

# Instalar dependências
# npm install -g puppeteer

node generate_screenshots.js
```

### 🎨 Otimização de Imagens
```bash
# Otimizar PNGs
optipng -o7 docs/images/*.png

# Otimizar JPGs
jpegoptim --max=85 docs/images/*.jpg

# Converter para WebP
cwebp -q 80 input.png -o output.webp
```

---

## 📊 Métricas de Imagem

| Métrica | Target | Atual |
|---------|--------|-------|
| **Tamanho médio** | <500KB | - |
| **Tempo de carregamento** | <2s | - |
| **Otimização** | >90% | - |
| **Formato** | WebP/PNG | - |

---

**📝 Status atual: 0/12 screenshots criados**

> 🎯 **Próxima tarefa**: Capturar screenshots da interface web em funcionamento