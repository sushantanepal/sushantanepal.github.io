// Initialize the map
const map = L.map('map', {
  center: [27.7, 85.3], // Center of Nepal
  zoom: 7
});

// Add OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Global variables for GeoJSON layers
let provincesLayer, districtsLayer, municipalitiesLayer;

// Load GeoJSON files for provinces, districts, and municipalities
Promise.all([
  fetch('provinces.geojson').then(res => res.json()),
  fetch('districts.geojson').then(res => res.json()),
  fetch('municipalities.geojson').then(res => res.json())
]).then(([provincesData, districtsData, municipalitiesData]) => {
  // Add layers to the map for provinces, districts, and municipalities
  provincesLayer = L.geoJSON(provincesData);
  districtsLayer = L.geoJSON(districtsData);
  municipalitiesLayer = L.geoJSON(municipalitiesData);

  // Populate the province dropdown
  const provinceSelect = document.getElementById('province-select');
  const uniqueProvinces = [...new Set(provincesData.features.map(f => f.properties.name))];
  uniqueProvinces.forEach(province => {
    const option = document.createElement('option');
    option.value = province;
    option.textContent = province;
    provinceSelect.appendChild(option);
  });

  // Enable district selection when a province is selected
  provinceSelect.addEventListener('change', () => {
    const selectedProvince = provinceSelect.value;

    // Filter districts by province
    const filteredDistricts = districtsData.features.filter(
      f => f.properties.province_name === selectedProvince
    );

    const districtSelect = document.getElementById('district-select');
    districtSelect.innerHTML = '<option value="" disabled selected>Select District</option>';
    filteredDistricts.forEach(district => {
      const option = document.createElement('option');
      option.value = district.properties.name;
      option.textContent = district.properties.name;
      districtSelect.appendChild(option);
    });

    districtSelect.disabled = false;
    document.getElementById('municipality-select').disabled = true;
    document.getElementById('submit-btn').disabled = true;
  });

  // Enable municipality selection when a district is selected
  document.getElementById('district-select').addEventListener('change', () => {
    const selectedDistrict = document.getElementById('district-select').value;

    // Filter municipalities by district
    const filteredMunicipalities = municipalitiesData.features.filter(
      f => f.properties.district_name === selectedDistrict
    );

    const municipalitySelect = document.getElementById('municipality-select');
    municipalitySelect.innerHTML = '<option value="" disabled selected>Select Municipality</option>';
    filteredMunicipalities.forEach(municipality => {
      const option = document.createElement('option');
      option.value = municipality.properties.name;
      option.textContent = municipality.properties.name;
      municipalitySelect.appendChild(option);
    });

    municipalitySelect.disabled = false;
    document.getElementById('submit-btn').disabled = true;
  });

  // Enable the Submit button when a municipality is selected
  document.getElementById('municipality-select').addEventListener('change', () => {
    document.getElementById('submit-btn').disabled = false;
  });

  // Zoom to selected municipality on Submit
  document.getElementById('submit-btn').addEventListener('click', () => {
    const selectedMunicipality = document.getElementById('municipality-select').value;

    // Find the selected municipality's geometry
    const selectedFeature = municipalitiesData.features.find(
      f => f.properties.name === selectedMunicipality
    );

    // Zoom to the municipality's bounds
    const selectedLayer = L.geoJSON(selectedFeature);
    map.fitBounds(selectedLayer.getBounds());
  });
}).catch(error => {
  console.error('Error loading GeoJSON data:', error);
});
