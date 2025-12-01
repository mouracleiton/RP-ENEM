# Script PowerShell para executar o processamento do PDF de grade curricular

$pdfFile = "Catálogo dos Cursos de Graduação 2025 - digital Rev.25.07.18-páginas (1).pdf"
$baseUrl = "http://localhost:23333/v1"
$apiKey = "cs-sk-c7ebb544-082a-49c9-8064-80b484f51037"

# Verifica se o arquivo PDF existe
if (-not (Test-Path $pdfFile)) {
    Write-Host "ERRO: Arquivo PDF não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, coloque o arquivo '$pdfFile' no diretório atual." -ForegroundColor Yellow
    Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Cyan
    exit 1
}

Write-Host "Arquivo PDF encontrado: $pdfFile" -ForegroundColor Green
Write-Host "Iniciando processamento..." -ForegroundColor Cyan
Write-Host ""

# Tenta encontrar Python
$pythonCmd = $null

# Tenta diferentes comandos Python
$pythonCommands = @("python", "python3", "py")

foreach ($cmd in $pythonCommands) {
    try {
        $result = Get-Command $cmd -ErrorAction SilentlyContinue
        if ($result) {
            $pythonCmd = $cmd
            Write-Host "Python encontrado: $($result.Source)" -ForegroundColor Green
            break
        }
    } catch {
        continue
    }
}

if (-not $pythonCmd) {
    Write-Host "ERRO: Python não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale Python e adicione-o ao PATH." -ForegroundColor Yellow
    Write-Host "Ou use o caminho completo do Python." -ForegroundColor Yellow
    exit 1
}

# Executa o script
$scriptPath = "process_curriculum_pdf.py"
$arguments = @(
    "`"$pdfFile`"",
    "--base-url", $baseUrl,
    "--api-key", $apiKey
)

Write-Host "Executando: $pythonCmd $scriptPath $($arguments -join ' ')" -ForegroundColor Cyan
Write-Host ""

try {
    & $pythonCmd $scriptPath $arguments
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Processamento concluído com sucesso!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Processamento concluído com erros (código: $LASTEXITCODE)" -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "ERRO ao executar o script: $_" -ForegroundColor Red
    exit 1
}

