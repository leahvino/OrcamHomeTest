<!-- Input.svelte -->
<script lang="ts">
    import { getContext } from 'svelte';
    export let type = 'text';
    export let label = "";
    export let name;
    export let value;
    export let maxlength = undefined;
    const { onBlur } = getContext('form');
  </script>
  
<div class="input-wrapper">
  <label for={name}>{label}</label>
  <input {name} {type} on:blur={onBlur} {value} {maxlength}/>
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
  }
  @media only screen and (max-width: 768px) {
    .input-wrapper {
      justify-content: center;
      flex-direction: column;
    }
  }
</style>