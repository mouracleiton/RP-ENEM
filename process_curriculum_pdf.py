#!/usr/bin/env python3
"""
Script para processar PDF de grade curricular e gerar JSON estruturado
com 6 níveis de atomicidade usando IA.
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
import argparse
import re

try:
    import PyPDF2
    from openai import OpenAI
except ImportError:
    print("Erro: Dependências não instaladas. Execute: pip install -r requirements.txt")
    sys.exit(1)


# Prompt para Atomic Expand - Integrado diretamente no script
ATOMIC_EXPAND_PROMPT = """# Prompt para Atomic Expand em Currículos JSON

## Objetivo
Expandir elementos `specificSkills` em arquivos JSON de currículo educacional com expansões atômicas detalhadas (`atomicExpansion`), transformando habilidades descritivas em passos de aprendizado estruturados e acionáveis.

## Quando Fazer Atomic Expand

Faça atomic expand quando:
- Um `specificSkill` não possui `atomicExpansion`
- Um `atomicExpansion` existe mas está incompleto (faltam campos importantes)
- Um `atomicExpansion` tem poucos detalhes ou subSteps insuficientes
- Há descrições que mencionam tópicos mas não têm expansões correspondentes

## Estrutura Esperada

Cada `atomicExpansion` deve conter:
- steps: Array com 2-8 steps (geralmente 3-5)
- practicalExample: Exemplo concreto e prático
- finalVerifications: Lista de verificações finais (3-7 itens)
- assessmentCriteria: Critérios de avaliação (3-7 itens)
- crossCurricularConnections: Conexões interdisciplinares (2-5 itens)
- realWorldApplication: Aplicação prática no mundo real

## Campos Obrigatórios

### Para cada `step`:
- ✅ `stepNumber`: Número sequencial (1, 2, 3...)
- ✅ `title`: Título claro e descritivo
- ✅ `subSteps`: Array com pelo menos 3-5 sub-passos detalhados
- ✅ `verification`: Como verificar conclusão do passo
- ✅ `estimatedTime`: Tempo estimado
- ✅ `materials`: Recursos necessários
- ✅ `tips`: Dica prática
- ✅ `learningObjective`: Objetivo específico
- ✅ `commonMistakes`: Erros comuns a evitar

### Para `atomicExpansion`:
- ✅ `steps`: Array com 2-8 steps (geralmente 3-5)
- ✅ `practicalExample`: Exemplo concreto e prático
- ✅ `finalVerifications`: Lista de verificações finais (3-7 itens)
- ✅ `assessmentCriteria`: Critérios de avaliação (3-7 itens)
- ✅ `crossCurricularConnections`: Conexões interdisciplinares (2-5 itens)
- ✅ `realWorldApplication`: Aplicação prática no mundo real

## Diretrizes de Expansão

### 1. SubSteps Detalhados
- Cada `subStep` deve ser uma ação específica e acionável
- Use verbos de ação (implementar, analisar, compreender, testar)
- Inclua detalhes técnicos relevantes
- Adicione 5-8 subSteps por step quando apropriado

### 2. Progressão Lógica
- Step 1: Compreensão conceitual/fundamentos
- Step 2: Implementação/prática básica
- Step 3+: Implementação avançada, análise, otimização, validação
- Cada step deve construir sobre os anteriores

### 3. Exemplos Práticos
- Use exemplos concretos com valores específicos
- Mostre o processo passo a passo
- Inclua casos de uso reais
- Demonstre resultados esperados

### 4. Verificações e Avaliação
- `verification` (por step): Como o estudante sabe que completou o passo
- `finalVerifications`: Lista abrangente de verificações finais
- `assessmentCriteria`: Como avaliar o domínio da habilidade

### 5. Conexões e Aplicações
- `crossCurricularConnections`: Relacione com outras disciplinas/áreas
- `realWorldApplication`: Mostre onde e como é usado na prática
- `tips`: Dicas práticas baseadas em experiência

## Padrões de Linguagem

- Use português claro e direto
- Verbos de ação no infinitivo ou imperativo
- Seja específico e técnico quando apropriado
- Evite jargão desnecessário, mas use terminologia técnica correta
- Mantenha consistência com o resto do currículo

