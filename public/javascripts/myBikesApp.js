var bikesApp = angular.module('myBikesApp',['google-maps','ngTouch','servicesgeo','ngAnimate']);

/*Service to handle the socket from the serveur*/
bikesApp.service("socket", function($rootScope){
	var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
    };
})


bikesApp.controller("areaListController",function($scope,$sce,socket,geolocateMe,flyingDistance){

    /* PARAMETERS HANDLE GOOGLE MAP DIRECTIVE*/
    angular.extend($scope, {
        map: {
            control: {},
            
            center: {
                latitude: 1, //default values
                longitude: -1 //default values
            },
            options: {
                streetViewControl: false,
                panControl: false,
                zoomControl:false,
                scrollwheel:false,
                keyboardShortcuts:false,
                mapTypeControl:false
            },
            zoom: 17,
            dragging: false,
            bounds: {}
        }
        
    });
    
    $scope.searchLocationMarker = {
        coords: {
            latitude: 1, //default values
            longitude:-1 //default values
        }
    }

    var myPosition; // JSON latitude,longitude of the client
    $scope.loaded = false;


    // Node.js is sending the client refreshed bikes list
	socket.on('newList', function(data) { // Listening in Socket in Angular Controller

		$scope.mainAreas = data.list.stationBeanList;
        $scope.updateTime = data.list.executionTime;
        $scope.predicate = "distance.dmi"; //to order the station list 

        //we locate the client calling the factory geolocateMe using promises (it may take a while to get the current location)
        geolocateMe.then(function(data) {
            myPosition = data;
            //calculate the distance between the current client location and the Area's bikes locations
            angular.forEach($scope.mainAreas, function(area) {
                var areaPosition  = JSON.parse('{"latitude" :'+area.latitude+',"longitude":'+area.longitude+'}'); 
                var myDist = JSON.parse(flyingDistance.calculate(myPosition,areaPosition));

                area.distance = myDist;
                area.center =JSON.parse('{"latitude":'+area.latitude+',"longitude":'+area.longitude+'}');  
                
            })  
            $scope.loaded =true;     
        }, function(erreur) {
            $scope.msg = erreur;
        });

        ;
        
	});

    $scope.goToMap = function(area){
        //we store the current station aera selected into a temp var in order to disable the map refresh on socket Event
        $scope.tmpArea = area;
        $scope.showDetails=true;

        //refresh the map scope
        $scope.map.center.latitude =$scope.tmpArea.latitude;
        $scope.map.center.longitude =$scope.tmpArea.longitude;
        $scope.searchLocationMarker.coords.latitude= $scope.tmpArea.latitude;
        $scope.searchLocationMarker.coords.longitude= $scope.tmpArea.longitude;
        
    }
    $scope.leaveFromMap = function(){
        
        $scope.showDetails=false;
    }

    $scope.convertToFeet = function(distance){
        if(distance<0.1){
            return true;
        }
        return false;
    }
	
});


