import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getBillingSettings from '@salesforce/apex/BillingSettingsManagerController.getBillingSettings';
import toggleBillingSettings from '@salesforce/apex/BillingSettingsManagerController.toggleBillingSettings';
import Billing_Settings_Manager_Component_Help_Text from '@salesforce/label/c.Billing_Settings_Manager_Component_Help_Text';
import USER_ID from '@salesforce/user/Id';

const DATE_OPTIONS = {
    weekday: 'long', 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true, 
};

export default class BillingSettingsManager extends LightningElement {
    @api recordId;

    isLoading = false;
    error;

    helpText = Billing_Settings_Manager_Component_Help_Text;
    dateOptions = DATE_OPTIONS;
    userId = USER_ID;

    @api cardTitle;
    @api cardIconName;
    billingInProgress = false;

    strResult = '';
    wiredBillingSettings = [];
    defaultBillingSettings;

    numHoursToExpiration;
    dtExpiration;

    billingSettingsNotFoundMessage = 'An org default has not been defined for the Billing Settings custom setting. Create an org default to utilize this feature';

    get toggleButtonLabel() {
        return !this.billingInProgress ? 'Commence Billing in Progress' : 'Deactivate';
    }

    get toggleButtonVariant() {
        return !this.billingInProgress ? 'success' : 'destructive';
    }

    @wire(getBillingSettings, { userId: '$userId' })
    wiredResult(result) {
        this.isLoading = true;
        this.wiredBillingSettings = result;
        if (result.data) {
            let defaultSettings = result.data;
            let dtNow = new Date();
            let dtExpire = new Date(defaultSettings.Expiration_Date_Time__c);
            if (defaultSettings.Billing_In_Progress__c && dtExpire > dtNow) {
                this.billingInProgress = true;
            } else {
                this.billingInProgress = false;
            }
            this.numHoursToExpiration = defaultSettings.Time_Limit__c;
            this.dtExpiration = defaultSettings.Expiration_Date_Time__c != null ? 
                this.formatDateTime(
                    defaultSettings.Expiration_Date_Time__c, 
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
        toggleBillingSettings({ billingBatchId: this.recordId })
            .then(result => {
                this.strResult = result;
                if (result == 'Success') {
                    this.billingInProgress = !this.billingInProgress;
                    refreshApex(this.wiredBillingSettings);
                    this.isLoading = false;
                }
            })
            .catch(error => {
                console.error(error);
                this.error = error;
                this.isLoading = false;
            });
    }
    
/*
    handleStart() {
        this.isLoading = true;
        activateBillingInProgress({ billingBatchId: this.recordId })
            .then(result => {
                this.strResult = result;
                if (result == 'Success') {
                    let dt = new Date();
                    dt.setTime(dt.getTime() + (this.numHoursToExpiration * 60 * 60 * 1000));
                    this.dtExpiration = this.formatDateTime(
                        dt, 
                        this.dateOptions
                    );
                    this.billingInProgress = true;
                }
            })
            .catch(error => {
                console.error(error);
                this.error = error;
            });
        refreshApex(this.wiredBillingSettings);
        this.isLoading = false;
    }
*/

    /////////////////////////////////////////////
    //                  Utils
    /////////////////////////////////////////////

    formatDateTime(date, options) {
        let dt = new Date( date );
        return new Intl.DateTimeFormat('en-US', options).format(dt);
    }

}