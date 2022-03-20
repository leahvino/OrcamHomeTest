export class HttpService {
        static DOMAIN = "https://admin.dev.orcam.io/api/v8/users";
        static AUTHORIZATION_KEY = 'accessKey 7f4ff3ae-53c2-4622-9fc4-28290a130e5c';

        static async fetchPost(payload: any, params: string) : Promise<any>{                           
          return await fetch(`${HttpService.DOMAIN}/${params}`, {
              method: 'post',		    		
              headers: {	
                  'Authorization': HttpService.AUTHORIZATION_KEY,
                  'Content-type': 'application/json'
              },	
              body: JSON.stringify(payload)
              }).then((response) => response.json())
              .then(async (data) => {
                return  data;
              })
              .catch(error => {
                  return error;               
          }); 
        }


        
        static async fetchGet(params: string) : Promise<any>{                           
            return await fetch(`${HttpService.DOMAIN}${params}`, {
                method: 'get',		    		
                headers: {	
                    'Authorization': HttpService.AUTHORIZATION_KEY,
                }
                }).then((response) => response.json())
                .then(async (data) => data)
                .catch(error => {
                    return error;               
            }); 
          }
}


 