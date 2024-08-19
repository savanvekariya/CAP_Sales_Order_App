sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
],
    function (Controller, MessageBox, Fragment) {
        "use strict";

        return Controller.extend("project1.controller.Home", {
            onInit: async function () {
                await this._onReadData()
                let oData = {
                    SalesOrder: {
                        Number: "",
                        CustomerName: "",
                        CustomerNumber: "",
                        TotalSales: ""
                    }
                };
                let oModel = new sap.ui.model.json.JSONModel(oData);
                this.getView().setModel(oModel, "formData");
            },
            _onReadData: function (oEvent) {
                let oModel = this.getOwnerComponent().getModel('mainModel');
                let oJSONModel = new sap.ui.model.json.JSONModel();
                let oBusyDialog = new sap.m.BusyDialog();
                oBusyDialog.open();
                oModel.read('/SalesOrder', {
                    success: (res) => {
                        oJSONModel.setProperty("/SalesData", res.results)
                        this.getView().setModel(oJSONModel, "oSalesJSONModel")
                        oBusyDialog.close()
                    },
                    error: (oError) => {
                        console.error(oError)
                        oBusyDialog.close()
                    }
                })
            },
            onDelete: function (oEvent) {
                let oContext = oEvent.getSource().getBindingContext('mainModel').getObject()
                MessageBox.confirm("Are you sure want to delete this recors?", {
                    title: "Confirm",
                    onClose: (sAction) => {
                        if (sAction == "OK") {
                            this._onDeleteSpecificRecord(oContext)
                        }
                    },
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.OK
                })
            },
            _onDeleteSpecificRecord: function (oRecord) {
                let oModel = this.getOwnerComponent().getModel('mainModel');
                let oBusyDialog = new sap.m.BusyDialog()
                oBusyDialog.open()
                oModel.remove(`/SalesOrder(soNumber=${oRecord.soNumber})`, {
                    success: (res) => {
                        console.warn(res)
                        oBusyDialog.close()
                        this._onReadData()
                    },
                    error: (oError) => {
                        console.warn(oError)
                        oBusyDialog.close()
                    }
                })
            },

            onCreate: async function (oEvent) {
                if (!this.createRecordDialog) {
                    this.createRecordDialog = await Fragment.load({
                        id: this.getView().getId(),
                        name: "project1.fragments.CreateDialog",
                        controller: this
                    })
                    this.getView().addDependent(this.createRecordDialog);
                }
                this.createRecordDialog.open()
            },

            onCloseCreateDialog: function (oEvent) {
                this.createRecordDialog.close()
            },

            onSaveCreateDialog: function (oEvent) {
                let viewModel = this.getView().getModel("formData");
                let oData = viewModel.getProperty("/SalesOrder");

                let oModel = this.getOwnerComponent().getModel('mainModel');

                let oRecord = {
                    "soNumber": oData.Number,
                    "customerName": oData.CustomerName,
                    "customerNumber": oData.CustomerNumber,
                    "totalOrderItems": oData.TotalSales,
                }

                let oBusyDialog = new sap.m.BusyDialog();
                oBusyDialog.open();

                oModel.create("/SalesOrder", oRecord, {
                    success: (res) => {
                        oBusyDialog.close();
                        console.log(res)
                    },
                    error: (err) => {
                        oBusyDialog.close();
                        console.log(err)
                    }
                })

                this.createRecordDialog.close()

            }
        });
    });
