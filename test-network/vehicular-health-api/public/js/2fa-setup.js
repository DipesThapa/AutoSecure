$(document).ready(function () {
    $('#setup2FAForm').submit(function (event) {
        event.preventDefault();
        const username = $('#setupUsername').val();

        $.ajax({
            url: '/2fa/setup',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username }),
            success: function (response) {
                $('#qrCode').attr('src', response.qrCode);
                $('#setupResult').html('<div class="alert alert-success">Scan the QR code with your authenticator app.</div>');
            },
            error: function (xhr, status, error) {
                console.error('Error setting up 2FA:', xhr.status, xhr.responseText);
                $('#setupResult').html('<div class="alert alert-danger">Error: ' + xhr.responseText + '</div>');
            }
        });
    });
});

