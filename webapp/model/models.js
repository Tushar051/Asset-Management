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
            var oModel = new JSONModel();
            oModel.loadData("model/mockData.json");
            return oModel;
        }
    };
});
