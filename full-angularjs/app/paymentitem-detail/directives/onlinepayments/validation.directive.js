angular.module('onlinepayments.validation', []).directive('onlinepaymentsValidation', function () {
    return {
        priority: 100,
        require: 'ngModel',
        restrict: 'A',
        compile: function onlinepaymentsValidationCompilingFunction() {

            return function oninepaymentsValidationLinkingFunction(scope, iElement, iAttrs, controller) {
                var addValidations = function (field) {
                    /* Add validators based on the dataRestrictions */
                    angular.forEach(field.dataRestrictions.validationRules, function (validationRule) {
                        controller.$validators[validationRule.type] = function (modelValue, viewValue) {
                            if (modelValue) {
                                return validationRule.validate(modelValue);
                            } else {
                                return true;
                            }
                        };
                    });
                }
                var field = scope.paymentitem.paymentProductFieldById[scope.paymentItemFieldId || scope.paymentItemfield.id]

                scope.$watch(iAttrs.onlinepaymentsValidation, function (n, o) {
                    if (n !== o) {
                        field = scope.paymentitem.paymentProductFieldById[scope.paymentItemFieldId || scope.paymentItemfield.id];
                        addValidations(field);
                    }
                });
                addValidations(field);

                scope.$watch(function () {
                    return scope.item && scope.item['fiscalNumber']
                }, function (n, o) {
                    // recheck requiredness of the other fields
                    if (n) {
                        scope.paymentform.firstName && scope.paymentform.firstName.$validate();
                        scope.paymentform.surname && scope.paymentform.surname.$validate();
                        scope.paymentform.companyName && scope.paymentform.companyName.$validate();
                    }
                });
            }
        }
    }
});