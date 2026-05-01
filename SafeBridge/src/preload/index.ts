import { contextBridge, ipcRenderer } from 'electron'
contextBridge.exposeInMainWorld('safebridge', {
  defaults: ()=>ipcRenderer.invoke('env:defaults'),
  connect: (payload:any)=>ipcRenderer.invoke('auth:connect',payload),
  listDatabases:(payload:any)=>ipcRenderer.invoke('db:list',payload),
  runBackup:(payload:any,database:string,folder:string,overwrite:boolean)=>ipcRenderer.invoke('backup:run',payload,database,folder,overwrite),
  runRestore:(payload:any,bak:string,target:string,force:boolean)=>ipcRenderer.invoke('restore:run',payload,bak,target,force),
  pickFolder:()=>ipcRenderer.invoke('fs:pickFolder'),
  pickBak:()=>ipcRenderer.invoke('fs:pickBak'),
  setTheme:(theme:'dark'|'light'|'system')=>ipcRenderer.invoke('theme:set',theme)
})
