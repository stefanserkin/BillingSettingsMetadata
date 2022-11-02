import { LightningElement, api, wire } from 'lwc';
import getDefaultBillingSetting from '@salesforce/apex/BillingSettingsManagerController.getDefaultBillingSetting';
import activateBillingInProgress from '@salesforce/apex/BillingSettingsManagerController.activateBillingInProgress';
import deactivateBillingInProgress from '@salesforce/apex/BillingSettingsManagerController.deactivateBillingInProgress';

export default class BillingSettingsManager extends LightningElement {
    @api recordId;

    isLoading = false;
    error;

    cardTitle = 'Manage Billing Settings';
    cardIconName = 'custom:custom19';
    billingInProgress = false;

    strResult = '';
    wiredBillingSettings = [];
    defaultBillingSetting;

    @wire(getDefaultBillingSetting)
    wiredResult(result) {
        this.isLoading = true;
        this.wiredBillingSettings = result;
        if (result.data) {
            this.billingInProgress = result.data.Billing_In_Progress__c;
            this.defaultBillingSetting = result.data;
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
                    this.billingInProgress = true;
                }
            })
            .catch(error => {
                console.error(error);
                this.error = error;
            });
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
        this.isLoading = false;
    }

}