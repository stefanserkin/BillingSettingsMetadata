public with sharing class BillingSettingsManagerController {

    private static final String DEFAULT_BILLING_SETTING_NAME = 'Default';

    @AuraEnabled(cacheable=true)
    public static Billing_Setting__mdt getDefaultBillingSetting(
        String billingBatchId
    ){
        try {
            return [
                SELECT Id, 
                       Billing_In_Progress__c, 
                       Expiration_Date_Time__c, 
                       Last_Billing_Start_Date_Time__c, 
                       Running_User_ID__c, 
                       Running_User_Name__c, 
                       Time_Limit__c
                  FROM Billing_Setting__mdt
                 WHERE DeveloperName = :DEFAULT_BILLING_SETTING_NAME
                 LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String activateBillingInProgress() {
        try {
            return 'called activation method';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String deactivateBillingInProgress() {
        try {
            return 'called deactivation method';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
}
