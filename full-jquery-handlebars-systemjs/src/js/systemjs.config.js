/**
 * System configuration
 * Adjust as necessary for your application needs.
 */
(function (global) {
    // map tells the System loader where to look for things
    var map = {
        'app': '/src/js/app',
        'direct-sdk-client-js': '/node_modules/direct-sdk-client-js',
        'jQuery': '/node_modules/jquery',
        'jquery': '/node_modules/jquery',
        'jquery-validation': '/node_modules/jquery-validation',
        'handlebars': '/node_modules/handlebars',
        'bootstrap': '/node_modules/bootstrap-sass',
        'node-forge': '/node_modules/node-forge'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app': { main: 'dev-start.js', defaultExtension: 'js' },
        'direct-sdk-client-js': { main: 'dist/directsdk.node.js', defaultExtension: 'js' },
        'jQuery': { main: 'dist/jquery.js', defaultExtension: 'js' },
        'jquery': { main: 'dist/jquery.js', defaultExtension: 'js' },
        'jquery-validation': { main: 'dist/jquery.validate.js', defaultExtension: 'js' },
        'handlebars': { main: 'dist/handlebars.js', defaultExtension: 'js' },
        'bootstrap': { main: 'assets/javascripts/bootstrap.js', defaultExtension: 'js' },
        'node-forge': { main: 'dist/forge.min.js', defaultExtension: 'js' }
    };

    // map direct-sdk for usage with systemjs
    packages['directsdk.session'] = { main: '../../../node_modules/direct-sdk-client-js/src/session.js', defaultExtension: 'js' };
    packages['directsdk.core'] = { main: '../../../node_modules/direct-sdk-client-js/src/core.js', defaultExtension: 'js' };
    packages['directsdk.C2SCommunicator'] = { main: '../../../node_modules/direct-sdk-client-js/src/C2SCommunicator.js', defaultExtension: 'js' };
    packages['directsdk.C2SCommunicatorConfiguration'] = { main: '../../../node_modules/direct-sdk-client-js/src/C2SCommunicatorConfiguration.js', defaultExtension: 'js' };
    packages['directsdk.IinDetailsResponse'] = { main: '../../../node_modules/direct-sdk-client-js/src/IinDetailsResponse.js', defaultExtension: 'js' };
    packages['directsdk.promise'] = { main: '../../../node_modules/direct-sdk-client-js/src/promise.js', defaultExtension: 'js' };
    packages['directsdk.C2SPaymentProductContext'] = { main: '../../../node_modules/direct-sdk-client-js/src/C2SPaymentProductContext.js', defaultExtension: 'js' };
    packages['directsdk.BasicPaymentProduct'] = { main: '../../../node_modules/direct-sdk-client-js/src/BasicPaymentProduct.js', defaultExtension: 'js' };
    packages['directsdk.BasicPaymentProducts'] = { main: '../../../node_modules/direct-sdk-client-js/src/BasicPaymentProducts.js', defaultExtension: 'js' };
    packages['directsdk.BasicPaymentProductGroups'] = { main: '../../../node_modules/direct-sdk-client-js/src/BasicPaymentProductGroups.js', defaultExtension: 'js' };
    packages['directsdk.PaymentProduct'] = { main: '../../../node_modules/direct-sdk-client-js/src/PaymentProduct.js', defaultExtension: 'js' };
    packages['directsdk.PaymentProduct302SpecificData'] = { main: '../../../node_modules/direct-sdk-client-js/src/PaymentProduct302SpecificData.js', defaultExtension: 'js' };
    packages['directsdk.PaymentProduct320SpecificData'] = { main: '../../../node_modules/direct-sdk-client-js/src/PaymentProduct320SpecificData.js', defaultExtension: 'js' };
    packages['directsdk.PaymentProduct863SpecificData'] = { main: '../../../node_modules/direct-sdk-client-js/src/PaymentProduct863SpecificData.js', defaultExtension: 'js' };
    packages['directsdk.PaymentProductGroup'] = { main: '../../../node_modules/direct-sdk-client-js/src/PaymentProductGroup.js', defaultExtension: 'js' };
    packages['directsdk.BasicPaymentItems'] = { main: '../../../node_modules/direct-sdk-client-js/src/BasicPaymentItems.js', defaultExtension: 'js' };
    packages['directsdk.PaymentRequest'] = { main: '../../../node_modules/direct-sdk-client-js/src/PaymentRequest.js', defaultExtension: 'js' };
    packages['directsdk.Encryptor'] = { main: '../../../node_modules/direct-sdk-client-js/src/Encryptor.js', defaultExtension: 'js' };
    packages['directsdk.JOSEEncryptor'] = { main: '../../../node_modules/direct-sdk-client-js/src/JOSEEncryptor.js', defaultExtension: 'js' };
    packages['directsdk.net'] = { main: '../../../node_modules/direct-sdk-client-js/src/net.js', defaultExtension: 'js' };
    packages['directsdk.Util'] = { main: '../../../node_modules/direct-sdk-client-js/src/Util.js', defaultExtension: 'js' };
    packages['directsdk.ApplePay'] = { main: '../../../node_modules/direct-sdk-client-js/src/ApplePay.js', defaultExtension: 'js' };
    packages['directsdk.PublicKeyResponse'] = { main: '../../../node_modules/direct-sdk-client-js/src/PublicKeyResponse.js', defaultExtension: 'js' };
    packages['directsdk.BasicPaymentProductGroup'] = { main: '../../../node_modules/direct-sdk-client-js/src/BasicPaymentProductGroup.js', defaultExtension: 'js' };
    packages['directsdk.PaymentProductField'] = { main: '../../../node_modules/direct-sdk-client-js/src/PaymentProductField.js', defaultExtension: 'js' };
    packages['directsdk.AccountOnFile'] = { main: '../../../node_modules/direct-sdk-client-js/src/AccountOnFile.js', defaultExtension: 'js' };
    packages['directsdk.PaymentProductDisplayHints'] = { main: '../../../node_modules/direct-sdk-client-js/src/PaymentProductDisplayHints.js', defaultExtension: 'js' };
    packages['directsdk.PaymentProductFieldDisplayHints'] = { main: '../../../node_modules/direct-sdk-client-js/src/PaymentProductFieldDisplayHints.js', defaultExtension: 'js' };
    packages['directsdk.DataRestrictions'] = { main: '../../../node_modules/direct-sdk-client-js/src/DataRestrictions.js', defaultExtension: 'js' };
    packages['directsdk.MaskingUtil'] = { main: '../../../node_modules/direct-sdk-client-js/src/MaskingUtil.js', defaultExtension: 'js' };
    packages['directsdk.MaskedString'] = { main: '../../../node_modules/direct-sdk-client-js/src/MaskedString.js', defaultExtension: 'js' };
    packages['directsdk.AccountOnFileDisplayHints'] = { main: '../../../node_modules/direct-sdk-client-js/src/AccountOnFileDisplayHints.js', defaultExtension: 'js' };
    packages['directsdk.Attribute'] = { main: '../../../node_modules/direct-sdk-client-js/src/Attribute.js', defaultExtension: 'js' };
    packages['directsdk.Tooltip'] = { main: '../../../node_modules/direct-sdk-client-js/src/Tooltip.js', defaultExtension: 'js' };
    packages['directsdk.FormElement'] = { main: '../../../node_modules/direct-sdk-client-js/src/FormElement.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleExpirationDate'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleExpirationDate.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleFixedList'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleFixedList.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleLength'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleLength.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleLuhn'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleLuhn.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleRange'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleRange.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleRegularExpression'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleRegularExpression.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleResidentIdNumber'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleResidentIdNumber.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleEmailAddress'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleEmailAddress.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleTermsAndConditions'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleTermsAndConditions.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleIban'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleIban.js', defaultExtension: 'js' };
    packages['directsdk.ValidationRuleFactory'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValidationRuleFactory.js', defaultExtension: 'js' };
    packages['directsdk.LabelTemplateElement'] = { main: '../../../node_modules/direct-sdk-client-js/src/LabelTemplateElement.js', defaultExtension: 'js' };
    packages['directsdk.ValueMappingElement'] = { main: '../../../node_modules/direct-sdk-client-js/src/ValueMappingElement.js', defaultExtension: 'js' };



    var meta = {
        'node-forge': { format: 'commonjs' }
    };

    var config = {
        map: map,
        packages: packages,
        meta: meta
    }
    System.config(config);
})(this);
