(function () {
	'use strict';

	/**
	* @ngdoc function
	* @name app.controller:shopCtrl
	* @description
	* # shopCtrl
	* Controller of the app
	*/

	angular
		.module('shop')
		.controller('ShopCtrl', shopCtrl);

	shopCtrl.$inject = ['$scope', '$rootScope', 'shopService'];

	/*
	* recommend
	* Using function declarations
	* and bindable members up top.
	*/

	function shopCtrl($scope, $rootScope, shopService) {
		/*jshint validthis: true */
		var vm = this;
		vm.photos = [];
		vm.loginLink = "";
		vm.token = "";

		vm.error = null;

		vm.resetError = function () {
			vm.error = null;
		}

		vm.getToken = function () {
			vm.resetError();

			console.log("Getting token from code " + findGetParameter("code"));

			shopService.postCode(findGetParameter("code"))
				.then((data) => {
					vm.token = data.response.data;
					vm.getPhotos();
					vm.userData = vm.getUserData();
					
					$scope.$apply();
				});

			/*
			shopService
				.postCode(`https://aureda.herokuapp.com/access_token`, findGetParameter("code"))
				.then((data) => {
					if (data.status === 0) {
						vm.error = 'the token could not be get';
					} else if (data.status === 1) {
						vm.token = data.response.data;
						vm.getPhotos();
						console.log(vm.token);
					}

					$scope.$apply();
				});//*/
		}

		vm.getPhotos = function () {
			vm.resetError();

			shopService.getBuyablePhotos()
				.then((data) => {
					if (data.status === 0) {
						vm.error = 'Could not get MY photos';
					} else if (data.status === 1) {
						// Adding if the user can buy this image or not
						data.response.data.forEach((i) => {
							i.disabled = vm.user.gold >= i.value;
						})

						vm.photos = data.response.data;
					}

					$scope.$apply();
				});
			/*
			shopService
				.getBuyablePhotos(`https://aureda.herokuapp.com/images?filter=buyable`, vm.token)
				.then((data) => {
					if (data.status === 0) {
						vm.error = 'Could not get MY photos';
					} else if (data.status === 1) {
						vm.photos = data.response.data;
					}

					$scope.$apply();
				});//*/
		}

		$scope.buy = function (imageId, value) {

			// Confirming buying
			$mdDialog.show(
				$mdDialog.prompt()
					.title('Do you really want to buy it for ' + value + ' gold?')
					.textContent('Is it worth it ?')
					.ariaLabel('Lucky day')
					.ok('Yes please, I like this image sooo much!')
					.cancel('No way...')
			).then(() => {
				// The user bought it
				shopService.buy(imageId)
					.then(() => $rootScope.$broadcast('refreshUser'));
			}, () => {
				// The user didn't buy it, we do not have to do anything
			});



		}

		vm.getUserData = function () {
			vm.resetError();
			const user = {};

			shopService.getUserData()
				.then((data) => {
					if (data.status === 0) {
						vm.error = 'Could not get my data';
					} else if (data.status === 1) {
						vm.user = data.response.data;
					}

					$scope.$apply();
				});

			return user;
		}

		$scope.$on('refreshUser', (event) => {
			vm.getPhotos();
			vm.getUserData();
		});

		function makerandom() {
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for (var i = 0; i < 30; i++)
				text += possible.charAt(Math.floor(Math.random() * possible.length));

			return text;
		}

		// https://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
		function findGetParameter(parameterName) {
			var result = null,
				tmp = [];
			location.search
				.substr(1)
				.split("&")
				.forEach(function (item) {
					tmp = item.split("=");
					if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
				});
			return result;
		}

		vm.getToken();
	}
})();
