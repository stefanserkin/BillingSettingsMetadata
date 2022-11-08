public with sharing class BillingSettingsManagerController {

    @AuraEnabled(cacheable=true)
    public static Billing_Settings__c getBillingSettings() {
        return Billing_Settings__c.getInstance();
    }

    @AuraEnabled
    public static String toggleBillingSettings(String billingBatchId) {
        try {
            Billing_Settings__c billingSettings = Billing_Settings__c.getOrgDefaults();
            billingSettings.Billing_In_Progress__c = !billingSettings.Billing_In_Progress__c;
            if (billingSettings.Billing_In_Progress__c) {
                billingSettings.Running_User_ID__c = UserInfo.getUserId();
                billingSettings.Running_User_Name__c = UserInfo.getName();
                billingSettings.Billing_Batch_ID__c = billingBatchId;
                billingSettings.Expiration_Date_Time__c = Datetime.now().addSeconds( 
                    Integer.valueOf(billingSettings.Time_Limit__c * 3600) 
                );
                billingSettings.Last_Billing_Start_Date_Time__c = Datetime.now();
            }
            update billingSettings;
            return 'Success';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
}