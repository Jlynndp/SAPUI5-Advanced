//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],

    function (Controller) {
        return Controller.extend("logaligroup.Employees.controller.Main", {

            onInit: function () {
                var oJSONModel = new sap.ui.model.json.JSONModel();

                //json model for countries
                var oView = this.getView();

                //load model from file
                //@ts-ignore
                var oJSONModelEmployees = new sap.ui.model.json.JSONModel();
                oJSONModelEmployees.loadData("./localService/mockdata/Employees.json", false);
                oView.setModel(oJSONModelEmployees, "jsonEmployees");

                var oJSONModelCountries = new sap.ui.model.json.JSONModel();
                oJSONModelCountries.loadData("./localService/mockdata/Countries.json", false);
                oView.setModel(oJSONModelCountries, "jsonCountries");

                var oJSONModelLayouts = new sap.ui.model.json.JSONModel();
                oJSONModelLayouts.loadData("./localService/mockdata/Layouts.json", false);
                oView.setModel(oJSONModelLayouts, "jsonLayouts");

                //config columns properties
                var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                    visibleId: true,
                    visibleName: true,
                    visibleCountry: true,
                    visibleCity: false,
                    visibleBtnShowCity: true,
                    visibleBtnHideCity: false,
                });
                oView.setModel(oJSONModelConfig, "jsonModelConfig");

                this._bus = sap.ui.getCore().getEventBus();
                //category, event_name, event_function, instance
                this._bus.subscribe("flexible", "showEmployee", this.showEmployeeDetails, this);

            },

            showEmployeeDetails: function (category, nameEvent, path) {
                var detailView = this.getView().byId("detailEmployeeView");
                detailView.bindElement("jsonEmployees>" + path);
                //set layout to show detail panel
                this.getView().getModel("jsonLayouts").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

                //bind Incidences controller
                var oJSONModelIncidence = new sap.ui.model.json.JSONModel([]);
                detailView.setModel(oJSONModelIncidence, "incidenceModel");

                //reset incidence model for new execution
                detailView.byId("tableIncidence").removeAllContent();
            }
        });
    });