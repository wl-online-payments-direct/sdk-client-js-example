/**
 * System configuration
 * Adjust as necessary for your application needs.
 */
(function (global) {
    // map tells the System loader where to look for things
    var map = {
        'onlinepayments-sdk-client-js': '/node_modules/onlinepayments-sdk-client-js',
        'node-forge': '/node_modules/node-forge'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'onlinepayments-sdk-client-js': { main: 'dist/onlinepaymentssdk.noEncrypt.js', defaultExtension: 'js' },
        'node-forge': { main: 'js/forge.js', defaultExtension: 'js' }
    };

    // map Online Payments sdk for usage with systemjs 
    packages['onlinepaymentssdk.session'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/session.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.core'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/core.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.C2SCommunicator'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/C2SCommunicator.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.C2SCommunicatorConfiguration'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/C2SCommunicatorConfiguration.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.IinDetailsResponse'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/IinDetailsResponse.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.promise'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/promise.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.C2SPaymentProductContext'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/C2SPaymentProductContext.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.BasicPaymentProduct'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/BasicPaymentProduct.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.BasicPaymentProducts'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/BasicPaymentProducts.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.BasicPaymentProductGroups'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/BasicPaymentProductGroups.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.PaymentProduct'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/PaymentProduct.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.PaymentProductGroup'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/PaymentProductGroup.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.BasicPaymentItems'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/BasicPaymentItems.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.PaymentRequest'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/PaymentRequest.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.Encryptor'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/Encryptor.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.JOSEEncryptor'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/JOSEEncryptor.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.net'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/net.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.Util'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/Util.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.PublicKeyResponse'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/PublicKeyResponse.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.BasicPaymentProductGroup'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/BasicPaymentProductGroup.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.PaymentProductField'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/PaymentProductField.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.AccountOnFile'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/AccountOnFile.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.PaymentProductDisplayHints'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/PaymentProductDisplayHints.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.PaymentProductFieldDisplayHints'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/PaymentProductFieldDisplayHints.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.DataRestrictions'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/DataRestrictions.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.MaskingUtil'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/MaskingUtil.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.MaskedString'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/MaskedString.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.AccountOnFileDisplayHints'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/AccountOnFileDisplayHints.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.Attribute'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/Attribute.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.Tooltip'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/Tooltip.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.FormElement'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/FormElement.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValidationRuleExpirationDate'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValidationRuleExpirationDate.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValidationRuleFixedList'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValidationRuleFixedList.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValidationRuleLength'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValidationRuleLength.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValidationRuleLuhn'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValidationRuleLuhn.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValidationRuleRange'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValidationRuleRange.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValidationRuleRegularExpression'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValidationRuleRegularExpression.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValidationRuleEmailAddress'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValidationRuleEmailAddress.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValidationRuleIban'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValidationRuleIban.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValidationRuleTermsAndConditions'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValidationRuleTermsAndConditions.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValidationRuleFactory'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValidationRuleFactory.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.LabelTemplateElement'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/LabelTemplateElement.js', defaultExtension: 'js' };
    packages['onlinepaymentssdk.ValueMappingElement'] = { main: '../node_modules/onlinepayments-sdk-client-js/src/ValueMappingElement.js', defaultExtension: 'js' };


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
