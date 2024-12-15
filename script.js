// Initialize the map
const map = L.map('map').setView([27.7, 85.3], 8);
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const basemapLayers = {
  'OpenStreetMap': osmLayer,
  'Google Maps': L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  })
};
L.control.layers(basemapLayers).addTo(map);

// Load GeoJSON
fetch('watersheds.geojson')
  .then(response => response.json())
  .then(data => {
    const dropdown = document.getElementById('basinDropdown');
    const geoJsonLayer = L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        dropdown.add(new Option(feature.properties.BASIN_NAME, feature.properties.BASIN_NAME));
        layer.bindPopup(feature.properties.BASIN_NAME);
      }
    });
    geoJsonLayer.addTo(map);
  });

// Handle form submission
document.getElementById('submitButton').onclick = async () => {
  const dateBefore1 = document.getElementById('dateBefore1').value;
  const dateBefore2 = document.getElementById('dateBefore2').value;
  const dateAfter1 = document.getElementById('dateAfter1').value;
  const dateAfter2 = document.getElementById('dateAfter2').value;
  const selectedBasin = document.getElementById('basinDropdown').value;

  if (!dateBefore1 || !dateBefore2 || !dateAfter1 || !dateAfter2 || !selectedBasin) {
    alert('All inputs are required!');
    return;
  }

  // Call the GEE function for flood mapping
  document.getElementById('statusMessage').innerText = 'Fetching flood mapping data...';
  const result = await performFloodMapping(selectedBasin, dateBefore1, dateBefore2, dateAfter1, dateAfter2);
  
  if (result.success) {
    document.getElementById('statusMessage').innerText = `
      Flood mapping complete:
      - Watershed: ${result.watershed}
      - Dates: ${result.dates.join(', ')}
      - Blue Area (water bodies): ${result.blueArea} sq.km
      - Yellow Area (inundated): ${result.yellowArea} sq.km
    `;
  } else {
    document.getElementById('statusMessage').innerText = 'Flood mapping failed. See console for details.';
  }
};
