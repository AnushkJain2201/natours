document.addEventListener('DOMContentLoaded', function () {
    const locations = JSON.parse(document.getElementById('map').dataset.locations);
    console.log(locations);

    mapboxgl.accessToken = 'pk.eyJ1IjoiYW51c2hrMjIwMSIsImEiOiJjbHdtMzRtaTcwYmU0Mmlyem00d3Ruc3I5In0.oMva6sUtIzA-mck7hJx6_Q';
    let map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/anushk2201/clwm3gbvl00oc01qxc5zt5n3v', // style URL
        scrollZoom: false
        // center: [-73.985141, 40.75894], // starting position [lng, lat]
        // zoom: 9, // starting zoom
        // interactive: false
    });

    const bound = new mapboxgl.LngLatBounds();

    locations.forEach(location => {
        const el = document.createElement('div');
        el.className = 'marker';


        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
        }).setLngLat(location.coordinates).addTo(map);

        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(location.coordinates).setHTML(`<p>Day ${location.day}: ${location.description}</p>`).addTo(map);

        bound.extend(location.coordinates);
    });

    map.fitBounds(bound, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        }
    });

});

