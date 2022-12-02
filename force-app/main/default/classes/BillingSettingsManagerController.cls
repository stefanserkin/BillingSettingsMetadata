/*****************************************************************************
 * @CreatedDate     December 2, 2022
 * @Author          Stefan Serkin
 * @Description     Controller for lwc on Billing Batch page to toggle off/on
 *                  account balance's effect on access control
 *****************************************************************************/

public without sharing class BillingSettingsManagerController {

    @AuraEnabled(cacheable=true)
    public static BillingSettingsWrapper getBillingSettings() {
        // Get custom setting
        Billing_Settings__c bs = Billing_Settings__c.getInstance();
        // Platform users can not access the custom setting
        // Create wrapper to display to the user
        return new BillingSettingsWrapper(bs);
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

    public class BillingSettingsWrapper {
        @AuraEnabled
        public String billingSettingId{get;set;}
        @AuraEnabled
        public Boolean billingInProgress{get;set;}
        @AuraEnabled
        public String runningUserId{get;set;}
        @AuraEnabled
        public String runningUserName{get;set;}
        @AuraEnabled
        public String billingBatchId{get;set;}
        @AuraEnabled
        public Datetime startDateTime{get;set;}
        @AuraEnabled
        public Datetime expirationDateTime{get;set;}
        @AuraEnabled
        public Decimal timeLimit{get;set;}

        public BillingSettingsWrapper(Billing_Settings__c bs) {
            billingSettingId = bs.Id;
            billingInProgress = bs.Billing_In_Progress__c;
            runningUserId = bs.Running_User_ID__c;
            runningUserName = bs.Running_User_Name__c;
            billingBatchId = bs.Billing_Batch_ID__c;
            startDateTime = bs.Last_Billing_Start_Date_Time__c;
            expirationDateTime = bs.Expiration_Date_Time__c;
            timeLimit = bs.Time_Limit__c;
        }
    }
    
}