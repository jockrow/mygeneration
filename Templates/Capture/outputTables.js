function setup() {
	ui.Title = "Generate Multiple Templates";
	ui.Width = 350;
	ui.Height = 430;

	// Grab default output path
	var sOutputPath = "";
	if (input.Contains("defaultOutputPath"))  {
		sOutputPath = input.Item("defaultOutputPath");
	}

	// Display and errors here
	var lblError = ui.AddLabel("lblError", "", "");
	lblError.ForeColor = "Red";

	// Setup Folder selection input control.
	var lblPath = ui.AddLabel("lblPath", "Select the output path:", "Select the output path in the field below.");
	var outpath = ui.AddTextBox("txtPath", sOutputPath, "Select the Output Path.");
	var btnSelectPath = ui.AddFilePicker("btnPath", "Select Path", "Select the Output Path.", "txtPath", true);

	// Setup Database selection combobox.
	var label_d = ui.AddLabel("lblDatabases", "Select a database:", "Select a database in the dropdown below.");
	var cmbDatabases = ui.AddComboBox("cmbDatabase", "Select a database.");

	// Setup Tables selection multi-select listbox.
	var label_t = ui.AddLabel("lblTables", "Select tables:", "Select tables from the listbox below.");
	var lstTables = ui.AddListBox("lstTables", "Select tables.");
	//var lstTables = ui.AddListControl("lstTables", "Select tables.");
	lstTables.Height = 150;

	// Attach the onchange event to the cmbDatabases control.
	setupDatabaseDropdown(cmbDatabases, lblError);
	cmbDatabases.AttachEvent("onblur", "cmbDatabases_onblur");
	//lblError.AttachEvent("onchange", "lblError_onchange");
		
	ui.ShowGUI = true;
}

function setupDatabaseDropdown(cmbDatabases, lblError) {
	try  {	
		if (MyMeta.IsConnected)  {
			cmbDatabases.BindData(MyMeta.Databases);
			if (MyMeta.DefaultDatabase != null)  {
				cmbDatabases.SelectedValue = MyMeta.DefaultDatabase.Name;
				bindTables(cmbDatabases.SelectedValue);
			}

			lblError.Text = "";
		}
		else {
			lblError.Text = "Please set up your database connection in the Default Settings dialog.";
		}
	}
	catch (error)  {
		lblError.Text = "" + error + ", " + error.number + ", " + error.description;
	}
}

function bindTables(sDatabase) {
	var lblError = ui.item("lblError");
	var count = 0

	var lstTables = ui.item("lstTables");
	
	try  {	
		var db = MyMeta.Databases.Item(sDatabase);
		
		if(sDatabase == "SICA"){
			////MyGenerationMDI p = mdi as MyGenerationMDI;
			//var p = MyGenerationMDI;
			////this.MetaData = p.MetaPropertiesDockContent;
			//this.UserData = p.UserMetaDataDockContent;
			////this.GlobalUserData = p.GlobalUserMetaDataDockContent;
			////this.UserData;
			//this.UserData.MetaBrowserRefresh();
			
			//var myGen = MyGeneration;
			var meta = MyMeta;
			//lblError.Text = meta;
			
			var props = MyMeta.Databases.Item(sDatabase).Properties;
			//lblError.Text = "...numTables:" + props.Item("numTables") + ", props.count:" + props.count; //DEBUG
			
			if(props.Item("numTables") == "0" || props.Item("numTables") == null){
				var numVisibleTables = 0;
				var arrProps = new Array();
				
				//Remove all tables in userMetaData for refresh completly
				props.Reset();
				while(props.MoveNext()){
					var prop = props.Current;
					arrProps.push(prop.Key);
				}
				for (i=0; i<arrProps.length; i++) {
					if(arrProps[i].match(/^SC_.*$/) || arrProps[i] == "numTables"){
						props.RemoveKey(arrProps[i]);
					}
				}
				
				for (i=0; i < db.Tables.count; i++) {
					if((db.Tables.Item(i)+"").match(/^SC_.*$/)){
						if(!(db.Tables.Item(i)+"").match(/^.*(TMP|SC_HIS_|OLD|PIC|AIC|__|EXT|BACK|BCK|[0-9]+).*$/)){
							numVisibleTables++;
							lstTables.Add(db.Tables.Item(i), db.Tables.Item(i));
							props.AddKeyValue(db.Tables.Item(i), "0");
							if(props.Item(db.Tables.Item(i)) == "1"){
								lstTables.Select(db.Tables.Item(i));
							}
						}
					}
					else if((db.Tables.Item(i)+"").match(/^SD_.*$/)){
						break;
					}
				}
				props.AddKeyValue("numTables", numVisibleTables);
				MyMeta.SaveUserMetaData();
			}
			// use UserMetaData like index for doesn't load slowly the list tables
			else{
				props.Reset();
				while(props.MoveNext()){
					var prop = props.Current;
					
					if(prop.key.match(/^SC_.*$/)){
						lstTables.Add(prop.Key, prop.Key);
						if(prop.Value == "1"){
							lstTables.Select(prop.key);
						}
					}
				}
			}
		}
		else{
			lstTables.BindData(db.Tables);
		}

		//Dispose();
		lblError.Text = ""; //TODO:DESCOMENTAREAR
	}
	catch (error)  {
		lblError.Text += "" + error + ", " + error.number + ", " + error.description;
		lblError.ToolTip = lblError.Text;
	}
}

function cmbDatabases_onblur(control) {
	var lblError = ui.item("lblError");
	var count = 0

	var cmbDatabases = ui.item("cmbDatabase");

	bindTables(cmbDatabases.SelectedText);
}

//function lblError_onchange(){
//	lblError.ToolTip = lblError.Text;
//}