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

        getPendingCount: function (aRequests) {
            return aRequests ? aRequests.length : 0;
        },

        onRefresh: function () {
            MessageToast.show("Dashboard refreshed");
            this.getModel().refresh(true);
        },

        onTotalAssetsTilePress: function () {
            MessageToast.show("Total Assets: " + this.getTotalAssets(
                this.getModel().getProperty("/availableAssets"),
                this.getModel().getProperty("/assignedAssets")
            ));
        },

        onAvailableAssetsTilePress: function () {
            var oIconTabBar = this.byId("iconTabBar");
            oIconTabBar.setSelectedKey("available");
        },

        onAssignedAssetsTilePress: function () {
            var oIconTabBar = this.byId("iconTabBar");
            oIconTabBar.setSelectedKey("assigned");
        },

        onSearchRequests: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oList = this.byId("requestsList");
            var oBinding = oList.getBinding("items");
            
            if (sQuery) {
                var aFilters = [
                    new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("employeeName", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("requestedAssetName", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("employeeId", sap.ui.model.FilterOperator.Contains, sQuery)
                        ],
                        and: false
                    })
                ];
                oBinding.filter(aFilters);
            } else {
                oBinding.filter([]);
            }
        },

        onSearchAvailable: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oList = this.byId("availableAssetsList");
            var oBinding = oList.getBinding("items");
            
            if (sQuery) {
                var aFilters = [
                    new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("assetName", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("category", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sQuery)
                        ],
                        and: false
                    })
                ];
                oBinding.filter(aFilters);
            } else {
                oBinding.filter([]);
            }
        },

        onSearchAssigned: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oList = this.byId("assignedAssetsList");
            var oBinding = oList.getBinding("items");
            
            if (sQuery) {
                var aFilters = [
                    new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("employeeName", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("assetName", sap.ui.model.FilterOperator.Contains, sQuery),
                            new sap.ui.model.Filter("category", sap.ui.model.FilterOperator.Contains, sQuery)
                        ],
                        and: false
                    })
                ];
                oBinding.filter(aFilters);
            } else {
                oBinding.filter([]);
            }
        },

        onBulkApprove: function () {
            var oList = this.byId("requestsList");
            var aSelectedItems = oList.getSelectedItems();
            
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select requests to approve");
                return;
            }
            
            this._showConfirmDialog(
                "Approve Requests",
                "Are you sure you want to approve " + aSelectedItems.length + " request(s)?",
                "Accept",
                "Accept",
                "Warning",
                function () {
                    this._processBulkApproval(aSelectedItems);
                }.bind(this)
            );
        },

        onBulkReject: function () {
            var oList = this.byId("requestsList");
            var aSelectedItems = oList.getSelectedItems();
            
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select requests to reject");
                return;
            }
            
            this._showConfirmDialog(
                "Reject Requests",
                "Are you sure you want to reject " + aSelectedItems.length + " request(s)?",
                "Reject",
                "Reject",
                "Error",
                function () {
                    this._processBulkRejection(aSelectedItems);
                }.bind(this)
            );
        },

        _processBulkApproval: function (aSelectedItems) {
            var oModel = this.getModel();
            var aRequests = oModel.getProperty("/requests") || [];
            var aAssigned = oModel.getProperty("/assignedAssets") || [];
            
            aSelectedItems.forEach(function (oItem) {
                var oContext = oItem.getBindingContext();
                var oRequest = oContext.getObject();
                
                var oNow = new Date();
                var sDate = oNow.toISOString().split('T')[0];
                var sTime = oNow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                aAssigned.push({
                    employeeName: oRequest.employeeName,
                    assetName: oRequest.requestedAssetName,
                    category: "Laptop",
                    description: "Assigned based on request",
                    assignedDate: sDate,
                    assignedTime: sTime
                });
                
                var iIndex = aRequests.indexOf(oRequest);
                if (iIndex > -1) {
                    aRequests.splice(iIndex, 1);
                }
            });
            
            oModel.setProperty("/requests", aRequests);
            oModel.setProperty("/assignedAssets", aAssigned);
            
            this._addNotification(
                "System",
                aSelectedItems.length + " request(s) approved and assets assigned",
                "sap-icon://accept"
            );
            
            MessageToast.show(aSelectedItems.length + " request(s) approved successfully");
            this.byId("requestsList").removeSelections(true);
        },

        _processBulkRejection: function (aSelectedItems) {
            var oModel = this.getModel();
            var aRequests = oModel.getProperty("/requests") || [];
            
            aSelectedItems.forEach(function (oItem) {
                var oContext = oItem.getBindingContext();
                var oRequest = oContext.getObject();
                
                var iIndex = aRequests.indexOf(oRequest);
                if (iIndex > -1) {
                    aRequests.splice(iIndex, 1);
                }
            });
            
            oModel.setProperty("/requests", aRequests);
            
            this._addNotification(
                "System",
                aSelectedItems.length + " request(s) rejected",
                "sap-icon://decline"
            );
            
            MessageToast.show(aSelectedItems.length + " request(s) rejected");
            this.byId("requestsList").removeSelections(true);
        },

        _showConfirmDialog: function (sTitle, sMessage, sButtonText, sButtonType, sState, fnCallback) {
            var oModel = this.getModel();
            oModel.setProperty("/confirmTitle", sTitle);
            oModel.setProperty("/confirmMessage", sMessage);
            oModel.setProperty("/confirmButtonText", sButtonText);
            oModel.setProperty("/confirmButtonType", sButtonType);
            oModel.setProperty("/confirmState", sState);
            this._confirmCallback = fnCallback;
            
            if (!this._confirmDialog) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "admin.asset.manager.view.fragments.ConfirmDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._confirmDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this._confirmDialog.open();
            }
        },

        onConfirmAction: function () {
            if (this._confirmCallback) {
                this._confirmCallback();
            }
            this._confirmDialog.close();
        },

        onCancelConfirm: function () {
            this._confirmDialog.close();
        },

        onAssetDetailsPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
            var oAsset = oContext.getObject();
            oAsset.status = "Available";
            oAsset.statusState = "Success";
            
            this._showAssetDetails(oContext);
        },

        onAssignedAssetDetailsPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext();
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

        onExportRequests: function () {
            var aRequests = this.getModel().getProperty("/requests") || [];
            if (aRequests.length === 0) {
                MessageToast.show("No data to export");
                return;
            }
            this._exportToCSV(aRequests, "Asset_Requests", ["employeeId", "employeeName", "requestedAssetName", "status"]);
        },

        onExportAvailable: function () {
            var aAssets = this.getModel().getProperty("/availableAssets") || [];
            if (aAssets.length === 0) {
                MessageToast.show("No data to export");
                return;
            }
            this._exportToCSV(aAssets, "Available_Assets", ["assetName", "category", "configuration", "description", "date"]);
        },

        onExportAssigned: function () {
            var aAssets = this.getModel().getProperty("/assignedAssets") || [];
            if (aAssets.length === 0) {
                MessageToast.show("No data to export");
                return;
            }
            this._exportToCSV(aAssets, "Assigned_Assets", ["employeeName", "assetName", "category", "description", "assignedDate", "assignedTime"]);
        },

        _exportToCSV: function (aData, sFileName, aColumns) {
            var sCsv = aColumns.join(",") + "\n";
            
            aData.forEach(function (oRow) {
                var aValues = aColumns.map(function (sCol) {
                    return '"' + (oRow[sCol] || "") + '"';
                });
                sCsv += aValues.join(",") + "\n";
            });
            
            var oBlob = new Blob([sCsv], { type: "text/csv;charset=utf-8;" });
            var sUrl = URL.createObjectURL(oBlob);
            var oLink = document.createElement("a");
            oLink.setAttribute("href", sUrl);
            oLink.setAttribute("download", sFileName + ".csv");
            oLink.click();
            
            MessageToast.show("Exported successfully");
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
                this._showConfirmDialog(
                    "Reject Request",
                    "Are you sure you want to reject the request from " + this._selectedRequest.employeeName + "?",
                    "Reject",
                    "Reject",
                    "Error",
                    function () {
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
                    }.bind(this)
                );
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
