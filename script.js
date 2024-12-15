// Initialize the map
const map = L.map('map', {
  center: [27.700769, 85.300140], // Kathmandu, Nepal (adjust to your preferred location)
  zoom: 13
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
let isOSMActive = true; // Track the active layer
const toggleButton = document.getElementById('toggleButton');

// Add event listener to the toggle button
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
  isOSMActive = !isOSMActive; // Toggle the layer state
});
