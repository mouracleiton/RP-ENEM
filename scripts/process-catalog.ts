#!/usr/bin/env node
/**
 * Script para processar JSON do Projeto Pedagógico do Curso 2025 Psicologia e gerar arquivos JSON
 * estruturados com expansão atômica usando IA.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - tipos serão resolvidos após npm install
import OpenAI from 'openai';
import pdf from 'pdf-parse';

// Resolve caminhos relativos ao diretório do script
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scriptDir = __dirname;

// Configuração
const MATRIZ_JSON_PATH = path.join(scriptDir, '..', 'matriz_referencia.json');
const OUTPUT_DIR = path.join(scriptDir, '..', 'packages', 'curriculum');
const ATOMIC_EXPAND_PROMPT_PATH = path.join(scriptDir, '..', 'ATOMIC_EXPAND_PROMPT.md');
const SCHEMA_EXAMPLE_PATH = path.join(scriptDir, '..', 'schema.json');
const VALIDATION_SCHEMA_PATH = path.join(scriptDir, '..', 'schema.json');
const CHECKPOINT_FILE = path.join(OUTPUT_DIR, '.process-catalog-checkpoint-enem.json');
const MAX_CONCURRENT_REQUESTS = parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10', 10);

interface AtomicExpansion {
  steps: Array<{
    stepNumber: number;
    title: string;
    subSteps: string[];
    verification: string;
    estimatedTime: string;
    materials: string[];
    tips: string;
    learningObjective: string;
    commonMistakes: string[];
  }>;
  practicalExample: string;
  finalVerifications: string[];
  assessmentCriteria: string[];
  crossCurricularConnections: string[];
  realWorldApplication: string;
}

interface SpecificSkill {
  id: string;
  name: string;
  description: string;
  atomicExpansion?: AtomicExpansion | {};
  estimatedTime?: string;
  difficulty?: string;
  status?: string;
  prerequisites?: string[];
}

interface IndividualConcept {
  id: string;
  name: string;
  description?: string;
  specificSkills: SpecificSkill[];
}

interface AtomicTopic {
  id: string;
  name: string;
  description?: string;
  individualConcepts?: IndividualConcept[];
  specificSkills?: SpecificSkill[];
}

interface MainTopic {
  id: string;
  name: string;
  description: string;
  totalSkills: number;
  atomicTopics: AtomicTopic[];
}

interface Discipline {
  id: string;
  name: string;
  description: string;
  totalSkills: number;
  mainTopics: MainTopic[];
}

interface Area {
  id: string;
  name: string;
  description: string;
  totalSkills: number;
  percentage: number;
  disciplines: Discipline[];
}

interface CurriculumData {
  metadata: {
    startDate: string;
    duration: string;
    dailyStudyHours: string;
    totalAtomicSkills: number;
    version: string;
    lastUpdated: string;
    institution: string;
    basedOn: string;
  };
  areas: Area[];
  infographics: null;
  settings: null;
}

interface CurriculumJSON {
  formatVersion: string;
  exportDate: string;
  appVersion: string;
  curriculumData: CurriculumData;
}

// Interface para o JSON de Psicologia
interface PsicologiaDisciplina {
  codigo: string;
  nome: string;
  creditos: string;
  horasAula: string;
  teoria: string;
  pratica: string;
  extensao: string;
  ementa: string;
  objetivos: string;
  programa: string;
  metodo: string;
  criterio: string;
  bibliografia: string;
}

interface PsicologiaData {
  nomeCurso: string;
  codigoCurso: string;
  codigoHabilitacao: string;
  codigoCG: string;
  disciplinas: PsicologiaDisciplina[];
}

// Interface para a Matriz de Referência ENEM
interface Habilidade {
  id: string;
  descricao: string;
}

interface Competencia {
  id: string;
  descricao: string;
  habilidades: Habilidade[];
}

interface Tema {
  id: string;
  titulo: string;
  descricao: string;
  competencias: Competencia[];
}

interface Dominio {
  id: string;
  titulo: string;
  descricao: string;
  temas: Tema[];
}

interface EixoConceptual {
  titulo: string;
  descricao: string;
  dominios: Dominio[];
}

interface AreaConhecimento {
  descricao: string;
  competencias_especificas: Array<{
    id: string;
    descricao: string;
    habilidades: string[];
  }>;
}

interface MatrizReferencia {
  documento: string;
  edicao: string;
  ano: number;
  descricao: string;
  estrutura: {
    eixo_conceptual: EixoConceptual;
  };
  areas_conhecimento: {
    Linguagens: AreaConhecimento;
    Matemática: AreaConhecimento;
    Ciências_da_Natureza: {
      descricao: string;
      subareas: {
        Física: AreaConhecimento;
        Química: AreaConhecimento;
        Biologia: AreaConhecimento;
      };
    };
    Ciências_Humanas: AreaConhecimento;
  };
  metadata: {
    data_extracao: string;
    fonte: string;
    total_competencias: number;
    total_temas: number;
    total_dominios: number;
    total_habilidades: number;
  };
}

// Interface para competências processadas
interface CompetenciaProcessada {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  area: string;
  dominio?: string;
  tema?: string;
  habilidades: Habilidade[];
  tipo: 'competencia_geral' | 'competencia_especifica';
}

interface Checkpoint {
  processedDisciplines: string[];
  lastUpdate: string;
  totalDisciplines: number;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  missingFields: string[];
}

class CatalogProcessor {
  private openai: OpenAI;
  private atomicExpandPrompt: string = '';
  private schemaExample: CurriculumJSON | null = null;
  private validationSchema: any = null;
  private model: string;
  private supportsJsonMode: boolean;
  private maxRetries: number;
  private debug: boolean;
  private checkpoint: Checkpoint | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || process.env.BASE_URL;
    this.model = process.env.OPENAI_MODEL || process.env.MODEL || 'gpt-4o';
    this.supportsJsonMode = process.env.SUPPORTS_JSON_MODE !== 'false';
    this.maxRetries = parseInt(process.env.MAX_RETRIES || '3', 10);
    this.debug = process.env.DEBUG === 'true' || process.env.DEBUG === '1';

    if (this.debug) {
      console.log('🔍 [DEBUG] Modo debug ativado');
      console.log('🔍 [DEBUG] Variáveis de ambiente:');
      console.log(`  - OPENAI_API_KEY: ${apiKey ? '***' + apiKey.slice(-4) : 'não definida'}`);
      console.log(`  - OPENAI_BASE_URL: ${baseURL || 'não definida (usando padrão)'}`);
      console.log(`  - OPENAI_MODEL: ${this.model}`);
      console.log(`  - SUPPORTS_JSON_MODE: ${this.supportsJsonMode}`);
      console.log(`  - MAX_RETRIES: ${this.maxRetries}`);
    }

    if (!apiKey && !baseURL) {
      throw new Error(
        'OPENAI_API_KEY ou API_KEY não está definida. Configure a variável de ambiente.\n' +
        'Para APIs locais (Ollama, etc.), você pode usar apenas BASE_URL sem API_KEY.'
      );
    }

    const config: any = {};

    if (apiKey) {
      config.apiKey = apiKey;
      if (this.debug) {
        console.log('🔍 [DEBUG] API Key configurada');
      }
    }

    if (baseURL) {
      config.baseURL = baseURL;
      if (this.debug) {
        console.log(`🔍 [DEBUG] Base URL configurada: ${baseURL}`);
      }
    }

    this.openai = new OpenAI(config);

    console.log(`📡 Configurado para usar: ${baseURL || 'https://api.openai.com/v1'}`);
    console.log(`🤖 Modelo: ${this.model}`);
    console.log(`📄 JSON Mode: ${this.supportsJsonMode ? 'Suportado' : 'Não suportado'}`);
    console.log(`⚡ Requisições simultâneas: ${MAX_CONCURRENT_REQUESTS}`);
    if (this.debug) {
      console.log(`🔍 [DEBUG] Cliente OpenAI inicializado`);
    }
  }

  async loadCheckpoint(): Promise<Checkpoint | null> {
    try {
      const checkpointContent = await fs.readFile(CHECKPOINT_FILE, 'utf-8');
      this.checkpoint = JSON.parse(checkpointContent) as Checkpoint;
      console.log(`📋 Checkpoint carregado: ${this.checkpoint.processedDisciplines.length} disciplinas já processadas`);
      return this.checkpoint;
    } catch (error) {
      if (this.debug) {
        console.log(`🔍 [DEBUG] Nenhum checkpoint encontrado, iniciando do zero`);
      }
      return null;
    }
  }

  async saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
    try {
      await fs.writeFile(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');
      if (this.debug) {
        console.log(`🔍 [DEBUG] Checkpoint salvo: ${checkpoint.processedDisciplines.length} disciplinas`);
      }
    } catch (error) {
      console.warn(`⚠️  Erro ao salvar checkpoint:`, error);
    }
  }

  async isDisciplineProcessed(disciplineCode: string): Promise<boolean> {
    // Verifica no checkpoint
    if (this.checkpoint?.processedDisciplines.includes(disciplineCode)) {
      return true;
    }

    // Verifica se o arquivo existe
    try {
      const files = await fs.readdir(OUTPUT_DIR);
      const matchingFile = files.find((f: string) => f.startsWith(`${disciplineCode} - `) && f.endsWith('.json'));
      if (matchingFile) {
        const filepath = path.join(OUTPUT_DIR, matchingFile);

        // Valida contra o schema
        const { valid, curriculum, missingFields } = await this.validateExistingJSON(filepath);

        if (valid && curriculum) {
          return true;
        }

        // Se inválido mas tem curriculum, tenta preencher com IA
        if (!valid && curriculum && missingFields.length > 0) {
          console.log(`🔧 Tentando preencher campos faltantes em ${matchingFile}...`);
          const filledCurriculum = await this.fillMissingFieldsWithAI(curriculum, missingFields);

          // Salva o curriculum atualizado
          await fs.writeFile(filepath, JSON.stringify(filledCurriculum, null, 2), 'utf-8');
          console.log(`✅ Campos preenchidos e arquivo atualizado: ${matchingFile}`);

          // Re-valida após preenchimento
          const revalidation = await this.validateExistingJSON(filepath);
          if (revalidation.valid) {
            return true;
          }
        }

        // Se ainda inválido após AI fill, considera não processado para reprocessamento
        return false;
      }
    } catch (error) {
      // Erro ao ler diretório, assume que não está processado
    }

    return false;
  }

  async markDisciplineAsProcessed(disciplineCode: string): Promise<void> {
    if (!this.checkpoint) {
      this.checkpoint = {
        processedDisciplines: [],
        lastUpdate: new Date().toISOString(),
        totalDisciplines: 0
      };
    }

    if (!this.checkpoint.processedDisciplines.includes(disciplineCode)) {
      this.checkpoint.processedDisciplines.push(disciplineCode);
      this.checkpoint.lastUpdate = new Date().toISOString();
      await this.saveCheckpoint(this.checkpoint);
    }
  }

  async loadPrompt(): Promise<string> {
    try {
      const prompt = await fs.readFile(ATOMIC_EXPAND_PROMPT_PATH, 'utf-8');
      this.atomicExpandPrompt = prompt;
      return prompt;
    } catch (error) {
      console.warn('Não foi possível carregar o prompt de atomic expand. Usando prompt padrão.');
      this.atomicExpandPrompt = this.getDefaultPrompt();
      return this.atomicExpandPrompt;
    }
  }

  async loadSchemaExample(): Promise<CurriculumJSON> {
    try {
      const schemaContent = await fs.readFile(SCHEMA_EXAMPLE_PATH, 'utf-8');
      this.schemaExample = JSON.parse(schemaContent) as CurriculumJSON;
      return this.schemaExample;
    } catch (error) {
      console.warn('Não foi possível carregar o schema de exemplo.');
      throw error;
    }
  }

  async loadValidationSchema(): Promise<any> {
    try {
      const schemaContent = await fs.readFile(VALIDATION_SCHEMA_PATH, 'utf-8');
      this.validationSchema = JSON.parse(schemaContent);
      console.log('✅ Schema de validação carregado');
      return this.validationSchema;
    } catch (error) {
      console.warn('⚠️ Não foi possível carregar o schema de validação:', VALIDATION_SCHEMA_PATH);
      return null;
    }
  }

  validateAgainstSchema(data: any, schema: any, path: string = ''): ValidationResult {
    const errors: string[] = [];
    const missingFields: string[] = [];

    if (!schema || !data) {
      return { valid: true, errors: [], missingFields: [] };
    }

    // Verifica campos obrigatórios do schema
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (data[field] === undefined || data[field] === null) {
          missingFields.push(`${path}.${field}`.replace(/^\./, ''));
          errors.push(`Campo obrigatório ausente: ${path}.${field}`.replace(/^\./, ''));
        }
      }
    }

    // Verifica propriedades definidas no schema
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        const propPath = path ? `${path}.${key}` : key;

        if (data[key] !== undefined) {
          const propSchemaTyped = propSchema as any;

          // Validação recursiva para objetos
          if (propSchemaTyped.type === 'object' && typeof data[key] === 'object' && !Array.isArray(data[key])) {
            const nestedResult = this.validateAgainstSchema(data[key], propSchemaTyped, propPath);
            errors.push(...nestedResult.errors);
            missingFields.push(...nestedResult.missingFields);
          }

          // Validação para arrays
          if (propSchemaTyped.type === 'array' && Array.isArray(data[key])) {
            if (propSchemaTyped.items) {
              data[key].forEach((item: any, index: number) => {
                if (typeof item === 'object') {
                  const itemResult = this.validateAgainstSchema(item, propSchemaTyped.items, `${propPath}[${index}]`);
                  errors.push(...itemResult.errors);
                  missingFields.push(...itemResult.missingFields);
                }
              });
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      missingFields
    };
  }

  async validateExistingJSON(filepath: string): Promise<{ valid: boolean; curriculum: CurriculumJSON | null; missingFields: string[] }> {
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const curriculum = JSON.parse(content) as CurriculumJSON;

      if (!this.validationSchema) {
        await this.loadValidationSchema();
      }

      if (!this.validationSchema) {
        console.log(`⚠️ Schema de validação não disponível, considerando JSON válido`);
        return { valid: true, curriculum, missingFields: [] };
      }

      const validationResult = this.validateAgainstSchema(curriculum, this.validationSchema);

      if (validationResult.valid) {
        console.log(`✅ JSON válido: ${path.basename(filepath)}`);
        return { valid: true, curriculum, missingFields: [] };
      } else {
        console.log(`⚠️ JSON inválido: ${path.basename(filepath)}`);
        console.log(`   Campos faltando: ${validationResult.missingFields.length}`);
        if (this.debug) {
          validationResult.missingFields.slice(0, 10).forEach(field => {
            console.log(`   - ${field}`);
          });
          if (validationResult.missingFields.length > 10) {
            console.log(`   ... e mais ${validationResult.missingFields.length - 10} campos`);
          }
        }
        return { valid: false, curriculum, missingFields: validationResult.missingFields };
      }
    } catch (error: any) {
      console.error(`❌ Erro ao validar JSON: ${error.message}`);
      return { valid: false, curriculum: null, missingFields: [] };
    }
  }

  async fillMissingFieldsWithAI(curriculum: CurriculumJSON, missingFields: string[]): Promise<CurriculumJSON> {
    console.log(`🤖 Usando IA para preencher ${missingFields.length} campos faltantes...`);

    // Agrupa campos por contexto para processamento mais eficiente
    const fieldsByPath: Map<string, string[]> = new Map();

    for (const field of missingFields) {
      const parts = field.split('.');
      const parentPath = parts.slice(0, -1).join('.');
      const fieldName = parts[parts.length - 1];

      if (!fieldsByPath.has(parentPath)) {
        fieldsByPath.set(parentPath, []);
      }
      fieldsByPath.get(parentPath)!.push(fieldName);
    }

    // Processa cada grupo de campos faltantes
    for (const [parentPath, fields] of fieldsByPath) {
      try {
        const parentObject = this.getNestedValue(curriculum, parentPath);
        if (!parentObject) continue;

        const filledFields = await this.generateMissingFields(parentObject, fields, parentPath, curriculum);

        // Aplica os campos preenchidos
        for (const [fieldName, value] of Object.entries(filledFields)) {
          this.setNestedValue(curriculum, `${parentPath}.${fieldName}`, value);
        }
      } catch (error: any) {
        console.warn(`⚠️ Erro ao preencher campos em ${parentPath}: ${error.message}`);
      }
    }

    return curriculum;
  }

  getNestedValue(obj: any, path: string): any {
    if (!path) return obj;

    const parts = path.split(/\.|\[|\]/).filter(p => p !== '');
    let current = obj;

    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }

    return current;
  }

  setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split(/\.|\[|\]/).filter(p => p !== '');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        current[part] = isNaN(Number(parts[i + 1])) ? {} : [];
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  async generateMissingFields(
    context: any,
    missingFields: string[],
    contextPath: string,
    fullCurriculum: CurriculumJSON
  ): Promise<Record<string, any>> {
    const contextDescription = this.getContextDescription(contextPath, fullCurriculum);

    const prompt = `Você é um especialista em currículos educacionais da ENEM, especificamente em Psicologia.

Contexto: ${contextDescription}

Objeto atual (parcial):
${JSON.stringify(context, null, 2)}

Campos que precisam ser preenchidos: ${missingFields.join(', ')}

Com base no contexto e no objeto atual, gere valores apropriados para os campos faltantes.
Use o schema de currículo educacional do Projeto Pedagógico de Psicologia como referência.

Retorne APENAS um JSON com os campos preenchidos, sem explicações:
{
  ${missingFields.map(f => `"${f}": <valor_apropriado>`).join(',\n  ')}
}`;

    const response = await this.makeAPIRequest(prompt, 'Você é um especialista em estruturar conteúdo educacional.');

    try {
      return JSON.parse(response);
    } catch (error) {
      console.warn(`⚠️ Erro ao parsear resposta da IA`);
      return {};
    }
  }

  getContextDescription(path: string, curriculum: CurriculumJSON): string {
    const parts = path.split('.');
    let description = `Currículo: ${curriculum.curriculumData.metadata.basedOn || 'BCT ENEM'}`;

    if (parts.includes('areas')) {
      const areaIndex = parseInt(parts[parts.indexOf('areas') + 1]?.replace(/[\[\]]/g, '') || '0');
      const area = curriculum.curriculumData.areas[areaIndex];
      if (area) {
        description += ` > Área: ${area.name}`;
      }
    }

    if (parts.includes('disciplines')) {
      description += ` > Disciplina`;
    }

    if (parts.includes('mainTopics')) {
      description += ` > Tópico Principal`;
    }

    if (parts.includes('atomicTopics')) {
      description += ` > Tópico Atômico`;
    }

    if (parts.includes('specificSkills')) {
      description += ` > Habilidade Específica`;
    }

    return description;
  }

  getDefaultPrompt(): string {
    return `# Prompt para Atomic Expand em Currículos JSON - BCT ENEM

## Objetivo
Expandir elementos specificSkills em arquivos JSON de currículo educacional do Bacharelado em Ciência e Tecnologia com expansões atômicas detalhadas (atomicExpansion), transformando habilidades descritivas em passos de aprendizado estruturados e acionáveis.

## Quando Fazer Atomic Expand
- Um specificSkill não possui atomicExpansion
- Um atomicExpansion existe mas está incompleto (faltam campos importantes)
- Um atomicExpansion tem poucos detalhes ou subSteps insuficientes

## Estrutura Esperada
Cada atomicExpansion deve conter:
- steps: Array com 2-8 steps (geralmente 3-5)
- practicalExample: Exemplo concreto e prático em Ciência e Tecnologia
- finalVerifications: Lista de verificações finais (3-7 itens)
- assessmentCriteria: Critérios de avaliação (3-7 itens)
- crossCurricularConnections: Conexões interdisciplinares (2-5 itens)
- realWorldApplication: Aplicação prática em engenharia, ciências exatas ou tecnologia

## Campos Obrigatórios para cada step:
- stepNumber: Número sequencial (1, 2, 3...)
- title: Título claro e descritivo
- subSteps: Array com pelo menos 3-5 sub-passos detalhados
- verification: Como verificar conclusão do passo
- estimatedTime: Tempo estimado
- materials: Recursos necessários (calculadoras, software, equipamentos de laboratório, etc.)
- tips: Dica prática para estudantes de Ciência e Tecnologia
- learningObjective: Objetivo específico de aprendizagem
- commonMistakes: Erros comuns a evitar em cálculos, experimentos ou implementações`;
  }

  async loadMatrizReferencia(): Promise<MatrizReferencia> {
    console.log(`📄 Carregando dados de ${MATRIZ_JSON_PATH}...`);

    if (this.debug) {
      console.log(`🔍 [DEBUG] Verificando se arquivo existe...`);
    }

    try {
      const stats = await fs.stat(MATRIZ_JSON_PATH);
      if (this.debug) {
        console.log(`🔍 [DEBUG] Arquivo encontrado: ${(stats.size / 1024).toFixed(2)} KB`);
      }

      const jsonContent = await fs.readFile(MATRIZ_JSON_PATH, 'utf-8');
      const data = JSON.parse(jsonContent) as MatrizReferencia;

      console.log(`✅ Dados carregados: ${data.documento} - ${data.edicao}`);

      if (this.debug) {
        console.log(`🔍 [DEBUG] Ano: ${data.ano}`);
        console.log(`🔍 [DEBUG] Total competências: ${data.metadata.total_competencias}`);
        console.log(`🔍 [DEBUG] Total habilidades: ${data.metadata.total_habilidades}`);
        console.log(`🔍 [DEBUG] Domínios: ${data.estrutura.eixo_conceptual.dominios.length}`);
        console.log(`🔍 [DEBUG] Áreas: ${Object.keys(data.areas_conhecimento).length}`);
      }

      return data;
    } catch (error: any) {
      if (this.debug) {
        console.error(`🔍 [DEBUG] Erro detalhado:`, error);
      }
      throw new Error(`Erro ao carregar JSON da Matriz de Referência: ${error.message}`);
    }
  }

  async extractBCTDisciplinesFromPDF(): Promise<BCTCurriculumData> {
    console.log(`📄 Carregando dados do PDF: ${PDF_PATH}...`);

    if (this.debug) {
      console.log(`🔍 [DEBUG] Verificando se arquivo PDF existe...`);
    }

    try {
      const stats = await fs.stat(PDF_PATH);
      if (this.debug) {
        console.log(`🔍 [DEBUG] Arquivo PDF encontrado: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      }

      const pdfBuffer = await fs.readFile(PDF_PATH);
      const pdfData = await pdf(pdfBuffer);

      if (this.debug) {
        console.log(`🔍 [DEBUG] PDF processado: ${pdfData.numpages} páginas`);
        console.log(`🔍 [DEBUG] Tamanho do texto extraído: ${(pdfData.text.length / 1024).toFixed(2)} KB`);
      }

      // Extrair disciplinas usando processamento de texto e IA
      const disciplines = await this.extractDisciplinesFromPDFText(pdfData.text);

      const curriculumData: BCTCurriculumData = {
        courseName: "Bacharelado em Ciência e Tecnologia",
        courseCode: "BCT-ENEM",
        totalCredits: disciplines.reduce((sum, d) => sum + d.credits, 0),
        totalHours: disciplines.reduce((sum, d) => sum + d.hours, 0),
        disciplines
      };

      console.log(`✅ Dados extraídos: ${curriculumData.courseName} (${curriculumData.disciplines.length} disciplinas)`);

      if (this.debug) {
        console.log(`🔍 [DEBUG] Créditos totais: ${curriculumData.totalCredits}`);
        console.log(`🔍 [DEBUG] Horas totais: ${curriculumData.totalHours}`);
        console.log(`🔍 [DEBUG] Primeiras 5 disciplinas:`, curriculumData.disciplines.slice(0, 5).map(d => `${d.code} - ${d.name}`));
      }

      return curriculumData;
    } catch (error: any) {
      if (this.debug) {
        console.error(`🔍 [DEBUG] Erro detalhado:`, error);
      }
      throw new Error(`Erro ao processar PDF do BCT: ${error.message}`);
    }
  }

  async extractDisciplinesFromPDFText(pdfText: string): Promise<BCTDiscipline[]> {
    console.log('🔍 Extraindo disciplinas do texto do PDF...');

    // Primeiro, vamos identificar as seções relevantes no PDF
    const sections = this.identifyRelevantSections(pdfText);

    if (this.debug) {
      console.log(`🔍 [DEBUG] Seções identificadas: ${sections.length}`);
      sections.forEach((section, index) => {
        console.log(`🔍 [DEBUG] Seção ${index + 1}: ${section.title.substring(0, 50)}... (${section.content.length} chars)`);
      });
    }

    // Usar IA para extrair disciplinas das seções
    const disciplines = await this.extractDisciplinesWithAI(sections);

    if (this.debug) {
      console.log(`🔍 [DEBUG] Disciplinas extraídas: ${disciplines.length}`);
      disciplines.slice(0, 3).forEach((discipline, index) => {
        console.log(`🔍 [DEBUG] Disciplina ${index + 1}: ${discipline.code} - ${discipline.name}`);
      });
    }

    console.log(`✅ Extraídas ${disciplines.length} disciplinas do PDF`);
    return disciplines;
  }

  identifyRelevantSections(pdfText: string): Array<{ title: string, content: string }> {
    const sections: Array<{ title: string, content: string }> = [];

    // Dividir o texto em linhas
    const lines = pdfText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    let currentSection: { title: string, content: string } | null = null;
    let inDisciplineSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Identificar seções de disciplinas obrigatórias e optativas
      if (line.includes('DISCIPLINAS OBRIGATÓRIAS') ||
          line.includes('Disciplinas Obrigatórias') ||
          line.includes('OB)') ||
          line.includes('Obrigatórias')) {

        if (currentSection && currentSection.content.length > 100) {
          sections.push(currentSection);
        }

        currentSection = {
          title: 'Disciplinas Obrigatórias',
          content: ''
        };
        inDisciplineSection = true;
        continue;
      }

      if (line.includes('DISCIPLINAS OPTATIVAS') ||
          line.includes('Disciplinas Optativas') ||
          line.includes('OP') ||
          line.includes('Optativas')) {

        if (currentSection && currentSection.content.length > 100) {
          sections.push(currentSection);
        }

        currentSection = {
          title: 'Disciplinas Optativas',
          content: ''
        };
        inDisciplineSection = true;
        continue;
      }

      // Adicionar conteúdo à seção atual
      if (inDisciplineSection && currentSection) {
        // Verificar se a linha parece ser uma disciplina
        const disciplinePattern = /^[A-Z]{3}\s*\d{4}/; // Padrão como "BCJ 0001"

        if (disciplinePattern.test(line) ||
            line.includes('Créditos') ||
            line.includes('Teórica') ||
            line.includes('Prática') ||
            line.includes('Requisitos') ||
            line.includes('Ementa')) {
          currentSection.content += line + '\n';
        } else if (currentSection.content.length > 0) {
          // Se já tem conteúdo e esta linha não parece ser disciplina, adiciona mesmo assim
          currentSection.content += line + '\n';
        }
      }
    }

    // Adicionar a última seção
    if (currentSection && currentSection.content.length > 100) {
      sections.push(currentSection);
    }

    return sections;
  }

  async extractDisciplinesWithAI(sections: Array<{ title: string, content: string }>): Promise<BCTDiscipline[]> {
    const allDisciplines: BCTDiscipline[] = [];

    for (const section of sections) {
      try {
        console.log(`  🤖 Processando seção: ${section.title}...`);

        const prompt = `Extraia informações detalhadas das disciplinas da seção abaixo.

Título da seção: ${section.title}

Conteúdo da seção:
${section.content.substring(0, 8000)}${section.content.length > 8000 ? '...' : ''}

Para cada disciplina encontrada, extraia:
- Código (ex: "BCJ 0001", "BCM 0302")
- Nome completo da disciplina
- Número de créditos
- Carga horária total (em horas)
- Tipo ("mandatory" para obrigatórias, "optional" para optativas)
- Requisitos/pré-requisitos (se houver)
- Ementa/ementa (se disponível)
- Distribuição de carga horária (teórica, prática, extensão se houver)
- Semestre sugerido (se mencionado)

Retorne um JSON com este formato:
{
  "disciplines": [
    {
      "code": "BCJ 0001",
      "name": "Nome da Disciplina",
      "credits": 4,
      "hours": 60,
      "type": "mandatory",
      "prerequisites": "Requisitos se houver",
      "syllabus": "Ementa resumida",
      "semester": 1,
      "workload": {
        "theory": 30,
        "practice": 30,
        "extension": 0
      }
    }
  ]
}

IMPORTANTE:
- Use português
- Retorne APENAS o JSON, sem markdown
- Inclua todas as disciplinas encontradas na seção
- Se não encontrar informações específicas (como semestre), pode omitir o campo
- Para o tipo, use "mandatory" para disciplinas obrigatórias e "optional" para optativas`;

        const response = await this.makeAPIRequest(prompt, 'Você é um especialista em extrair informações de grades curriculares universitárias.');

        try {
          const result = JSON.parse(response) as { disciplines: BCTDiscipline[] };

          if (result.disciplines && Array.isArray(result.disciplines)) {
            allDisciplines.push(...result.disciplines);
            console.log(`  ✅ ${result.disciplines.length} disciplinas extraídas da seção ${section.title}`);
          }
        } catch (parseError) {
          console.warn(`  ⚠️ Erro ao parsear resposta da IA para seção ${section.title}`);
          if (this.debug) {
            console.warn(`🔍 [DEBUG] Resposta da IA:`, response.substring(0, 500));
          }
        }
      } catch (error: any) {
        console.warn(`  ⚠️ Erro ao processar seção ${section.title}: ${error.message}`);
      }
    }

    // Remover duplicatas baseadas no código
    const uniqueDisciplines = this.removeDuplicateDisciplines(allDisciplines);

    console.log(`✅ Total de disciplinas únicas extraídas: ${uniqueDisciplines.length}`);
    return uniqueDisciplines;
  }

  removeDuplicateDisciplines(disciplines: BCTDiscipline[]): BCTDiscipline[] {
    const seen = new Set<string>();
    return disciplines.filter(discipline => {
      const key = discipline.code.replace(/\s+/g, '').toUpperCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async extractDisciplinesFromPDF(): Promise<Array<{ code: string, name: string, content: string }>> {
    console.log('🔍 Extraindo disciplinas do PDF do BCT...');

    const bctData = await this.extractBCTDisciplinesFromPDF();
    const disciplines: Array<{ code: string, name: string, content: string }> = [];

    if (this.debug) {
      console.log(`🔍 [DEBUG] Processando ${bctData.disciplines.length} disciplinas do BCT`);
    }

    for (const discipline of bctData.disciplines) {
      // Pula disciplinas sem informações básicas
      if (!discipline.name || discipline.name.trim() === '') {
        if (this.debug) {
          console.log(`🔍 [DEBUG] Pulando disciplina ${discipline.code} - sem nome`);
        }
        continue;
      }

      // Monta o conteúdo da disciplina
      const contentParts: string[] = [];

      if (discipline.name) contentParts.push(`Nome: ${discipline.name}`);
      if (discipline.code) contentParts.push(`Código: ${discipline.code}`);
      if (discipline.syllabus) contentParts.push(`Ementa: ${discipline.syllabus}`);
      if (discipline.objectives) contentParts.push(`Objetivos: ${discipline.objectives}`);
      if (discipline.prerequisites) contentParts.push(`Pré-requisitos: ${discipline.prerequisites}`);
      if (discipline.credits) contentParts.push(`Créditos: ${discipline.credits}`);
      if (discipline.hours) contentParts.push(`Carga horária: ${discipline.hours} horas`);
      if (discipline.type) contentParts.push(`Tipo: ${discipline.type === 'mandatory' ? 'Obrigatória' : 'Optativa'}`);
      if (discipline.semester) contentParts.push(`Semestre: ${discipline.semestre}`);

      if (discipline.workload) {
        if (discipline.workload.theory) contentParts.push(`Teórica: ${discipline.workload.theory} horas`);
        if (discipline.workload.practice) contentParts.push(`Prática: ${discipline.workload.practice} horas`);
        if (discipline.workload.extension) contentParts.push(`Extensão: ${discipline.workload.extension} horas`);
      }

      const content = contentParts.join('\n\n');

      disciplines.push({
        code: discipline.code,
        name: discipline.name.trim(),
        content: content.trim()
      });
    }

    if (this.debug) {
      console.log(`🔍 [DEBUG] Disciplinas processadas do PDF: ${disciplines.length}`);
      if (disciplines.length > 0) {
        console.log(`🔍 [DEBUG] Primeiras 3 disciplinas:`, disciplines.slice(0, 3).map(d => `${d.code} - ${d.name}`));
      }
    }

    console.log(`✅ Processadas ${disciplines.length} disciplinas do PDF do BCT`);
    return disciplines;
  }

  async extractCompetenciasFromMatriz(): Promise<Array<{ code: string, name: string, content: string }>> {
    console.log('🔍 Extraindo competências da Matriz de Referência ENEM...');

    const matrizData = await this.loadMatrizReferencia();
    const competencias: Array<{ code: string, name: string, content: string }> = [];

    if (this.debug) {
      console.log(`🔍 [DEBUG] Processando competências da matriz`);
    }

    // Extrair competências gerais do eixo conceptual
    for (const dominio of matrizData.estrutura.eixo_conceptual.dominios) {
      for (const tema of dominio.temas) {
        for (const competencia of tema.competencias) {
          const contentParts: string[] = [];

          contentParts.push(`Tipo: Competência Geral`);
          contentParts.push(`Domínio: ${dominio.titulo}`);
          contentParts.push(`Tema: ${tema.titulo}`);
          contentParts.push(`Descrição: ${competencia.descricao}`);

          if (competencia.habilidades && competencia.habilidades.length > 0) {
            contentParts.push(`Habilidades (${competencia.habilidades.length}):`);
            competencia.habilidades.forEach((habilidade, index) => {
              contentParts.push(`  ${index + 1}. ${habilidade.descricao}`);
            });
          }

          const content = contentParts.join('\n\n');

          competencias.push({
            code: competencia.id,
            name: `Competência ${competencia.id} - ${tema.titulo}`,
            content: content.trim()
          });
        }
      }
    }

    // Extrair competências específicas das áreas de conhecimento
    const areasConhecimento = [
      { nome: 'Linguagens', dados: matrizData.areas_conhecimento.Linguagens },
      { nome: 'Matemática', dados: matrizData.areas_conhecimento.Matemática },
      { nome: 'Ciências_Humanas', dados: matrizData.areas_conhecimento.Ciências_Humanas }
    ];

    // Adicionar subáreas de Ciências da Natureza
    const subareasNatureza = [
      { nome: 'Física', dados: matrizData.areas_conhecimento.Ciências_da_Natureza.subareas.Física },
      { nome: 'Química', dados: matrizData.areas_conhecimento.Ciências_da_Natureza.subareas.Química },
      { nome: 'Biologia', dados: matrizData.areas_conhecimento.Ciências_da_Natureza.subareas.Biologia }
    ];

    areasConhecimento.push(...subareasNatureza.map(s => ({
      nome: `Ciências_da_Natureza_${s.nome}`,
      dados: s.dados
    })));

    for (const area of areasConhecimento) {
      if (area.dados && area.dados.competencias_especificas) {
        for (const competencia of area.dados.competencias_especificas) {
          const contentParts: string[] = [];

          contentParts.push(`Tipo: Competência Específica`);
          contentParts.push(`Área: ${area.nome}`);
          contentParts.push(`Descrição: ${competencia.descricao}`);

          if (competencia.habilidades && competencia.habilidades.length > 0) {
            contentParts.push(`Habilidades (${competencia.habilidades.length}):`);
            competencia.habilidades.forEach((habilidade, index) => {
              contentParts.push(`  ${index + 1}. ${habilidade}`);
            });
          }

          const content = contentParts.join('\n\n');

          competencias.push({
            code: competencia.id,
            name: `Competência ${competencia.id} - ${area.nome}`,
            content: content.trim()
          });
        }
      }
    }

    if (this.debug) {
      console.log(`🔍 [DEBUG] Competências processadas: ${competencias.length}`);
      if (competencias.length > 0) {
        console.log(`🔍 [DEBUG] Primeiras 3 competências:`, competencias.slice(0, 3).map(c => `${c.code} - ${c.name}`));
      }
    }

    console.log(`✅ Processadas ${competencias.length} competências da matriz`);
    return competencias;
  }

  async generateCurriculumJSON(competencia: { code: string, name: string, content: string }): Promise<CurriculumJSON> {
    console.log(`📝 Gerando JSON para ${competencia.code} - ${competencia.name}...`);

    if (this.debug) {
      console.log(`🔍 [DEBUG] Tamanho do conteúdo da competência: ${competencia.content.length} caracteres`);
    }

    const schemaExample = await this.loadSchemaExample();

    // Passo 1: Criar estrutura básica (metadata, área, disciplina)
    const basicStructure = await this.generateBasicStructure(competencia, schemaExample);

    // Passo 2: Identificar tópicos principais
    const mainTopics = await this.identifyMainTopics(competencia, basicStructure);

    // Passo 3: Para cada tópico principal, gerar estrutura detalhada (em paralelo)
    const detailedTopics = await Promise.all(
      mainTopics.map(async (mainTopic, i) => {
        console.log(`  📑 [${i + 1}/${mainTopics.length}] Processando tópico: ${mainTopic.name}`);

        const detailedTopic = await this.generateDetailedMainTopic(
          competencia,
          mainTopic,
          basicStructure,
          i + 1
        );

        if (this.debug) {
          console.log(`🔍 [DEBUG] Tópico ${mainTopic.name} processado com ${detailedTopic.atomicTopics.length} tópicos atômicos`);
        }

        return detailedTopic;
      })
    );

    if (basicStructure?.curriculumData?.areas?.[0]?.disciplines?.[0]?.mainTopics) {
      basicStructure.curriculumData.areas[0].disciplines[0].mainTopics.push(...detailedTopics);
    } else {
      console.error('❌ Estrutura básica inválida: areas[0] ou disciplines[0] não encontrados');
      throw new Error('Estrutura básica inválida retornada pela API');
    }

    // Recalcula totalSkills
    this.recalculateTotalSkills(basicStructure);

    return basicStructure;
  }

  async generateBasicStructure(
    competencia: { code: string, name: string, content: string },
    schemaExample: CurriculumJSON
  ): Promise<CurriculumJSON> {
    console.log(`  🏗️  Criando estrutura básica...`);

    const prompt = `Você é um especialista em currículos educacionais da ENEM, especificamente em competências e habilidades do Exame Nacional do Ensino Médio.

Tarefa: Criar APENAS a estrutura básica (metadata, área e disciplina) para a competência abaixo.

Competência: ${competencia.code} - ${competencia.name}

Conteúdo da competência:
${competencia.content.substring(0, 2000)}${competencia.content.length > 2000 ? '...' : ''}

Baseado no schema de exemplo, retorne um JSON com:
1. formatVersion, exportDate, appVersion
2. curriculumData.metadata (com baseOn referenciando "${competencia.code}")
3. curriculumData.areas[0] com:
   - id, name, description apropriados para ENEM - Matriz de Referência 2026
   - disciplines[0] com:
     - id (ex: "10.1"), name, description
     - mainTopics: [] (vazio por enquanto)

IMPORTANTE:
- Use português
- IDs sequenciais (ex: área "10", disciplina "10.1")
- baseOn: "Matriz de Referência ENEM 2026 - ${competencia.code}"
- institution: "INEP - Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira"
- Retorne APENAS o JSON, sem markdown`;

    const response = await this.makeAPIRequest(prompt, 'Você é um especialista em criar estruturas de currículo educacional.');

    const structure = JSON.parse(response) as CurriculumJSON;

    // Valida estrutura mínima
    if (!structure?.curriculumData?.areas || !Array.isArray(structure.curriculumData.areas) || structure.curriculumData.areas.length === 0) {
      throw new Error('Estrutura JSON inválida: áreas não encontradas ou vazias na resposta da API');
    }

    if (!structure.curriculumData.areas[0]?.disciplines || !Array.isArray(structure.curriculumData.areas[0].disciplines) || structure.curriculumData.areas[0].disciplines.length === 0) {
      throw new Error('Estrutura JSON inválida: disciplinas não encontradas ou vazias na resposta da API');
    }

    if (!structure.curriculumData.areas[0].disciplines[0]?.mainTopics) {
      structure.curriculumData.areas[0].disciplines[0].mainTopics = [];
    }

    structure.exportDate = new Date().toISOString();
    structure.curriculumData.metadata.lastUpdated = new Date().toISOString().split('T')[0];

    return structure;
  }

  async identifyMainTopics(
    competencia: { code: string, name: string, content: string },
    structure: CurriculumJSON
  ): Promise<Array<{ name: string, description: string }>> {
    console.log(`  🔍 Identificando tópicos principais...`);

    const prompt = `Analise o conteúdo da competência ENEM abaixo e identifique os TÓPICOS PRINCIPAIS (MainTopics).

Competência: ${competencia.code} - ${competencia.name}

Conteúdo completo:
${competencia.content}

Para cada tópico principal, identifique:
- Nome do tópico (ex: "Análise Crítica", "Compreensão de Processos", "Aplicação de Conhecimentos", "Resolução de Problemas")
- Descrição breve (1-2 frases)

Retorne um JSON com este formato:
{
  "mainTopics": [
    {
      "name": "Nome do Tópico 1",
      "description": "Descrição do tópico 1"
    },
    {
      "name": "Nome do Tópico 2",
      "description": "Descrição do tópico 2"
    }
  ]
}

IMPORTANTE:
- Identifique 2-6 tópicos principais relevantes para a competência ENEM
- Cada tópico deve ser um aspecto significativo da competência
- Use português
- Retorne APENAS o JSON, sem markdown`;

    const response = await this.makeAPIRequest(prompt, 'Você é um especialista em análise de competências ENEM.');

    let result;
    try {
      result = JSON.parse(response) as { mainTopics: Array<{ name: string, description: string }> };
    } catch (error) {
      console.error('❌ Erro ao processar resposta da API para identificar tópicos principais:', error);
      throw new Error(`Resposta da API inválida ao identificar tópicos principais: ${error}`);
    }

    if (!result?.mainTopics || !Array.isArray(result.mainTopics)) {
      console.error('❌ Estrutura de tópicos principais inválida:', result);
      throw new Error('Estrutura de tópicos principais inválida na resposta da API');
    }

    console.log(`  ✅ Identificados ${result.mainTopics.length} tópicos principais`);

    return result.mainTopics;
  }

  async generateDetailedMainTopic(
    competencia: { code: string, name: string, content: string },
    mainTopic: { name: string, description: string },
    structure: CurriculumJSON,
    topicIndex: number
  ): Promise<MainTopic> {
    if (!structure?.curriculumData?.areas?.[0]?.disciplines?.[0]?.id) {
      throw new Error('Estrutura inválida: não foi possível encontrar ID da competência');
    }
    const topicId = `${structure.curriculumData.areas[0].disciplines[0].id}.${topicIndex}`;

    // Primeiro, identifica tópicos atômicos
    const atomicTopics = await this.identifyAtomicTopics(competencia, mainTopic, topicId);

    // Para cada tópico atômico, gera estrutura detalhada (em paralelo)
    const detailedAtomicTopics = await Promise.all(
      atomicTopics.map(async (atomicTopic, i) => {
        const atomicId = `${topicId}.${i + 1}`;

        if (this.debug) {
          console.log(`    🔬 [${i + 1}/${atomicTopics.length}] Processando tópico atômico: ${atomicTopic.name}`);
        }

        return await this.generateDetailedAtomicTopic(
          competencia,
          mainTopic,
          atomicTopic,
          atomicId
        );
      })
    );

    // Calcula totalSkills do mainTopic
    const totalSkills = detailedAtomicTopics.reduce((sum, at) => {
      const conceptSkills = at.individualConcepts?.reduce((s, ic) => s + ic.specificSkills.length, 0) || 0;
      const directSkills = at.specificSkills?.length || 0;
      return sum + conceptSkills + directSkills;
    }, 0);

    return {
      id: topicId,
      name: mainTopic.name,
      description: mainTopic.description,
      totalSkills,
      atomicTopics: detailedAtomicTopics
    };
  }

  async identifyAtomicTopics(
    competencia: { code: string, name: string, content: string },
    mainTopic: { name: string, description: string },
    topicId: string
  ): Promise<Array<{ name: string, description: string }>> {
    const prompt = `Analise o tópico principal abaixo e identifique os TÓPICOS ATÔMICOS (subtópicos específicos).

Competência: ${competencia.code} - ${competencia.name}
Tópico Principal: ${mainTopic.name}
Descrição: ${mainTopic.description}

Conteúdo relevante da competência:
${competencia.content.substring(0, 3000)}${competencia.content.length > 3000 ? '...' : ''}

Para cada tópico atômico, identifique:
- Nome específico (ex: "Análise Crítica de Fontes", "Compreensão de Conceitos", "Aplicação Prática", "Avaliação de Argumentos")
- Descrição breve

Retorne JSON:
{
  "atomicTopics": [
    {
      "name": "Nome do Tópico Atômico 1",
      "description": "Descrição"
    }
  ]
}

IMPORTANTE:
- Identifique 2-5 tópicos atômicos por tópico principal
- Cada tópico atômico deve ser uma habilidade específica e desenvolvível da competência ENEM
- Use português
- Retorne APENAS JSON, sem markdown`;

    const response = await this.makeAPIRequest(prompt, 'Você é um especialista em decomposição de competências ENEM.');

    let result;
    try {
      result = JSON.parse(response) as { atomicTopics: Array<{ name: string, description: string }> };
    } catch (error) {
      console.error('❌ Erro ao processar resposta da API para identificar tópicos atômicos:', error);
      throw new Error(`Resposta da API inválida ao identificar tópicos atômicos: ${error}`);
    }

    if (!result?.atomicTopics || !Array.isArray(result.atomicTopics)) {
      console.error('❌ Estrutura de tópicos atômicos inválida:', result);
      throw new Error('Estrutura de tópicos atômicos inválida na resposta da API');
    }

    return result.atomicTopics;
  }

  async generateDetailedAtomicTopic(
    competencia: { code: string, name: string, content: string },
    mainTopic: { name: string, description: string },
    atomicTopic: { name: string, description: string },
    atomicId: string
  ): Promise<AtomicTopic> {
    const prompt = `Crie a estrutura detalhada para um tópico atômico específico de competência ENEM.

Competência: ${competencia.code} - ${competencia.name}
Tópico Principal: ${mainTopic.name}
Tópico Atômico: ${atomicTopic.name}
Descrição: ${atomicTopic.description}

Conteúdo relevante:
${competencia.content.substring(0, 4000)}${competencia.content.length > 4000 ? '...' : ''}

Crie:
1. individualConcepts (2-4 conceitos individuais)
   - Cada conceito com name, description
   - Cada conceito com specificSkills (2-5 habilidades)
     - Cada skill com: id, name, description, atomicExpansion: {}

2. OU specificSkills diretas (se não houver conceitos intermediários)
   - 3-8 habilidades com: id, name, description, atomicExpansion: {}

Retorne JSON:
{
  "individualConcepts": [
    {
      "id": "${atomicId}.1",
      "name": "Nome do Conceito",
      "description": "Descrição",
      "specificSkills": [
        {
          "id": "${atomicId}.1.1",
          "name": "Nome da Habilidade",
          "description": "Descrição detalhada",
          "atomicExpansion": {},
          "estimatedTime": "X horas",
          "difficulty": "beginner|intermediate|advanced",
          "status": "not_started",
          "prerequisites": []
        }
      ]
    }
  ]
}

OU se não houver conceitos intermediários:
{
  "specificSkills": [
    {
      "id": "${atomicId}.1",
      "name": "Nome da Habilidade",
      "description": "Descrição detalhada",
      "atomicExpansion": {},
      "estimatedTime": "X horas",
      "difficulty": "beginner|intermediate|advanced",
      "status": "not_started",
      "prerequisites": []
    }
  ]
}

IMPORTANTE:
- IDs sequenciais (${atomicId}.1, ${atomicId}.1.1, etc.)
- Descrições detalhadas e específicas para competências ENEM
- Habilidades práticas e aplicáveis (ex: "Analisar criticamente textos", "Interpretar dados", "Resolver problemas matemáticos", "Compreender fenômenos naturais")
- Use português
- Retorne APENAS JSON, sem markdown`;

    const response = await this.makeAPIRequest(prompt, 'Você é um especialista em estruturar competências ENEM em níveis atômicos.');

    let result;
    try {
      result = JSON.parse(response) as { individualConcepts?: IndividualConcept[], specificSkills?: SpecificSkill[] };
    } catch (error) {
      console.error('❌ Erro ao processar resposta da API para gerar tópico atômico detalhado:', error);
      throw new Error(`Resposta da API inválida ao gerar tópico atômico detalhado: ${error}`);
    }

    if (!result || (!result.individualConcepts && !result.specificSkills)) {
      console.error('❌ Estrutura de tópico atômico inválida:', result);
      throw new Error('Estrutura de tópico atômico inválida na resposta da API');
    }

    return {
      id: atomicId,
      name: atomicTopic.name,
      description: atomicTopic.description,
      individualConcepts: result.individualConcepts,
      specificSkills: result.specificSkills
    };
  }

  async makeAPIRequest(prompt: string, systemMessage: string): Promise<string> {
    let attempts = 0;
    while (attempts < this.maxRetries) {
      try {
        if (this.debug && attempts === 0) {
          console.log(`🔍 [DEBUG] Fazendo requisição (prompt: ${prompt.length} chars)`);
        }

        const requestConfig: any = {
          model: this.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
        };

        if (this.supportsJsonMode) {
          requestConfig.response_format = { type: 'json_object' };
        } else {
          requestConfig.messages[1].content = prompt + '\n\nIMPORTANTE: Retorne APENAS um JSON válido, sem markdown, sem explicações.';
        }

        const startTime = Date.now();
        const response = await this.openai.chat.completions.create(requestConfig);
        const duration = Date.now() - startTime;

        if (this.debug) {
          console.log(`🔍 [DEBUG] Resposta em ${duration}ms, tokens: ${response.usage?.total_tokens || 'N/A'}`);
        }

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Resposta vazia da API');
        }

        let jsonContent = content.trim();
        if (jsonContent.startsWith('```json')) {
          jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonContent.startsWith('```')) {
          jsonContent = jsonContent.replace(/```\n?/g, '');
        }

        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }

        return jsonContent;
      } catch (error: any) {
        attempts++;
        if (attempts >= this.maxRetries) {
          throw error;
        }
        const delay = 1000 * attempts;
        if (this.debug) {
          console.warn(`🔍 [DEBUG] Tentativa ${attempts}/${this.maxRetries} falhou, retry em ${delay}ms...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Número máximo de tentativas excedido');
  }

  recalculateTotalSkills(curriculum: CurriculumJSON): void {
    if (!curriculum?.curriculumData?.areas || !Array.isArray(curriculum.curriculumData.areas)) {
      console.warn('⚠️ Estrutura inválida: areas não encontrado ou não é um array');
      return;
    }

    curriculum.curriculumData.areas.forEach(area => {
      let areaTotal = 0;

      if (!area.disciplines || !Array.isArray(area.disciplines)) {
        console.warn('⚠️ Área sem disciplinas válidas, pulando...');
        return;
      }

      area.disciplines.forEach(discipline => {
        let disciplineTotal = 0;

        if (!discipline.mainTopics || !Array.isArray(discipline.mainTopics)) {
          console.warn('⚠️ Disciplina sem mainTopics válidos, pulando...');
          return;
        }

        discipline.mainTopics.forEach(topic => {
          let topicTotal = 0;

          if (!topic.atomicTopics || !Array.isArray(topic.atomicTopics)) {
            console.warn('⚠️ Tópico sem atomicTopics válidos, pulando...');
            return;
          }

          topic.atomicTopics.forEach(atomicTopic => {
            const conceptSkills = atomicTopic.individualConcepts?.reduce(
              (sum, concept) => sum + concept.specificSkills.length, 0
            ) || 0;
            const directSkills = atomicTopic.specificSkills?.length || 0;
            topicTotal += conceptSkills + directSkills;
          });

          topic.totalSkills = topicTotal;
          disciplineTotal += topicTotal;
        });

        discipline.totalSkills = disciplineTotal;
        areaTotal += disciplineTotal;
      });

      area.totalSkills = areaTotal;
    });

    const grandTotal = curriculum.curriculumData.areas.reduce(
      (sum, area) => sum + area.totalSkills, 0
    );
    curriculum.curriculumData.metadata.totalAtomicSkills = grandTotal;
  }

  async expandAtomicSkills(curriculum: CurriculumJSON): Promise<CurriculumJSON> {
    console.log('🔧 Expandindo habilidades atômicas...');

    const skillsToExpand: Array<{ path: string[], skill: SpecificSkill }> = [];

    const collectSkills = (
      area: Area,
      discipline: Discipline,
      mainTopic: MainTopic,
      atomicTopic: AtomicTopic,
      individualConcept?: IndividualConcept
    ) => {
      const needsExpansion = (expansion: AtomicExpansion | {} | undefined): boolean => {
        if (!expansion || Object.keys(expansion).length === 0) {
          return true;
        }
        if ('steps' in expansion && Array.isArray(expansion.steps)) {
          return expansion.steps.length < 3;
        }
        return true;
      };

      if (atomicTopic.specificSkills) {
        atomicTopic.specificSkills.forEach(skill => {
          if (needsExpansion(skill.atomicExpansion)) {
            skillsToExpand.push({
              path: [area.name, discipline.name, mainTopic.name, atomicTopic.name, skill.name],
              skill
            });
          }
        });
      }

      if (atomicTopic.individualConcepts) {
        atomicTopic.individualConcepts.forEach(concept => {
          concept.specificSkills.forEach(skill => {
            if (needsExpansion(skill.atomicExpansion)) {
              skillsToExpand.push({
                path: [area.name, discipline.name, mainTopic.name, atomicTopic.name, concept.name, skill.name],
                skill
              });
            }
          });
        });
      }
    };

    curriculum.curriculumData.areas.forEach(area => {
      area.disciplines.forEach(discipline => {
        discipline.mainTopics.forEach(mainTopic => {
          mainTopic.atomicTopics.forEach(atomicTopic => {
            collectSkills(area, discipline, mainTopic, atomicTopic);
          });
        });
      });
    });

    console.log(`📊 Encontradas ${skillsToExpand.length} habilidades para expandir`);

    if (this.debug) {
      console.log(`🔍 [DEBUG] Distribuição de habilidades por área:`);
      const byArea = new Map<string, number>();
      skillsToExpand.forEach(({ path }) => {
        const area = path[0];
        byArea.set(area, (byArea.get(area) || 0) + 1);
      });
      byArea.forEach((count, area) => {
        console.log(`🔍 [DEBUG]   ${area}: ${count} habilidades`);
      });
    }

    // Processamento paralelo com controle de concorrência
    await this.processInParallel(
      skillsToExpand,
      async ({ path, skill }, index, total) => {
        const progress = `[${index + 1}/${total}]`;
        console.log(`🔄 ${progress} Expandindo: ${path.join(' > ')}`);

        try {
          const startTime = Date.now();
          const expanded = await this.expandSingleSkill(skill, path);
          const duration = Date.now() - startTime;

          skill.atomicExpansion = expanded;

          if (this.debug) {
            const stepsCount = 'steps' in expanded && Array.isArray(expanded.steps) ? expanded.steps.length : 0;
            console.log(`✅ ${progress} Concluído em ${duration}ms (${stepsCount} steps)`);
          }
        } catch (error: any) {
          console.error(`❌ ${progress} Erro ao expandir habilidade ${skill.name}:`, error.message);
          if (this.debug) {
            console.error(`🔍 [DEBUG] Erro completo:`, error);
          }
        }
      },
      MAX_CONCURRENT_REQUESTS
    );

    return curriculum;
  }

  async processInParallel<T>(
    items: T[],
    processor: (item: T, index: number, total: number) => Promise<void>,
    concurrency: number
  ): Promise<void> {
    if (items.length === 0) return;

    const executing = new Set<Promise<void>>();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Se atingiu o limite de concorrência, espera uma promise terminar
      while (executing.size >= concurrency) {
        await Promise.race(executing);
        // Remove promises já resolvidas do Set
        // Isso é feito automaticamente quando a promise resolve no .finally abaixo
      }

      const promise = processor(item, i + 1, items.length)
        .catch(() => {
          // Erro já foi logado no processor
        })
        .finally(() => {
          executing.delete(promise);
        });

      executing.add(promise);
    }

    // Espera todas as promises restantes terminarem
    await Promise.all(Array.from(executing));
  }

  async expandSingleSkill(skill: SpecificSkill, path: string[]): Promise<AtomicExpansion> {
    const prompt = `${this.atomicExpandPrompt}

Habilidade específica a expandir:
- Nome: ${skill.name}
- Descrição: ${skill.description || 'Sem descrição'}
- ID: ${skill.id}
- Contexto: ${path.join(' > ')}

Crie uma expansão atômica completa seguindo TODAS as diretrizes acima. Retorne APENAS o JSON da atomicExpansion, sem markdown, sem explicações.

Formato esperado:
{
  "steps": [...],
  "practicalExample": "...",
  "finalVerifications": [...],
  "assessmentCriteria": [...],
  "crossCurricularConnections": [...],
  "realWorldApplication": "..."
}`;

    let attempts = 0;
    while (attempts < this.maxRetries) {
      try {
        const requestConfig: any = {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em criar planos de aprendizado detalhados e estruturados. Sempre retorne JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
        };

        if (this.supportsJsonMode) {
          requestConfig.response_format = { type: 'json_object' };
        }

        const response = await this.openai.chat.completions.create(requestConfig);

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Resposta vazia da API');
        }

        let jsonContent = content.trim();
        if (jsonContent.startsWith('```json')) {
          jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonContent.startsWith('```')) {
          jsonContent = jsonContent.replace(/```\n?/g, '');
        }

        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }

        const expansion = JSON.parse(jsonContent) as AtomicExpansion;
        return expansion;
      } catch (error: any) {
        attempts++;
        if (attempts >= this.maxRetries) {
          console.error(`Erro ao expandir habilidade após ${this.maxRetries} tentativas:`, error);
          return {
            steps: [],
            practicalExample: '',
            finalVerifications: [],
            assessmentCriteria: [],
            crossCurricularConnections: [],
            realWorldApplication: ''
          };
        }
        console.warn(`Tentativa ${attempts}/${this.maxRetries} falhou, tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    return {
      steps: [],
      practicalExample: '',
      finalVerifications: [],
      assessmentCriteria: [],
      crossCurricularConnections: [],
      realWorldApplication: ''
    };
  }

  async saveCurriculumJSON(curriculum: CurriculumJSON, disciplineCode: string, disciplineName: string): Promise<string> {
    const filename = `${disciplineCode} - ${disciplineName}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);

    await fs.writeFile(filepath, JSON.stringify(curriculum, null, 2), 'utf-8');
    console.log(`✓ Arquivo salvo: ${filename}`);

    return filepath;
  }

  async processAllCompetencias(): Promise<string[]> {
    console.log('🚀 === Iniciando processamento da Matriz de Referência ENEM 2026 ===\n');

    const overallStartTime = Date.now();

    // Garante que o diretório de saída existe
    try {
      await fs.mkdir(OUTPUT_DIR, { recursive: true });
      console.log(`📁 Diretório de saída: ${OUTPUT_DIR}`);
    } catch (error) {
      // Diretório já existe, ok
    }

    // Carrega checkpoint
    await this.loadCheckpoint();

    if (this.debug) {
      console.log(`🔍 [DEBUG] Carregando recursos...`);
    }

    await this.loadPrompt();
    await this.loadSchemaExample();
    await this.loadValidationSchema();

    if (this.debug) {
      console.log(`🔍 [DEBUG] Prompt carregado: ${this.atomicExpandPrompt.length} caracteres`);
      console.log(`🔍 [DEBUG] Schema exemplo carregado`);
      console.log(`🔍 [DEBUG] Schema de validação carregado: ${this.validationSchema ? 'sim' : 'não'}`);
    }

    const competencias = await this.extractCompetenciasFromMatriz();

    if (competencias.length === 0) {
      throw new Error('Nenhuma competência encontrada na matriz');
    }

    // Filtra competências já processadas
    const competenciasToProcess: Array<{ code: string, name: string, content: string, index: number }> = [];
    for (let i = 0; i < competencias.length; i++) {
      const competencia = competencias[i];
      const isProcessed = await this.isDisciplineProcessed(competencia.code);
      if (!isProcessed) {
        competenciasToProcess.push({ ...competencia, index: i });
      } else {
        console.log(`⏭️  [${i + 1}/${competencias.length}] ${competencia.code} já processado, pulando...`);
      }
    }

    if (competenciasToProcess.length === 0) {
      console.log(`\n✅ Todas as competências já foram processadas!`);
      return [];
    }

    console.log(`\n📊 ${competenciasToProcess.length} competência(s) para processar (${competencias.length - competenciasToProcess.length} já processada(s))`);

    // Atualiza checkpoint com total
    if (!this.checkpoint) {
      this.checkpoint = {
        processedDisciplines: [],
        lastUpdate: new Date().toISOString(),
        totalDisciplines: competencias.length
      };
    } else {
      this.checkpoint.totalDisciplines = competencias.length;
    }
    await this.saveCheckpoint(this.checkpoint);

    const outputFiles: string[] = [];
    const errors: Array<{ code: string, error: string }> = [];

    // Processa competências em paralelo com controle de concorrência
    await this.processInParallel(
      competenciasToProcess,
      async (competencia, localIndex, total) => {
        const globalIndex = competencia.index + 1;
        const competenciaStartTime = Date.now();
        console.log(`\n📚 [${localIndex}/${total}] (${globalIndex}/${competencias.length}) Processando ${competencia.code}...`);

        try {
          let curriculum = await this.generateCurriculumJSON(competencia);
          curriculum = await this.expandAtomicSkills(curriculum);
          const filepath = await this.saveCurriculumJSON(curriculum, competencia.code, competencia.name);
          outputFiles.push(filepath);
          await this.markDisciplineAsProcessed(competencia.code);

          const competenciaDuration = Date.now() - competenciaStartTime;
          console.log(`✅ ${competencia.code} concluído em ${(competenciaDuration / 1000).toFixed(1)}s`);

          if (this.debug) {
            const totalSkills = curriculum.curriculumData.metadata.totalAtomicSkills;
            console.log(`🔍 [DEBUG] Total de skills: ${totalSkills}`);
          }
        } catch (error: any) {
          const errorMsg = error.message || String(error);
          console.error(`❌ Erro ao processar ${competencia.code}:`, errorMsg);
          errors.push({ code: competencia.code, error: errorMsg });

          if (this.debug) {
            console.error(`🔍 [DEBUG] Stack trace:`, error.stack);
          }
        }
      },
      Math.max(1, Math.floor(MAX_CONCURRENT_REQUESTS / 3)) // Menos concorrência para competências completas
    );

    const overallDuration = Date.now() - overallStartTime;
    console.log(`\n🎉 === Processamento concluído ===`);
    console.log(`✅ ${outputFiles.length} arquivo(s) gerado(s) com sucesso`);
    if (errors.length > 0) {
      console.log(`⚠️  ${errors.length} erro(s) encontrado(s):`);
      errors.forEach(({ code, error }) => {
        console.log(`   - ${code}: ${error}`);
      });
    }
    console.log(`⏱️  Tempo total: ${(overallDuration / 1000 / 60).toFixed(1)} minutos`);

    if (this.debug) {
      console.log(`\n🔍 [DEBUG] Estatísticas finais:`);
      console.log(`  - Competências processadas: ${outputFiles.length}`);
      console.log(`  - Competências com erro: ${errors.length}`);
      console.log(`  - Taxa de sucesso: ${((outputFiles.length / competenciasToProcess.length) * 100).toFixed(1)}%`);
      if (competenciasToProcess.length > 0) {
        console.log(`  - Tempo médio por competência: ${(overallDuration / competenciasToProcess.length / 1000).toFixed(1)}s`);
      }
    }

    return outputFiles;
  }
}

async function main() {
  try {
    const processor = new CatalogProcessor();
    const files = await processor.processAllCompetencias();
    console.log('\nArquivos gerados:');
    files.forEach(file => console.log(`  - ${file}`));
  } catch (error) {
    console.error('Erro fatal:', error);
    process.exit(1);
  }
}

const isDirectExecution = process.argv[1]?.includes('process-catalog') ||
  process.argv[1]?.endsWith('process-catalog.ts') ||
  process.argv[1]?.endsWith('process-catalog.js');

if (isDirectExecution) {
  main();
}

export { CatalogProcessor };

