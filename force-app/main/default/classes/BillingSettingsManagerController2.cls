public without sharing class BillingSettingsManagerController2 {

    @testVisible private static final String DEFAULT_BILLING_SETTING_NAME = 'Default';
    @testVisible private static final String DEFAULT_BILLING_SETTING_FULLNAME = 'Billing_Setting.Default';

    private static Decimal defaultTimeLimit = Billing_Setting__mdt.getInstance('Default').Time_Limit__c;

    @AuraEnabled(cacheable=true)
    public static Billing_Setting__mdt getDefaultBillingSetting() {
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
    public static String activateBillingInProgress(
        String billingBatchId
    ) {
        try {
            Map<String, Object> mapFieldData = new Map<String, Object>();
            mapFieldData.put('Billing_In_Progress__c', true);
            mapFieldData.put('Billing_Batch_ID__c', billingBatchId);
            mapFieldData.put('Last_Billing_Start_Date_Time__c', Datetime.now());
            mapFieldData.put('Expiration_Date_Time__c', Datetime.now().addHours(Integer.valueOf( defaultTimeLimit )));
            mapFieldData.put('Running_User_ID__c', UserInfo.getUserId());
            mapFieldData.put('Running_User_Name__c', UserInfo.getName());

            String strResult = MetadataDeploy.updateAndDeployMetadata(
                DEFAULT_BILLING_SETTING_FULLNAME, 
                DEFAULT_BILLING_SETTING_NAME, 
                mapFieldData
            );

            return strResult;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String deactivateBillingInProgress() {
        try {
            Map<String, Object> mapFieldData = new Map<String, Object>();
            mapFieldData.put('Billing_In_Progress__c', false);

            String strResult = MetadataDeploy.updateAndDeployMetadata(
                DEFAULT_BILLING_SETTING_FULLNAME, 
                DEFAULT_BILLING_SETTING_NAME, 
                mapFieldData
            );

            return strResult;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String toggleSuperSecretSetting() {
        try {
            Super_Secret_Hierarchy_Setting__c sshs = [SELECT Id, Secret_Checkbox__c FROM Super_Secret_Hierarchy_Setting__c LIMIT 1];
            sshs.Secret_Checkbox__c = !sshs.Secret_Checkbox__c;
            update sshs;
            return 'Success';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
}