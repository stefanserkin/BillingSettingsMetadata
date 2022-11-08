@isTest
private class BillingSettingsManagerController_Test {
    
    private static final Decimal TIME_LIMIT = 6.00;

    @TestSetup
    static void makeData() {
        Billing_Settings__c defaultSettings = new Billing_Settings__c(Time_Limit__c = TIME_LIMIT);
        insert defaultSettings;
    }
        
    @isTest
    static void testGetBillingSettings() {
        Test.startTest();
        Billing_Settings__c defaultSettings = BillingSettingsManagerController.getBillingSettings();
        Test.stopTest();
        
        Billing_Settings__c settingsToVerify = Billing_Settings__c.getInstance();
        
        System.assertEquals(
            settingsToVerify.Id, 
            defaultSettings.Id, 
            'Ids should match'
        );
        
        System.assertEquals(
            settingsToVerify.Billing_In_Progress__c, 
            defaultSettings.Billing_In_Progress__c, 
            'Billing in progress values should match'
        );
    }
    
    @isTest
    static void testActivateBillingInProgress() {
        String billingBatchId = TestUtility.getFakeId( TREX1__Billing_Batch__c.SObjectType );
        
        String strResult = '';
        Test.startTest();
        strResult = BillingSettingsManagerController.toggleBillingSettings(
            billingBatchId
        );
        Test.stopTest();

        System.assertEquals(
            'Success', 
            strResult, 
            'Should have received successful response'
        );

        System.assertEquals(
            billingBatchId, 
            Billing_Settings__c.getOrgDefaults().Billing_Batch_ID__c, 
            'Should have received the defined billing batch id'
        );

        System.assertEquals(
            true, 
            Billing_Settings__c.getOrgDefaults().Billing_In_Progress__c, 
            'Billing In Progress should have been set to true'
        );
    }

    @isTest
    static void testActivateBillingInProgressWithException() {
        String invalidBillingBatchId = '0123456789012345678';
        Boolean exceptionThrown = false;
        Test.startTest();
        try {
            String strResult = BillingSettingsManagerController.toggleBillingSettings(
                invalidBillingBatchId
            );
        } catch (Exception e) {
            exceptionThrown = true;
        }
        Test.stopTest();
        System.assert(exceptionThrown, 'Exception should have been thrown');
    }
    
    @isTest
    static void testDeactivateBillingInProgress() {
        String billingBatchId = TestUtility.getFakeId( TREX1__Billing_Batch__c.SObjectType );
        String strResult = '';
        
        // Update to active billing in progress settings
        Billing_Settings__c billingSettings = Billing_Settings__c.getOrgDefaults();
        billingSettings.Billing_In_Progress__c = true;
        billingSettings.Running_User_ID__c = UserInfo.getUserId();
        billingSettings.Running_User_Name__c = UserInfo.getName();
        billingSettings.Billing_Batch_ID__c = billingBatchId;
        billingSettings.Expiration_Date_Time__c = Datetime.now().addSeconds(
            Integer.valueOf( Math.round(TIME_LIMIT * 3600) )
        );
        billingSettings.Last_Billing_Start_Date_Time__c = Datetime.now();
        update billingSettings;
                
        Test.startTest();
        strResult = BillingSettingsManagerController.toggleBillingSettings(
            billingBatchId
        );
        Test.stopTest();
        
        System.assertEquals(
            'Success', 
            strResult, 
            'Should have received successful response'
        );
        
        System.assertNotEquals(
            true, 
            Billing_Settings__c.getOrgDefaults().Billing_In_Progress__c, 
            'Billing In Progress should not equal true'
        );
    }

}