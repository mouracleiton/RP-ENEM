#!/usr/bin/env python3
"""
Exemplo de uso do processador de PDF de grade curricular.
"""

import os
import sys
from process_curriculum_pdf import CurriculumProcessor

def exemplo_basico():
    """Exemplo básico de uso."""
    
    # Verifica se a chave da API está configurada
    if not os.getenv("OPENAI_API_KEY"):
        print("Erro: Defina OPENAI_API_KEY como variável de ambiente")
        print("Exemplo: export OPENAI_API_KEY='sua-chave-aqui'")
        return
    
    # Caminhos dos arquivos
    pdf_path = "grade_curricular.pdf"  # Substitua pelo caminho do seu PDF
    output_dir = "output"
    prompt_path = None  # None = tenta encontrar automaticamente
    schema_path = None  # None = tenta encontrar automaticamente
    
    try:
        # Cria o processador
        processor = CurriculumProcessor()
        
        # Processa o PDF
        print(f"Processando {pdf_path}...")
        output_files = processor.process_pdf(
            pdf_path=pdf_path,
            output_dir=output_dir,
            prompt_path=prompt_path,
            schema_path=schema_path
        )
        
        print(f"\n✓ Processamento concluído!")
        print(f"✓ {len(output_files)} arquivo(s) gerado(s):")
        for file in output_files:
            print(f"  - {file}")
            
    except FileNotFoundError as e:
        print(f"Erro: Arquivo não encontrado - {e}")
    except ValueError as e:
        print(f"Erro: {e}")
    except Exception as e:
        print(f"Erro inesperado: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    exemplo_basico()


