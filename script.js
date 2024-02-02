let map, line, circle, clickedInfoWindow, infoWindow, secondLine, thirdLine, fourthLine, lengthInfoWindow;
let markers = [];

function initMap() {
    const center = { lat: 5.952620859850009, lng: 80.5326067758267 };
    const secondLocation = { lat: 5.936906347354336, lng: 80.52025303268421 };
    const thirdLocation = { lat: 5.949711721260112, lng: 80.51795581950165 };
    const fourthLocation = { lat: 5.945020480265159, lng: 80.53568731642662 };

    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 12
    });

    function resetMap() {
        [line, circle, clickedInfoWindow, infoWindow, secondLine, thirdLine, fourthLine].forEach(item => {
            if (item) item.setMap(null);
        });

        markers.forEach(marker => {
            marker.setMap(null);
        });

        markers = [];

        if (lengthInfoWindow) {
            lengthInfoWindow.close();
        }

        // Clear the manual coordinates text box
        document.getElementById('manualCoordinates').value = '';
    }

    function drawLineWithLabel(start, end, color) {
        const path = [start, end];
        const line = new google.maps.Polyline({
            path: path,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            map: map
        });

        const length = google.maps.geometry.spherical.computeDistanceBetween(start, end) / 1000;
        const midpoint = google.maps.geometry.spherical.interpolate(start, end, 0.5);

        const marker = new google.maps.Marker({
            position: midpoint,
            label: `${length.toFixed(3)} km`,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 0,
            },
        });

        markers.push(marker);

        return line;
    }

    map.addListener('click', function(event) {
        resetMap();

        const clickedLocation = event.latLng;
        line = drawLineWithLabel(center, clickedLocation, '#0000FF');
        const distanceToClicked = google.maps.geometry.spherical.computeDistanceBetween(center, clickedLocation) / 1000;

        circle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#e9f5f9',
            fillOpacity: 0.35,
            map: map,
            center: clickedLocation,
            radius: distanceToClicked * 1000
        });

        const distanceToSecond = google.maps.geometry.spherical.computeDistanceBetween(clickedLocation, secondLocation) / 1000;
        secondLine = drawLineWithLabel(clickedLocation, secondLocation, distanceToSecond > distanceToClicked ? '#00FF00' : '#FF0000');

        const distanceToThird = google.maps.geometry.spherical.computeDistanceBetween(clickedLocation, thirdLocation) / 1000;
        thirdLine = drawLineWithLabel(clickedLocation, thirdLocation, distanceToThird > distanceToClicked ? '#00FF00' : '#FF0000');

        const distanceToFourth = google.maps.geometry.spherical.computeDistanceBetween(clickedLocation, fourthLocation) / 1000;
        fourthLine = drawLineWithLabel(clickedLocation, fourthLocation, distanceToFourth > distanceToClicked ? '#00FF00' : '#FF0000');
    });

    // Create a button to clear data and add it to the map
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Data';
    clearButton.id = 'clearButton';
    clearButton.addEventListener('click', resetMap);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(clearButton);

    // Create a text box for manual coordinates entry
    const manualCoordinatesBox = document.createElement('input');
    manualCoordinatesBox.type = 'text';
    manualCoordinatesBox.placeholder = 'Enter coordinates (lat, lng)';
    manualCoordinatesBox.id = 'manualCoordinates';
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(manualCoordinatesBox);

    // Create a button to trigger manual coordinates entry
    const manualCoordinatesButton = document.createElement('button');
    manualCoordinatesButton.textContent = 'Set Manual Coordinates';
    manualCoordinatesButton.id = 'manualCoordinatesButton';
    manualCoordinatesButton.addEventListener('click', function() {
        const coordinatesInput = document.getElementById('manualCoordinates').value;

        if (coordinatesInput.trim() !== '') {
            // Use coordinates from the manual input
            const coordinatesArray = coordinatesInput.split(',');
            if (coordinatesArray.length === 2) {
                const lat = parseFloat(coordinatesArray[0]);
                const lng = parseFloat(coordinatesArray[1]);
                if (!isNaN(lat) && !isNaN(lng)) {
                    const clickedLocation = new google.maps.LatLng(lat, lng);
                    // Call the click event manually
                    google.maps.event.trigger(map, 'click', {
                        latLng: clickedLocation
                    });
                } else {
                    alert('Invalid coordinates format. Please enter valid numbers for latitude and longitude.');
                }
            } else {
                alert('Invalid coordinates format. Please enter both latitude and longitude.');
            }
        } else {
            // Get user's current location using Geolocation API
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const coordinatesInput = `${lat}, ${lng}`;
                    document.getElementById('manualCoordinates').value = coordinatesInput;

                    const clickedLocation = new google.maps.LatLng(lat, lng);
                    // Call the click event manually
                    google.maps.event.trigger(map, 'click', {
                        latLng: clickedLocation
                    });    
                }, function(error) {
                    console.error(error.message);
                    alert('Unable to retrieve your location. Please enter coordinates manually.');
                });
            } else {
                alert('Geolocation is not supported by your browser. Please enter coordinates manually.');
            }
        }
    });
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(manualCoordinatesButton);
}
