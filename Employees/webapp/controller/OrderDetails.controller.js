//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
],

    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     * @param {typeof sap.ui.core.routing.History} History 
     */
    function (Controller, History) {
        function _onObjectMatched(oEvent) {
            //path = datasource url: /Northwind.svc/Orders(10248) // get model from manifest.json
            this.getView().bindElement({
                path: "/Orders(" + oEvent.getParameter("arguments").OrderId + ")",
                model: "odataNorthwind"
            });
        }


        return Controller.extend("logaligroup.Employees.controller.OrderDetails", {

            onInit: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                //if function has been called from RouteOrderDetails route, bind event
                oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMatched, this);
            },

            onBack: function () {
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                //validate if a previous view exists
                if (sPreviousHash !== undefined) {
                    //navigate to previous page
                    window.history.go(-1);
                } else {
                    //navigate to Main route (from manifest.json)
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteMain", true);
                }
            },

            onClearSignature: function (oEvent) {
                var signature = this.byId("signature");
                signature.clear();
            },

            //this function will be called for each item in the order
            factoryOrderDetails: function (listId, oContext) {
                //get object context
                var contextObject = oContext.getObject();

                //set currency (the model doesn't include this property)
                contextObject.Currency = "EUR";

                //get units in stock: context/model/property/
                var unitsInStock = oContext.getModel().getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");

                if (contextObject.Quantity <= unitsInStock) {
                    var objectListItem = new sap.m.ObjectListItem({
                        title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
                        number: "{parts: [ {path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency', formatOptions: {showMeasure : false}}",
                        numberUnit: "{odataNorthwind>Currency}"

                    });
                    return objectListItem;

                } else {
                    var customListItem = new sap.m.CustomListItem({
                        content : [
                            new sap.m.Bar({
                                contentLeft: new sap.m.Label({
                                    text : "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})"
                                }),
                                contentMiddle: new sap.m.ObjectStatus({
                                    text : "{i18n>availableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state : "Error"
                                }),
                                contentRight: new sap.m.Label({
                                    text : "{parts: [ {path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency'}"
                                })
                            })
                        ]
                    });
                    return customListItem;
                }
            }
        });
    });