export class Localstore {

  public static  setCompte (key:string,compte:any){
     localStorage.setItem(key,compte)
  }
  public static  set (key:string,value:any){
     localStorage.setItem(key,value)
  }

  public static  deleteCompte (){
    localStorage.removeItem("COMPTE")
 }

   public static getCompte (key:string):any{
      return  localStorage.getItem(key)
    }
   public static get (key:string):any{
      return  localStorage.getItem(key)
    }
}
