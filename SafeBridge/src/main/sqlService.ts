import sql from 'mssql'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'

export type AuthMode = 'windows' | 'sql'
export interface ConnectionPayload { server:string; authMode:AuthMode; username?:string; password?:string }

const makeConfig = (payload: ConnectionPayload): sql.config => ({
  server: payload.server,
  database: 'master',
  options: { trustServerCertificate: true, encrypt: false },
  ...(payload.authMode === 'sql'
    ? { user: payload.username, password: payload.password }
    : { options: { trustServerCertificate: true, encrypt: false, trustedConnection: true } as any })
})

export async function testConnection(payload: ConnectionPayload){
  const pool = await sql.connect(makeConfig(payload)); await pool.request().query('SELECT 1 as ok'); await pool.close(); return true
}
export async function listDatabases(payload: ConnectionPayload){ const pool=await sql.connect(makeConfig(payload)); const r=await pool.request().query("SELECT name FROM sys.databases WHERE database_id > 4 ORDER BY name"); await pool.close(); return r.recordset.map(x=>x.name as string)}
export function detectDefaults(){ const host=os.hostname(); return { host, serverCandidates:[`${host}\\SQLEXPRESS`,'localhost\\SQLEXPRESS',host,'localhost'] }}
export function defaultBackupDir(){ return path.join('C:\\','Program Files','Microsoft SQL Server','MSSQL','Backup') }
export async function backupAndValidate(payload:ConnectionPayload, database:string, folder:string, overwrite=false){
  const filename=`${database}_${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}_FULL.bak`; const fullPath=path.join(folder,filename)
  if (fs.existsSync(fullPath) && !overwrite) return { exists:true, backupPath: fullPath }
  const pool=await sql.connect(makeConfig(payload));
  await pool.request().query(`BACKUP DATABASE [${database}] TO DISK = N'${fullPath.replace(/'/g,"''")}' WITH INIT, STATS = 10`)
  const sandbox=`${database}_SAFEBRIDGE_${Date.now()}`
  await pool.request().query(`RESTORE DATABASE [${sandbox}] FROM DISK = N'${fullPath.replace(/'/g,"''")}' WITH RECOVERY, REPLACE`)
  const check=await pool.request().query(`DBCC CHECKDB ([${sandbox}]) WITH NO_INFOMSGS, ALL_ERRORMSGS`)
  await pool.request().query(`ALTER DATABASE [${sandbox}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${sandbox}]`)
  await pool.close(); return { exists:false, backupPath: fullPath, validationRows: check.rowsAffected }
}
export async function restoreBackup(payload:ConnectionPayload, bakFile:string, targetDb:string, force=false){
  const pool=await sql.connect(makeConfig(payload));
  const exists=await pool.request().query(`SELECT 1 ok FROM sys.databases WHERE name=N'${targetDb.replace(/'/g,"''")}'`)
  if (exists.recordset.length && !force) { await pool.close(); return { conflict:true } }
  await pool.request().query(`RESTORE DATABASE [${targetDb}] FROM DISK = N'${bakFile.replace(/'/g,"''")}' WITH RECOVERY, ${force?'REPLACE,':''} STATS = 10`)
  await pool.close(); return { conflict:false }
}
