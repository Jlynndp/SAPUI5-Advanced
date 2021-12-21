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
            var oJSONModel = new sap.ui.model.json.JSONModel();

            //json model for countries
            var oView = this.getView();
            // //get i18n resources
            // var i18nBundle = oView.getModel("i18n").getResourceBundle();
            //     var oJSON = {
            //         employeeId: "12345",
            //         countryKey: "UK",
            //         listCountry: [
            //             {
            //                 key: "US",
            //                 text: i18nBundle.getText("CountryUS")
            //             },
            //             {
            //                 key: "UK",
            //                 text: i18nBundle.getText("CountryUK")
            //             },
            //             {
            //                 key: "ES",
            //                 text: i18nBundle.getText("CountryES")
            //             },
            //         ]
            //     };
            //     oJSONModel.setData(oJSON);

            //load model from file
            //@ts-ignore
            var oJSONModelEmployees = new sap.ui.model.json.JSONModel();
            oJSONModelEmployees.loadData("./localService/mockdata/Employees.json", false);
            oView.setModel(oJSONModelEmployees, "jsonEmployees");

            var oJSONModelCountries = new sap.ui.model.json.JSONModel();
            oJSONModelCountries.loadData("./localService/mockdata/Countries.json", false);
            oView.setModel(oJSONModelCountries, "jsonCountries");

            //config columns properties
            var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                visibleId: true,
                visibleName: true,
                visibleCountry: true,
                visibleCity: false,
                visibleBtnShowCity: true,
                visibleBtnHideCity: false,
            });
            oView.setModel(oJSONModelConfig, "jsonModelConfig")

            // //show loaded model
            // oJSONModel.attachRequestCompleted(function (oEventModel) {
            //     console.log(JSON.stringify(oJSONModel.getData()));
            // });
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
            var ordersTable = this.getView().byId("ordersTable");
            ordersTable.destroyItems();

            //get Employee selected
            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("jsonEmployees");

            //get orders from Employee model
            var objectContext = oContext.getObject();
            var orders = objectContext.Orders;
            var ordersItems = [];

            for (var i in orders) {
                ordersItems.push(new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Label({ text: orders[i].OrderID }),
                        new sap.m.Label({ text: orders[i].Freight }),
                        new sap.m.Label({ text: orders[i].ShipAddress })
                    ]
                }));
            }

            //add columns with labels
            var newTable = new sap.m.Table({
                width: "auto",
                columns: [
                    new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>orderID}" }) }),
                    new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>freight}" }) }),
                    new sap.m.Column({ header: new sap.m.Label({ text: "{i18n>shipAddress}" }) }),
                ],
                items: ordersItems
            }).addStyleClass("sapUiSmallMargin");

            ordersTable.addItem(newTable);

            //add new table
            var newTableJSON = new sap.m.Table();
            newTableJSON.setWidth("auto");
            newTableJSON.addStyleClass("sapUiSmallMargin");

            //add columns
            var columnOrderID = new sap.m.Column();
            var labelOrderID = new sap.m.Label();
            labelOrderID.bindProperty("text", "i18n>orderID");
            columnOrderID.setHeader(labelOrderID);
            newTableJSON.addColumn(columnOrderID);

            var columnFreight = new sap.m.Column();
            var labelFreight = new sap.m.Label();
            labelFreight.bindProperty("text", "i18n>freight");
            columnFreight.setHeader(labelFreight);
            newTableJSON.addColumn(columnFreight);

            var columnShipAddress = new sap.m.Column();
            var labelShipAddress = new sap.m.Label();
            labelShipAddress.bindProperty("text", "i18n>shipAddress");
            columnShipAddress.setHeader(labelShipAddress);
            newTableJSON.addColumn(columnShipAddress);

            var columnListItem = new sap.m.ColumnListItem();
            var cellOrderID = new sap.m.Label();
            cellOrderID.bindProperty("text", "jsonEmployees>OrderID");
            columnListItem.addCell(cellOrderID);

            var cellFreight = new sap.m.Label();
            cellFreight.bindProperty("text", "jsonEmployees>Freight");
            columnListItem.addCell(cellFreight);

            var cellShipAddress = new sap.m.Label();
            cellShipAddress.bindProperty("text", "jsonEmployees>ShipAddress");
            columnListItem.addCell(cellShipAddress);

            //set path to reach data
            var oBindingInfo = {
                model : "jsonEmployees",
                path : "Orders",
                template : columnListItem
            };

            //get element from model
            newTableJSON.bindAggregation("items", oBindingInfo);
            newTableJSON.bindElement("jsonEmployees>" + oContext.getPath());

            ordersTable.addItem(newTableJSON);
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
