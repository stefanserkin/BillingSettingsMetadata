@isTest
private class BillingSettingsManagerController_Test {
    
    @isTest
    static void testGetDefaultBillingSetting() {
        Test.startTest();
        Billing_Setting__mdt defaultSetting = BillingSettingsManagerController.getDefaultBillingSetting();
        Test.stopTest();
        
        Billing_Setting__mdt settingToVerify = [
            SELECT Id, Billing_In_Progress__c
              FROM Billing_Setting__mdt
             WHERE DeveloperName = :BillingSettingsManagerController.DEFAULT_BILLING_SETTING_NAME
             LIMIT 1
        ];
        
        System.assertEquals(
            settingToVerify.Id, 
            defaultSetting.Id, 
            'Ids should match'
        );
        
        System.assertEquals(
            settingToVerify.Billing_In_Progress__c, 
            defaultSetting.Billing_In_Progress__c, 
            'Billing in progress values should match'
        );
    }
    
    @isTest
    static void testActivateBillingInProgress() {
        String billingBatchId = TestUtility.getFakeId( TREX1__Billing_Batch__c.SObjectType );
        String strResult = '';
        Test.startTest();
        strResult = BillingSettingsManagerController.activateBillingInProgress(
            billingBatchId
        );
        Test.stopTest();
    }
    
    @isTest
    static void testDeactivateBillingInProgress() {
        String strResult = '';
        Test.startTest();
        strResult = BillingSettingsManagerController.deactivateBillingInProgress();
        Test.stopTest();
    }

}