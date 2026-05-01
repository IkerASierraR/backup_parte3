declare global {
  interface Window {
    safebridge: {
      defaults:()=>Promise<any>; connect:(p:any)=>Promise<any>; listDatabases:(p:any)=>Promise<string[]>;
      runBackup:(p:any,d:string,f:string,o:boolean)=>Promise<any>; runRestore:(p:any,b:string,t:string,f:boolean)=>Promise<any>;
      pickFolder:()=>Promise<string|null>; pickBak:()=>Promise<string|null>; setTheme:(t:'dark'|'light'|'system')=>Promise<void>
    }
  }
}
export {}
