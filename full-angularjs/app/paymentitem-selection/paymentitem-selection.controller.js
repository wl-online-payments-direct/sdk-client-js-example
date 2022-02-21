app.controller('paymentitem-selection.controller', ['$scope', '$rootScope', '$location', '$log', function ($scope, $rootScope, $location, $log) {
    "use strict";
    $scope.hasError = false;

    var context = JSON.parse(sessionStorage.getItem('context'));

    var isPaymentProductIdInList = function (paymentProductId, list) {
        return list.filter(function (paymentItem) {
            return paymentItem.id === paymentProductId;
        }).length > 0;
    }

    $scope.getPaymentItems = function () {
        $scope.hasError = false;
        $scope.loading = true;
        // Third parameter paymentProductSpecificInputs is optional
        $scope.onlinepayments.session.getBasicPaymentItems($scope.onlinepayments.paymentDetails, false, $scope.onlinepayments.paymentProductSpecificInputs).then(function (basicPaymentItems) {
            $scope.loading = false;

            // since the Online Payments sdk has async calls outside of angular we need to tell Angular to dirty-check the state after the async call is complete.
            $scope.$apply(function () {
                // sort the paymentitems here
                $scope.basicPaymentItems = basicPaymentItems.basicPaymentItems.sort(function (a, b) {
                    if (a.displayHints.displayOrder < b.displayHints.displayOrder) {
                        return -1;
                    } else if (a.displayHints.displayOrder > b.displayHints.displayOrder) {
                        return 1;
                    }
                    return 0;
                });
                // add accounts on file
                $scope.accountsOnFile = basicPaymentItems.accountsOnFile;

                // enrich the accounts on file with images; not all UIs require the logo that's why it's not a default part of the response.
                if ($scope.accountsOnFile) {
                    addLogosToAoF();
                }
            });
        }, function () {
            $scope.$apply(function () {
                $scope.hasError = true;
                $scope.loading = false;
                $log.error('error while getting the basicPaymentItems');
            });
        })
    };

    var encryptPayment = function (paymentResponse) {
        var encryptor = $scope.onlinepayments.session.getEncryptor();
        var paymentRequest = $scope.onlinepayments.session.getPaymentRequest();
        $rootScope.encryptedString = null;
        if (paymentRequest.isValid()) {
            $rootScope.loading = true;
            encryptor.encrypt(paymentRequest).then(function (encryptedString) {
                $rootScope.loading = false;
                $scope.$apply(function () {
                    $rootScope.encryptedString = encryptedString;
                    $location.path('/dev-success');
                });
            }, function error (e) {
                $rootScope.loading = false;
                console.error('encryption failed', e);
                $scope.$apply(function () {
                    $rootScope.encryptedString = encryptedString;
                    $location.path('/dev-failure');
                });
            });
        } else {
            // something is wrong according to the paymentRequest;
            console.error(paymentRequest.getErrorMessageIds(), paymentRequest.getValues(), paymentRequest.getPaymentProduct());
            $scope.$apply(function () {
                $rootScope.encryptedString = encryptedString;
                $location.path('/dev-failure');
            });
        }
    };

    $scope.choosePaymentItem = function (paymentItem) {
        $location.path('/paymentitem-detail/' + paymentItem.json.type + '/' + paymentItem.id);
    };

    $scope.chooseAccountOnFile = function (aof) {
        $location.path('/paymentitem-detail/product/' + aof.paymentProductId + '/' + aof.id);
    };

    $scope.showAccountOnFileData = function (accountOnFile) {
        var accountOnFileObject = new onlinepaymentssdk.AccountOnFile(accountOnFile);
        var displayHints = accountOnFileObject.displayHints;
        var output = "";
        for (var j = 0, jl = displayHints.labelTemplate.length; j < jl; j++) {
            var keyToShow = displayHints.labelTemplate[j].attributeKey;
            output = output + accountOnFileObject.getMaskedValueByAttributeKey(keyToShow).formattedValue + " ";
        }
        return output;
    };

    var addLogosToAoF = function () {
        angular.forEach($scope.accountsOnFile, function (aof) {
            var paymentProductId = aof.paymentProductId;
            $scope.onlinepayments.session.getPaymentProduct(paymentProductId, $scope.onlinepayments.paymentDetails).then(function (paymentProduct) {
                $scope.$apply(function () {
                    aof.displayHints = aof.displayHints || {};
                    aof.displayHints.logo = paymentProduct.displayHints.logo;
                });
            });
        });
    };

    if (context) {
        $scope.onlinepayments = {}; // store all Online Payments SDK variables in this namespace

        // split the context up in the session- and paymentDetails
        $scope.onlinepayments.sessionDetails = {
            clientSessionId: context.clientSessionId,
            customerId: context.customerId,
            clientApiUrl: context.clientApiUrl,
            assetUrl: context.assetUrl
        };
        $scope.onlinepayments.paymentDetails = {
            totalAmount: context.amountInCents,
            countryCode: context.countryCode,
            locale: context.locale,
            isRecurring: context.isRecurring,
            currency: context.currencyCode
        };
        $scope.onlinepayments.paymentProductSpecificInputs = {
            applePay: {
                merchantName: context.merchantName
            }
        };

        // use the sessionDetails to create a new session
        $scope.onlinepayments.session = new onlinepaymentssdk.Session($scope.onlinepayments.sessionDetails);

        // Get the paymentRequest for this session. This is an SDK object that stores all the data
        // that the customer provided during the checkout. In the end of the checkout it will provide
        // all this information to the encryption function so that it can create the encrypted string
        // that contains all this info.
        $scope.onlinepayments.paymentRequest = $scope.onlinepayments.session.getPaymentRequest();

        // now render the page
        $scope.getPaymentItems();
    } else {
        $location.path('/start');
    }
}]);
