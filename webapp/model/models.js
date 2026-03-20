sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createDataModel: function () {
            var oData = {
                requests: [],
                availableAssets: [],
                assignedAssets: []
            };
            return new JSONModel(oData);
        }
    };
});
