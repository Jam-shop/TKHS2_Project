// Initialize the map centered on Assam
const map = L.map('map').setView([26.2006, 92.9376], 7);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let districtData = [];

// Fetch the district data JSON file
fetch('district_data.json')
    .then(response => response.json())
    .then(data => {
        districtData = data; // Save the loaded JSON data in the global variable
        loadDistricts(); // Call the function to load districts after data is available
    })
    .catch(error => console.error('Error loading district data:', error));

// Function to load districts with pie charts
function loadDistricts() {
    fetch('./ASSAM_DISTRICTS.geojson')
        .then(response => response.json())
        .then(geoData => {
            // Create a GeoJSON layer with custom style and tooltips
            L.geoJSON(geoData, {
                style: function(feature) {
                    return { color: '#537FE6', weight: 1, fillOpacity: 0.1 };
                },
                onEachFeature: function(feature, layer) {
                    const districtName = feature.properties.dtname;  // Replace with correct property name in your GeoJSON
                    const data = getDistrictData(districtName); // Get data from JSON or other sources
                    
                    if (data) {
                        addPieChartMarker(districtName, data, layer);
                    }
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error loading GeoJSON:', error));
}

// Function to retrieve district data based on name
function getDistrictData(name) {
    return districtData.find(d => d.Name === name) || { Hindu: 0, Muslim: 0, Christian: 0, Others: 0, Total_Population: 1 };
}

// Function to add a pie chart marker at the center of the district
function addPieChartMarker(districtName, data, layer) {
    // Data for the pie chart (religion percentages)
    const chartData = {
        labels: ['Hindus', 'Muslims', 'Others'],
        datasets: [{
            data: [
                data.Hindu * 100 / data.Total_Population,
                data.Muslim * 100 / data.Total_Population,
                (data.Christian + data.Sikh + data.Buddhist + data.Jain + data.Others) * 100 / data.Total_Population
            ],
            backgroundColor: ['#000000', '#0000FF', '#00FFFF']
        }]
    };
    console.log(districtName,chartData);


    // Create a new canvas for each district pie chart
    const canvas = document.createElement('canvas');
    canvas.width = 25;
    canvas.height = 25;

    // Temporarily append to body for rendering
    document.body.appendChild(canvas);

    // Render the chart on the canvas
    const chart = new Chart(canvas, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: false,
            animation: false, // Disable animation for immediate rendering
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });

    // Convert the canvas to an image and remove it from the DOM
    setTimeout(() => {
        const imageUrl = canvas.toDataURL(); // Convert canvas to image
        document.body.removeChild(canvas); // Remove canvas from DOM
        chart.destroy(); // Destroy chart instance to avoid memory leaks

        // Create a Leaflet icon with the rendered pie chart as an image
        const pieIcon = L.divIcon({
            className: 'leaflet-pie-chart-icon',
            html: `<img src="${imageUrl}" width="25" height="25" />`,
            iconSize: [25, 25],
            // iconAnchor: [25, 25]
        });

        // Place the pie chart as a marker on the map, centered on the district
        const districtCenter = layer.getBounds().getCenter();
        L.marker(districtCenter, { icon: pieIcon }).addTo(map);
    }, 100); // Adjust delay if required
}
