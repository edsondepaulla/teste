var Location = {
    onDeviceReady: function () {
        $(document).on("resume", Location.onResume);
        Location.checkState();
    },
    onResume: function () {
        Location.checkState();
    },

    openSettings: function () {
        if (cordova.platformId === "android") {
            cordova.plugins.diagnostic.switchToLocationSettings();
        } else {
            cordova.plugins.diagnostic.switchToSettings();
        }
    },

    handleLocationAuthorizationStatus: function (status) {
        switch (status) {
            case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                if (cordova.platformId === "ios") {
                    Location.onError("Location services is already switched ON");
                }
                $('#request-authorization').attr('disabled', 'disabled');

                break;
            case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED:
                if (cordova.platformId === "android") {
                    Location.onError("User denied permission to use location");
                    $('#request-authorization').removeAttr('disabled');
                }
                break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                // Android only
                Location.onError("User denied permission to use location");
                break;
            case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
                // iOS only
                Location.onError("Location services is already switched ON");
                $('#request-authorization').attr('disabled', 'disabled');
                break;
        }
    },

    requestLocationAuthorization: function () {
        cordova.plugins.diagnostic.requestLocationAuthorization(
            Location.handleLocationAuthorizationStatus,
            function (error) {
                alert("1 An error occurred: " + error);
                Location.checkState();
            }
        );
    },

    requestLocationAccuracy: function () {
        cordova.plugins.locationAccuracy.canRequest(function (canRequest) {
            if (canRequest) {
                cordova.plugins.locationAccuracy.request(function () {
                        Location.handleSuccess("Location accuracy request successful");
                    }, function (error) {
                        Location.onError("Error requesting location accuracy: " + JSON.stringify(error));
                        if (error) {
                            // Android only
                            Location.onError("error code=" + error.code + "; error message=" + error.message);
                            if (cordova.platformId === "android" && error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
                                if (window.confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")) {
                                    cordova.plugins.diagnostic.switchToLocationSettings();
                                }
                            }
                        }
                    }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
                );
            } else {
                // On iOS, this will occur if Location Services is currently on OR a request is currently in progress.
                // On Android, this will occur if the app doesn't have authorization to use location.
                Location.onError("Cannot request location accuracy");
            }
        });
    },

    checkState: function () {
        var canRequest;
        cordova.plugins.locationAccuracy.canRequest(function (_canRequest) {
            canRequest = _canRequest;
            if (canRequest) {
                $('#request-accuracy').removeAttr('disabled');
            } else {
                $('#request-accuracy').attr('disabled', 'disabled');
            }
        });

        cordova.plugins.diagnostic.isLocationAvailable(
            function (available) {
                $('#location-available').text(available ? "AVAILABLE" : "UNAVAILABLE");
            }, function (error) {
                alert("2 An error occurred: " + error);
                Location.checkState();
            }
        );


        cordova.plugins.diagnostic.isLocationEnabled(
            function (enabled) {
                $('#location-enabled').text(enabled ? "ENABLED" : "DISABLED");
                if (enabled) {
                    cordova.plugins.diagnostic.isLocationAuthorized(function (authorized) {


                        $('#location-authorized').text(authorized ? "AUTHORIZED" : "UNAUTHORIZED");
                    }, function (error) {
                        alert("3 An error occurred: " + error);
                        Location.checkState();
                    });
                } else {
                    $('#location-authorized').text("UNKNOWN");
                }
            },
            function (error) {
                alert("4 An error occurred: " + error);
                Location.checkState();
            }
        );

        cordova.plugins.diagnostic.getLocationAuthorizationStatus(
            Location.handleLocationAuthorizationStatus,
            function (error) {
                alert("5 An error occurred: " + error);
                Location.checkState();
            }
        );

        if (cordova.platformId === "android") {
            cordova.plugins.diagnostic.getLocationMode(
                function (mode) {
                    $('#location-mode').text(mode.toUpperCase());
                    if (canRequest && mode !== "high_accuracy") {
                        $('#request-accuracy').removeAttr('disabled');
                    } else {
                        $('#request-accuracy').attr('disabled', 'disabled');
                    }
                }, function (error) {
                    alert("6 An error occurred: " + error);
                    Location.checkState();
                }
            );
        }
    },
    onError: function (error) {
        alert("7 An error occurred: " + error);
        Location.checkState();
    },
    handleSuccess: function (msg) {
        alert(msg);
        Location.checkState();
    }
};

$(document).on("deviceready", Location.onDeviceReady);