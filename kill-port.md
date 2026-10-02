Get-NetTCPConnection -LocalPort 3006 -State Listen | ForEach-Object { taskkill /PID $_.OwningProcess /T /F }
