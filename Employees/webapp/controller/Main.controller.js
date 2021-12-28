//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],

    function (Controller) {
        return Controller.extend("logaligroup.Employees.controller.Main", {

            onBeforeRendering: function () {
                //keep detail employee in the incidence view 
                this._detailEmployeeView = this.getView().byId("detailEmployeeView");
            },

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

                //subscribe save incidence event
                this._bus.subscribe("incidence", "onSaveIncidence", this.onSaveDataIncidence, this);

            },

            showEmployeeDetails: function (category, nameEvent, path) {
                var detailView = this.getView().byId("detailEmployeeView");
                detailView.bindElement("odataNorthwind>" + path);
                //set layout to show detail panel
                this.getView().getModel("jsonLayouts").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

                //bind Incidences controller
                var oJSONModelIncidence = new sap.ui.model.json.JSONModel([]);
                detailView.setModel(oJSONModelIncidence, "incidenceModel");

                //reset incidence model for new execution
                detailView.byId("tableIncidence").removeAllContent();

                this.onReadDataIncidence(this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID);
            },

            //channel, event (subscribed), event_data
            onSaveDataIncidence: function (channelId, eventId, data) {
                var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                //get ID for selected employee: model/object/property
                var employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID;
                //get employee incidences
                var incidenceModel = this._detailEmployeeView.getModel("incidenceModel").getData();

                if (typeof incidenceModel[data.incidenceRow].IncidenceId == 'undefined') {
                    //get selected incidence and build operation body
                    var body = {
                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: employeeId.toString(),
                        CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                        Type: incidenceModel[data.incidenceRow].Type,
                        Reason: incidenceModel[data.incidenceRow].Reason
                    };

                    //save new incidence: get view/model/create_operation
                    this.getView().getModel("incidenceModel").create("/IncidentsSet", body, {
                        success: function () {
                            this.onReadDataIncidence.bind(this)(employeeId);
                            sap.m.MessageToast.show(oResourceBundle.getText("oDataSaveOK"));
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(oResourceBundle.getText("oDataSaveKO"));
                        }.bind(this)
                    })
                } 
                
                else if (incidenceModel[data.incidenceRow].CreationDateX ||
                           incidenceModel[data.incidenceRow].ReasonX ||
                           incidenceModel[data.incidenceRow].TypeX) {
                    var body = {
                        //SapId: this.getOwnerComponent().SapId,
                        //EmployeeId: employeeId.toString(),
                        CreationDate: incidenceModel[data.incidenceRow].CreationDate,
                        CreationDateX: incidenceModel[data.incidenceRow].CreationDateX,
                        Type: incidenceModel[data.incidenceRow].Type,
                        TypeX: incidenceModel[data.incidenceRow].TypeX,
                        Reason: incidenceModel[data.incidenceRow].Reason,
                        ReasonX: incidenceModel[data.incidenceRow].ReasonX
                    };
                    //call odata update service. Key: IncidenceId='xxx',SapId='xxx',EmployeeId='xxx')",
                    this.getView().getModel("incidenceModel").update("/IncidentsSet(IncidenceId='" + incidenceModel[data.incidenceRow].IncidenceId +
                                                                     "',SapId='" + incidenceModel[data.incidenceRow].SapId +
                                                                     "',EmployeeId='" + incidenceModel[data.incidenceRow].EmployeeId + "')", body, {
                        success: function () {
                            this.onReadDataIncidence.bind(this)(employeeId);
                            sap.m.MessageToast.show(oResourceBundle.getText("oDataUpdateOK"));
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(oResourceBundle.getText("oDataUpdateKO"));
                        }.bind(this)
                    });
                }

                else {
                    sap.m.MessageToast.show(oResourceBundle.getText("oDataNoChanges"));
                };
            },

            onReadDataIncidence: function (employeeID) {
                //get view/model/read_operation
                this.getView().getModel("incidenceModel").read("/IncidentsSet", {
                    filters: [
                        new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                        new sap.ui.model.Filter("EmployeeId", "EQ", employeeID.toString())
                    ],
                    success: function (data) {
                        //get incidence model
                        var incidenceModel = this._detailEmployeeView.getModel("incidenceModel");
                        incidenceModel.setData(data.results);

                        //get table incidence from current view
                        var tableIncidence = this._detailEmployeeView.byId("tableIncidence");
                        tableIncidence.removeAllContent();

                        //add incidences to incidence model
                        for (var incidence in data.results) {
                            var newIncidence = sap.ui.xmlfragment("logaligroup.Employees.fragment.NewIncidence", this._detailEmployeeView.getController());
                            this._detailEmployeeView.addDependent(newIncidence);
                            newIncidence.bindElement("incidenceModel>/" + incidence);
                            tableIncidence.addContent(newIncidence);
                        }

                    }.bind(this),
                    error: function (e) {
                    }.bind(this)
                });
            }
        });
    });