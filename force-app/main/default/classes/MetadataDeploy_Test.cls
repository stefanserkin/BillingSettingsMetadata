@isTest
private class MetadataDeploy_Test {

    @isTest
    static void testDeployMetadata() {
        String fullName = 'Billing_Setting.TestRecord';
        String label = 'TestRecord';
        Map<String, Object> mapFieldValues = new Map<String, Object>();
        mapFieldValues.put('Billing_In_Progress__c', true);
        
        String strResult = '';

        Test.startTest();
        strResult = MetadataDeploy.updateAndDeployMetadata(
            fullName, 
            label, 
            mapFieldValues
        );
        Test.stopTest();
    }
    
    @isTest
    static void testMetadataDeployUtils() {
        MetadataDeploy mtd = new MetadataDeploy();
        Test.startTest();
        mtd.handleResult(
            new Metadata.DeployResult(), 
            new Metadata.DeployCallbackContext()
        );
        Test.stopTest();
    }
    
}