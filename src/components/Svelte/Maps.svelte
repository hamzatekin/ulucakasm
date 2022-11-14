<script>
  let container;
  let map;
  let zoom = 17;
  let center = { lat: 38.47777128408031, lng: 27.355494344671058 };

  import { onMount } from 'svelte';

  onMount(async function initMap() {
    map = new google.maps.Map(container, {
      zoom,
      center,
    });

    const marker = new google.maps.Marker({
      position: center,
      lablel: 'Ulucak Aile Sağlığı Merkezi',
      map: map,
    });
  });
</script>

<div class="map" bind:this={container} />

<style>
  .map {
    height: 400px;
    width: 100%;
  }
</style>
