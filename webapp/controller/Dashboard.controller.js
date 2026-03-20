sap.ui.define([
    "admin/asset/manager/controller/BaseController",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (BaseController, Fragment, MessageToast) {
    "use strict";

    return BaseController.extend("admin.asset.manager.controller.Dashboard", {
        onInit: function () {
            this._selectedRequest = null;
            var oModel = this.getModel();
            if (oModel && oModel.getData()) {
                this._initializeAdminData();
            } else {
                this.getView().attachModelContextChange(function() {
                    if (!this._adminInitialized) {
                        this._initializeAdminData();
                        this._adminInitialized = true;
                    }
                }.bind(this));
            }
        },

        _initializeAdminData: function () {
            var oModel = this.getModel();
            if (!oModel) {
                return;
            }
            
            if (!oModel.getProperty("/adminProfile")) {
                oModel.setProperty("/adminProfile", {
                    name: "John Smith",
                    role: "System Administrator",
                    employeeId: "ADM001",
                    email: "john.smith@company.com"
                });
            }
            
            if (!oModel.getProperty("/notifications")) {
                oModel.setProperty("/notifications", []);
                oModel.setProperty("/notificationCount", 0);
            }
        },

        _addNotification: function (sSender, sMessage, sIcon) {
            var oModel = this.getModel();
            var aNotifications = oModel.getProperty("/notifications") || [];
            var oNow = new Date();
            var sTimestamp = "Just now";
            
            aNotifications.unshift({
                sender: sSender,
                message: sMessage,
                timestamp: sTimestamp,
                icon: sIcon || "sap-icon://message-information"
            });
            
            oModel.setProperty("/notifications", aNotifications);
            oModel.setProperty("/notificationCount", aNotifications.length);
        },

        onProfilePress: function (oEvent) {
            var oButton = oEvent.getSource();
            if (!this._profilePopover) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "admin.asset.manager.view.fragments.ProfilePopover",
                    controller: this
                }).then(function (oPopover) {
                    this._profilePopover = oPopover;
                    this.getView().addDependent(oPopover);
                    oPopover.openBy(oButton);
                }.bind(this));
            } else {
                this._profilePopover.openBy(oButton);
            }
        },

        onNotificationPress: function (oEvent) {
            var oButton = oEvent.getSource();
            if (!this._notificationPopover) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "admin.asset.manager.view.fragments.NotificationPopover",
                    controller: this
                }).then(function (oPopover) {
                    this._notificationPopover = oPopover;
                    this.getView().addDependent(oPopover);
                    oPopover.openBy(oButton);
                }.bind(this));
            } else {
                this._notificationPopover.openBy(oButton);
            }
        },

        onClearNotifications: function () {
            var oModel = this.getModel();
            oModel.setProperty("/notifications", []);
            oModel.setProperty("/notificationCount", 0);
            MessageToast.show("All notifications cleared");
        },

        onCloseNotifications: function () {
            this._notificationPopover.close();
        },

        onLogout: function () {
            MessageToast.show("Logging out...");
            this._profilePopover.close();
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
                var oModel = this.getModel();
                var aRequests = oModel.getProperty("/requests") || [];
                var aAssigned = oModel.getProperty("/assignedAssets") || [];
                
                var oNow = new Date();
                var sDate = oNow.toISOString().split('T')[0];
                var sTime = oNow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                var oAssignedAsset = {
                    employeeName: this._selectedRequest.employeeName,
                    assetName: this._selectedRequest.requestedAssetName,
                    category: "Laptop",
                    description: "Assigned based on request",
                    assignedDate: sDate,
                    assignedTime: sTime
                };
                
                aAssigned.push(oAssignedAsset);
                
                var iIndex = aRequests.indexOf(this._selectedRequest);
                if (iIndex > -1) {
                    aRequests.splice(iIndex, 1);
                }
                
                oModel.setProperty("/requests", aRequests);
                oModel.setProperty("/assignedAssets", aAssigned);
                
                this._addNotification(
                    "System",
                    "Asset '" + this._selectedRequest.requestedAssetName + "' assigned to " + this._selectedRequest.employeeName,
                    "sap-icon://accept"
                );
                
                MessageToast.show("Request approved and asset assigned");
                this._requestDetailDialog.close();
            }
        },

        onRejectRequest: function () {
            if (this._selectedRequest) {
                var oModel = this.getModel();
                var aRequests = oModel.getProperty("/requests") || [];
                
                var iIndex = aRequests.indexOf(this._selectedRequest);
                if (iIndex > -1) {
                    aRequests.splice(iIndex, 1);
                }
                
                oModel.setProperty("/requests", aRequests);
                
                this._addNotification(
                    "System",
                    "Request from " + this._selectedRequest.employeeName + " for '" + this._selectedRequest.requestedAssetName + "' was rejected",
                    "sap-icon://decline"
                );
                
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
            
            this._addNotification(
                "System",
                "New asset '" + sAssetName + "' added to inventory",
                "sap-icon://add-equipment"
            );

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
