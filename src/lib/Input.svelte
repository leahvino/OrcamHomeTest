<!-- Input.svelte -->
<script lang="ts">
    import { getContext } from 'svelte';
    export let type = 'text';
    export let label;
    export let name;
    export let value;
    const { onBlur } = getContext('form');
  </script>
  
  <label for={name}>{label}</label>
  <input {name} {type} on:blur={onBlur} {value}/>