$(document).ready(function () {
    $('#loginForm').submit(function (event) {
        event.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();
        $.ajax({
            url: '/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username: username, password: password }),
            success: function (response) {
                localStorage.setItem('token', response.token);
                $('#login-section').hide();
                $('#records-section').show();
            },
            error: function (xhr, status, error) {
                $('#loginResult').html('<div class="alert alert-danger">Login failed: ' + xhr.responseText + '</div>');
            }
        });
    });

    $('#getRecordsForm').submit(function (event) {
        event.preventDefault();
        const vehicleID = $('#getVehicleID').val();
        const token = localStorage.getItem('token');
        $.ajax({
            url: `/getRecords/${vehicleID}`,
            type: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function (response) {
                let output = `<h3>Vehicle ID: ${vehicleID}</h3>`;
                output += '<ul>';
                output += `<li><strong>Timestamp:</strong> ${new Date(response.timestamp * 1000).toLocaleString()}</li>`;
                const dataHash = JSON.parse(response.dataHash);
                output += `<li><strong>Engine Temperature:</strong> ${dataHash.engine_temperature} °C</li>`;
                output += `<li><strong>Oil Pressure:</strong> ${dataHash.oil_pressure} psi</li>`;
                output += `<li><strong>Tire Pressure:</strong>`;
                output += `<ul>`;
                output += `<li>Front Left: ${dataHash.tire_pressure.front_left} psi</li>`;
                output += `<li>Front Right: ${dataHash.tire_pressure.front_right} psi</li>`;
                output += `<li>Rear Left: ${dataHash.tire_pressure.rear_left} psi</li>`;
                output += `<li>Rear Right: ${dataHash.tire_pressure.rear_right} psi</li>`;
                output += `</ul></li>`;
                output += `<li><strong>Battery Status:</strong> ${dataHash.battery_status}</li>`;
                output += `<li><strong>Fuel Level:</strong> ${dataHash.fuel_level}%</li>`;
                output += '</ul>';
                $('#recordsOutput').html(output);
            },
            error: function (xhr, status, error) {
                $('#getRecordsResult').html('<div class="alert alert-danger">Error getting records: ' + xhr.responseText + '</div>');
            }
        });
    });
});

