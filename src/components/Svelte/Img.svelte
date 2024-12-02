<script lang="ts">
  import { portal } from 'svelte-portal';

  export let src = '';
  export let alt = '';
  let showModal = false;
</script>

<img
  loading="lazy"
  class="thumbnail"
  on:click={() => showModal = true}
  on:keydown={(e) => e.key === 'Enter' && (showModal = true)}
  {src}
  {alt}
/>

{#if showModal}
  <div
    class="modal-overlay"
    use:portal={'body'}
    on:click={() => showModal = false}
    on:keydown={(e) => e.key === 'Escape' && (showModal = false)}
  >
    <img
      class="modal-img"
      {src}
      {alt}
    />
  </div>
{/if}

<style>
  .thumbnail {
    cursor: zoom-in;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    cursor: zoom-out;
  }

  .modal-img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
  }
</style>
