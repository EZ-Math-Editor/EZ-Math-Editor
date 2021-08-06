import React, { Component  }from 'react';
import '../App.css';
import { Modifier, EditorState, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import firebase from './firebase';

export default class RichTextEditor extends Component{
	constructor(props){
		super(props);

		this.state = {
			editorState : {},
			editorState : EditorState.createEmpty(),
		};
	}

	componentDidMount(){ 
		this.queryAndLoad(); //on app start, load data from database
	}


	dbToText = (data) => {
		this.onEditorStateChange(EditorState.createWithContent(ContentState.createFromText(data)));
	}


	//todo
	getPlainText = () => {
		return this.state.editorState.getCurrentContent().getPlainText();
	}
	textToDb = () => {
		// console.log("saving into database...");
		// console.log(this.state.editorState.getCurrentContent().getPlainText());

	}

	//I used firebase for backend since its super easy to set up. I currently created my own firebase to test and i'll add you guys via email
	queryAndLoad = () => {
		firebase.firestore().collection("user_data")
		.where("UID", "==", 1) //todo multi user support
		.get()
		.then((querySnapshot) => {
			//assume UIDs to be unique
			//if querySnapshot isn't empty, then we found the ID
			if(!querySnapshot.empty){ 
				this.loadIntoRTF(querySnapshot.docs[0].data().Data); //get [0] since theres only gonna be one
			}
		})
		.catch((e) => { console.log("error during query and load func")
		});
	}

	//inter-component communication via ref
	//rigged such that pressing button uploads stuff from firebase into the RTF doc itself
	loadIntoRTF = (data) => {
		//if loading overwrites whats on the RTF, alert for now
		if(data !== this.getPlainText()){

			this.dbToText(data);
		}
	};

	//saves whatever in RTF box to database
	storeIntoDatabase = () => {
		const plaintext = this.getPlainText();
		firebase.firestore().collection("user_data")
		.where("UID", "==", 1) //todo multi user support
		.get()
		.then((querySnapshot) => {
			//assume UIDs to be unique
			//if querySnapshot isn't empty, then we found the ID
			if(!querySnapshot.empty){ 
				console.log(querySnapshot.docs[0].id);
				firebase.firestore().collection("user_data")
				.doc(querySnapshot.docs[0].id)
				.update({
					Data : plaintext
				})
				.catch((e) => { console.log("error turing update op")});
					//get [0] since theres only gonna be one
			}
		})
		.catch((e) => { console.log("error during store func")
		});
		
		alert("Saved to Database");
	}

	onEditorStateChange = (editorState) => {
		this.setState({editorState: editorState});
	}

	render(){
		return (
			<div>
				<Editor
					editorState={this.state.editorState}
					onEditorStateChange={this.onEditorStateChange}
					wrapperClassName="wrapper-class"
					editorClassName="editor-class"
					toolbarClassName="toolbar-class"
				/>
				<div class="btn-group">
					<button onClick={this.queryAndLoad}>Load from Database to RTF</button>
					<button onClick={this.storeIntoDatabase}>Save from RTF into Database</button>
					{/* <button onClick={this.generatePDF} type="primary">get your pdf</button> */}
					
				</div>
			</div>
		)
	}
}


