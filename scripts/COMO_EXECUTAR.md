# Como Executar o Script de Processamento de Catálogo

## 📋 Pré-requisitos

1. **Node.js** >= 18.0.0 instalado
2. **npm** >= 9.0.0
3. **Chave da API OpenAI** ou API compatível configurada

## 🚀 Passo a Passo

### 1. Instalar Dependências

```bash
cd GITHUB/ita-rp-game
npm install
```

Isso instalará:
- `openai` - Cliente para APIs OpenAI-compatíveis
- `pdf-parse` - Parser de PDF
- `tsx` - Executor TypeScript

### 2. Configurar Variáveis de Ambiente

#### Opção A: OpenAI Oficial

```bash
# Windows (PowerShell)
$env:OPENAI_API_KEY="sk-..."
$env:OPENAI_MODEL="gpt-4o"

# Linux/Mac
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-4o"
```

#### Opção B: Ollama (Local)

```bash
# Primeiro, inicie o Ollama
ollama serve

# Em outro terminal, configure:
# Windows (PowerShell)
$env:OPENAI_BASE_URL="http://localhost:11434/v1"
$env:OPENAI_MODEL="llama3.2"
$env:OPENAI_API_KEY="ollama"
$env:SUPPORTS_JSON_MODE="false"

# Linux/Mac
export OPENAI_BASE_URL="http://localhost:11434/v1"
export OPENAI_MODEL="llama3.2"
export OPENAI_API_KEY="ollama"
export SUPPORTS_JSON_MODE="false"
```

#### Opção C: Outras APIs Compatíveis

```bash
# Windows (PowerShell)
$env:OPENAI_BASE_URL="https://sua-api.com/v1"
$env:OPENAI_API_KEY="sua-chave"
$env:OPENAI_MODEL="seu-modelo"
$env:SUPPORTS_JSON_MODE="true"  # ou "false" se não suportar

# Linux/Mac
export OPENAI_BASE_URL="https://sua-api.com/v1"
export OPENAI_API_KEY="sua-chave"
export OPENAI_MODEL="seu-modelo"
export SUPPORTS_JSON_MODE="true"
```

### 3. Verificar Localização do PDF

O script procura o PDF em:
```
GITHUB/ita-rp-game/Catálogo dos Cursos de Graduação 2025 - digital Rev.25.07.18-páginas (1).pdf
```

Se o PDF estiver em outro local, edite a constante `PDF_PATH` no arquivo `scripts/process-catalog.ts`.

### 4. Executar o Script

```bash
npm run process-catalog
```

## 📊 O que o Script Faz

1. **Extrai texto do PDF** usando `pdf-parse`
2. **Identifica todas as disciplinas** no catálogo
3. **Para cada disciplina**:
   - Gera JSON estruturado seguindo o schema do exemplo `MAT-13.json`
   - Cria hierarquia completa: areas → disciplines → mainTopics → atomicTopics → individualConcepts → specificSkills
   - Expande atomicamente todas as `specificSkills` usando IA
4. **Salva arquivos JSON** no formato: `[CÓDIGO] - [NOME].json`

## 📝 Exemplo de Saída

```
=== Iniciando processamento do catálogo ===

Configurado para usar: http://localhost:11434/v1
Modelo: llama3.2
JSON Mode: Não suportado

Extraindo texto de ...pdf...
Texto extraído: 500000 caracteres

Extraindo disciplinas do texto do PDF...
Encontradas 150 disciplinas

[1/150] Processando MAT-13...
Gerando JSON para MAT-13 - Cálculo Diferencial e Integral I...
Expandindo habilidades atômicas...
Encontradas 428 habilidades para expandir
Expandindo [1/428]: Matemática > Cálculo > Limites > Definição Formal > Provar limites...
✓ Arquivo salvo: MAT-13 - Cálculo Diferencial e Integral I.json

...

=== Processamento concluído ===
✓ 150 arquivo(s) gerado(s)
```

