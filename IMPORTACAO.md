# 📅 Como Importar para o Google Calendar

## Passo a Passo Detalhado

### 1. Gerar o Arquivo CSV

```bash
cd /home/bitter/dev/cmmg-calendar
python main.py
```

### 2. Acessar o Google Calendar

1. Abra [calendar.google.com](https://calendar.google.com)
2. Faça login com sua conta Google

### 3. Importar o Arquivo

1. **No menu lateral esquerdo**, procure por "Outros calendários"
2. **Clique no ícone "+"** ao lado de "Outros calendários"
3. **Selecione "Importar"** no menu dropdown
4. **Clique em "Selecionar arquivo do computador"**
5. **Navegue até** `output/GoogleAgenda.csv`
6. **Selecione o arquivo** e clique em "Abrir"

### 4. Configurar a Importação

1. **Escolha o calendário de destino**:
   - Recomendo criar um novo calendário específico para "Aulas CMMG"
   - Para criar novo: clique em "Criar novo calendário"
2. **Verifique as configurações**:
   - Formato do arquivo: CSV
   - Fuso horário: America/Sao_Paulo (ou seu fuso local)
3. **Clique em "Importar"**

### 5. Verificar a Importação

- ✅ Você deve ver uma mensagem de confirmação
- ✅ Os eventos aparecerão no calendário selecionado
- ✅ Total esperado: **677 eventos** importados

## 🎨 Personalização Pós-Importação

### Cores e Visualização

1. **Clique nas configurações** do calendário importado (ícone de 3 pontos)
2. **Escolha uma cor** específica para suas aulas
3. **Sugestão**: Use cores diferentes por tipo de aula:
   - 🔵 Azul: Aulas teóricas
   - 🟢 Verde: Aulas práticas
   - 🟡 Amarelo: Provas e avaliações

### Notificações

1. **Vá em Configurações** → **Configurações de evento**
2. **Configure lembretes padrão**:
   - 📱 **15 minutos antes** (notificação mobile)
   - 📧 **1 hora antes** (email - opcional)
   - 🔔 **1 dia antes** (para preparação)

## 🛠️ Solução de Problemas

### ❌ "Formato de arquivo não suportado"

- Verifique se o arquivo tem extensão `.csv`
- Certifique-se que foi gerado pelo script python

### ❌ "Erro ao processar datas"

- Verifique se seu Google Calendar está configurado para fuso horário brasileiro
- O script gera datas no formato MM/DD/YYYY

### ❌ "Alguns eventos não foram importados"

- Normal se houver eventos duplicados
- O script já filtra eventos inválidos (são os 20 registros inválidos detectados)

### ❌ "Eventos aparecem no horário errado"

- Verifique o fuso horário do seu Google Calendar
- Vá em Configurações → Fuso horário → America/Sao_Paulo

## 📱 Sincronização Mobile

Após a importação:

1. **Abra o app Google Calendar** no seu celular
2. **Verifique se o calendário está sincronizado**
3. **Configure notificações mobile** se necessário

## 🔄 Atualizações Futuras

Se você receber um novo arquivo JSON:

1. **Substitua** o arquivo `data/QuadroHorarioAluno.json`
2. **Execute novamente** `python main.py`
3. **Importe o novo CSV** (pode sobrescrever o calendário anterior)

## 📞 Formato Importado

Cada evento terá:

- **Título**: Nome da matéria
- **Horário**: Hora exata de início e fim
- **Local**: Prédio, bloco e sala completos
- **Descrição**: Código da turma e subturma
- **Privacidade**: Privado por padrão
