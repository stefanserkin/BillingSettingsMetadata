import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getDefaultBillingSetting from '@salesforce/apex/BillingSettingsManagerController2.getDefaultBillingSetting';
import activateBillingInProgress from '@salesforce/apex/BillingSettingsManagerController2.activateBillingInProgress';
import deactivateBillingInProgress from '@salesforce/apex/BillingSettingsManagerController2.deactivateBillingInProgress';
import toggleSuperSecretSetting from '@salesforce/apex/BillingSettingsManagerController2.toggleSuperSecretSetting';
import Billing_Settings_Manager_Component_Help_Text from '@salesforce/label/c.Billing_Settings_Manager_Component_Help_Text';

const DATE_OPTIONS = {
    weekday: 'long', 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true, 
};

export default class BillingSettingsManager2 extends LightningElement {
    @api recordId;

    isLoading = false;
    error;

    helpText = Billing_Settings_Manager_Component_Help_Text;
    dateOptions = DATE_OPTIONS;

    @api cardTitle;
    @api cardIconName;
    billingInProgress = false;
    superSecretSettingIsActive = false;

    strResult = '';
    wiredBillingSettings = [];
    defaultBillingSetting;

    numHoursToExpiration;
    dtExpiration;

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
            } else {
                this.billingInProgress = false;
            }
            this.numHoursToExpiration = defaultSetting.Time_Limit__c;
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

    handleStop() {
        this.isLoading = true;
        deactivateBillingInProgress()
            .then(result => {
                this.strResult = result;
                if (result == 'Success') {
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

    handleToggleSuperSecretSetting() {
        this.isLoading = true;
        toggleSuperSecretSetting()
            .then(result => {
                if (result == 'Success') {
                    this.superSecretSettingIsActive = !this.superSecretSettingIsActive;
                }
            })
            .catch(error => {
                console.error(error);
                this.error = error;
            });
        this.isLoading = false;
    }

    get toggleButtonLabel() {
        return !this.superSecretSettingIsActive ? 'Activate Super Secret Setting' : 'Deactivate Super Secret Setting';
    }

    /////////////////////////////////////////////
    //                  Utils
    /////////////////////////////////////////////

    formatDateTime(date, options) {
        let dt = new Date( date );
        return new Intl.DateTimeFormat('en-US', options).format(dt);
    }

}