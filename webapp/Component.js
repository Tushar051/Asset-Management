sap.ui.define([
    "sap/ui/core/UIComponent",
    "admin/asset/manager/model/models"
], function (UIComponent, models) {
    "use strict";

    return UIComponent.extend("admin.asset.manager.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(models.createDataModel());
            this.getRouter().initialize();
        }
    });
});
