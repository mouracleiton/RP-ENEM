# Processador de PDF de Grade Curricular

Script Python para processar PDFs de grade curricular e gerar arquivos JSON estruturados com 6 níveis de atomicidade usando IA.

## Funcionalidades

- ✅ Extração de texto de arquivos PDF
- ✅ Processamento com IA para estruturar o currículo
- ✅ Geração de JSON com 6 níveis de atomicidade:
  1. **Area** - Área do conhecimento
  2. **Discipline** - Disciplina específica
  3. **MainTopic** - Tópico principal
  4. **AtomicTopic** - Tópico atômico
  5. **IndividualConcept** - Conceito individual
  6. **SpecificSkill** - Habilidade específica com expansão atômica
- ✅ Expansão automática de habilidades atômicas seguindo o prompt fornecido
- ✅ Geração de arquivos JSON separados por disciplina

## Pré-requisitos

- Python 3.8 ou superior
- Chave da API OpenAI ou API compatível (obtenha em https://platform.openai.com/api-keys ou use serviços como:
  - OpenAI (oficial)
  - Anthropic Claude (via compatibilidade)
  - Ollama (local)
  - Outras APIs compatíveis com OpenAI)

## Instalação

1. Instale as dependências:

```bash
pip install -r requirements.txt
```

2. Configure a chave da API:

```bash
# Windows (PowerShell)
$env:OPENAI_API_KEY="sua-chave-aqui"
# Para APIs compatíveis (opcional):
$env:OPENAI_BASE_URL="https://api.exemplo.com/v1"

# Linux/Mac
export OPENAI_API_KEY="sua-chave-aqui"
# Para APIs compatíveis (opcional):
export OPENAI_BASE_URL="https://api.exemplo.com/v1"
```

Ou passe diretamente via argumentos `--api-key` e `--base-url`.

## Uso

### Uso Básico

```bash
python process_curriculum_pdf.py caminho/para/arquivo.pdf
```

### Opções Disponíveis

```bash
python process_curriculum_pdf.py [PDF_PATH] [OPÇÕES]

Argumentos:
  pdf_path              Caminho para o arquivo PDF

Opções:
  -o, --output DIR      Diretório de saída (padrão: diretório atual)
  -p, --prompt PATH     Caminho opcional para arquivo de prompt (padrão: usa prompt integrado)
  -s, --schema PATH     Caminho opcional para arquivo de schema (padrão: usa schema integrado)
  --api-key KEY         Chave da API (ou use OPENAI_API_KEY)
  --base-url URL        URL base da API para serviços compatíveis (ou use OPENAI_BASE_URL)
  --model MODEL         Modelo de IA a usar (padrão: gpt-4o)
  -h, --help            Mostra esta mensagem de ajuda
```

### Exemplos

```bash
# Processar PDF e salvar na pasta atual
python process_curriculum_pdf.py grade_curricular.pdf

# Processar e salvar em pasta específica
python process_curriculum_pdf.py grade_curricular.pdf -o output/

# Usar modelo específico
python process_curriculum_pdf.py grade_curricular.pdf --model gpt-4-turbo

# Passar chave da API diretamente
python process_curriculum_pdf.py grade_curricular.pdf --api-key sk-...

# Usar API compatível (ex: Ollama local)
python process_curriculum_pdf.py grade_curricular.pdf --base-url http://localhost:11434/v1 --model llama2

# Usar API compatível com variável de ambiente
export OPENAI_BASE_URL="https://api.exemplo.com/v1"
python process_curriculum_pdf.py grade_curricular.pdf
```

## Estrutura de Saída

O script gera um arquivo JSON para cada disciplina encontrada no PDF, seguindo o schema fornecido:

```
[Nome_Disciplina].json
```

Cada arquivo contém:
- Metadados do currículo
- Área(s) de conhecimento
- Disciplina(s) com estrutura completa de 6 níveis
- Habilidades específicas com expansões atômicas completas

