# Instruções para Instalar Python

## Problema Identificado
O Python não está instalado corretamente no sistema. O comando `python` aponta apenas para um stub da Windows Store.

## Solução: Instalar Python

### Opção 1: Instalação via Microsoft Store (Mais Fácil)
1. Abra a Microsoft Store
2. Procure por "Python 3.11" ou "Python 3.12"
3. Clique em "Instalar"
4. Após a instalação, reinicie o terminal

### Opção 2: Instalação via Site Oficial (Recomendado)
1. Acesse: https://www.python.org/downloads/
2. Baixe a versão mais recente (Python 3.11 ou 3.12)
3. Execute o instalador
4. **IMPORTANTE**: Durante a instalação, marque a opção:
   - ✅ "Add Python to PATH" (Adicionar Python ao PATH)
5. Clique em "Install Now"
6. Após a instalação, reinicie o terminal

### Verificar Instalação
Após instalar, execute no terminal:
```powershell
python --version
```

Deve mostrar algo como: `Python 3.11.x` ou `Python 3.12.x`

## Instalar Dependências

Após instalar o Python, instale as dependências necessárias:

```powershell
pip install -r requirements.txt
```

Ou se `pip` não funcionar:
```powershell
python -m pip install -r requirements.txt
```

## Executar o Script

Após instalar Python e as dependências, execute:

```powershell
python process_curriculum_pdf.py "Catálogo dos Cursos de Graduação 2025 - digital Rev.25.07.18-páginas (1).pdf" --base-url http://localhost:23333/v1 --api-key cs-sk-c7ebb544-082a-49c9-8064-80b484f51037
```

Ou use o script auxiliar:
```powershell
.\executar_processamento.ps1
```

## Alternativa: Usar Python Online

Se não puder instalar Python localmente, você pode:
1. Usar Google Colab
2. Usar Replit
3. Usar um servidor remoto com Python instalado


