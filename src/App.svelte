<script lang="ts" >
import Layout from "./components/Layout.svelte"

</script>

<main>
	<Layout></Layout>	
</main>

<style>
	main {
		text-align: center;
		max-width: 240px;
		margin: 0 auto;	
		padding: 20px;
		border-radius: 10px;
		margin-bottom: 50px;
		background: #efefef;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>