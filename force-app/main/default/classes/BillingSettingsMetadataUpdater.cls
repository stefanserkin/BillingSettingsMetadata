public class BillingSettingsMetadataUpdater implements Metadata.DeployCallback {

    public void handleResult(
        Metadata.DeployResult result, 
        Metadata.DeployCallbackContext context
    ) {
        if (result.status == Metadata.DeployStatus.SUCCEEDED) {
            System.debug(':::::: Success : ' + result);
        } else {
            System.debug(':::::: Failed : ' + result);
        }
    }

    /*
    public static void deactivateBillingInProgress(
        String fullName, 
        String label, 
        Map<String, Object> fieldWithValuesMap
    ) {
        // uncheck a box
        Metadata.CustomMetadata customMetadata = new Metadata.CustomMetadata();
        customMetadata.fullName = fullName;
        customMetadata.label = label;

        for (String key : fieldWithValuesMap.keySet()) {
            Metadata.CustomMetadataValue customField = new Metadata.CustomMetadataValue();
            customField.field = key;
            customField.value = fieldWithValuesMap.get(key);
            customMetadata.values.add(customField);
        }

        Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
        mdContainer.addMetadata(customMetadata);
        BillingSettingsMetadataUpdater bsmu = new BillingSettingsMetadataUpdater();
        Id jobId = Metadata.Operations.enqueueDeployment(
            mdContainer, 
            bsmu
        );
    }
*/

}
