@echo off
title Instalacao - Bot WhatsApp RAIO ICNG HKW
color 0A

cd /d "%~dp0"

echo ============================================
echo    BOT WHATSAPP - INSTALAR DEPENDENCIAS
echo ============================================
echo.

echo Pasta do projeto:
echo %CD%
echo.

echo [1/3] Verificando Node.js...
node --version

if errorlevel 1 (
    echo.
    echo ERRO: Node.js nao foi encontrado.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Verificando npm...
call npm --version

if errorlevel 1 (
    echo.
    echo ERRO: npm nao foi encontrado.
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Instalando dependencias...
echo.
echo Aguarde enquanto o npm instala os arquivos necessarios...
echo.

call npm install

echo.

if errorlevel 1 (
    echo ============================================
    echo       ERRO NA INSTALACAO
    echo ============================================
    echo.
    echo Tire um print desta janela e me envie.
    echo.
    pause
    exit /b 1
)

echo ============================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo ============================================
echo.

echo Agora voce pode executar:
echo INICIAR_BOT.bat
echo.

pause