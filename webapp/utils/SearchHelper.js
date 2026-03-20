sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Filter, FilterOperator) {
    "use strict";

    return {
        applySearch: function (oList, sQuery, aFields) {
            var oBinding = oList.getBinding("items");
            
            if (!oBinding) {
                return;
            }

            if (sQuery && sQuery.length > 0) {
                var aFilters = aFields.map(function (sField) {
                    return new Filter(sField, FilterOperator.Contains, sQuery);
                });
                
                var oCombinedFilter = new Filter({
                    filters: aFilters,
                    and: false
                });
                
                oBinding.filter([oCombinedFilter]);
            } else {
                oBinding.filter([]);
            }
        }
    };
});
