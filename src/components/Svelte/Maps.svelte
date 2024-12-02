<script>
  import { onMount } from 'svelte';

  let container;
  let map;
  let zoom = 17;
  let center = { lat: 38.47771, lng: 27.35559 };

  onMount(async function initMap() {
    map = new google.maps.Map(container, {
      zoom,
      center,
    });

    const marker = new google.maps.Marker({
      position: center,
      lablel: 'Kemalpaşa İbrahim-Hüsniye Özdurakoğlu Aile Sağlığı Merkezi',
      map: map,
    });
  });
</script>

<div class="map" bind:this={container}></div>

<style>
  .map {
    height: 400px;
    width: 100%;
  }
</style>
