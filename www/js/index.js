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
            case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
            case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                $('#request-authorization').attr('disabled', 'disabled');
                break;
            case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED:
                if (cordova.platformId === "android")
                    Location.checkState();
                break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                Location.checkState();
                break;
        }
    },

    requestLocationAuthorization: function () {
        try {
            cordova.plugins.diagnostic.requestLocationAuthorization(
                Location.handleLocationAuthorizationStatus,
                function (error) {
                    alert(error);
                }
            );
        }catch (e) {
            alert(e);
        }
    },

    requestLocationAccuracy: function () {
        try {
            cordova.plugins.locationAccuracy.canRequest(function (canRequest) {
                if (canRequest) {
                    cordova.plugins.locationAccuracy.request(function () {
                            Location.checkState();
                        }, function (error) {
                            if (error) {
                                if (cordova.platformId === "android" && error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
                                    if (window.confirm("Falha ao definir o Modo de Localização automaticamente como 'Alta Precisão'. Deseja mudar as Configurações de local e fazer isso manualmente?"))
                                        cordova.plugins.diagnostic.switchToLocationSettings();
                                }
                            }
                        }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY
                    );
                } else
                    alert("Não é possível solicitar a precisão da localização, favor verificar!");
            });

        } catch (e) {
            alert(e);
        }
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
                $('#location-available').text(available ? "ACESSÍVEL" : "INDISPONÍVEL");
            }, function (error) {
                Location.checkState();
            }
        );

        cordova.plugins.diagnostic.isLocationEnabled(
            function (enabled) {
                $('#location-enabled').text(enabled ? "ATIVADA" : "DESATIVADA");
                if (enabled) {
                    cordova.plugins.diagnostic.isLocationAuthorized(function (authorized) {


                        $('#location-authorized').text(authorized ? "AUTORIZADA" : "NÃO AUTORIZADO");
                    }, function (error) {
                        Location.checkState();
                    });
                } else {
                    $('#location-authorized').text("DESCONHECIDA");
                }
            },
            function (error) {
                Location.checkState();
            }
        );

        cordova.plugins.diagnostic.getLocationAuthorizationStatus(
            Location.handleLocationAuthorizationStatus,
            function (error) {
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
                    Location.checkState();
                }
            );
        }
    }
};

$(document).on("deviceready", Location.onDeviceReady);