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

let geoJsonData;

// Load GeoJSON file for Nepal boundaries
fetch('downloadeddata.geojson')
    .then(response => response.json())
    .then(data => {
        geoJsonData = data;
        populateProvinces(data);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

// Dropdown elements
const provinceDropdown = document.getElementById('provinceDropdown');
const districtDropdown = document.getElementById('districtDropdown');
const municipalityDropdown = document.getElementById('municipalityDropdown');
const zoomButton = document.getElementById('zoomToMunicipality');

// Populate Province Dropdown
function populateProvinces(data) {
    const provinces = [...new Set(data.features.map(f => f.properties.province))].sort();
    provinces.forEach(province => {
        provinceDropdown.add(new Option(province, province));
    });
}

// Populate Districts based on selected Province
provinceDropdown.addEventListener('change', function () {
    districtDropdown.innerHTML = '<option value="">Select District</option>';
    municipalityDropdown.innerHTML = '<option value="">Select Municipality</option>';
    municipalityDropdown.disabled = true;
    districtDropdown.disabled = !this.value;

    if (this.value) {
        const districts = [...new Set(
            geoJsonData.features
                .filter(f => f.properties.province === this.value)
                .map(f => f.properties.district)
        )].sort();
        districts.forEach(district => {
            districtDropdown.add(new Option(district, district));
        });
    }
});

// Populate Municipalities based on selected District
districtDropdown.addEventListener('change', function () {
    municipalityDropdown.innerHTML = '<option value="">Select Municipality</option>';
    municipalityDropdown.disabled = !this.value;
    zoomButton.disabled = !this.value;

    if (this.value) {
        const municipalities = [...new Set(
            geoJsonData.features
                .filter(f => f.properties.district === this.value)
                .map(f => f.properties.name)
        )].sort();
        municipalities.forEach(municipality => {
            municipalityDropdown.add(new Option(municipality, municipality));
        });
    }
});

// Zoom to selected Municipality
zoomButton.addEventListener('click', function () {
    const selectedMunicipality = municipalityDropdown.value;
    if (selectedMunicipality) {
        const feature = geoJsonData.features.find(f => f.properties.name === selectedMunicipality);
        if (feature) {
            const bounds = L.geoJSON(feature).getBounds();
            map.fitBounds(bounds);
        }
    }
});

// Load GeoJSON for watersheds
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

// Handle Flood Mapping Form Submission
document.getElementById('submitDates').onclick = async () => {
    const dateBefore1 = document.getElementById('dateBefore1').value;
    const dateBefore2 = document.getElementById('dateBefore2').value;
    const dateAfter1 = document.getElementById('dateAfter1').value;
    const dateAfter2 = document.getElementById('dateAfter2').value;
    const selectedBasin = document.getElementById('basinDropdown').value;

    if (!dateBefore1 || !dateBefore2 || !dateAfter1 || !dateAfter2 || !selectedBasin) {
        alert('All inputs are required!');
        return;
    }

    document.getElementById('notification').innerText = 'Fetching flood mapping data...';
};
