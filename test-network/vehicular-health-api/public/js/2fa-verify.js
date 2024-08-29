$(document).ready(function () {
    $('#verify2FAForm').submit(function (event) {
        event.preventDefault();
        const username = $('#verifyUsername').val();
        const token = $('#verifyToken').val();

        $.ajax({
            url: '/2fa/verify',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, token }),
            success: function (response) {
                $('#verifyResult').html('<div class="alert alert-success">' + response + '</div>');
            },
            error: function (xhr, status, error) {
                console.error('Error verifying 2FA:', xhr.status, xhr.responseText);
                $('#verifyResult').html('<div class="alert alert-danger">Error: ' + xhr.responseText + '</div>');
            }
        });
    });
});

