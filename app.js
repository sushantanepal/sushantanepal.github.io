// Initialize the map
const map = L.map('map').setView([27.7, 85.3], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Load GeoJSON data
fetch('watersheds.geojson')
    .then(response => response.json())
    .then(data => {
        const basinDropdown = document.getElementById('basinDropdown');
        L.geoJSON(data, {
            onEachFeature: (feature, layer) => {
                basinDropdown.add(new Option(feature.properties.BASIN_NAME, feature.properties.BASIN_NAME));
            }
        }).addTo(map);
        document.getElementById('notification').innerText = 'Names of basin are accessible';
    });

// Handle basin submission
document.getElementById('submitBasin').onclick = () => {
    const basin = document.getElementById('basinDropdown').value;
    if (!basin) {
        alert('Please select a basin.');
        return;
    }
    document.getElementById('notification').innerText = `Basin "${basin}" selected. Zooming in...`;
    fetch('watersheds.geojson')
        .then(response => response.json())
        .then(data => {
            const selectedFeature = data.features.find(f => f.properties.BASIN_NAME === basin);
            if (selectedFeature) {
                const bounds = L.geoJSON(selectedFeature).getBounds();
                map.fitBounds(bounds);
            }
        });
};

// Handle date submission
document.getElementById('submitDates').onclick = () => {
    const dateBefore1 = document.getElementById('dateBefore1').value;
    const dateBefore2 = document.getElementById('dateBefore2').value;
    const dateAfter1 = document.getElementById('dateAfter1').value;
    const dateAfter2 = document.getElementById('dateAfter2').value;

    if (!dateBefore1 || !dateBefore2 || !dateAfter1 || !dateAfter2) {
        alert('Please enter all dates.');
        return;
    }

    const basin = document.getElementById('basinDropdown').value;
    if (!basin) {
        alert('Please select a basin first.');
        return;
    }

    // Send the data to the backend for processing
    fetch('http://your-backend-server-url.com/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            basin,
            dateBefore1,
            dateBefore2,
            dateAfter1,
            dateAfter2
        })
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('notification').innerText = `
                Basin: ${data.basin}\n
                Date Before 1: ${data.dateBefore1}\n
                Date Before 2: ${data.dateBefore2}\n
                Date After 1: ${data.dateAfter1}\n
                Date After 2: ${data.dateAfter2}\n
                Waterbody Area: ${data.waterbodyArea} sq.km\n
                Inundated Area: ${data.inundatedArea} sq.km
            `;
        });
};
