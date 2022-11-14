<!-- svelte popup component -->
<script lang="ts">
</script>

<div class="modal-wrapper">
  <div class="modal-content">
    <h3>hello</h3>
  </div>
</div>

<style>
  .modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    padding: 1rem 3rem;
    height: 100%;
    z-index: 56;
  }

  .modal-content {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0 0 0.5rem 0.5rem rgba(0, 0, 0, 0.1);
  }
</style>
