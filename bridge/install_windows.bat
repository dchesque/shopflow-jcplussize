@echo off
echo =====================================
echo   ShopFlow Bridge - Instalador
echo =====================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado!
    echo Baixe em: https://www.python.org/downloads/
    pause
    exit
)

echo [OK] Python encontrado
echo.

echo Criando ambiente virtual...
python -m venv venv

echo Ativando ambiente...
call venv\\Scripts\\activate.bat

echo Instalando dependencias...
pip install -r requirements.txt

mkdir logs 2>nul
mkdir cache 2>nul

echo.
echo =====================================
echo   Instalacao concluida!
echo =====================================
echo.
echo Configure config.ini com sua senha
echo Para iniciar use: run_bridge.bat
echo.
pause