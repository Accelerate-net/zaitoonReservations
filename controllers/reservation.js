angular.module('guestReservation', [])


    .controller('reservationController', function($scope, $http) {
    
    	//Check is outlet code is set
    	if(localStorage.getItem("reservationZaitoonOutlet") && localStorage.getItem("reservationZaitoonOutlet") != ''){
    		$scope.selectedOutlet = localStorage.getItem("reservationZaitoonOutlet");
    	}
    	else{
    		window.location = "landing.html";
    	}
    	


		$scope.errorMsg = "";
		$scope.isSubmitted = false;
		$scope.isSuccess = false;


		//Default Values
		$scope.userData = {};
		$scope.userData.name = "";
		$scope.userData.mobile = "";
		$scope.userData.email = "";

		$scope.bookData = {};
		$scope.bookData.comments = "";
		$scope.bookData.isBirthday = false;
		$scope.bookData.isAnniversary = false;


		$scope.dateList = [];

		//Pre-populate time and date list:

		var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		var i = 0;
		var today = new Date();
		var dd, mm, yyyy;
		while(i < 7){

			var date = new Date();
			date.setDate(today.getDate() + i);

			dd = date.getDate();
			mm = date.getMonth()+1;
			yyyy = date.getFullYear();

			//Format Date and Month
			if(dd<10){
	    	dd='0'+dd;
			}
			if(mm<10){
			   mm='0'+mm;
			}

			if(i == 0){ //Today
				$scope.dateList.push({value: dd+'-'+mm+'-'+yyyy, name:"Today, "+date.getDate()+' '+months[date.getMonth()]});
			}
			else if(i == 1){ //Tomorrow
				$scope.dateList.push({value: dd+'-'+mm+'-'+yyyy, name:"Tomorrow, "+date.getDate()+' '+months[date.getMonth()]});
			}
			else{ //Day Name
				$scope.dateList.push({value: dd+'-'+mm+'-'+yyyy, name:days[date.getDay()]+", "+date.getDate()+' '+months[date.getMonth()]});
			}
			i++;
		}


		$scope.timeDefaultList = [
			{
				value:"1230",
				name:"12:30 PM"
			},
			{
				value:"1300",
				name:"01:00 PM"
			},
			{
				value:"1330",
				name:"01:30 PM"
			},
			{
				value:"1400",
				name:"02:00 PM"
			},
			{
				value:"1430",
				name:"02:30 PM"
			},
			{
				value:"1500",
				name:"03:00 PM"
			},
			{
				value:"1900",
				name:"07:00 PM"
			},
			{
				value:"1930",
				name:"07:30 PM"
			},
			{
				value:"2000",
				name:"08:00 PM"
			},
			{
				value:"2030",
				name:"08:30 PM"
			},
			{
				value:"2100",
				name:"09:00 PM"
			},
			{
				value:"2130",
				name:"09:30 PM"
			},
			{
				value:"2200",
				name:"10:00 PM"
			},
			{
				value:"2230",
				name:"10:30 PM"
			},
			{
				value:"2300",
				name:"11:00 PM"
			}

		];

		$scope.countList = [
			{value:1},
			{value:2},
			{value:3},
			{value:4},
			{value:5},
			{value:6},
			{value:7},
			{value:8},
			{value:9},
			{value:10}
		];

		//Set Time List to display
		$scope.timeList = $scope.timeDefaultList;

		//Remove past time slots
		var currentTime = today.getHours();
		if(currentTime > 12){
			var startIndex = 2*(currentTime - 12);

			if(currentTime <= 15){
				//Say, if it Is already 9.25 pm do not show 9.30 in the time slot. Skip Index.
				if(today.getMinutes() > 25)
					startIndex++;
	
				if(startIndex < 22){ //If time is less 11 pm (say upto 10.59 pm)
					$scope.timeList = $scope.timeList.slice(startIndex, 23);
				}
			}
			else{
				if(today.getMinutes() > 25)
					startIndex++;
	
				if(startIndex < 22){ //If time is less 11 pm (say upto 10.59 pm)
					$scope.timeList = $scope.timeList.slice(startIndex-7, 23);
				}
			
			}
		}


		//Remove TODAY option if it Is already 10 PM in the night.
		if(today.getHours() >= 23 && today.getMinutes() > 1){
			$scope.dateList = $scope.dateList.splice(1, 6);
		}


		$scope.fetchTimeslots = function(data){

			$scope.dateSelected = data.dateSelected;

			//If the date is TODAY, and remove time slots already passed.
			var date = new Date();
			var dd = date.getDate();
			var mm = date.getMonth()+1;
			var yyyy = date.getFullYear();

			//Format Date and Month
			if(dd<10){
				dd='0'+dd;
			}
			if(mm<10){
				 mm='0'+mm;
			}

			var todayDate = dd+'-'+mm+'-'+yyyy;

			if(data.dateSelected.value.toString() != todayDate){
				$scope.timeList = $scope.timeDefaultList;
				$scope.timeSelected = $scope.timeList[0];
			}
			else
			{
				//Remove past time slots
				var currentTime = today.getHours();
				if(currentTime > 12){
					var startIndex = 2*(currentTime - 12);

					if(currentTime <= 15){
						//Say, if it Is already 9.25 pm do not show 9.30 in the time slot. Skip Index.
						if(today.getMinutes() > 25)
							startIndex++;
			
						if(startIndex < 22){ //If time is less 11 pm (say upto 10.59 pm)
							$scope.timeList = $scope.timeList.slice(startIndex, 23);
						}
					}
					else{
						if(today.getMinutes() > 25)
							startIndex++;
			
						if(startIndex < 22){ //If time is less 11 pm (say upto 10.59 pm)
							$scope.timeList = $scope.timeList.slice(startIndex-7, 23);
						}
					
					}
				}
				$scope.timeSelected = $scope.timeList[0];
			}
		}

		//To update the time slot
		$scope.updateTimeSlot = function(data){
			$scope.timeSelected = data.timeSelected;
		}

		//To update the count
		$scope.updateCount = function(data){
			$scope.countSelected = data.countSelected;
		}


		//Date and Time DEFAULT options
		$scope.dateSelected = $scope.dateList[0];
		$scope.timeSelected = $scope.timeList[0];
		$scope.countSelected = $scope.countList[1];

		$scope.reservationConfirm = "";
		$scope.bookTable = function(){
		
			$scope.errorMsg = "";

			if($scope.userData.name == ""){
				$scope.errorMsg = "Name canot be empty.";
			}
			else if($scope.userData.mobile == "" || $scope.userData.mobile.length != 10){
				$scope.errorMsg = "Enter a valid mobile number.";
			}
			else{
				var reservation = {
					"outlet": $scope.selectedOutlet,
					"date": $scope.dateSelected.value,
					"time": $scope.timeSelected.value,
					"count": $scope.countSelected.value,
					"name": $scope.userData.name,
					"mobile": $scope.userData.mobile,
					"email": $scope.userData.email,
					"comments": $scope.bookData.comments,
					"birthday": 0,
					"anniversary": 0
				};

				var mydata = {};
				mydata.details = reservation;
			

				$http({
					method  : 'POST',
					url     : 'https://accelerateengine.app/food-engine/apis/desknewcustomerreservation.php',
					data    : mydata,
					headers : {'Content-Type': 'application/x-www-form-urlencoded'}
				 })
				.then(function(response) {
					$scope.isSubmitted = true;
					if(response.data.status){
						$scope.isSuccess = true;
						$scope.reservationConfirm = response.data.response;
					}
					else {
						$scope.isSuccess = false;
						$scope.reservationConfirm = "";
					}
				});

			}

		}

 
    	
        $scope.reset = function(){
        	$scope.isSubmitted = false;
        	$scope.isSuccess = false;
        	
		//Default Values
		$scope.userData = {};
		$scope.userData.name = "";
		$scope.userData.mobile = "";
		$scope.userData.email = "";

		$scope.bookData = {};
		$scope.bookData.comments = "";
		$scope.bookData.isBirthday = false;
		$scope.bookData.isAnniversary = false;        	
        }
    
    
    	$scope.outletInfo = "";
    	$scope.getOutletInfo = function(code){
	      	$http.get("https://accelerateengine.app/food-engine/apis/fetchoutlets.php?outletcode="+code).then(function(response) {
	        	$scope.outletInfo = response.data.response;
	        	$scope.isPhoto = $scope.outletInfo.pictures.length == 0? false: true;
		});
      	}
      	
      	$scope.getOutletInfo('HALROAD');
      	
    })
    
    
;