export const displayMap = (locations) => {
   mapboxgl.accessToken =
      'pk.eyJ1IjoiZmFybWFuY3MyMDI0IiwiYSI6ImNtN2x5N3BsNzBoNzcyaXNkaGg1cTV3aTkifQ.ZkdHSHSNrpFR0Ii3RV6aQg';
   const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      scrollZoom: false
   });
   const bounds = new mapboxgl.LngLatBounds()
   locations.forEach(loc => {
      // creating marker to locastion
      let el = document.createElement('div');
      el.className = 'marker';
      //add marker 
      new mapboxgl.Marker({
         element: el,
         anchor: 'bottom'
      })
         .setLngLat(loc.coordinates)
         .addTo(map)
      //add popup message
      new mapboxgl.Popup({
         offset: 20
      })
         .setLngLat(loc.coordinates)
         .setHTML(`<p>Day ${loc.day}: ${loc.description}</P>`)
         .addTo(map)
      //extend the coordinates
      bounds.extend(loc.coordinates);
   });
   map.fitBounds(bounds, {
      padding: {
         top: 200,
         bottom: 150,
         left: 100,
         right: 100
      }
   })
}

