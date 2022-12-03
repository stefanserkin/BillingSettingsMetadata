import { LightningElement, wire } from 'lwc';
import getBillingSettings from '@salesforce/apex/BillingSettingsManagerController.getBillingSettings';
import toggleBillingSettings from '@salesforce/apex/BillingSettingsManagerController.toggleBillingSettings';

const DATE_OPTIONS = {
    weekday: 'long', 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true, 
};

export default class BillingInProgressWarning extends LightningElement {
    isLoading = false;
    error;

    dateOptions = DATE_OPTIONS;

    wiredBillingSettings = [];
    defaultBillingSettings;
    billingInProgress = false;
    dtExpiration;
    strResult;

    isUserDeactivated = false;
    strTemporaryConfirmationMsg = 'Success! The Billing in Progress setting has been deactivated. This setting can be reactivated from any billing batch record page.';

    get alertMessage() {
        return `Billing is currently in progress, which nullifies access control restrictions due to outstanding balances. Click the button below to deactivate this setting if billing is complete. The setting will automatically expire on ${this.dtExpiration}.`;
    }

    @wire(getBillingSettings)
    wiredResult(result) {
        this.isLoading = true;
        this.wiredBillingSettings = result;
        if (result.data) {
            let defaultSettings = result.data;
            let dtNow = new Date();
            let dtExpire = new Date(defaultSettings.expirationDateTime);
            if (defaultSettings.billingInProgress && dtExpire > dtNow) {
                this.billingInProgress = true;
            } else {
                this.billingInProgress = false;
            }
            this.dtExpiration = defaultSettings.expirationDateTime != null ? 
                this.formatDateTime(
                    defaultSettings.expirationDateTime, 
                    this.dateOptions
                ) :
                '';
            this.defaultBillingSettings = defaultSettings;
            this.error = undefined;
        } else if (result.error) {
            console.error(result.error);
            this.defaultBillingSettings = undefined;
            this.error = result.error;
        }
        this.isLoading = false;
    }

    handleToggleBillingSettings() {
        this.isLoading = true;
        const billingBatchFakeId = 'deactivate';
        toggleBillingSettings({ billingBatchId: billingBatchFakeId })
            .then(result => {
                this.strResult = result;
                if (result == 'Success') {
                    this.isUserDeactivated = true;
                    this.isLoading = false;
                }
            })
            .catch(error => {
                console.error(error);
                this.error = error;
                this.isLoading = false;
            });
    }

    /////////////////////////////////////////////
    //                  Utils
    /////////////////////////////////////////////

    formatDateTime(date, options) {
        let dt = new Date( date );
        return new Intl.DateTimeFormat('en-US', options).format(dt);
    }

}