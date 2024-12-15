// Initialize the map
const map = L.map('map', {
  center: [27.7, 85.3], // Center of Nepal
  zoom: 7
});

// Add OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add floating filter panel inside the map container
const filterPanel = L.DomUtil.create('div', 'filter-panel');
filterPanel.innerHTML = `
  <select id="province-select">
    <option value="" disabled selected>Select Province</option>
  </select>
  <select id="watershed-select" disabled>
    <option value="" disabled selected>Select Watershed</option>
  </select>
  <button id="submit-btn" disabled>Submit</button>
`;
map.getContainer().appendChild(filterPanel);

// Disable map interactions for the panel
L.DomEvent.disableClickPropagation(filterPanel);

// Global variables for GeoJSON layers
let provincesLayer, watershedsLayer;

// Load GeoJSON files for provinces and watersheds
Promise.all([
  fetch('provinces.geojson').then(res => res.json()),
  fetch('watersheds.geojson').then(res => res.json())
]).then(([provincesData, watershedsData]) => {
  // Add province layer to the map
  provincesLayer = L.geoJSON(provincesData);
  watershedsLayer = L.geoJSON(watershedsData);

  // Populate the province dropdown
  const provinceSelect = document.getElementById('province-select');
  const uniqueProvinces = [...new Set(provincesData.features.map(f => f.properties.name))];
  uniqueProvinces.forEach(province => {
    const option = document.createElement('option');
    option.value = province;
    option.textContent = province;
    provinceSelect.appendChild(option);
  });

  // Enable watershed selection when a province is selected
  provinceSelect.addEventListener('change', () => {
    const selectedProvince = provinceSelect.value;

    // Filter watersheds by province
    const filteredWatersheds = watershedsData.features.filter(
      f => f.properties.province_name === selectedProvince
    );

    const watershedSelect = document.getElementById('watershed-select');
    watershedSelect.innerHTML = '<option value="" disabled selected>Select Watershed</option>';
    filteredWatersheds.forEach(watershed => {
      const option = document.createElement('option');
      option.value = watershed.properties.name;
      option.textContent = watershed.properties.name;
      watershedSelect.appendChild(option);
    });

    watershedSelect.disabled = false;
    document.getElementById('submit-btn').disabled = true;
  });

  // Enable the Submit button when a watershed is selected
  document.getElementById('watershed-select').addEventListener('change', () => {
    document.getElementById('submit-btn').disabled = false;
  });

  // Zoom to selected watershed on Submit
  document.getElementById('submit-btn').addEventListener('click', () => {
    const selectedWatershed = document.getElementById('watershed-select').value;

    // Find the selected watershed's geometry
    const selectedFeature = watershedsData.features.find(
      f => f.properties.name === selectedWatershed
    );

    // Zoom to the watershed's bounds
    const selectedLayer = L.geoJSON(selectedFeature);
    map.fitBounds(selectedLayer.getBounds());
  });
}).catch(error => {
  console.error('Error loading GeoJSON data:', error);
});
