<script lang="ts">
  let a = 5;

  const clicked = () => {
    a = a + 1;
  };
</script>

<div>this is a svelte template</div>
{a}
<button on:click={clicked}>Increment</button>
