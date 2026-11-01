@echo off
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 JUGAR.py
) else (
  python JUGAR.py
)
if errorlevel 1 (
  echo No se pudo abrir el juego. Revisa que Python 3 este instalado y que hayas extraido el ZIP completo.
  pause
)
