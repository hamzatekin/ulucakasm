<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { portal } from 'svelte-portal';

  const dispatch = createEventDispatcher();
  const close = () => dispatch('close');

  let modal;

  const handle_keydown = (e) => {
    console.log();
    if (e.key === 'Escape') {
      close();
      return;
    }
  };
</script>

<div class="modal-background" />

<div class="modal-wrapper" bind:this={modal} use:portal={'body'} on:keydown={handle_keydown} on:click={close}>
  <slot />
  <div role="dialog" aria-modal="true" />
</div>

<style>
  .modal-background {
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 55;
    background: rgba(0, 0, 0, 0.3);
  }

  .modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    padding: 1rem 3rem;
    height: 100%;
    z-index: 56;
    overflow: hidden;
  }
</style>
