//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "logaligroup/Employees/model/formatter",
    "sap/m/MessageBox",
],

    function (Controller, formatter, MessageBox) {
        function onInit() {
            //load bus event
            this._bus = sap.ui.getCore().getEventBus();
        };

        function onCreateIncidence() {
            var tableIncidence = this.getView().byId("tableIncidence");
            //add fragment to current instance
            var newIncidence = sap.ui.xmlfragment("logaligroup.Employees.fragment.NewIncidence", this);
            var incidenceModel = this.getView().getModel("incidenceModel");

            //declare odata service where data will be saved
            var oData = incidenceModel.getData();
            var index = oData.length;
            // "_" external property (no-sap)
            oData.push({
                index: index + 1,
                _ValidDate: false,
                EnabledSave: false
            });

            //refresh model
            incidenceModel.refresh();

            //add data to the model
            newIncidence.bindElement("incidenceModel>/" + index);
            tableIncidence.addContent(newIncidence);
        };

        function onDeleteIncidence(oEvent) {
            //get context object
            var contextObject = oEvent.getSource().getBindingContext("incidenceModel").getObject();

            MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmDeleteIncidence"), {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        //publish service that will be managed by Main
                        this._bus.publish("incidence", "onDeleteIncidence", {
                            IncidenceId: contextObject.IncidenceId,
                            SapId: contextObject.SapId,
                            EmployeeId: contextObject.EmployeeId
                        });
                    }
                }.bind(this)
            });

            // //identify incidence table
            // var tableIncidence = this.getView().byId("tableIncidence");
            // //get selected row
            // var rowIncidence = oEvent.getSource().getParent().getParent();
            // var incidenceModel = this.getView().getModel("incidenceModel");
            // var oData = incidenceModel.getData();
            // //get model context
            // var contextObject = rowIncidence.getBindingContext("incidenceModel").getObject();

            // //delete selected incidence: from_index, number_of_elements
            // oData.splice(contextObject.index - 1, 1);
            // for (var i in oData) {
            //     oData[i].index = parseInt(i) + 1;
            // };

            // //update model content
            // incidenceModel.refresh();
            // tableIncidence.removeContent(rowIncidence);

            // //remove content from incidence table
            // for (var j in tableIncidence.getContent()) {
            //     tableIncidence.getContent()[j].bindElement("incidenceModel>/" + j);
            // }
        };

        function onSaveIncidence(oEvent) {
            //get incidence row
            var incidence = oEvent.getSource().getParent().getParent();
            //get context
            var incidenceRow = incidence.getBindingContext("incidenceModel");
            //publish incidence event for subscription
            this._bus.publish("incidence", "onSaveIncidence", { incidenceRow: incidenceRow.sPath.replace('/', '') });
        };

        function updateIncidenceCreationDate(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObject = context.getObject();

            //get resource bundle to read i18n texts: view/i18n_model/resource
            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            if (!oEvent.getSource().isValidValue()) {
                contextObject._ValidDate = false;
                contextObject.CreationDateState = "Error";

                //show error message with object properties
                MessageBox.error(oResourceBundle.getText("errorCreationDateValue"), {
                    title: "Error",
                    onClose: null,
                    styleClass: "",
                    actions: MessageBox.Action.CLOSE,
                    emphasizedAction: null,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });

            } else {
                contextObject.CreationDateX = true;
                contextObject._ValidDate = true;
                contextObject.CreationDateState = "None";
            };

            //enable save button: check date_value and reason_value
            if (oEvent.getSource().isValidValue() && contextObject.Reason) {
                contextObject.EnabledSave = true;
            } else {
                contextObject.EnabledSave = false;
            };

            context.getModel().refresh();
        };

        function updateIncidenceReason(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObject = context.getObject();

            if (oEvent.getSource().getValue()) {
                contextObject.ReasonX = true;
                contextObject.CreationReasonState = "None";
            } else {
                contextObject.CreationReasonState = "Error";
            };

            //enable save button: check date_value and reason_value
            if (contextObject._ValidDate && oEvent.getSource().getValue()) {
                contextObject.EnabledSave = true;
            } else {
                contextObject.EnabledSave = false;
            };
            context.getModel().refresh();
        };

        function updateIncidenceType(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObject = context.getObject();
            //enable save button: check date_value and reason_value
            if (contextObject._ValidDate && contextObject.Reason) {
                contextObject.EnabledSave = true;
            } else {
                contextObject.EnabledSave = false;
            };
            contextObject.TypeX = true;
            context.getModel().refresh();
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

        //binding for incidenceModel
        var Main = Controller.extend("logaligroup.Employees.controller.EmployeeDetails", []);
        Main.prototype.onInit = onInit;
        Main.prototype.onCreateIncidence = onCreateIncidence;
        Main.prototype.onDeleteIncidence = onDeleteIncidence;
        Main.prototype.Formatter = formatter;
        Main.prototype.onSaveIncidence = onSaveIncidence;
        Main.prototype.updateIncidenceCreationDate = updateIncidenceCreationDate;
        Main.prototype.updateIncidenceReason = updateIncidenceReason;
        Main.prototype.updateIncidenceType = updateIncidenceType;
        Main.prototype.toOrderDetails = toOrderDetails;

        return Main;

    });