public class MetadataDeploy implements Metadata.DeployCallback {

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

    public static String updateAndDeployMetadata(
        String fullName, 
        String label, 
        Map<String, Object> mapFieldValues
    ) {
        try {
            Metadata.CustomMetadata customMetadata = new Metadata.CustomMetadata();
            customMetadata.fullName = fullName;
            customMetadata.label = label;
    
            for (String key : mapFieldValues.keySet()) {
                Metadata.CustomMetadataValue customField = new Metadata.CustomMetadataValue();
                customField.field = key;
                customField.value = mapFieldValues.get(key);
                customMetadata.values.add(customField);
            }
    
            Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
            mdContainer.addMetadata(customMetadata);
            MetadataDeploy md = new MetadataDeploy();
            Id jobId = Metadata.Operations.enqueueDeployment(
                mdContainer, 
                md
            );
            return 'Success';
        } catch (Exception e) {
            return e.getMessage();
        }
    }
    
}