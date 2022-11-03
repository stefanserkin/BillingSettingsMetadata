import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getDefaultBillingSetting from '@salesforce/apex/BillingSettingsManagerController.getDefaultBillingSetting';
import deactivateBillingInProgress from '@salesforce/apex/BillingSettingsManagerController.deactivateBillingInProgress';

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
    defaultBillingSetting;
    billingInProgress = false;
    dtExpiration;

    isUserDeactivated = false;
    strTemporaryConfirmationMsg = 'Success! The Billing in Progress setting has been deactivated. This setting can be reactivated from any billing batch record page.';

    get alertMessage() {
        return `Billing is currently in progress, which nullifies access control restrictions due to outstanding balances. Click the button below to deactivate this setting if billing is complete. The setting will automatically expire on ${this.dtExpiration}.`;
    }

    @wire(getDefaultBillingSetting)
    wiredResult(result) {
        this.isLoading = true;
        this.wiredBillingSettings = result;
        if (result.data) {
            let defaultSetting = result.data;
            let dtNow = new Date();
            let dtExpire = new Date(defaultSetting.Expiration_Date_Time__c);
            if (defaultSetting.Billing_In_Progress__c && dtExpire > dtNow) {
                this.billingInProgress = true;
            }
            this.dtExpiration = this.formatDateTime(
                defaultSetting.Expiration_Date_Time__c, 
                this.dateOptions
            );
            this.defaultBillingSetting = defaultSetting;
            this.error = undefined;
        } else if (result.error) {
            console.error(result.error);
            this.defaultBillingSetting = undefined;
            this.error = result.error;
        }
        this.isLoading = false;
    }

    handleStop() {
        this.isLoading = true;
        deactivateBillingInProgress()
            .then(result => {
                this.strResult = result;
                if (result == 'Success') {
                    this.isUserDeactivated = true;
                    this.billingInProgress = false;
                }
            })
            .catch(error => {
                console.error(error);
                this.error = error;
            });
        refreshApex(this.wiredBillingSettings);
        this.isLoading = false;
    }

    /////////////////////////////////////////////
    //                  Utils
    /////////////////////////////////////////////

    formatDateTime(date, options) {
        let dt = new Date( date );
        return new Intl.DateTimeFormat('en-US', options).format(dt);
    }

}