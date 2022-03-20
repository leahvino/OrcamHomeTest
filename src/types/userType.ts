import type { UserDevice } from "./UserDetails"

export interface UserType{

    userId: string
    hash: string                                                                                        
    identityId: string
    createdAt: string
    updatedAt: string
    email: string
    details: Array<any>
    devices: Array<UserDevice>
    firstName: string
    lastName: string  
    phone: number;
    countryCode: number;
  }