<script lang="ts" >
import Layout from "./components/Layout.svelte"

</script>

<main>
	<Layout></Layout>	
</main>

<style>
	main {
		text-align: center;
		min-height: 100vh;
		margin: 0 auto;	
		padding: 20px;
		border-radius: 10px;
		margin-bottom: 50px;
		background: #efefef;
  	}
	
		/* Extra small devices (phones, 600px and down) */
		/* @media only screen and (max-width: 600px) {
			
		} */
		/* Small devices (portrait tablets and large phones, 600px and up) */
		/* @media only screen and (min-width: 600px) {

		} */

		/* Medium devices (landscape tablets, 768px and up) */
		@media only screen and (max-width: 768px) {
			main {
				max-width: none;
			}
		}

		/* Large devices (laptops/desktops, 992px and up) */
		/* @media only screen and (min-width: 992px) {

		} */

</style>