sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Input",
	"sap/ndc/BarcodeScanner",
	"sap/ndc/BarcodeScannerButton",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/Device"

], function(Controller, MessageBox, HorizontalLayout, VerticalLayout, Dialog, Button, Label, Text, Input, BarcodeScanner,
	BarcodeScannerButton, Fragment, MessageToast, Filter, JSONModel, Sorter, Device) {
	"use strict";
	// var prefixId;
	// var oScanResultText;

	return Controller.extend("ZPOROINWARD.controller.STOInvoiceOutward", {
		onInit: function() {
			this.poOrderNumber = "";
			// prefixId = this.createId();
			// if (prefixId) {
			// 	prefixId = prefixId.split("--")[0] + "--";
			// } else {
			// 	prefixId = "";
			// }
			// oScanResultText = sap.ui.getCore().byId(prefixId + 'sampleBarcodeScannerResult
			// if (sap.ushell.Container && sap.ushell.Container.getService("UserInfo") && sap.ushell.Container.getService("UserInfo").getUser().getId() !==
			// 	"ABIYANTA1") {
			// 	if (Device) {
			// 		if (Device.system.tablet || Device.system.phone) {
			// 			this.getView().byId("invoiceDtl").setVisible(false);
			// 		} else {
			// 			this.getView().byId("tabScannedSerial").setVisible(false);
			// 			this.getView().byId("tabBarcode").setVisible(false);
			// 		}
			// 	}
			// } else {
			// 	if (Device) {
			// 		if (Device.system.tablet || Device.system.phone) {
			// 			this.getView().byId("invoiceDtl").setVisible(false);
			// 		}
			// 	}
			// }
			var oUserModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oUserModel, "UserModel");

			var oModel = this.getOwnerComponent().getModel();
			oModel.read("/UserIdSet", {
				success: jQuery.proxy(function(odata) {
					this.getView().getModel("UserModel").setData(odata.results);
					var Userid = this.getView().getModel("UserModel").getData()[0].Userid;
					if (Device) {
						if (Userid && Userid !== "NODATA") {
							this.getView().byId("invoiceDtl").setVisible(true);
							this.getView().byId("tabScannedSerial").setVisible(true);
							this.getView().byId("tabBarcode").setVisible(true);
						} else {
							if (Device.system.tablet || Device.system.phone) {
								this.getView().byId("invoiceDtl").setVisible(false);
							} else {
								this.getView().byId("tabScannedSerial").setVisible(false);
								this.getView().byId("tabBarcode").setVisible(false);
							}
						}
					}
				}, this),
				error: jQuery.proxy(function(oError) {}, this)
			});

			var mModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(mModel, "mModel");

			var data = [];
			var localModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(localModel, "localModel");
			this.getView().getModel("localModel").setData(data);

			var InvdtlModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(InvdtlModel, "lnvModel");

			var InvPOModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(InvPOModel, "lnvPOModel");

			var SerialModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(SerialModel, "serialModel");

		},
		// OnInvnoChange: function() {
		// 	this.onGoPress();
		// },
		onRefreshPress: function() {
			// this.getView().getModel("lnvModel").setData([]);
			// this.getView().byId("idprodord").setValue();
			window.location.reload(true);
		},
		onGoPress: function(evt) {
			var that = this;
			var prodord = this.getView().byId("idprodord").getValue();
			if (prodord === "") {
				sap.m.MessageBox.warning("Please enter PO Number");
				this.getView().byId("idInvoiceTable").setVisible(false);
				this.getView().byId("invoiceForm").setVisible(false);

			} else {
				this.poOrderNumber = prodord;
				var ofilters = new sap.ui.model.Filter("EkkoEbeln", sap.ui.model.FilterOperator.EQ, prodord);

				var oModel = this.getView().getModel();
				oModel.read("/VendorPoSet", {
					filters: [ofilters],
					success: jQuery.proxy(function(mOdata, response) {

						if (mOdata.results.length === 0) {
							sap.m.MessageBox.error("Data is not available");
						} else {
							this.getView().getModel("lnvPOModel").setData({
								"PODetails": mOdata.results
							});
							sap.m.MessageToast.show("success");
						}
						that.getView().byId("idInvoiceTable").setVisible(true);
						that.getView().byId("invoiceForm").setVisible(true);
						that.refreshInvoiceTable();

					}, this),
					error: jQuery.proxy(function(oError) {
						try {
							var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
							sap.m.MessageBox.error(msg, {
								title: "Error",
								id: "messagexxxddBoxId1",
								details: oError

							});
						} catch (e) {
							sap.m.MessageBox.error("Error message", {
								title: "Error",
								id: "messageddBoxId1",
								details: oError

							});
						}

					}, this)
				});
			}
		},
		refreshInvoiceTable: function() {
			this.getView().byId("vendorInvcNum").setValue("");
			this.getView().byId("trnsprtName").setValue("");
			this.getView().byId("lrNumber").setValue("");
			this.getView().byId("invDate").setValue("");
		},
		onDeletePress: function(oEvent) {
			// var table = this.getView().byId("idProductsTable1");
			var that = this;
			var selectedItems = oEvent;
			// var len = selectedItems.length;
			var serialNo = selectedItems.getParameters().listItem.getCells()[0].getText();
			var material = selectedItems.getParameters().listItem.getCells()[1].getText();
			var invNo = "XXX";

			// if (len === 0) {
			// 	sap.m.MessageBox.error("Select line item for Delete");
			// } else {
			MessageBox.confirm("Are you sure you want to delete items?", {
				icon: sap.m.MessageBox.Icon.SUCCESS,
				title: "Confirmation",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function(oAction) {
					if (oAction === "YES") {
						// selectedItems.forEach(function(item) {

						var oModel = that.getView().getModel();
						oModel.remove("/StoInvSernrSet(Vbeln='" + invNo + "',Sernr='" + serialNo + "',Matnr='" + material + "')", {
							method: "DELETE",
							success: function(oEvt) {

								var mModelData = that.getView().getModel("localModel").getData();
								var newData = mModelData.filter(function(record) {
									return record.Sernr !== serialNo;
								});
								that.getView().getModel("localModel").setData(newData);
								// table.removeSelections();

								// selectedItems.forEach(function(items) {
								// 	var itemId = items.getId();
								// 	table.removeItem(itemId);
								// });
								// table.removeSelections();
								// table.getBinding("items").refresh();

								var ofilters = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, that.invno);
								oModel.read("/StoInvoiceSet", {
									filters: [ofilters],
									success: jQuery.proxy(function(odata) {

										that.getView().getModel("lnvModel").setData(odata.results);
										sap.m.MessageToast.show("Deleted Successfully");

									}, this),
									error: jQuery.proxy(function(oError) {

									}, this)
								});

							},
							error: function(oError) {
								var errorMessage;
								try {
									errorMessage = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
								} catch (e) {
									errorMessage = "Error message";
								}
								sap.m.MessageBox.error(errorMessage, {
									title: "Error",
									details: oError
								});
							}
						});
						// }, this);
					}

				}
			});

			// }

		},

		onScannerBtnPress: function(oEvent) {
			if (!this.BarcodeScanner) {
				this.BarcodeScanner = sap.ui.xmlfragment("ZPOROINWARD.view.Scanner", this);
				this.getView().addDependent(this.BarcodeScanner);
			}
			this.BarcodeScanner.open();

		}, //end of onPress1

		OnPressCancel: function() {
			if (this.BarcodeScanner) {
				this.BarcodeScanner.destroy();
				this.BarcodeScanner = null;
			}
		},
		OnChangeSrlno: function(oEvent) {
			if (oEvent.getParameter("cancelled")) {
				MessageToast.show("Scan cancelled", {
					duration: 1000
				});
			} else {
				if (oEvent.getParameter("value")) {
					// oScanResultText.setText(oEvent.getParameter("text"));
					var serialno = oEvent.getParameter("value");
					var oEntry = {
						"Sernr": serialno
					};

					var oModel = this.getView().getModel();
					oModel.create("/StoInvSernrSet", oEntry, {
						success: jQuery.proxy(function(mOdata, response) {
							sap.ui.getCore().byId("InpSrialno").setValue();
							var data = this.getView().getModel("localModel").getData();
							data.push(mOdata);
							this.getView().getModel("localModel").setData(data);
							this.getView().getModel("mModel").setData(mOdata);
							sap.m.MessageToast.show("success");

						}, this),
						error: jQuery.proxy(function(oError) {
							sap.ui.getCore().byId("InpSrialno").setValue();
							try {
								var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
								sap.m.MessageBox.error(msg, {
									title: "Error",
									id: "messagexxxddBoxId1",
									details: oError

								});
							} catch (e) {
								sap.m.MessageBox.error("Error message", {
									title: "Error",
									id: "messageddBoxId1",
									details: oError

								});
							}

						}, this)
					});

				} else {
					// oScanResultText.setText('');
				}
			}
		},
		getSerialNo: function(oEvt) {
			var oModel = this.getView().getModel();
			var oFilters = [];
			var timeZoneOff = this.setLocalTimeZoneZone(this.invoiceDate);
			var formatDate = this.dateFormat(timeZoneOff);
			var srModel = new sap.ui.model.json.JSONModel();
			oFilters.push(new Filter({
				filters: [
					new Filter("Ebeln", sap.ui.model.FilterOperator.EQ, this.poOrderNumber),
					new Filter("VendInv", sap.ui.model.FilterOperator.EQ, this.vendorInvoiceNumber),
					new Filter("Lrno", sap.ui.model.FilterOperator.EQ, this.lrNumber),
					new Filter("Trname", sap.ui.model.FilterOperator.EQ, this.transporterName),
					new Filter("Invdt", sap.ui.model.FilterOperator.EQ, formatDate)

				],
				and: true
			}));
			oModel.read("/VenPoInvSernrSet", {
				filters: [oFilters],
				success: jQuery.proxy(function(Odata, response) {
					var oTable = this.getView().byId("myCCDialog");
					if (Odata.results.length === 0) {
						sap.m.MessageBox.error("Data is not available");

					} else {
						sap.m.MessageToast.show("success");
						srModel.setData(Odata.results);
						this.getView().setModel(srModel, "oModel");
						// oTable.setModel(new JSONModel(Odata.results), "oModel");
					}

					if (!this.ROInward) {
						this.ROInward = Fragment.load({
							id: this.getView().getId(),
							name: "ZPOROINWARD.view.ROInward",
							controller: this
						}).then(function(oDialog) {
							this.getView().addDependent(oDialog);
							return oDialog;
						}.bind(this));
					}
					this.ROInward.then(function(oDialog) {

						oDialog.open();
					}.bind(this));
					/* Sorting Logic */
					// Get the binding for the items
					var oBinding = oTable.getBinding("items");

					// // Define your sorter
					// var oSorter = new Sorter("Status", false); // Status is the path to the property you want to sort by

					// // Add the sorter to the binding
					// oBinding.sort(oSorter);

					this.ROInward.then(function(oDialog) {
						oDialog.open();
					});
				}, this),
				error: jQuery.proxy(function(oError) {
					try {
						var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
						sap.m.MessageBox.error(msg, {
							title: "Error",
							id: "messagexxxddBoxId1",
							details: oError

						});
					} catch (e) {
						sap.m.MessageBox.error("Error message", {
							title: "Error",
							id: "messageddBoxId1",
							details: oError

						});
					}

				}, this)
			});

		}, //end of onPress1

		OnPressCancelRO: function() {
			// if (this.ROInward) {
			// 	this.ROInward.destroy();
			// 	this.ROInward = null;
			// }
			this.getView().byId("ROInward").close();
		},
		onGRNPress: function() {
			var oModel = this.getView().getModel();
			var oEntry = {
				"Ebeln": this.poOrderNumber
			};
			MessageBox.confirm("Are you sure you want to POST GRN?", {
				icon: sap.m.MessageBox.Icon.SUCCESS,
				title: "Confirmation",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function(oAction) {
					if (oAction === "YES") {
						oModel.create("/VenPoInvGrnSet", oEntry, {
							success: jQuery.proxy(function(mOdata, response) {
								sap.m.MessageToast.show(mOdata.Msg);
							}, this),
							error: jQuery.proxy(function(oError) {
								try {
									var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
									sap.m.MessageBox.error(msg, {
										title: "Error",
										id: "messagexxxddBoxId1",
										details: oError

									});
								} catch (e) {
									sap.m.MessageBox.error("Error message", {
										title: "Error",
										id: "messageddBoxId1",
										details: oError

									});
								}

							}, this)
						});
					}
				}
			});

		},
		onReadyPress: function() {
			var oModel = this.getView().getModel();
			var oEntry = {
				"EkkoEbeln": this.poOrderNumber
			};
			oModel.create("/StoInvoiceSet", oEntry, {
				success: jQuery.proxy(function(mOdata, response) {

					// var data = this.getView().getModel("localModel").getData();
					// data.push(mOdata);
					// this.getView().getModel("localModel").setData(data);
					// this.getView().getModel("mModel").setData(mOdata);
					sap.m.MessageToast.show("Success: Invoice Ready for Scan");

				}, this),
				error: jQuery.proxy(function(oError) {
					try {
						var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
						sap.m.MessageBox.error(msg, {
							title: "Error",
							id: "messagexxxddBoxId1",
							details: oError

						});
					} catch (e) {
						sap.m.MessageBox.error("Error message", {
							title: "Error",
							id: "messageddBoxId1",
							details: oError

						});
					}

				}, this)
			});

		},

		// onAfterRendering: function() {
		// 	var oStatusIdentifier = this.byId("statusIdentifier");
		// 	var sStatus = this.getView().getModel("oModel").getProperty("/Status");

		// 	if (sStatus === "unverified") {
		// 		oStatusIdentifier.addStyleClass("unverifiedRow");
		// 	}
		// },
		// Formatter function to determine the CSS class based on the status
		getStatusCellStyle: function(sStatus) {
			var oStatusIdentifier = this.getView().byId("statusIdentifier");
			if (sStatus === "UNVERIFIED") {
				if (oStatusIdentifier) {
					oStatusIdentifier.addStyleClass("unverifiedRow");
				}
			}

		},
		checkMandatoryField: function() {
			var bFlag = false;
			this.vendorInvoiceNumber = this.getView().byId("vendorInvcNum").getValue();
			this.transporterName = this.getView().byId("trnsprtName").getValue();
			this.lrNumber = this.getView().byId("lrNumber").getValue();
			this.invoiceDate = this.getView().byId("invDate").getDateValue();

			if (this.vendorInvoiceNumber === "") {
				this.getView().byId("vendorInvcNum").setValueState("Error");
				this.getView().byId("vendorInvcNum").setValueStateText("enter the required value");
				bFlag = true;

			} else if (this.transporterName === "") {
				this.getView().byId("trnsprtName").setValueState("Error");
				this.getView().byId("trnsprtName").setValueStateText("enter the required value");
				bFlag = true;

			} else if (this.lrNumber === "") {
				this.getView().byId("lrNumber").setValueState("Error");
				this.getView().byId("lrNumber").setValueStateText("enter the required value");
				bFlag = true;

			} else if ((this.invoiceDate === null) || (this.invoiceDate === undefined)) {
				this.getView().byId("invDate").setValueState("Error");
				this.getView().byId("invDate").setValueStateText("enter the required value");
				bFlag = true;

			} else {
				this.getView().byId("vendorInvcNum").setValueState("Success");
				this.getView().byId("vendorInvcNum").setValueStateText("");
				this.getView().byId("trnsprtName").setValueState("Success");
				this.getView().byId("trnsprtName").setValueStateText("");
				this.getView().byId("lrNumber").setValueState("Success");
				this.getView().byId("lrNumber").setValueStateText("");
				this.getView().byId("invDate").setValueState("Success");
				this.getView().byId("invDate").setValueStateText("");
				bFlag = false;
			}

			return bFlag;
		},
		onVendorInvoiceChange: function(oEvent) {

			if (this.getView().byId("vendorInvcNum").getValue().length > 0) {
				this.getView().byId("vendorInvcNum").setValueState("Success");
				this.getView().byId("vendorInvcNum").setValueStateText("");
			}
		},
		onTransportNameChange: function(oEvent) {
			if (this.getView().byId("trnsprtName").getValue().length > 0) {
				this.getView().byId("trnsprtName").setValueState("Success");
				this.getView().byId("trnsprtName").setValueStateText("");
			}
		},
		onLRNumberChange: function(oEvent) {
			if (this.getView().byId("lrNumber").getValue().length > 0) {
				this.getView().byId("lrNumber").setValueState("Success");
				this.getView().byId("lrNumber").setValueStateText("");
			}
		},
		onInvoiceDateChange: function(oEvent) {

			var invoiceDate = this.getView().byId("invDate").getDateValue();
			if ((invoiceDate !== null) || (invoiceDate !== undefined)) {
				this.getView().byId("invDate").setValueState("Success");
				this.getView().byId("invDate").setValueStateText("");
			}

		},
		onPressReadyScan: function() {
			var bFlag = this.checkMandatoryField();
			var requestPayload = {};
			var timeZoneOff = this.setLocalTimeZoneZone(this.invoiceDate);
			var formatDate = this.dateFormat(timeZoneOff);
			if (bFlag) {
				MessageBox.error("Kindly entered mandatory fields");
			} else {
				requestPayload = {
					"Ebeln": this.poOrderNumber,
					"VendInv": this.vendorInvoiceNumber,
					"Lrno": this.lrNumber,
					"Trname": this.transporterName,
					"Invdt": formatDate + "T00:00:00" // "datetime'"+ formatDate + "T00:00:00'"   //datetime'2024-02-29T00:00:00'
				};
				var oModel = this.getView().getModel();
				oModel.create("/VendorPoInvSet", requestPayload, {

					success: jQuery.proxy(function(mOdata, response) {

						console.log(mOdata);
						console.log(response);

					}, this),
					error: jQuery.proxy(function(oError) {
						try {
							var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
							sap.m.MessageBox.error(msg, {
								title: "Error",
								id: "messagexxxddBoxId1",
								details: oError

							});
						} catch (e) {
							sap.m.MessageBox.error("Error message", {
								title: "Error",
								id: "messageddBoxId1",
								details: oError

							});
						}

					}, this)
				});

			}
		},
		onPressDisplayInvoice: function() {
			var bFlag = this.checkMandatoryField();
			var aFilter = [];
			var timeZoneOff = this.setLocalTimeZoneZone(this.invoiceDate);
			var formatDate = this.dateFormat(timeZoneOff);
			if (bFlag) {
				MessageBox.error("Kindly entered mandatory fields");
			} else {
				aFilter.push(new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, this.poOrderNumber));
				aFilter.push(new sap.ui.model.Filter("VendInv", sap.ui.model.FilterOperator.EQ, this.vendorInvoiceNumber));
				aFilter.push(new sap.ui.model.Filter("Lrno", sap.ui.model.FilterOperator.EQ, this.lrNumber));
				aFilter.push(new sap.ui.model.Filter("Trname", sap.ui.model.FilterOperator.EQ, this.transporterName));
				aFilter.push(new sap.ui.model.Filter("Invdt", sap.ui.model.FilterOperator.EQ, formatDate));

				var oModel = this.getView().getModel();
				oModel.read("/VendorPoInvSet", {
					filters: aFilter,
					success: jQuery.proxy(function(mOdata, response) {

						if (mOdata.results.length === 0) {
							sap.m.MessageBox.error("Data is not available");
						} else {
							this.getView().getModel("lnvModel").setData({
								"POInvoiceDetails": mOdata.results
							});
							sap.m.MessageToast.show("success");
						}

					}, this),
					error: jQuery.proxy(function(oError) {
						try {
							var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
							sap.m.MessageBox.error(msg, {
								title: "Error",
								id: "messagexxxddBoxId1",
								details: oError

							});
						} catch (e) {
							sap.m.MessageBox.error("Error message", {
								title: "Error",
								id: "messageddBoxId1",
								details: oError

							});
						}

					}, this)
				});

			}
		},
		onPressAddInvoiceDetails: function() {
			var bFlag = this.checkMandatoryField();
			if (bFlag) {
				MessageBox.error("Kindly entered mandatory fields");
			}
		},
		setLocalTimeZoneZone: function(datevalue) {

			var dateTime = new Date(datevalue);
			if (datevalue === null) {
				return null;
			} else if (dateTime !== undefined && dateTime !== null && dateTime !== "") {
				var offSet = dateTime.getTimezoneOffset();
				var offSetVal = dateTime.getTimezoneOffset() / 60;
				var h = Math.floor(Math.abs(offSetVal));
				var m = Math.floor((Math.abs(offSetVal) * 60) % 60);
				dateTime = new Date(dateTime.setHours(h, m, 0, 0));
				return dateTime;
			} else {
				return null;
			}

		},
		dateFormat: function(date) {
			var formattedDate = "";
			if (date != null) {
				var today = new Date(date);
				var yyyy = today.getFullYear();
				var mm = today.getMonth() + 1; // month is zero-based
				var dd = today.getDate();

				if (dd < 10) dd = '0' + dd;
				if (mm < 10) mm = '0' + mm;
				formattedDate = yyyy.toString() + "-" + mm.toString() + "-" + dd.toString();
			} else {
				formattedDate = "";
			}

			return formattedDate;
		},
		OnPressGobtn: function(oEvent) {
			var serNumber = sap.ui.getCore().byId("InpSrialno").getValue();
			var oEntry = {
				"Sernr": serNumber,
				"Ebeln": this.poOrderNumber

			};

			var oModel = this.getView().getModel();
			oModel.create("/VenPoInvSernrSet", oEntry, {
				success: jQuery.proxy(function(mOdata, response) {
					sap.ui.getCore().byId("InpSrialno").setValue("");
					var data = this.getView().getModel("localModel").getData();
					data.push(mOdata);
					this.getView().getModel("localModel").setData(data);
					this.getView().getModel("mModel").setData(mOdata);
					sap.m.MessageToast.show("success");

				}, this),
				error: jQuery.proxy(function(oError) {
					sap.ui.getCore().byId("InpSrialno").setValue();
					try {
						var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
						sap.m.MessageBox.error(msg, {
							title: "Error",
							id: "messagexxxddBoxId1",
							details: oError

						});
					} catch (e) {
						sap.m.MessageBox.error("Error message", {
							title: "Error",
							id: "messageddBoxId1",
							details: oError

						});
					}

				}, this)
			});

		},
		getDelete: function(oEvent) {
			var serNumber, matNumber;
			var oEntry = {
				"Ebeln": this.poOrderNumber,
				"Sernr": serNumber,
				"Matnr": matNumber
			};
			var oModel = this.getView().getModel();
			oModel.delete("/VenPoInvSernrSet", oEntry, {
				success: jQuery.proxy(function(mOdata, response) {

					sap.m.MessageToast.show("success");

				}, this),
				error: jQuery.proxy(function(oError) {
					sap.ui.getCore().byId("InpSrialno").setValue();
					try {
						var msg = JSON.parse(oError.responseText).error.innererror.errordetails[0].message;
						sap.m.MessageBox.error(msg, {
							title: "Error",
							id: "messagexxxddBoxId1",
							details: oError

						});
					} catch (e) {
						sap.m.MessageBox.error("Error message", {
							title: "Error",
							id: "messageddBoxId1",
							details: oError

						});
					}

				}, this)
			});

		}

	});
});