## Exemplo de Prompt para IA

Expanda atomicamente, adicionando ou completando atomicExpansion para todos os specificSkills que:
1. Não possuem atomicExpansion
2. Têm atomicExpansion incompleta (faltam campos obrigatórios)
3. Têm expansões muito simples (menos de 3 steps ou subSteps insuficientes)

Para cada expansão, garanta:
- 3-5 steps bem estruturados com progressão lógica
- Cada step com todos os campos obrigatórios (title, subSteps, verification, estimatedTime, materials, tips, learningObjective, commonMistakes)
- 5-8 subSteps detalhados por step
- practicalExample concreto
- finalVerifications abrangentes (3-7 itens)
- assessmentCriteria mensuráveis (3-7 itens)
- crossCurricularConnections relevantes
- realWorldApplication específica

Mantenha consistência com o estilo e nível de detalhe das expansões existentes.
Se encontrar descrições que mencionam tópicos sem expansão correspondente, adicione as expansões necessárias.

## Notas Finais

- A expansão atômica transforma descrições em planos de aprendizado acionáveis
- Cada expansão deve ser auto-suficiente mas pode referenciar pré-requisitos
- O nível de detalhe deve ser apropriado para o nível educacional do currículo
- Priorize clareza e praticidade sobre complexidade teórica excessiva
- Sempre valide que a expansão ajuda o estudante a alcançar o objetivo de aprendizado
"""


# Schema JSON de referência - Integrado diretamente no script
SCHEMA_EXAMPLE = {
    "formatVersion": "1.0",
    "exportDate": "2025-11-29T10:30:00.000-0300",
    "appVersion": "1.0",
    "curriculumData": {
        "metadata": {
            "startDate": "2025-01-01",
            "duration": "1 Semestre",
            "dailyStudyHours": "6-8 hours",
            "totalAtomicSkills": 355,
            "version": "1.0 - ITA Catalog 2025 Based",
            "lastUpdated": "2025-11-29",
            "institution": "Instituto Tecnológico de Aeronáutica (ITA)",
            "basedOn": "Catálogo dos Cursos de Graduação 2025 - CC201"
        },
        "areas": [
            {
                "id": "37",
                "name": "Algoritmos e Estruturas de Dados",
                "description": "Projeto e análise de algoritmos eficientes",
                "totalSkills": 355,
                "percentage": 100,
                "disciplines": [
                    {
                        "id": "37.1",
                        "name": "Algoritmos",
                        "description": "Ordenação, busca e algoritmos gulosos",
                        "totalSkills": 180,
                        "mainTopics": [
                            {
                                "id": "37.1.1",
                                "name": "Ordenação",
                                "description": "Algoritmos de ordenação e análise de complexidade",
                                "totalSkills": 90,
                                "atomicTopics": [
                                    {
                                        "id": "37.1.1.1",
                                        "name": "QuickSort",
                                        "description": "Algoritmo de ordenação rápida",
                                        "individualConcepts": [
                                            {
                                                "id": "37.1.1.1.1",
                                                "name": "Implementar QuickSort",
                                                "description": "Desenvolver e analisar o algoritmo",
                                                "specificSkills": [
                                                    {
                                                        "id": "37.1.1.1.1.1",
                                                        "name": "Analisar complexidade",
                                                        "description": "Calcular tempo médio O(n log n) e pior caso O(n²)",
                                                        "atomicExpansion": {
                                                            "steps": [
                                                                {
                                                                    "stepNumber": 1,
                                                                    "title": "Compreender estrutura do QuickSort",
                                                                    "subSteps": [
                                                                        "Entender o conceito de divisão e conquista (divide and conquer)",
                                                                        "Reconhecer que QuickSort particiona o array em torno de um pivô",
                                                                        "Compreender que elementos menores que o pivô vão à esquerda e maiores à direita"
                                                                    ],
                                                                    "verification": "Explica corretamente o funcionamento geral do QuickSort",
                                                                    "estimatedTime": "30 minutos",
                                                                    "materials": ["Material didático sobre QuickSort", "Visualizações animadas do algoritmo"],
                                                                    "tips": "Assista a visualizações animadas do QuickSort para entender o processo visualmente",
                                                                    "learningObjective": "Compreender a estratégia fundamental do algoritmo QuickSort",
                                                                    "commonMistakes": ["Confundir com MergeSort", "Não entender o papel do pivô"]
                                                                }
                                                            ],
                                                            "practicalExample": "Array [5,2,8,1,9,3,7,4,6]. Escolhendo pivô=5 (primeiro elemento). Partição: [2,1,3,4] + [5] + [8,9,7,6].",
                                                            "finalVerifications": [
                                                                "Implementação ordena corretamente arrays de diferentes tamanhos e configurações",
                                                                "Complexidade de tempo O(n log n) no caso médio verificada experimentalmente"
                                                            ],
                                                            "assessmentCriteria": [
                                                                "Implementa corretamente função de partição",
                                                                "Calcula complexidade de tempo para caso médio e pior caso"
                                                            ],
                                                            "crossCurricularConnections": ["Análise de Algoritmos", "Estruturas de Dados", "Matemática Discreta"],
                                                            "realWorldApplication": "QuickSort é usado em bibliotecas padrão de muitas linguagens (C++ std::sort, Java Arrays.sort para tipos primitivos) devido à sua eficiência no caso médio e implementação in-place"
                                                        },
                                                        "estimatedTime": "6-8 horas",
                                                        "difficulty": "intermediate",
                                                        "status": "not_started",
                                                        "prerequisites": []
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        "infographics": None,
        "settings": None
    }
}


class CurriculumProcessor:
    """Processador de currículo que extrai PDF e gera JSON estruturado."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o", 
                 base_url: Optional[str] = None):
        """
        Inicializa o processador.
        
        Args:
            api_key: Chave da API OpenAI (ou usa OPENAI_API_KEY do ambiente)
            model: Modelo de IA a usar
            base_url: URL base da API (para APIs compatíveis com OpenAI)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Chave da API não fornecida. Defina OPENAI_API_KEY ou passe --api-key"
            )
        
        # Suporta APIs compatíveis com OpenAI
        # Remove variáveis de ambiente de proxy que podem causar conflito
        proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']
        original_proxy_values = {}
        for var in proxy_vars:
            if var in os.environ:
                original_proxy_values[var] = os.environ[var]
                del os.environ[var]
        
        try:
            client_kwargs = {"api_key": self.api_key}
            if base_url:
                client_kwargs["base_url"] = base_url
            elif os.getenv("OPENAI_BASE_URL"):
                client_kwargs["base_url"] = os.getenv("OPENAI_BASE_URL")
            
            self.client = OpenAI(**client_kwargs)
        except TypeError as e:
            # Restaura variáveis de proxy
            for var, value in original_proxy_values.items():
                os.environ[var] = value
            
            # Tenta sem base_url se houver erro
            if "base_url" in client_kwargs and "unexpected keyword" in str(e).lower():
                client_kwargs_no_url = {"api_key": self.api_key}
                self.client = OpenAI(**client_kwargs_no_url)
                # Define base_url manualmente se suportado
                if base_url or os.getenv("OPENAI_BASE_URL"):
                    self.client.base_url = base_url or os.getenv("OPENAI_BASE_URL")
            else:
                # Restaura variáveis de proxy antes de relançar
                for var, value in original_proxy_values.items():
                    os.environ[var] = value
                raise
        finally:
            # Restaura variáveis de proxy se ainda não foram restauradas
            for var, value in original_proxy_values.items():
                if var not in os.environ:
                    os.environ[var] = value
        self.model = model
        
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extrai texto de um arquivo PDF.
        
        Args:
            pdf_path: Caminho para o arquivo PDF
            
        Returns:
            Texto extraído do PDF
        """
        print(f"Extraindo texto de {pdf_path}...")
        text = ""
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                num_pages = len(pdf_reader.pages)
                
                for page_num in range(num_pages):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text() + "\n"
                    print(f"  Página {page_num + 1}/{num_pages} processada")
                    
        except Exception as e:
            raise Exception(f"Erro ao extrair texto do PDF: {str(e)}")
            
        if not text.strip():
            raise ValueError("Nenhum texto foi extraído do PDF. Verifique se o arquivo está correto.")
            
        print(f"Texto extraído: {len(text)} caracteres")
        return text
    
    def get_prompt_text(self, prompt_path: Optional[str] = None) -> str:
        """
        Obtém o texto do prompt para atomic expand.
        Usa o prompt integrado por padrão, ou lê de arquivo se fornecido.
        """
        if prompt_path:
            try:
                with open(prompt_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception as e:
                print(f"Aviso: Não foi possível ler arquivo de prompt {prompt_path}: {e}")
                print("Usando prompt integrado...")
        
        return ATOMIC_EXPAND_PROMPT
    
    def get_schema(self, schema_path: Optional[str] = None) -> Dict:
        """
        Obtém o schema JSON de referência.
        Usa o schema integrado por padrão, ou lê de arquivo se fornecido.
        """
        if schema_path:
            try:
                with open(schema_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Aviso: Não foi possível ler arquivo de schema {schema_path}: {e}")
                print("Usando schema integrado...")
        
        return {"examples": [SCHEMA_EXAMPLE]}
    
    def generate_curriculum_json(self, pdf_text: str, prompt_text: str, schema: Dict) -> Dict:
        """
        Usa IA para gerar JSON estruturado do currículo.
        
        Args:
            pdf_text: Texto extraído do PDF
            prompt_text: Texto do prompt para atomic expand
            schema: Schema JSON de referência
            
        Returns:
            Dicionário com a estrutura do currículo
        """
        print("Gerando estrutura JSON com IA...")
        
        # Prepara o prompt para a IA
        system_prompt = """Você é um especialista em processamento de currículos educacionais.
Sua tarefa é analisar o texto de uma grade curricular e gerar um JSON estruturado
com 6 níveis de atomicidade seguindo o schema fornecido.

Estrutura esperada:
1. Area (id, name, description)
2. Discipline (id, name, description) 
3. MainTopic (id, name, description)
4. AtomicTopic (id, name, description)
5. IndividualConcept (id, name, description)
6. SpecificSkill (id, name, description, atomicExpansion)

Para cada specificSkill, você DEVE criar uma atomicExpansion completa seguindo
as diretrizes do prompt fornecido."""
        
        # Limita tamanho do texto para não exceder tokens
        max_pdf_text = 20000
        max_schema_text = 8000
        max_prompt_text = 8000
        
        pdf_text_limited = pdf_text[:max_pdf_text]
        if len(pdf_text) > max_pdf_text:
            pdf_text_limited += f"\n\n[... texto truncado, total original: {len(pdf_text)} caracteres ...]"
        
        schema_example = schema.get('examples', [{}])[0] if schema.get('examples') else {}
        schema_text = json.dumps(schema_example, indent=2, ensure_ascii=False)[:max_schema_text]
        prompt_text_limited = prompt_text[:max_prompt_text]
        
        user_prompt = f"""Analise o seguinte texto de grade curricular e gere um JSON completo
seguindo o schema fornecido. Para cada disciplina encontrada, crie uma estrutura
completa com 6 níveis de atomicidade.

TEXTO DO PDF:
{pdf_text_limited}

SCHEMA DE REFERÊNCIA:
{schema_text}

DIRETRIZES PARA ATOMIC EXPANSION:
{prompt_text_limited}

IMPORTANTE:
- Gere JSON válido e completo
- Cada specificSkill DEVE ter atomicExpansion completa
- Use IDs sequenciais (ex: 1, 1.1, 1.1.1, 1.1.1.1, 1.1.1.1.1, 1.1.1.1.1.1)
- Mantenha consistência com o schema
- Responda APENAS com o JSON, sem markdown ou explicações adicionais
- Se o texto estiver truncado, use as informações disponíveis para criar a estrutura
"""
        
        try:
            # Prepara parâmetros da requisição
            request_params = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 16000
            }
            
            # Adiciona response_format apenas para modelos que suportam
            if "gpt-4" in self.model.lower() and "turbo" in self.model.lower():
                request_params["response_format"] = {"type": "json_object"}
            
            response = self.client.chat.completions.create(**request_params)
            
            response_text = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks se existirem
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            # Tenta parsear o JSON
            try:
                curriculum_data = json.loads(response_text)
            except json.JSONDecodeError as e:
                print(f"Erro ao parsear JSON da resposta: {e}")
                print("Resposta recebida:")
                print(response_text[:500])
                raise Exception("A IA não retornou JSON válido")
            
            return curriculum_data
            
        except Exception as e:
            raise Exception(f"Erro ao gerar JSON com IA: {str(e)}")
    
    def expand_atomic_skills(self, curriculum_data: Dict, prompt_text: str) -> Dict:
        """
        Expande atomicExpansion para todas as specificSkills que precisam.
        
        Args:
            curriculum_data: Dados do currículo
            prompt_text: Texto do prompt para expansão
            
        Returns:
            Dados do currículo com expansões completas
        """
        print("Expandindo habilidades atômicas...")
        
        # Encontra todas as specificSkills que precisam de expansão
        skills_to_expand = []
        
        def find_skills(obj, path=""):
            if isinstance(obj, dict):
                if "specificSkills" in obj:
                    for skill in obj["specificSkills"]:
                        if isinstance(skill, dict):
                            skill_id = skill.get("id", "")
                            if not skill.get("atomicExpansion") or self.is_expansion_incomplete(skill.get("atomicExpansion", {})):
                                skills_to_expand.append((skill, path))
                for key, value in obj.items():
                    find_skills(value, f"{path}.{key}" if path else key)
            elif isinstance(obj, list):
                for item in obj:
                    find_skills(item, path)
        
        find_skills(curriculum_data)
        print(f"Encontradas {len(skills_to_expand)} habilidades para expandir")
        
        # Expande cada habilidade
        for skill, path in skills_to_expand:
            try:
                expanded = self.expand_single_skill(skill, prompt_text)
                skill.update(expanded)
                print(f"  ✓ Expandido: {skill.get('name', 'N/A')}")
            except Exception as e:
                print(f"  ✗ Erro ao expandir {skill.get('name', 'N/A')}: {e}")
        
        return curriculum_data
    
    def is_expansion_incomplete(self, expansion: Dict) -> bool:
        """Verifica se uma expansão atômica está incompleta."""
        required_fields = ["steps", "practicalExample", "finalVerifications", 
                          "assessmentCriteria", "crossCurricularConnections", "realWorldApplication"]
        
        for field in required_fields:
            if field not in expansion:
                return True
        
        if not expansion.get("steps") or len(expansion["steps"]) < 2:
            return True
        
        for step in expansion.get("steps", []):
            required_step_fields = ["stepNumber", "title", "subSteps", "verification",
                                   "estimatedTime", "materials", "tips", "learningObjective", "commonMistakes"]
            for field in required_step_fields:
                if field not in step:
                    return True
            if len(step.get("subSteps", [])) < 3:
                return True
        
        return False
    
    def expand_single_skill(self, skill: Dict, prompt_text: str) -> Dict:
        """Expande uma única habilidade específica."""
        skill_name = skill.get("name", "")
        skill_desc = skill.get("description", "")
        
        expansion_prompt = f"""Expanda atomicamente a seguinte habilidade específica seguindo
as diretrizes do prompt fornecido.

HABILIDADE:
Nome: {skill_name}
Descrição: {skill_desc}

DIRETRIZES:
{prompt_text[:3000]}

Gere uma atomicExpansion completa com:
- 3-5 steps bem estruturados
- Cada step com todos os campos obrigatórios
- 5-8 subSteps detalhados por step
- practicalExample concreto
- finalVerifications (3-7 itens)
- assessmentCriteria (3-7 itens)
- crossCurricularConnections relevantes
- realWorldApplication específica

Responda APENAS com o JSON da atomicExpansion, sem markdown."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Você é um especialista em criar expansões atômicas detalhadas para habilidades educacionais."},
                    {"role": "user", "content": expansion_prompt}
                ],
                temperature=0.3,
                max_tokens=4000
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Remove markdown se existir
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            expansion = json.loads(response_text)
            
            # Retorna apenas a parte que precisa ser atualizada
            return {"atomicExpansion": expansion}
            
        except Exception as e:
            print(f"    Erro ao expandir habilidade: {e}")
            # Retorna expansão básica em caso de erro
            return {
                "atomicExpansion": {
                    "steps": [{
                        "stepNumber": 1,
                        "title": f"Estudar {skill_name}",
                        "subSteps": [
                            f"Revisar conceitos fundamentais de {skill_name}",
                            f"Praticar exercícios relacionados",
                            f"Aplicar conhecimento em projeto prático"
                        ],
                        "verification": f"Consegue explicar {skill_name} corretamente",
                        "estimatedTime": "2-3 horas",
                        "materials": ["Material didático", "Exercícios práticos"],
                        "tips": "Pratique regularmente para consolidar o aprendizado",
                        "learningObjective": f"Dominar {skill_name}",
                        "commonMistakes": ["Não praticar suficientemente", "Pular conceitos fundamentais"]
                    }],
                    "practicalExample": f"Exemplo prático de aplicação de {skill_name}",
                    "finalVerifications": [
                        f"Compreende {skill_name}",
                        f"Aplica {skill_name} corretamente"
                    ],
                    "assessmentCriteria": [
                        f"Demonstra conhecimento de {skill_name}",
                        f"Aplica {skill_name} em situações práticas"
                    ],
                    "crossCurricularConnections": ["Conceitos relacionados"],
                    "realWorldApplication": f"Aplicação de {skill_name} no mundo real"
                }
            }
    
    def calculate_totals(self, curriculum_data: Dict) -> Dict:
        """Calcula totais de habilidades recursivamente."""
        def count_skills(obj):
            count = 0
            if isinstance(obj, dict):
                if "specificSkills" in obj:
                    count += len(obj["specificSkills"])
                for value in obj.values():
                    count += count_skills(value)
            elif isinstance(obj, list):
                for item in obj:
                    count += count_skills(item)
            return count
        
        def update_totals(obj, path=""):
            if isinstance(obj, dict):
                if "specificSkills" in obj:
                    obj["totalSkills"] = len(obj["specificSkills"])
                elif "individualConcepts" in obj:
                    obj["totalSkills"] = sum(
                        len(concept.get("specificSkills", []))
                        for concept in obj["individualConcepts"]
                    )
                elif "atomicTopics" in obj:
                    obj["totalSkills"] = sum(
                        topic.get("totalSkills", 0)
                        for topic in obj["atomicTopics"]
                    )
                elif "mainTopics" in obj:
                    obj["totalSkills"] = sum(
                        topic.get("totalSkills", 0)
                        for topic in obj["mainTopics"]
                    )
                elif "disciplines" in obj:
                    obj["totalSkills"] = sum(
                        disc.get("totalSkills", 0)
                        for disc in obj["disciplines"]
                    )
                elif "areas" in obj:
                    obj["totalSkills"] = sum(
                        area.get("totalSkills", 0)
                        for area in obj["areas"]
                    )
                
                for key, value in obj.items():
                    update_totals(value, f"{path}.{key}" if path else key)
            elif isinstance(obj, list):
                for item in obj:
                    update_totals(item, path)
        
        # Atualiza totais
        if "curriculumData" in curriculum_data:
            update_totals(curriculum_data["curriculumData"])
            total = count_skills(curriculum_data["curriculumData"])
            if "metadata" in curriculum_data["curriculumData"]:
                curriculum_data["curriculumData"]["metadata"]["totalAtomicSkills"] = total
        
        return curriculum_data
    
    def process_pdf(self, pdf_path: str, output_dir: str = ".", 
                   prompt_path: Optional[str] = None,
                   schema_path: Optional[str] = None) -> List[str]:
        """
        Processa um PDF e gera arquivos JSON por disciplina.
        
        Args:
            pdf_path: Caminho para o PDF
            output_dir: Diretório de saída
            prompt_path: Caminho opcional para arquivo de prompt (usa integrado se None)
            schema_path: Caminho opcional para arquivo de schema (usa integrado se None)
            
        Returns:
            Lista de arquivos JSON gerados
        """
        # Obtém prompt e schema (usa integrados por padrão)
        prompt_text = self.get_prompt_text(prompt_path)
        schema = self.get_schema(schema_path)
        
        # Extrai texto do PDF
        pdf_text = self.extract_text_from_pdf(pdf_path)
        
        # Gera estrutura inicial
        curriculum_data = self.generate_curriculum_json(pdf_text, prompt_text, schema)
        
        # Expande habilidades atômicas
        curriculum_data = self.expand_atomic_skills(curriculum_data, prompt_text)
        
        # Calcula totais
        curriculum_data = self.calculate_totals(curriculum_data)
        
        # Adiciona metadados se não existirem
        if "formatVersion" not in curriculum_data:
            curriculum_data["formatVersion"] = "1.0"
        if "exportDate" not in curriculum_data:
            curriculum_data["exportDate"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.000-0300")
        if "appVersion" not in curriculum_data:
            curriculum_data["appVersion"] = "1.0"
        
        # Extrai disciplinas e salva arquivos separados
        output_files = []
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        if "curriculumData" in curriculum_data and "areas" in curriculum_data["curriculumData"]:
            for area in curriculum_data["curriculumData"]["areas"]:
                for discipline in area.get("disciplines", []):
                    discipline_name = discipline.get("name", "Disciplina")
                    # Limpa nome do arquivo (remove caracteres especiais, mantém espaços e hífens)
                    safe_name = re.sub(r'[<>:"/\\|?*]', '', discipline_name)
                    safe_name = safe_name.strip()
                    # Se estiver vazio, usa ID
                    if not safe_name:
                        safe_name = f"Disciplina_{discipline.get('id', 'unknown')}"
                    
                    # Cria estrutura para disciplina individual
                    discipline_json = {
                        "formatVersion": curriculum_data.get("formatVersion", "1.0"),
                        "exportDate": curriculum_data.get("exportDate"),
                        "appVersion": curriculum_data.get("appVersion", "1.0"),
                        "curriculumData": {
                            "metadata": curriculum_data["curriculumData"].get("metadata", {}),
                            "areas": [{
                                "id": area.get("id", "1"),
                                "name": area.get("name", "Área"),
                                "description": area.get("description", ""),
                                "totalSkills": discipline.get("totalSkills", 0),
                                "percentage": 100,
                                "disciplines": [discipline]
                            }],
                            "infographics": curriculum_data["curriculumData"].get("infographics"),
                            "settings": curriculum_data["curriculumData"].get("settings")
                        }
                    }
                    
                    # Salva arquivo
                    output_file = output_path / f"{safe_name}.json"
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(discipline_json, f, indent=2, ensure_ascii=False)
                    
                    output_files.append(str(output_file))
                    print(f"✓ Arquivo salvo: {output_file}")
        
        return output_files


def main():
    """Função principal."""
    parser = argparse.ArgumentParser(
        description="Processa PDF de grade curricular e gera JSON estruturado com 6 níveis de atomicidade"
    )
    parser.add_argument("pdf_path", help="Caminho para o arquivo PDF")
    parser.add_argument("-o", "--output", default=".", help="Diretório de saída (padrão: .)")
    parser.add_argument("-p", "--prompt", default=None,
                       help="Caminho para arquivo de prompt (padrão: tenta encontrar automaticamente)")
    parser.add_argument("-s", "--schema", default=None,
                       help="Caminho para arquivo de schema (padrão: tenta encontrar automaticamente)")
    parser.add_argument("--api-key", help="Chave da API OpenAI (ou use OPENAI_API_KEY)")
    parser.add_argument("--model", default="gpt-4o", help="Modelo de IA a usar (padrão: gpt-4o)")
    parser.add_argument("--base-url", default=None, 
                       help="URL base da API (para APIs compatíveis com OpenAI, ou use OPENAI_BASE_URL)")
    
    args = parser.parse_args()
    
    try:
        processor = CurriculumProcessor(
            api_key=args.api_key, 
            model=args.model,
            base_url=args.base_url
        )
        output_files = processor.process_pdf(
            args.pdf_path,
            args.output,
            args.prompt,
            args.schema
        )
        
        print(f"\n✓ Processamento concluído!")
        print(f"✓ {len(output_files)} arquivo(s) JSON gerado(s):")
        for file in output_files:
            print(f"  - {file}")
            
    except Exception as e:
        print(f"\n✗ Erro: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

