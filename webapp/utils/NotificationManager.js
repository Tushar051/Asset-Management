sap.ui.define([], function () {
    "use strict";

    return {
        addNotification: function (oModel, sSender, sMessage, sIcon) {
            var aNotifications = oModel.getProperty("/notifications") || [];
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

        clearNotifications: function (oModel) {
            oModel.setProperty("/notifications", []);
            oModel.setProperty("/notificationCount", 0);
        }
    };
});
