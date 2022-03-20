<!-- Error.svelte -->
<script lan="ts">
    import { getContext } from 'svelte';
    const { errors } = getContext('form');
    export let message = null;
    export let fieldName;
    export let errorKey;
</script>

{#if $errors?.[fieldName]?.[errorKey]?.error}
<p class="error-message">{message || $errors[fieldName][errorKey].message}</p>
{/if}

<style>
.error-message {
  color: tomato;
  flex: 0 0 100%;
  margin: 0 2px;
  font-size: 0.8em;
}
</style>