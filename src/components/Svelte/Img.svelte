<script lang="ts">
  import { portal } from 'svelte-portal';

  export let src = '';
  export let alt = '';
  let showModal = false;
</script>

<button
  class="thumbnail"
  on:click={() => (showModal = true)}
  on:keydown={(e) => e.key === 'Enter' && (showModal = true)}
  aria-label="Open image in modal"
>
  <img {src} {alt} />
</button>

{#if showModal}
  <dialog
    class="modal-overlay"
    use:portal={'body'}
    aria-modal="true"
    open
  >
    <div
      class="backdrop"
      on:click={() => (showModal = false)}
      on:keydown={(e) => e.key === 'Escape' && (showModal = false)}
      role="presentation"
    ></div>
    <button
      class="modal-close"
      on:click|stopPropagation={() => (showModal = false)}
      on:keydown={(e) => e.key === 'Escape' && (showModal = false)}
      aria-label="Close image modal"
    >
      <img class="modal-img" {src} {alt} />
    </button>
  </dialog>
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
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    border: none;
    padding: 0;
    margin: 0;
  }

  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
  }

  .modal-close {
    position: relative;
    cursor: zoom-out;
  }

  .modal-img {
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
  }
</style>
