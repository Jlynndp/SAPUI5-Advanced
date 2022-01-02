//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],

    function (Controller) {
        return Controller.extend("logaligroup.Employees.controller.Base", {

            onInit: function () {

            },

            toOrderDetails: function (oEvent) {
                //get parameter orderId: source/model/object/property
                var orderId = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
                //get router for the instance
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //nav to Route with parameter -> OrderDetails/{OrderId}
                oRouter.navTo("RouteOrderDetails", {
                    OrderId: orderId
                });
            }
        });
    });
