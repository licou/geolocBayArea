var servicesgeo = angular.module('servicesgeo', []);

servicesgeo.factory("geolocateMe", function($q){
    var deferred = $q.defer();

    if(navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function(position) {
            var myPosition = '{"latitude":'+position.coords.latitude+', "longitude":'+position.coords.longitude+',"test":"tto"}';
            myPosition = JSON.parse(myPosition);
            deferred.resolve(myPosition);
        });
    } 
    else {
        alert("Error getting your location");
        deferred.reject("Sorry, we haven't been able to detect your location");
        browserSupportFlag = false;
    }
    return deferred.promise;
});

servicesgeo.factory("flyingDistance",function($rootScope){
    var distance = {};

    var rayonMi = 3958.75587; // mi
    var rayonFt =  20902230.9936; //ft
    var rayonKm = 6371; //km


    distance.calculate = function(coord1,coord2){
        var dLat = (coord1.latitude-coord2.latitude)*Math.PI / 180;
        var dLon = (coord1.longitude-coord2.longitude)*Math.PI / 180;
        var lat1 = (coord1.latitude)*Math.PI / 180;
        var lat2 = (coord1.latitude)*Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var dmi = (rayonMi * c).toFixed(1);
        var dft = Math.round(rayonFt * c);

        distance = '{"dmi":'+dmi+',"dft":'+dft+'}'; 

        return distance;
    }

    return distance;

});

