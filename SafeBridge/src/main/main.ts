import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'node:path'
import Store from 'electron-store'
import { backupAndValidate, defaultBackupDir, detectDefaults, listDatabases, restoreBackup, testConnection, type ConnectionPayload } from './sqlService'

const store = new Store<{theme:'dark'|'light'|'system'}>({ defaults:{ theme:'dark' } })
let win: BrowserWindow
const createWindow=()=>{ win=new BrowserWindow({ width:1200,height:760,webPreferences:{ preload:path.join(__dirname,'../preload/index.js') }}); win.loadURL(process.env.ELECTRON_RENDERER_URL || `file://${path.join(__dirname,'../renderer/index.html')}`)}
app.whenReady().then(createWindow)
ipcMain.handle('env:defaults', ()=> ({ ...detectDefaults(), backupDir: defaultBackupDir(), theme:store.get('theme') }))
ipcMain.handle('auth:connect', async (_, payload:ConnectionPayload)=> ({ ok: await testConnection(payload), databases: await listDatabases(payload) }))
ipcMain.handle('db:list', async (_, payload:ConnectionPayload)=> listDatabases(payload))
ipcMain.handle('backup:run', async (_, payload, database, folder, overwrite)=> backupAndValidate(payload,database,folder,overwrite))
ipcMain.handle('restore:run', async (_, payload,bak,target,force)=> restoreBackup(payload,bak,target,force))
ipcMain.handle('fs:pickFolder', async ()=> (await dialog.showOpenDialog(win,{properties:['openDirectory']})).filePaths[0] ?? null)
ipcMain.handle('fs:pickBak', async ()=> (await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'SQL Backup',extensions:['bak']}]})).filePaths[0] ?? null)
ipcMain.handle('theme:set',(_,theme)=> store.set('theme',theme))