## ⚙️ Variáveis de Ambiente Disponíveis

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|--------|-------------|
| `OPENAI_API_KEY` ou `API_KEY` | Chave da API | - | Sim* |
| `OPENAI_BASE_URL` ou `BASE_URL` | URL base da API | `https://api.openai.com/v1` | Não |
| `OPENAI_MODEL` ou `MODEL` | Modelo a usar | `gpt-4o` | Não |
| `SUPPORTS_JSON_MODE` | Se a API suporta JSON mode | `true` | Não |
| `MAX_RETRIES` | Número máximo de tentativas | `3` | Não |
| `DEBUG` | Ativa logs detalhados (`true`/`1` ou `false`/`0`) | `false` | Não |

*Para APIs locais (Ollama), pode ser qualquer string ou omitido.

#### Ativar modo debug:

```bash
# Windows (PowerShell)
$env:DEBUG="true"

# Linux/Mac
export DEBUG="true"
```

O modo debug mostra:
- 🔍 Detalhes de todas as requisições à API
- ⏱️ Tempo de resposta de cada chamada
- 📊 Tokens usados (prompt, completion, total)
- ❌ Erros detalhados com stack traces
- 📈 Estatísticas de processamento
- 📝 Progresso detalhado de cada etapa

## 🔧 Troubleshooting

### Erro: "OPENAI_API_KEY não está definida"

**Solução**: Configure a variável de ambiente ou, para APIs locais, defina apenas `BASE_URL`.

### Erro: "Connection refused"

**Solução**: Verifique se sua API local está rodando:
- Ollama: `ollama serve`
- Verifique se a porta está correta na `BASE_URL`

### Erro: "Nenhum texto foi extraído do PDF"

**Solução**: 
- Verifique se o PDF existe no caminho esperado
- Verifique se o PDF não está corrompido
- Verifique se o PDF não está protegido por senha

### Erro: "Nenhuma disciplina encontrada no PDF"

**Solução**: O script tentará usar IA para extrair. Se falhar, verifique o formato do PDF.

### Processamento muito lento

**Solução**: 
- Use um modelo mais rápido (ex: `gpt-3.5-turbo` ao invés de `gpt-4o`)
- Aumente os delays no código se estiver enfrentando rate limiting
- Processe menos disciplinas por vez (modifique o código para filtrar)

### Erro: "Cannot read properties of undefined (reading 'image')" no claude-code-router

Este erro ocorre quando o `claude-code-router` tenta processar uma requisição e encontra um problema interno.

**Soluções**:
1. **Atualizar o claude-code-router**:
   ```bash
   npm install -g @musistudio/claude-code-router@latest
   ```

2. **Verificar a sintaxe do comando**:
   - O comando correto pode ser: `claude-code-route` (sem "com")
   - Ou: `claude-code-router` (completo)
   - Verifique a documentação oficial do pacote

3. **Limpar cache e reinstalar**:
   ```bash
   npm cache clean --force
   npm uninstall -g @musistudio/claude-code-router
   npm install -g @musistudio/claude-code-router@latest
   ```

4. **Verificar variáveis de ambiente**:
   - Certifique-se de que não há variáveis de ambiente conflitantes
   - Tente executar em um terminal limpo

5. **Usar alternativa**: Se o problema persistir, considere usar o comando diretamente sem o router:
   ```bash
   npm run process-catalog
   ```

## 💡 Dicas

1. **Para testar rapidamente**: Modifique o código para processar apenas 1-2 disciplinas primeiro
2. **Para APIs locais**: Use modelos menores e mais rápidos
3. **Para produção**: Configure `MAX_RETRIES` maior para maior robustez
4. **Monitoramento**: O script mostra progresso em tempo real

## 📚 Arquivos Gerados

Os arquivos JSON serão salvos no diretório raiz do projeto (`GITHUB/ita-rp-game/`) no formato:
- `MAT-13 - Cálculo Diferencial e Integral I.json`
- `FIS-15 - Mecânica I.json`
- etc.

Cada arquivo segue o schema definido em `MAT-13 - Cálculo Diferencial e Integral I.json`.

