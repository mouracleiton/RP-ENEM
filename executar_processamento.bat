@echo off
REM Script para executar o processamento do PDF de grade curricular

REM Verifica se o arquivo PDF existe
if not exist "Catálogo dos Cursos de Graduação 2025 - digital Rev.25.07.18.pdf" (
    echo ERRO: Arquivo PDF não encontrado!
    echo Por favor, coloque o arquivo "Catálogo dos Cursos de Graduação 2025 - digital Rev.25.07.18.pdf" no diretório atual.
    pause
    exit /b 1
)

REM Tenta executar com python
python process_curriculum_pdf.py "Catálogo dos Cursos de Graduação 2025 - digital Rev.25.07.18.pdf" --base-url http://localhost:23333/v1 --api-key cs-sk-c7ebb544-082a-49c9-8064-80b484f51037

if errorlevel 1 (
    echo.
    echo Tentando com python3...
    python3 process_curriculum_pdf.py "Catálogo dos Cursos de Graduação 2025 - digital Rev.25.07.18.pdf" --base-url http://localhost:23333/v1 --api-key cs-sk-c7ebb544-082a-49c9-8064-80b484f51037
)

pause


