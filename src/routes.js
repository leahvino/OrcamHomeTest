import UserList from "./components/UserList.svelte"
import About from "./components/About.svelte";
import UserDetails from "./components/UserDetails.svelte";


  const routes = [
   {
     name: "/",
     component: UserList,
   },
   {
      name: "/about",
      component: About
   },
   {
      name: "/userDetails/:userId",
      component: UserDetails
   }

 ];
 
 export { routes };