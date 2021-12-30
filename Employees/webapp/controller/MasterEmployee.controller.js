//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        };

        //Filter button implemetation 
        function onFilter() {
            //get current data of the model
            //var oJSON = this.getView().getModel().getData();

            //get countries model
            var oJSONCountries = this.getView().getModel("jsonCountries").getData();
            var filters = [];

            //create filter with the data
            if (oJSONCountries.EmployeeId !== "") {
                // filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSON.EmployeeId));
                filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSONCountries.EmployeeId));
            }
            if (oJSONCountries.CountryKey !== "") {
                // filters.push(new Filter("Country", FilterOperator.EQ, oJSON.CountryKey));
                filters.push(new Filter("Country", FilterOperator.EQ, oJSONCountries.CountryKey));
            }

            //update table with filters
            var oList = this.getView().byId("tableEmployee");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters);
        };

        //clear filters on table
        function onClearFilter() {
            // var oModel = this.getView().getModel();
            var oModel = this.getView().getModel("jsonCountries");
            oModel.setProperty("/EmployeeId", "");
            oModel.setProperty("/CountryKey", "");

            //display table with no filters
            var oList = this.getView().byId("tableEmployee");
            var oBinding = oList.getBinding("items");
            oBinding.filter();
        };

        function showPostalcode(oEvent) {
            var itemPressed = oEvent.getSource();                                           //get pressed item from event
            // var oContext = itemPressed.getBindingContext();                              //get context from the pressed item
            var oContext = itemPressed.getBindingContext("jsonEmployees");                  //get Employees context from the pressed item
            var objectContext = oContext.getObject();                                       //object from model
            sap.m.MessageToast.show(objectContext.PostalCode);
        };

        function onShowCity() {
            var oJSONModelConfig = this.getView().getModel("jsonModelConfig");
            oJSONModelConfig.setProperty("/visibleCity", true);
            oJSONModelConfig.setProperty("/visibleBtnShowCity", false);
            oJSONModelConfig.setProperty("/visibleBtnHideCity", true);
        };

        function onHideCity() {
            var oJSONModelConfig = this.getView().getModel("jsonModelConfig");
            oJSONModelConfig.setProperty("/visibleCity", false);
            oJSONModelConfig.setProperty("/visibleBtnShowCity", true);
            oJSONModelConfig.setProperty("/visibleBtnHideCity", false);
        };

        function showOrders(oEvent) {
            //get selected controller
            var iconPressed = oEvent.getSource();

            //context from the model
            // var oContext = iconPressed.getBindingContext("jsonEmployees");
            var oContext = iconPressed.getBindingContext("odataNorthwind");

            //get fragment instance
            if (!this._oDialogOrders) {
                this._oDialogOrders = sap.ui.xmlfragment("logaligroup.Employees.fragment.DialogOrders", this);
                this.getView().addDependent(this._oDialogOrders);
            };

            //dialog binding to the context to have access to the data of selected item
            // this._oDialogOrders.bindElement("jsonEmployees>" + oContext.getPath());
            this._oDialogOrders.bindElement("odataNorthwind>" + oContext.getPath());
            this._oDialogOrders.open();
        };

        function onCloseOrders() {
            this._oDialogOrders.close();
        };

        function showEmployee(oEvent) {
            var path = oEvent.getSource().getBindingContext("odataNorthwind").getPath();
            //category, event_name, object
            this._bus.publish("flexible", "showEmployee", path);
        };

        function toOrderDetails(oEvent) {
            //get parameter orderId: source/model/object/property
            var orderId = oEvent.getSource().getBindingContext("odataNorthwind").getObject().OrderID;
            //get router for the instance
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //nav to Route with parameter -> OrderDetails/{OrderId}
            oRouter.navTo("RouteOrderDetails", {
                OrderId: orderId
            });
        };

        //prototype to clear js-error
        var Main = Controller.extend("logaligroup.Employees.controller.MainView", {});

        Main.prototype.onLiveChange = function () {
            var inputEmployee = this.byId("inputEmployee");
            var valueEmployee = inputEmployee.getValue();
            if (valueEmployee.length === 6) {
                //inputEmployee.setDescription("OK");
                this.getView().byId("labelCountry").setVisible(true);
                this.getView().byId("slCountry").setVisible(true);

            } else {
                //inputEmployee.setDescription("NOT OK");
                this.getView().byId("labelCountry").setVisible(false);
                this.getView().byId("slCountry").setVisible(false);
            }
        };

        //prototype: make functions visible
        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.onClearFilter = onClearFilter;
        Main.prototype.showPostalcode = showPostalcode;
        Main.prototype.onShowCity = onShowCity;
        Main.prototype.onHideCity = onHideCity;
        Main.prototype.showOrders = showOrders;
        Main.prototype.onCloseOrders = onCloseOrders;
        Main.prototype.showEmployee = showEmployee;
        Main.prototype.toOrderDetails = toOrderDetails;
        return Main;

        /** 
        return Controller.extend("logaligroup.Employees.controller.MainView", {
            onInit: function () {
 
            },
 
            onLiveChange: function () {
 
                var inputEmployee = this.byId("inputEmployee");
                var valueEmployee = inputEmployee.getValue();
                if (valueEmployee.length === 6) {
                    //inputEmployee.setDescription("OK");
                    this.byId("labelCountry").setVisible(true);
                    this.byId("slCountry").setVisible(true);
 
                } else {
                    //inputEmployee.setDescription("NOT OK");
                    this.byId("labelCountry").setVisible(false);
                    this.byId("slCountry").setVisible(false);
                };
 
            },
        });*/
    });
