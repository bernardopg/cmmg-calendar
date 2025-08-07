# 📧 Como Importar para o Thunderbird

## Passo a Passo Detalhado para Thunderbird

### 1. Gerar o Arquivo ICS

```bash
cd /home/bitter/dev/cmmg-calendar
python main.py
```

### 2. Importar no Thunderbird

#### Método 1: Via Menu Principal

1. **Abra o Thunderbird**
2. **Vá em "Agenda"** (ou pressione `Ctrl+Shift+C`)
3. **No menu superior**, clique em **"Arquivo"** → **"Importar"**
4. **Selecione "Calendário"** na janela de importação
5. **Clique em "Avançar"**
6. **Escolha "No disco rígido"** e clique em "Avançar"
7. **Navegue até** `output/ThunderbirdAgenda.ics`
8. **Selecione o arquivo** e clique em "Abrir"

#### Método 2: Via Drag & Drop

1. **Abra o Thunderbird** e vá para a **aba "Agenda"**
2. **Abra o gerenciador de arquivos** e navegue até `output/ThunderbirdAgenda.ics`
3. **Arraste o arquivo** `.ics` diretamente para a área da agenda no Thunderbird
4. **Confirme a importação** quando solicitado

#### Método 3: Via Botão Direito (mais simples)

1. **No gerenciador de arquivos**, clique com o **botão direito** no arquivo `ThunderbirdAgenda.ics`
2. **Selecione "Abrir com"** → **"Thunderbird"**
3. **Confirme a importação** quando o Thunderbird abrir

### 3. Configurar o Calendário Importado

1. **Após a importação**, você verá um novo calendário chamado **"Horário Acadêmico CMMG"**
2. **No painel lateral esquerdo**, encontre o calendário na lista
3. **Clique com o botão direito** no nome do calendário
4. **Selecione "Propriedades"** para personalizar:
   - **Nome**: Altere se desejar (ex: "Aulas CMMG 2025")
   - **Cor**: Escolha uma cor específica para suas aulas
   - **Visibilidade**: Marque/desmarque para mostrar/ocultar

### 4. Verificar a Importação

- ✅ **Total esperado**: 677 eventos
- ✅ **Período**: Agosto a dezembro de 2025
- ✅ **Horários**: 07:00 às 19:00
- ✅ **Informações**: Cada evento terá título, horário, local e descrição completos

## 🔧 Configurações Recomendadas

### Lembretes e Notificações

1. **Clique com botão direito** no calendário → **"Propriedades"**
2. **Vá na aba "Lembretes"**
3. **Configure lembretes padrão**:
   - 🔔 **15 minutos antes** (para chegar na aula)
   - 📧 **1 dia antes** (para preparação)

### Sincronização com Celular

Para sincronizar com dispositivos móveis:

1. **Configure uma conta CalDAV** (se disponível)
2. **Ou exporte regularmente** novos arquivos `.ics`
3. **Use aplicativos** como DAVx5 (Android) para sincronização

### Cores por Matéria

Para organizar melhor, você pode:

1. **Usar filtros** para criar visualizações por matéria
2. **Criar calendários separados** por matéria (se preferir)
3. **Aplicar cores diferentes** baseadas no local da aula

## 🛠️ Solução de Problemas

### ❌ "Arquivo não reconhecido"

- Verifique se o arquivo tem extensão `.ics`
- Certifique-se que foi gerado pelo script Python

### ❌ "Erro ao importar calendário"

- Feche e reabra o Thunderbird
- Tente importar novamente
- Verifique se há espaço suficiente no disco

### ❌ "Eventos aparecem no horário errado"

- Verifique o fuso horário do Thunderbird
- Vá em **Configurações** → **Calendário** → **Fuso horário**
- Configure para **America/Sao_Paulo**

### ❌ "Alguns eventos não aparecem"

- Normal se alguns eventos estavam duplicados
- O arquivo contém 677 eventos válidos
- Verifique o filtro de visualização da agenda

## 📱 Alternativas de Importação

Se o Thunderbird não estiver disponível, o arquivo `.ics` também funciona em:

- **Evolution** (Linux)
- **KDE Kontact** (Linux)
- **Apple Calendar** (macOS)
- **Outlook** (Windows/macOS)
- **Google Calendar** (via upload de arquivo)

## 🔄 Atualizações Futuras

Para atualizar com novos horários:

1. **Gere um novo arquivo** `.ics` com o script
2. **Remova o calendário antigo** do Thunderbird
3. **Importe o novo arquivo** seguindo os mesmos passos
4. **Ou sobrescreva** o arquivo existente (se mantiver o mesmo nome)

## 📊 Formato do Arquivo ICS

O arquivo gerado segue o padrão **iCalendar (RFC 5545)** com:

- **VEVENT**: Cada aula é um evento individual
- **DTSTART/DTEND**: Horários de início e fim precisos
- **SUMMARY**: Nome da matéria
- **LOCATION**: Local completo (prédio, bloco, sala)
- **DESCRIPTION**: Códigos de turma e informações extras
- **UID**: Identificador único para cada evento
