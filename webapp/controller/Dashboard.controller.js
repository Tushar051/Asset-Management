sap.ui.define([
    "admin/asset/manager/controller/BaseController",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "admin/asset/manager/utils/SearchHelper",
    "admin/asset/manager/utils/NotificationManager"
], function (BaseController, Fragment, MessageToast, SearchHelper, NotificationManager) {
    "use strict";

    return BaseController.extend("admin.asset.manager.controller.Dashboard", {
        onInit: function () {
            this._selectedRequest = null;
            this._initializeData();
        },

        _initializeData: function () {
            var oModel = this.getModel();
            if (oModel && oModel.getData()) {
                this._setupAdminProfile();
            } else {
                this.getView().attachModelContextChange(function() {
                    if (!this._adminInitialized) {
                        this._setupAdminProfile();
                        this._adminInitialized = true;
                    }
                }.bind(this));
            }
        },

        _setupAdminProfile: function () {
            var oModel = this.getModel();
            if (!oModel) return;
            
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

        // KPI Formatters
        getTotalAssets: function (aAvailable, aAssigned) {
            return (aAvailable ? aAvailable.length : 0) + (aAssigned ? aAssigned.length : 0);
        },

        getAvailableCount: function (aAvailable) {
            return aAvailable ? aAvailable.length : 0;
        },

        getAssignedCount: function (aAssigned) {
            return aAssigned ? aAssigned.length : 0;
        },

        getPendingCount: function (aRequests) {
            return aRequests ? aRequests.length : 0;
        },

        // Header Actions
        onRefresh: function () {
            MessageToast.show("Dashboard refreshed");
            this.getModel().refresh(true);
        },

        onProfilePress: function (oEvent) {
            this._openPopover(oEvent.getSource(), "ProfilePopover", "_profilePopover");
        },

        onNotificationPress: function (oEvent) {
            this._openPopover(oEvent.getSource(), "NotificationPopover", "_notificationPopover");
        },

        onLogout: function () {
            MessageToast.show("Logging out...");
            if (this._profilePopover) {
                this._profilePopover.close();
            }
        },

        // Tile Actions
        onTotalAssetsTilePress: function () {
            var iTotal = this.getTotalAssets(
                this.getModel().getProperty("/availableAssets"),
                this.getModel().getProperty("/assignedAssets")
            );
            MessageToast.show("Total Assets: " + iTotal);
        },

        onAvailableAssetsTilePress: function () {
            this.byId("iconTabBar").setSelectedKey("available");
        },

        onAssignedAssetsTilePress: function () {
            this.byId("iconTabBar").setSelectedKey("assigned");
        },

        // Search
        onSearchRequests: function (oEvent) {
            SearchHelper.applySearch(
                this.byId("requestsList"),
                oEvent.getParameter("query"),
                ["employeeName", "requestedAssetName", "employeeId"]
            );
        },

        onSearchAvailable: function (oEvent) {
            SearchHelper.applySearch(
                this.byId("availableAssetsList"),
                oEvent.getParameter("query"),
                ["assetName", "category", "description"]
            );
        },

        onSearchAssigned: function (oEvent) {
            SearchHelper.applySearch(
                this.byId("assignedAssetsList"),
                oEvent.getParameter("query"),
                ["employeeName", "assetName", "category"]
            );
        },

        // Request Management
        onRequestPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            this._selectedRequest = oContext.getObject();
            this._openDialog("RequestDetail", "_requestDetailDialog", oContext);
        },

        onAcceptRequest: function () {
            if (!this._selectedRequest) return;
            this._processApproval(this._selectedRequest);
            this._requestDetailDialog.close();
        },

        onRejectRequest: function () {
            if (!this._selectedRequest) return;
            this._showConfirmDialog(
                "Reject Request",
                "Reject this request?",
                "Reject",
                "Reject",
                "Error",
                this._processRejection.bind(this)
            );
        },

        onCloseRequestDetail: function () {
            this._requestDetailDialog.close();
        },

        // Bulk Actions
        onBulkApprove: function () {
            var aSelected = this.byId("requestsList").getSelectedItems();
            if (aSelected.length === 0) {
                MessageToast.show("Select requests to approve");
                return;
            }
            this._showConfirmDialog(
                "Approve Requests",
                "Approve " + aSelected.length + " request(s)?",
                "Accept",
                "Accept",
                "Warning",
                function () { this._bulkProcess(aSelected, true); }.bind(this)
            );
        },

        onBulkReject: function () {
            var aSelected = this.byId("requestsList").getSelectedItems();
            if (aSelected.length === 0) {
                MessageToast.show("Select requests to reject");
                return;
            }
            this._showConfirmDialog(
                "Reject Requests",
                "Reject " + aSelected.length + " request(s)?",
                "Reject",
                "Reject",
                "Error",
                function () { this._bulkProcess(aSelected, false); }.bind(this)
            );
        },

        _bulkProcess: function (aItems, bApprove) {
            var oModel = this.getModel();
            var aRequests = oModel.getProperty("/requests") || [];
            var aAssigned = oModel.getProperty("/assignedAssets") || [];
            
            aItems.forEach(function (oItem) {
                var oRequest = oItem.getBindingContext().getObject();
                if (bApprove) {
                    aAssigned.push(this._createAssignment(oRequest));
                }
                var idx = aRequests.indexOf(oRequest);
                if (idx > -1) aRequests.splice(idx, 1);
            }.bind(this));
            
            oModel.setProperty("/requests", aRequests);
            if (bApprove) oModel.setProperty("/assignedAssets", aAssigned);
            
            NotificationManager.addNotification(
                oModel,
                "System",
                aItems.length + " request(s) " + (bApprove ? "approved" : "rejected"),
                bApprove ? "sap-icon://accept" : "sap-icon://decline"
            );
            
            MessageToast.show(aItems.length + " request(s) processed");
            this.byId("requestsList").removeSelections(true);
        },

        _processApproval: function (oRequest) {
            var oModel = this.getModel();
            var aRequests = oModel.getProperty("/requests") || [];
            var aAssigned = oModel.getProperty("/assignedAssets") || [];
            
            aAssigned.push(this._createAssignment(oRequest));
            var idx = aRequests.indexOf(oRequest);
            if (idx > -1) aRequests.splice(idx, 1);
            
            oModel.setProperty("/requests", aRequests);
            oModel.setProperty("/assignedAssets", aAssigned);
            
            NotificationManager.addNotification(
                oModel,
                "System",
                "Asset assigned to " + oRequest.employeeName,
                "sap-icon://accept"
            );
            
            MessageToast.show("Request approved");
        },

        _processRejection: function () {
            var oModel = this.getModel();
            var aRequests = oModel.getProperty("/requests") || [];
            var idx = aRequests.indexOf(this._selectedRequest);
            if (idx > -1) aRequests.splice(idx, 1);
            
            oModel.setProperty("/requests", aRequests);
            
            NotificationManager.addNotification(
                oModel,
                "System",
                "Request rejected",
                "sap-icon://decline"
            );
            
            MessageToast.show("Request rejected");
            this._requestDetailDialog.close();
        },

        _createAssignment: function (oRequest) {
            var oNow = new Date();
            return {
                employeeName: oRequest.employeeName,
                assetName: oRequest.requestedAssetName,
                category: "Laptop",
                description: "Assigned based on request",
                assignedDate: oNow.toISOString().split('T')[0],
                assignedTime: oNow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
        },

        // Asset Management
        onCreateAsset: function () {
            this._openDialog("AddAsset", "_addAssetDialog");
            setTimeout(function() { this._setCurrentDate(); }.bind(this), 100);
        },

        onSaveAsset: function () {
            var sName = this.byId("assetNameInput").getValue();
            var sConfig = this.byId("configurationInput").getValue();
            var sDesc = this.byId("descriptionInput").getValue();
            var sCategory = this.byId("categorySelect").getSelectedKey();
            var oDate = this.byId("assetDatePicker").getDateValue();

            if (!sName || !sConfig || !sDesc || !sCategory) {
                MessageToast.show("Fill all required fields");
                return;
            }

            var oModel = this.getModel();
            var aAssets = oModel.getProperty("/availableAssets") || [];
            
            var oNewAsset = {
                assetName: sName,
                configuration: sConfig,
                description: sDesc,
                category: sCategory,
                date: oDate.toISOString().split('T')[0]
            };
            
            aAssets.push(oNewAsset);
            oModel.setProperty("/availableAssets", aAssets);
            oModel.refresh(true);
            
            NotificationManager.addNotification(
                oModel,
                "System",
                "Asset '" + sName + "' added",
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

        _setCurrentDate: function () {
            var oPicker = this.byId("assetDatePicker");
            if (oPicker) oPicker.setDateValue(new Date());
        },

        _clearAssetForm: function () {
            this.byId("assetNameInput").setValue("");
            this.byId("configurationInput").setValue("");
            this.byId("descriptionInput").setValue("");
            this.byId("categorySelect").setSelectedKey("");
        },

        // Asset Details
        onAssetDetailsPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oAsset = oContext.getObject();
            oAsset.status = "Available";
            oAsset.statusState = "Success";
            this._showAssetDetails(oContext);
        },

        onAssignedAssetDetailsPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oAsset = oContext.getObject();
            oAsset.status = "Assigned";
            oAsset.statusState = "Warning";
            this._showAssetDetails(oContext);
        },

        _showAssetDetails: function (oContext) {
            if (!this._assetDetailsDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "admin.asset.manager.view.fragments.AssetDetailsDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._assetDetailsDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    oDialog.bindElement(oContext.getPath());
                    oDialog.open();
                }.bind(this));
            } else {
                this._assetDetailsDialog.bindElement(oContext.getPath());
                this._assetDetailsDialog.open();
            }
        },

        onCloseAssetDetails: function () {
            this._assetDetailsDialog.close();
        },

        // Notifications
        onClearNotifications: function () {
            NotificationManager.clearNotifications(this.getModel());
            MessageToast.show("Notifications cleared");
        },

        onCloseNotifications: function () {
            this._notificationPopover.close();
        },

        // Confirmation
        _showConfirmDialog: function (sTitle, sMsg, sBtnText, sBtnType, sState, fnCallback) {
            var oModel = this.getModel();
            oModel.setProperty("/confirmTitle", sTitle);
            oModel.setProperty("/confirmMessage", sMsg);
            oModel.setProperty("/confirmButtonText", sBtnText);
            oModel.setProperty("/confirmButtonType", sBtnType);
            oModel.setProperty("/confirmState", sState);
            this._confirmCallback = fnCallback;
            this._openDialog("ConfirmDialog", "_confirmDialog");
        },

        onConfirmAction: function () {
            if (this._confirmCallback) this._confirmCallback();
            this._confirmDialog.close();
        },

        onCancelConfirm: function () {
            this._confirmDialog.close();
        },

        // Helpers
        _openDialog: function (sFragment, sProp, oContext) {
            if (!this[sProp]) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "admin.asset.manager.view.fragments." + sFragment,
                    controller: this
                }).then(function (oDialog) {
                    this[sProp] = oDialog;
                    this.getView().addDependent(oDialog);
                    if (oContext) oDialog.bindElement(oContext.getPath());
                    oDialog.open();
                }.bind(this));
            } else {
                if (oContext) this[sProp].bindElement(oContext.getPath());
                this[sProp].open();
            }
        },

        _openPopover: function (oSource, sFragment, sProp) {
            if (!this[sProp]) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "admin.asset.manager.view.fragments." + sFragment,
                    controller: this
                }).then(function (oPopover) {
                    this[sProp] = oPopover;
                    this.getView().addDependent(oPopover);
                    oPopover.openBy(oSource);
                }.bind(this));
            } else {
                this[sProp].openBy(oSource);
            }
        }
    });
});
