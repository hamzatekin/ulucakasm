<script lang="ts">
  import Modal from '../Svelte/Modal.svelte';

  export let src = '';
  export let alt = '';
  let showModal = false;

  const onClick = () => {
    showModal = !showModal;
  };
</script>

<img
  loading="lazy"
  class="ulucak-img"
  on:keydown={(ev) => {
    if (ev.key === 'Enter') {
      onClick();
    }
  }}
  on:click={onClick}
  {src}
  {alt}
/>

{#if showModal}
  <Modal on:close={() => (showModal = false)}>
    <img
      class="modal-img"
      on:keydown={(ev) => {
        if (ev.key === 'Enter') {
          onClick();
        }
      }}
      on:click={onClick}
      {src}
      {alt}
    />
  </Modal>
{/if}

<style>
  .modal-img {
    width: 100%;
    height: 100%;
  }

  .modal-img:hover {
    cursor: zoom-out;
  }

  .ulucak-img:hover {
    cursor: zoom-in;
  }
</style>
