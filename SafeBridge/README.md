# SafeBridge (Electron + React + TypeScript)

Migración del sistema Python/CustomTkinter a aplicación de escritorio moderna con Electron.

## Funcionalidades migradas
- Detección de equipo/servidor local y autocompletado inicial.
- Conexión SQL Server (Windows o SQL Auth).
- Listado de bases de datos.
- Flujo "Backup + Validación": BACKUP, RESTORE sandbox, DBCC CHECKDB, limpieza.
- Restauración de archivo `.bak` con control de sobrescritura.
- UI moderna con Tailwind, tema oscuro por defecto, toasts y layout profesional.

## Desarrollo
```bash
npm install
npm run dev
```
