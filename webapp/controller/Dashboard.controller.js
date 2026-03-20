sap.ui.define([
    "admin/asset/manager/controller/BaseController",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (BaseController, Fragment, MessageToast) {
    "use strict";

    return BaseController.extend("admin.asset.manager.controller.Dashboard", {
        onInit: function () {
            this._selectedRequest = null;
        },

        getTotalAssets: function (aAvailable, aAssigned) {
            var iAvailable = aAvailable ? aAvailable.length : 0;
            var iAssigned = aAssigned ? aAssigned.length : 0;
            return iAvailable + iAssigned;
        },

        getAvailableCount: function (aAvailable) {
            return aAvailable ? aAvailable.length : 0;
        },

        getAssignedCount: function (aAssigned) {
            return aAssigned ? aAssigned.length : 0;
        },

        onRequestPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            this._selectedRequest = oContext.getObject();

            if (!this._requestDetailDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "admin.asset.manager.view.fragments.RequestDetail",
                    controller: this
                }).then(function (oDialog) {
                    this._requestDetailDialog = oDialog;
                    this.getView().addDependent(this._requestDetailDialog);
                    this._requestDetailDialog.open();
                }.bind(this));
            } else {
                this._requestDetailDialog.open();
            }
        },

        onCloseRequestDetail: function () {
            this._requestDetailDialog.close();
        },

        onAcceptRequest: function () {
            if (this._selectedRequest) {
                this._selectedRequest.status = "Approved";
                this.getModel().refresh(true);
                MessageToast.show("Request approved successfully");
                this._requestDetailDialog.close();
            }
        },

        onRejectRequest: function () {
            if (this._selectedRequest) {
                this._selectedRequest.status = "Rejected";
                this.getModel().refresh(true);
                MessageToast.show("Request rejected");
                this._requestDetailDialog.close();
            }
        },

        onCreateAsset: function () {
            if (!this._addAssetDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "admin.asset.manager.view.fragments.AddAsset",
                    controller: this
                }).then(function (oDialog) {
                    this._addAssetDialog = oDialog;
                    this.getView().addDependent(this._addAssetDialog);
                    this._setCurrentDate();
                    this._addAssetDialog.open();
                }.bind(this));
            } else {
                this._setCurrentDate();
                this._addAssetDialog.open();
            }
        },

        _setCurrentDate: function () {
            var oDatePicker = this.byId("assetDatePicker");
            if (oDatePicker) {
                var oToday = new Date();
                oDatePicker.setDateValue(oToday);
            }
        },

        onSaveAsset: function () {
            var sAssetName = this.byId("assetNameInput").getValue();
            var sConfiguration = this.byId("configurationInput").getValue();
            var sDescription = this.byId("descriptionInput").getValue();
            var sCategory = this.byId("categorySelect").getSelectedKey();
            var oDate = this.byId("assetDatePicker").getDateValue();

            if (!sAssetName || !sConfiguration || !sDescription || !sCategory) {
                MessageToast.show("Please fill all required fields");
                return;
            }

            var oNewAsset = {
                assetName: sAssetName,
                configuration: sConfiguration,
                description: sDescription,
                category: sCategory,
                date: oDate.toISOString().split('T')[0]
            };

            var oModel = this.getModel();
            var aAssets = oModel.getProperty("/availableAssets") || [];
            aAssets.push(oNewAsset);
            oModel.setProperty("/availableAssets", aAssets);
            oModel.refresh(true);

            MessageToast.show("Asset created successfully");
            this._clearAssetForm();
            this._addAssetDialog.close();
        },

        onCancelAsset: function () {
            this._clearAssetForm();
            this._addAssetDialog.close();
        },

        _clearAssetForm: function () {
            this.byId("assetNameInput").setValue("");
            this.byId("configurationInput").setValue("");
            this.byId("descriptionInput").setValue("");
            this.byId("categorySelect").setSelectedKey("");
        }
    });
});
