//@ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],

    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller 
     * @param {typeof sap.ui.core.routing.History} History 
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
    function (Controller, History, MessageBox, Filter, FilterOperator) {
        function _onObjectMatched(oEvent) {
            //clear signature box
            this.onClearSignature();

            //path = datasource url: /Northwind.svc/Orders(10248) // get model from manifest.json
            this.getView().bindElement({
                path: "/Orders(" + oEvent.getParameter("arguments").OrderId + ")",
                model: "odataNorthwind",
                events: {
                    dataReceived: function (oData) {
                        _readSignature.bind(this)(oData.getParameter("data").OrderID, oData.getParameter("data").EmployeeID);
                    }.bind(this)
                }
            });

            //get signature from odata service
            const objectContext = this.getView().getModel("odataNorthwind").getContext("/Orders(" + oEvent.getParameter("arguments").OrderId + ")").getObject();

            if (objectContext) {
                _readSignature.bind(this)(objectContext.OrderID, objectContext.EmployeeID);
            }
        };

        function _readSignature(orderId, employeeId) {
            //read signature image
            this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='" + orderId +
                                                           "',SapId='" + this.getOwnerComponent().SapId +
                                                           "',EmployeeId='" + employeeId + "')", {
                success: function (data) {
                    const signature = this.byId("signature");
                    if (data.MediaContent !== "") {
                        signature.setSignature("data:image/png;base64," + data.MediaContent);
                    }
                }.bind(this),
                error: function (data) {
                }
            });

            //bind files
            this.byId("fileUpload").bindAggregation("items", {
                path: "incidenceModel>/FilesSet",
                filters: [new Filter("OrderId", FilterOperator.EQ, orderId),
                          new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
                          new Filter("EmployeeId", FilterOperator.EQ, employeeId)
                ],
                template: new sap.m.UploadCollectionItem({
                    documentId: "{incidenceModel>AttId}",
                    visibleEdit: false,
                    fileName: "{incidenceModel>FileName}"
                }).attachPress(this.downloadFile)
            });
        };

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
                        content: [
                            new sap.m.Bar({
                                contentLeft: new sap.m.Label({
                                    text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})"
                                }),
                                contentMiddle: new sap.m.ObjectStatus({
                                    text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: "Error"
                                }),
                                contentRight: new sap.m.Label({
                                    text: "{parts: [ {path: 'odataNorthwind>UnitPrice'}, {path: 'odataNorthwind>Currency'}], type: 'sap.ui.model.type.Currency'}"
                                })
                            })
                        ]
                    });
                    return customListItem;
                }
            },

            onSaveSignature: function (oEvent) {
                //get signature instance
                const signature = this.byId("signature");
                const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
                let signaturePng;

                if (!signature.isFill()) {
                    MessageBox.error(oResourceBundle.getText("fillSignature"));
                } else {
                    //delete image format, keep only image content
                    signaturePng = signature.getSignature().replace("data:image/png;base64,", "");

                    //set signature key object (OrderId, SapId, EmployeeId) from model
                    let objectOrder = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
                    let body = {
                        OrderId: objectOrder.OrderID.toString(),
                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: objectOrder.EmployeeID.toString(),
                        MimeType: "image/png",
                        MediaContent: signaturePng
                    };

                    //access to odata service
                    this.getView().getModel("incidenceModel").create("/SignatureSet", body, {
                        success: function () {
                            MessageBox.information(oResourceBundle.getText("signatureSaved"));
                        },
                        error: function () {
                            MessageBox.error(oResourceBundle.getText("signatureNotSaved"));
                        },
                    });
                };
            },

            //upload file executes Post method with slug and csrf-token parameters
            onFileBeforeUpload: function (oEvent) {
                let fileName = oEvent.getParameter("fileName");
                let objectContext = oEvent.getSource().getBindingContext("odataNorthwind").getObject();

                //slug: header parameter allow send key values for the file
                let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: objectContext.OrderID + ";" + this.getOwnerComponent().SapId + ";" + objectContext.EmployeeID + ";" + fileName
                });

                //add slug parameter to previous parameters of the media object
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
            },

            //update token every time files change
            onFileChange: function (oEvent) {
                //add csrf-token parameter
                let oUploadCollection = oEvent.getSource();
                let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                    name: "x-csrf-token",
                    value: this.getView().getModel("incidenceModel").getSecurityToken()
                });
                oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
            },

            //update collection after a new file has been uploaded
            onFileUploadComplete: function(oEvent){
                oEvent.getSource().getBinding("items").refresh();
            },


            //delete files in sap-system
            onFileDeleted: function (oEvent) {
                var oUploadCollection = oEvent.getSource();

                //route to be deleted
                var sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();
                this.getView().getModel("incidenceModel").remove(sPath, {
                    success: function () {
                        oUploadCollection.getBinding("items").refresh();
                    },
                    error: function () {
                    }
                });
            },

            //call file with /$value, using window methods
            downloadFile: function (oEvent) {
                const sPath = oEvent.getSource().getBindingContext("incidenceModel").getPath();
                window.open("/sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value");
            }

        });
    });