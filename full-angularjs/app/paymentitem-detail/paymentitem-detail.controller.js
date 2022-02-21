app.controller('paymentitem.controller', ['$rootScope', '$scope', '$location', '$log', '$routeParams', '$sce', function ($rootScope, $scope, $location, $log, $routeParams, $sce) {
    "use strict";

    $scope.id = $routeParams.id;
    $scope.type = $routeParams.type;
    $scope.aofId = $routeParams.aof;

    $scope.hasError = false;
    $scope.showCobrands = false;

    $scope.doValidate = false;

    $scope.item = {};

    $rootScope.loading = true;

    $scope.maskoptions = {
        clearOnBlur: false,
        addDefaultPlaceholder: false,
        clearOnBlurPlaceholder: true,
        allowInvalidValue: true
    }

    $scope.getPaymentItem = function () {
        $scope.hasError = false;
        $rootScope.loading = true;

        $scope.showPaymentProduct($scope.id);
    };

    $scope.showPaymentProduct = function (id) {
        if ($scope.paymentitem && $scope.paymentitem.id === id) {
            $rootScope.loading = false;
        } else {
            $scope.onlinepayments.session.getPaymentProduct(id, $scope.onlinepayments.paymentDetails).then(function (paymentProduct) {
                $rootScope.loading = false;
                $scope.$apply(function () {
                    $scope.paymentitem = paymentProduct;
                    $scope.fixMask();
                    $scope.createHtmlTooltips();

                    $scope.onlinepayments.paymentRequest.setPaymentProduct(paymentProduct);
                    $scope.encryptIfNofields();

                    if ($scope.aofId) {
                        $scope.handleAccountOnFile();
                    }
                });
            }, function () {
                $scope.$apply(function () {
                    $scope.hasError = true;
                    $rootScope.loading = false;
                    $log.error('error while getting the payment product with id ' + id);
                });
            });
        }
    };

    $scope.encryptIfNofields = function () {
        if ($scope.paymentitem.paymentProductFields.length === 0) {
            encrypt();
        };
    }

    $scope.handleAccountOnFile = function () {
        // store account on file in request
        var accountOnFile = isNaN($scope.aofId) ? null : $scope.paymentitem.accountOnFileById[$scope.aofId];
        $scope.onlinepayments.paymentRequest.setAccountOnFile(accountOnFile);
        // prefill data
        angular.forEach(accountOnFile.attributes, function (attribute) {
            if ($scope.paymentitem.paymentProductFieldById[attribute.key]) {
                var masked = $scope.paymentitem.paymentProductFieldById[attribute.key].applyWildcardMask(attribute.value).formattedValue;
                $scope.item[attribute.key] = masked;
                $scope.paymentitem.paymentProductFieldById[attribute.key].aofField = true;
            }
        });
    };

    $scope.fixMask = function () {
        // we fix the mask for use with angular.ui.mask; if you use some other masking util refer to the docs of the directive.
        angular.forEach($scope.paymentitem.paymentProductFields, function (field) {
            if (field.displayHints.mask) {
                field.displayHints.uimask = field.displayHints.mask.replace(/{{/g, '').replace(/}}/g, '').replace(/9/g, '?9');
            }
        });
    }

    $scope.createHtmlTooltips = function () {
        angular.forEach($scope.paymentitem.paymentProductFields, function (field) {
            if (field.displayHints.tooltip) {
                var tooltip = field.displayHints.tooltip;
                field.displayHints.htmltooltip = $sce.trustAsHtml(tooltip.label + " <br /><img src='" + tooltip.image + "?size=240x160' width='240' height='160'>");
            }
        });
    }

    $scope.startApplePay = function () {
        var networks = $scope.paymentitem.paymentProduct302SpecificData.networks;
        $scope.onlinepayments.session.createApplePayPayment($scope.onlinepayments.paymentDetails, $scope.onlinepayments.paymentProductSpecificInputs.applePay, networks).then(function (res) {
            var request = $scope.onlinepayments.session.getPaymentRequest();
            request.setValue('encryptedPaymentData', res.data.paymentData.data)
            encrypt()
        }, function (res) {
            $rootScope.loading = false;
            $scope.$apply(function () {
                console.error(res.message);
                $location.path('/dev-failure');
                $rootScope.loading = false;
            });
        });
    }



    $scope.getPaymentProduct = function (id) {
        return $scope.onlinepayments.session.getPaymentProduct(id, $scope.onlinepayments.paymentDetails);
    };

    $scope.toggleCobrands = function () {
        $scope.showCobrands = !$scope.showCobrands;
    };

    $scope.setCobrand = function (id) {
        $scope.showCobrands = false;
        $scope.showPaymentProduct(id);
    };

    $scope.setProduct = function (id) {
        $rootScope.loading = true;
        $scope.showPaymentProduct(id);
    };

    $scope.birthDayArr = [];

    $scope.generateDateOfBirth = function (type, value) {
        if (type == "day") $scope.birthDayArr[2] = String("0" + value).slice(-2);
        if (type == "month") $scope.birthDayArr[1] = String("0" + value).slice(-2);
        if (type == "year") $scope.birthDayArr[0] = value;

        $scope.item["dateOfBirth"] = $scope.birthDayArr.join("");
    }

    $scope.doPayment = function () {
        $scope.doValidate = true;
        // check if all mandatory fields are present
        var request = $scope.onlinepayments.session.getPaymentRequest();

        if ($scope.showLookupFields && !$scope.lookupModel) {
            return;
        }

        if ($scope.showLookupFields && !$scope.isLookupSearchDone && !$scope.showLookupSummary) {
            $scope.searchCustomerDetails("redirectToPayment");
        }

        $scope.errorCustomerSearch = false;
        $scope.combineFields();

        for (var key in $scope.item) {
            // we need to supply masked values; so let's mask them here
            var field = $scope.paymentitem.paymentProductFieldById[key];
            if (field) {
                if (field.displayHints.formElement.type != 'boolean') {
                    var masked = field.applyMask($scope.item[key]).formattedValue;
                } else {
                    var masked = $scope.item[key] + '';
                }

                if (!field.aofField) {
                    request.setValue(key, masked);
                }
            } else {
                if (key === 'rememberme') {
                    request.setTokenize($scope.item[key]);
                }
            }
        }
        if (request.getPaymentProduct() && request.isValid()) {
            encrypt();
        } else {
            console.log(request.getErrorMessageIds());
            // validation errors
        }
    };

    $scope.shouldShowRememberMe = function () {
        var ret = false;
        if ($scope.paymentitem && $scope.paymentitem.id === 'cards') {
            if ($scope.onlinepayments.paymentDetails.isRecurring) {
                // recurring groups show the checkbox
                ret = true;
            }
        } else if ($scope.paymentitem) {
            if ($scope.paymentitem.allowsTokenization && !$scope.paymentitem.autoTokenized) {
                // paymentproducts that are tokenizable but not auto tokenized show the checkbox
                ret = true;
            }
        }
        return ret;
    }

    var encrypt = function () {
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

    var context = JSON.parse(sessionStorage.getItem('context'));
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
        }

        $scope.onlinepayments.paymentProductSpecificInputs = {
            applePay: {
                merchantName: context.merchantName
            },
        }

        $rootScope.hasSession = true; // this indicates we have enough info to render a payment result page

        // use the sessionDetails to create a new session
        $scope.onlinepayments.session = new onlinepaymentssdk.Session($scope.onlinepayments.sessionDetails);

        // Get the paymentRequest for this session. This is an SDK object that stores all the data
        // that the customer provided during the checkout. In the end of the checkout it will provide
        // all this information to the encryption function so that it can create the encrypted string
        // that contains all this info.
        $scope.onlinepayments.paymentRequest = $scope.onlinepayments.session.getPaymentRequest();
        // now render the page
        $scope.getPaymentItem();
    } else {
        $location.path('/start');
    }
}]);