//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "logaligroup/Employees/model/formatter"
],

    function (Controller, formatter) {
        function onInit() {
        };

        function onCreateIncidence() {
            var tableIncidence = this.getView().byId("tableIncidence");
            //add fragment to current instance
            var newIncidence = sap.ui.xmlfragment("logaligroup.Employees.fragment.NewIncidence", this);
            var incidenceModel = this.getView().getModel("incidenceModel");

            //declare odata service where data will be saved
            var oData = incidenceModel.getData();
            var index = oData.length;
            oData.push({ index: index + 1 });

            //refresh model
            incidenceModel.refresh();

            //add data to the model
            newIncidence.bindElement("incidenceModel>/" + index);
            tableIncidence.addContent(newIncidence);
        };

        function onDeleteIncidence(oEvent) {
            //identify incidences table
            var tableIncidence = this.getView().byId("tableIncidence");
            //get selected row
            var rowIncidence = oEvent.getSource().getParent().getParent();
            var incidenceModel = this.getView().getModel("incidenceModel");
            var oData = incidenceModel.getData();
            //get model context
            var contextObject = rowIncidence.getBindingContext("incidenceModel").getObject();

            //delete selected incidence: from_index, number_of_elements
            oData.splice(contextObject.index-1, 1);
            for (var i in oData) {
                oData[i].index = parseInt(i) + 1;
            };

            //update model content
            incidenceModel.refresh();
            tableIncidence.removeContent(rowIncidence);

            //remove content from incidence table
            for (var j in tableIncidence.getContent()) {
                tableIncidence.getContent()[j].bindElement("incidenceModel>/"+j);
            }
        };

        //binding for incidenceModel
        var Main = Controller.extend("logaligroup.Employees.controller.EmployeeDetails", []);
        Main.prototype.onInit = onInit;
        Main.prototype.onCreateIncidence = onCreateIncidence;
        Main.prototype.onDeleteIncidence = onDeleteIncidence;
        Main.prototype.Formatter = formatter;
        return Main;

    });