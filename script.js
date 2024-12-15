// Initialize the map
const map = L.map('map', {
  center: [27.700769, 85.300140], // Kathmandu, Nepal
  zoom: 7 // Adjust zoom to fit the national boundary
});

// Define OpenStreetMap layer
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Define Google Maps layer
const googleMapsLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
});

// Add the default OpenStreetMap layer to the map
osmLayer.addTo(map);

// Handle layer switching
let isOSMActive = true;
const toggleButton = document.getElementById('toggleButton');
toggleButton.addEventListener('click', () => {
  if (isOSMActive) {
    map.removeLayer(osmLayer);
    map.addLayer(googleMapsLayer);
    toggleButton.textContent = 'Switch to OpenStreetMap';
  } else {
    map.removeLayer(googleMapsLayer);
    map.addLayer(osmLayer);
    toggleButton.textContent = 'Switch to Google Maps';
  }
  isOSMActive = !isOSMActive;
});

// Load Nepal national boundary GeoJSON
fetch('nepal-boundary.geojson')
  .then(response => response.json())
  .then(geojsonData => {
    // Add the boundary to the map
    const boundaryLayer = L.geoJSON(geojsonData, {
      style: {
        color: '#FF0000', // Red color for the boundary
        weight: 0.5, // 0.5mm equivalent in Leaflet
        opacity: 1
      }
    });

    // Add the boundary layer to the map
    boundaryLayer.addTo(map);

    // Adjust map view to fit the boundary
    map.fitBounds(boundaryLayer.getBounds());
  })
  .catch(error => {
    console.error('Error loading GeoJSON:', error);
  });

