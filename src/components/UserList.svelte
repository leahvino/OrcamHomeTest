<script lang="ts">

import { Navigate, navigateTo } from "svelte-router-spa";
import { paginate, LightPaginationNav } from 'svelte-paginate'
import { identity, onMount } from "svelte/internal";
import { HttpService } from "../lib/HttpService";
import type { UserType } from "../types/userType";
import Loader from "./Loader.svelte";


let items: UserType[] = [];
let loading: boolean = false;
let currentPage = 1;
const pageSize = 10;
let totalItems = (currentPage * pageSize) * pageSize;

 $: paginatedItems = paginate({ items, pageSize, currentPage })

    onMount(async () => {		
        items = await getUserList();        
	});

    async function getUserList(): Promise<any[]>{
        loading = true;
        return await HttpService.fetchGet(`?${currentPage -1}&size=${pageSize}`)        
                .then((data) => {
                    loading = false;
                    return data.items;
                })
                .catch(error => {
                    console.log(error);
                    return [];
                });
    }
      

    function handleUserDetails(userId){         
        navigateTo(`/UserDetails/${userId}`);
    }

    async function handlePaginateClick(e){
        currentPage = e.detail.page;
        items = await getUserList();

    }
</script>

<h1>User List</h1>
{#if loading }
  <Loader/>
{:else}
<div class="user-grid">
    {#each items as user, i}
    
    <div class="user">
        <div class="user-wrap">  
            <div>                
                <span class="label">Created At: </span>
                <span>{ new Date(user.createdAt).toLocaleDateString() }</span>
            </div>  
            <div>
                <span class="label">Updated At: </span>
                <span>{ new Date(user.updatedAt).toLocaleDateString() }</span>
            </div>
            {#if user?.email}    
                <div>
                    <span class="label">Mail: </span>
                    <span>{user.email}</span>
                </div>
            {/if}
            <button on:click|once={()=>handleUserDetails(user.userId)}>
              More Detials
          </button>
        </div>           
    </div> 
  {/each}  
</div>


<LightPaginationNav
  totalItems="{totalItems}"
  pageSize="{pageSize}"
  currentPage="{currentPage}"
  limit="{1}"
  showStepOptions="{true}"
  on:setPage="{(e) => handlePaginateClick(e)}"
/>

{/if}


<style>
    .user-grid{
        display: flex;
        flex-flow: wrap;
        list-style: none;
        margin: 0;
        padding: 0;
        justify-content: space-around;
        font-size: 16px;
    } 
    .user {
        border: 1px solid #ddd;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        text-align: center;
        width: 32%;
        margin: 0.5%;
    }   
    .user-wrap{
        margin: 15px;        
    }
    .user-wrap .label{
        font-weight: bold;
    }
    button{
       margin-top:15px;     
    }
    @media only screen and (max-width: 767px) {
        .user{
            width: 100%;
        }
    }
</style>

