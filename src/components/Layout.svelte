<script>
import { routes } from "../routes.js"
import { Navigate, Router } from "svelte-router-spa";
</script>

<nav>  
    <a href="/">User List</a>
    <a href="/about">About</a>
</nav>
<Router {routes}/>  
<slot></slot>

<style>
    nav{
        padding:15px;    
    }
    nav a{
        padding: 15px;
    }
</style>