## Formato do JSON Gerado

O JSON segue o schema definido em `schema.json` e inclui:

### Níveis de Atomicidade

1. **Area** (`id`, `name`, `description`, `totalSkills`, `percentage`, `disciplines`)
2. **Discipline** (`id`, `name`, `description`, `totalSkills`, `mainTopics`)
3. **MainTopic** (`id`, `name`, `description`, `totalSkills`, `atomicTopics`)
4. **AtomicTopic** (`id`, `name`, `description`, `individualConcepts`)
5. **IndividualConcept** (`id`, `name`, `description`, `specificSkills`)
6. **SpecificSkill** (`id`, `name`, `description`, `atomicExpansion`, `estimatedTime`, `difficulty`, `status`, `prerequisites`)

### Atomic Expansion

Cada `specificSkill` possui uma `atomicExpansion` completa com:

- **steps**: Array de 3-5 passos de aprendizado
  - `stepNumber`: Número sequencial
  - `title`: Título do passo
  - `subSteps`: 5-8 sub-passos detalhados
  - `verification`: Como verificar conclusão
  - `estimatedTime`: Tempo estimado
  - `materials`: Recursos necessários
  - `tips`: Dicas práticas
  - `learningObjective`: Objetivo de aprendizado
  - `commonMistakes`: Erros comuns a evitar

- **practicalExample**: Exemplo prático e concreto
- **finalVerifications**: Lista de verificações finais (3-7 itens)
- **assessmentCriteria**: Critérios de avaliação (3-7 itens)
- **crossCurricularConnections**: Conexões interdisciplinares (2-5 itens)
- **realWorldApplication**: Aplicação no mundo real

## Arquivos de Referência

O script possui **prompt e schema integrados diretamente**, então não é necessário ter arquivos externos. No entanto, você pode fornecer arquivos personalizados:

1. **ATOMIC_EXPAND_PROMPT.md** (opcional): Se fornecido, substitui o prompt integrado
2. **schema.json** (opcional): Se fornecido, substitui o schema integrado

Por padrão, o script usa versões integradas destes arquivos, tornando-o totalmente autossuficiente.

## Limitações e Considerações

- O processamento pode levar vários minutos dependendo do tamanho do PDF e número de disciplinas
- O uso da API OpenAI gera custos (consulte https://openai.com/pricing)
- PDFs muito grandes podem precisar ser processados em partes
- A qualidade da extração depende da qualidade do PDF (texto vs. imagens)

## Solução de Problemas

### Erro: "Chave da API não fornecida"
- Defina a variável de ambiente `OPENAI_API_KEY` ou use `--api-key`

### Erro: "Nenhum texto foi extraído do PDF"
- O PDF pode estar em formato de imagem. Considere usar OCR primeiro
- Verifique se o PDF não está protegido ou corrompido

### Usando APIs compatíveis com OpenAI
- **Ollama (local)**: `--base-url http://localhost:11434/v1 --model llama2`
- **Anthropic Claude**: Configure via `OPENAI_BASE_URL` se disponível
- **Outras APIs**: Qualquer serviço compatível com a API OpenAI pode ser usado via `--base-url`

### Erro: "A IA não retornou JSON válido"
- Tente usar um modelo diferente (ex: `gpt-4-turbo`)
- Verifique se o PDF contém informações estruturadas
- O texto pode estar muito longo - tente processar em partes menores

### JSON incompleto ou com erros
- Verifique os logs para identificar habilidades que falharam na expansão
- Re-execute o script - ele tentará expandir apenas habilidades incompletas

## Desenvolvimento

Para contribuir ou modificar o script:

1. O código está estruturado em classes modulares
2. A classe `CurriculumProcessor` gerencia todo o fluxo
3. Métodos podem ser sobrescritos para personalização
4. Adicione tratamento de erros conforme necessário

## Licença

Este script faz parte do projeto ENEM RP Game.

