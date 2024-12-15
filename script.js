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
  <select id="watershed-select">
    <option value="" disabled selected>Select Watershed</option>
  </select>
  <button id="submit-btn" disabled>Submit</button>
`;
map.getContainer().appendChild(filterPanel);

// Disable map interactions for the panel
L.DomEvent.disableClickPropagation(filterPanel);

// Global variable for the GeoJSON layer
let watershedsLayer;

// Load GeoJSON for watersheds
fetch('watersheds.geojson')
  .then(res => res.json())
  .then(watershedsData => {
    // Add watershed layer to the map
    watershedsLayer = L.geoJSON(watershedsData, {
      style: {
        color: '#ff7800',
        weight: 1, // Boundary line thickness
        fillOpacity: 0 // Fully transparent fill
      }
    }).addTo(map);

    // Populate the watershed dropdown
    const watershedSelect = document.getElementById('watershed-select');
    const uniqueWatersheds = [...new Set(watershedsData.features.map(f => f.properties.BASIN_NAME))];
    uniqueWatersheds.forEach(watershed => {
      const option = document.createElement('option');
      option.value = watershed;
      option.textContent = watershed;
      watershedSelect.appendChild(option);
    });

 // Enable the Submit button when a watershed is selected
    watershedSelect.addEventListener('change', () => {
      document.getElementById('submit-btn').disabled = false;
    });

    // Zoom to selected watershed on Submit
    document.getElementById('submit-btn').addEventListener('click', () => {
      const selectedWatershed = document.getElementById('watershed-select').value;

      // Find the selected watershed's geometry
      const selectedFeature = watershedData.features.find(
        f => f.properties.BASIN_NAME === selectedWatershed
      );

      if (selectedFeature) {
        const selectedLayer = L.geoJSON(selectedFeature, {
          style: {
            color: '#ff7800',
            weight: 1, // Boundary line thickness
            fillOpacity: 0 // Fully transparent fill
          }
        });

        // Add the selected layer to the map
        selectedLayer.addTo(map);

        // Zoom to the watershed's bounds
        map.fitBounds(selectedLayer.getBounds());

        // Optionally, you can clear previous layers after zooming
        map.eachLayer(function(layer) {
          if (layer !== selectedLayer) {
            map.removeLayer(layer);
          }
        });
      }
    });
  })
  .catch(error => {
    console.error('Error loading GeoJSON data:', error);
  });
