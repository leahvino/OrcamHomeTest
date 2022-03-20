<script lang="ts">
import { createEventDispatcher, onMount, setContext } from "svelte";
import { writable } from "svelte/store";
import Form from '../lib/Form.svelte';
import Input from '../lib/Input.svelte';
import Error from '../lib/Error.svelte';
import { Validators } from '../lib/Validators';
import type { CurrentRoute } from "svelte-router-spa/types/components/route";
import type { UserDevice } from "../types/UserDetails";
import { Navigate } from "svelte-router-spa";
import { userUpdateRequest } from "../types/UserRequest";
import { HttpService } from "../lib/HttpService";
import type { UserType } from "../types/userType";
import Loader from "./Loader.svelte";



export let currentRoute: CurrentRoute;
let currentUser: string =  currentRoute.namedParams.userId;
let successMessage: string = "";
let errorMessage: string = "";
let userDetails: UserType;
let userRequest: userUpdateRequest;
export let loading: boolean = false;


let formEl: Form;
  let form = {
    firstName: {
      validators: [Validators.required],    
    },
    lastName: {
      validators: [Validators.required],
    },
    phone: {
      validators: [Validators.required, Validators.isNumber],
    },
    email:{
      validators: [Validators.required],
    }
  };

  async function onSubmit(e){
    if (e?.detail?.valid) {      
      userRequest = new userUpdateRequest();
      userRequest = e.detail.data;
      debugger;
      userRequest.phone = `${e.detail.data.countryCode}${e.detail.data.phone}`;
      delete userRequest["countryCode"];
      await UpdateUser(e.detail.data).then(async data =>{
        userDetails = await GetUserDetails();
      })
    } else {
      console.log('Invalid Form');
    }
  };
    onMount(async () => {		
        userDetails = await GetUserDetails();               
	});

    async function GetUserDetails(): Promise<UserType>{   
        loading = true;
        if(currentUser){
          return await HttpService.fetchGet(`/${currentUser}`)            
                .then((data) => {                  
                  loading = false;
                  let response = data;                
                  response.countryCode = data?.phone?.substring(0, 4);
                  response.phone = data?.phone?.substring(4, data.phone.length);
                  return response;
                  
                } )
                .catch(error => {
                  loading = false;
                  errorMessage = error;
                 return [];
            }); 
        }  
        else{
          loading = false;
          errorMessage = "not Get UserId";

            //Show Error 
        }
                
    }

    async function UpdateUser(data: userUpdateRequest) : Promise<boolean>{
      loading = true;
      errorMessage = "";
      successMessage = "";
      let res: boolean = false;  

        return await HttpService.fetchPost(data, currentUser)        
            .then(async (data) => {             
              loading = false;
              if(data?.message){//Error
                errorMessage = data?.message;            
              }
              else{
                res = true;             
                successMessage = "user details updated successfully";              
              }            
              return res;
            })
            .catch(error => {
              loading = false;
              errorMessage = error;
              return res;
        }); 
    }
   
</script>

{#if loading}
<Loader />
{:else}
<h1>User Details</h1>
<Form {form} on:submit={onSubmit} bind:this={formEl}>
    <div>
      <Input label="first Name" name="firstName" value={userDetails?.firstName ?? ""} />
      <Error
        fieldName="firstName"
        errorKey="required"
        message="First Name is required"
      />
    </div>
    <div>
        <Input label="last Name" name="lastName" value={userDetails?.lastName ?? ""}/>
        <Error
          fieldName="lastName"
          errorKey="required"
          message="Last Name is required"
        />
      </div>
    <div>
      <label>Phone Number</label>
      <div class="phone-wrapper">
        <span class="countryCode">
          <Input label="" name="countryCode" value={userDetails?.countryCode?? ""}/>
          <Error
            fieldName="countryCode"
            errorKey="required"
            message="Phone Number is required"
          />
        </span>
        <span class="phone">
          <Input label="" name="phone" value={userDetails?.phone?? ""}/>
          <Error
          fieldName="phone"
          errorKey="required"
          message="Phone Number is required"
          />
          <Error fieldName="phone" errorKey="isNumber" />
        </span> 
      </div>              
    </div>
    <div>
      <Input label="Email" name="email" value={userDetails?.email ?? ""}/>
      <Error
        fieldName="email"
        errorKey="required"
        message="email is required"
      />
    </div>
    <button type="submit">Submit</button>
  </Form>
    {#if successMessage !== ""}
      <div class="success-message">{successMessage}</div>
    {/if}
    {#if errorMessage !== ""}
      <div class="error-message">`Error: {errorMessage}`</div>
    {/if}
  {/if}
  


  <style>  
    * {
      box-sizing: border-box;
    }
    .success-message{
      color:cadetblue;
    }
    .error-message{
      color: crimson;
    }
   
    .phone-wrapper{
      width: 56%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .phone-wrapper .countryCode{
      width: 30%;
      /* width: inherit; */
    }
    .phone-wrapper .phone{
      width: 70%;
      /* width: inherit; */
    }  
    :global(.phone input){
      width: 100%;
    } 
  </style>