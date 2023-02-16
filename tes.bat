@echo off
:start
node index.js 
if %ERRORLEVEL% NEQ 0 (
  type error.log | findstr /i "ECONNRESET" > nul
  if %ERRORLEVEL% NEQ 0 (
    type error.log | findstr /i "errorType: 'api_error'" > nul
    if %ERRORLEVEL% NEQ 0 (
    type error.log | findstr /i "Error: connect ETIMEDOUT" > nul
    if %ERRORLEVEL% NEQ 0 (
    type error.log | findstr /i "Error: socket hang up" > nul
    if %ERRORLEVEL% NEQ 0 (
     echo An error has occurred. Restarting...
     goto start
    )
  )
)
