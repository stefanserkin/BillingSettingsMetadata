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
            this.numHoursToExpiration = defaultSettings.timeLimit;
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

    /////////////////////////////////////////////
    //                  Utils
    /////////////////////////////////////////////

    formatDateTime(date, options) {
        let dt = new Date( date );
        return new Intl.DateTimeFormat('en-US', options).format(dt);
    }

}