angular.module('guestReservation', ['gm'])

    
    .controller('locatorController', function($scope, $http) {

        var map;
        var markers = [];
        var infoWindow;
        var locationSelect;
        var manMarker;
        $scope.myLocation = "";

        $scope.outletList = [];

        map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 13.0826802, //Chennai
                lng: 80.2707184
            },
            zoom: 13
        });

        infoWindow = new google.maps.InfoWindow();

        $scope.$on('gmPlacesAutocomplete::placeChanged', function() {
            $scope.myLocation = $scope.autocomplete.getPlace();
            $scope.$apply();
        });




        $scope.findZaitoon = function() {

            var place = $scope.myLocation;

            manMarker = new google.maps.Marker({
                map: map,
                anchorPoint: new google.maps.Point(0, -29),
                animation: google.maps.Animation.BOUNCE,
                icon: "https://zaitoon.online/icons/person_marker.png"
            });

            manMarker.setVisible(false);

            if (!place.geometry) {
                var x = document.getElementById("snackbar")
                x.innerHTML = "No location name " + place.name;
                x.className = "show";
                setTimeout(function() {
                    x.className = x.className.replace("show", "");
                }, 5000);

                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }
            manMarker.setPosition(place.geometry.location);
            manMarker.setVisible(true);

            //Call show branches function.
            $scope.showOutlets(place.geometry.location);

        }


        function clearLocations() {
            infoWindow.close();
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers.length = 0;
        }



        $scope.showOutlets = function(center) {
            clearLocations();

            $scope.outletList = [];

            var radius = document.getElementById('cuisine-type').value;
            var searchUrl = 'https://zaitoon.online/services/branchlocator.php?lat=' + center.lat() + '&lng=' + center.lng() + '&radius=' + radius;
            downloadUrl(searchUrl, function(data) {
                var xml = parseXml(data);
                var markerNodes = xml.documentElement.getElementsByTagName("marker");
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < markerNodes.length; i++) {
                    var id = markerNodes[i].getAttribute("id");
                    var name = markerNodes[i].getAttribute("name");
                    var address = markerNodes[i].getAttribute("address");
                    var contact = markerNodes[i].getAttribute("contact");
                    contact = (contact != null ? contact : 'care@zaitoon.online');
                    var hours = markerNodes[i].getAttribute("operationalHours");
                    hours = (hours != null ? hours : 'Not Available');
                    var distance = parseFloat(markerNodes[i].getAttribute("distance"));
                    var code = markerNodes[i].getAttribute("code");
                    var url = markerNodes[i].getAttribute("url");
                    var latlng = new google.maps.LatLng(
                        parseFloat(markerNodes[i].getAttribute("lat")),
                        parseFloat(markerNodes[i].getAttribute("lng")));

                    var myOutlet = {
                        "code": code,
                        "name": name,
                        "distance": Math.round(Number(distance) * 100) / 100,
                        "url": url
                    }

                    createMarker(latlng, name, address, hours, contact, distance);
                    bounds.extend(latlng);

                    $scope.outletList.push(myOutlet);
                    $scope.$apply();
                }


                var allMyMarkers = markers;
                allMyMarkers.push(manMarker);
                var count = 0;
                for (var i = 0; i < allMyMarkers.length; i++) {
                    bounds.extend(allMyMarkers[i].getPosition());
                    count++;
                }

                //No outlets found near to you
                if (count == 1) {
                    var x = document.getElementById("snackbar")
                    x.innerHTML = "Sorry! There are no Zaitoon Outlet with in " + radius + " Kms to you.";
                    x.className = "show";
                    setTimeout(function() {
                        x.className = x.className.replace("show", "");
                    }, 3000);
                } else {
                    var x = document.getElementById("snackbar")
                    x.innerHTML = count == 2 ? "We have found 1 Zaitoon outlet with in " + radius + " Kms to you." : "We have found " + (count - 1) + " Zaitoon outlets with in " + radius + " Kms to you.";
                    x.className = "show";
                    setTimeout(function() {
                        x.className = x.className.replace("show", "");
                    }, 3000);

                    $('html, body').animate({
                        scrollTop: $("#outletSuggetions").offset().top
                    }, 1000);

                }

                map.fitBounds(bounds);

            });
        }

        function createMarker(latlng, name, address, hours, contact, distance) {
            var html = "<b style='color: #ed1c24'>Zaitoon " + name + "</b> <br/>" + address + "<br/>Open Hours: " + hours + "<br/> Contact " + contact + "<br/><tag style='color: #e67e22' >" + Math.round(distance * 100) / 100 + " km away</tag><br/><br/><button>Reserve Table</button>";
            var zaitoonMarker = new google.maps.Marker({
                map: map,
                position: latlng,
                animation: google.maps.Animation.DROP,
                icon: "https://zaitoon.online/icons/zaitoon_marker.png"
            });
            google.maps.event.addListener(zaitoonMarker, 'click', function() {
                infoWindow.setContent(html);
                infoWindow.open(map, zaitoonMarker);
            });
            markers.push(zaitoonMarker);
        }

        function downloadUrl(url, callback) {
            var request = window.ActiveXObject ?
                new ActiveXObject('Microsoft.XMLHTTP') :
                new XMLHttpRequest;

            request.onreadystatechange = function() {
                if (request.readyState == 4) {
                    request.onreadystatechange = doNothing;
                    callback(request.responseText, request.status);
                }
            };

            request.open('GET', url, true);
            request.send(null);
        }

        function parseXml(str) {
            if (window.ActiveXObject) {
                var doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.loadXML(str);
                return doc;
            } else if (window.DOMParser) {
                return (new DOMParser).parseFromString(str, 'text/xml');
            }
        }

        function doNothing() {}


        //Default Location of User
        var geocoder = new google.maps.Geocoder;
        geocodeLatLng(geocoder, map, infoWindow);

        function geocodeLatLng(geocoder, map, infowindow) {

            var input = "";

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                return '';
            }

            function showPosition(position) {
                input = position.coords.latitude + ',' + position.coords.longitude;
                var latlngStr = input.split(',', 2);
                var latlng = {
                    lat: parseFloat(latlngStr[0]),
                    lng: parseFloat(latlngStr[1])
                };
                geocoder.geocode({
                    'location': latlng
                }, function(results, status) {
                    if (status === 'OK') {
                        if (results[0]) {
                            $scope.myLocation = results[0];
                            document.getElementById("myPlaceInput").value = $scope.myLocation.formatted_address;
                            $scope.findZaitoon();
                        }
                    }
                });
            }


        }




    });