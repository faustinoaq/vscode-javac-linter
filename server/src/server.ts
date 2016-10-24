/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	IPCMessageReader, IPCMessageWriter,
	createConnection, IConnection, TextDocumentSyncKind,
	TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
	InitializeParams, InitializeResult, TextDocumentPositionParams
	// CompletionItem, CompletionItemKind
} from 'vscode-languageserver';

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites. 
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
	workspaceRoot = params.rootPath;
	return {
		capabilities: {
			// Tell the client that the server works in FULL text document sync mode
			textDocumentSync: documents.syncKind
			// Tell the client that the server support code complete
			// completionProvider: {
			// 	resolveProvider: true
			// }
		}
	}
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidOpen((change) => {
	validateTextDocument(change.document);
});

// The settings interface describe the server relevant settings part
interface Settings {
	javacLinter: ExtensionSettings;
}

// These are the example settings we defined in the client's package.json
// file
interface ExtensionSettings {
	maxNumberOfProblems: number;
	classpath: string[];
	enable: boolean;
	javac: string;
}

interface FileUri {
	uri: string;
}

// hold the maxNumberOfProblems setting
let maxNumberOfProblems: number;
let classpath: string[];
let enable: boolean;
let javac: string;
// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
	let settings = <Settings>change.settings;
	maxNumberOfProblems = settings["javac-linter"].maxNumberOfProblems || 20;
	classpath = settings["javac-linter"].classpath;
	if (classpath.length == 0) {
		classpath = [workspaceRoot];
	}
	enable = settings["javac-linter"].enable;
	javac = settings["javac-linter"].javac || 'javac';
	// Revalidate any open text documents
	documents.all().forEach(validateTextDocument);
});

function convertUriToPath(uri: string) : string {
	return uri.replace("file://", "");
}

function validateTextDocument(textDocument: FileUri): void {
	let exec = require('child_process').exec;
	// First check if javac exist then validate sources
	exec(`${javac} -version`, (err, stderr, stdout) => {
		if ((stdout.split(' ')[0] == 'javac') && enable) {
			let diagnostics: Diagnostic[] = [];
			let os = require('os');
			var cp = classpath.join(":");
			var filepath = convertUriToPath(textDocument.uri); 
			if (os.platform() == 'win32') {
				cp = classpath.join(";");
				filepath = filepath.substr(1).replace('%3A', ':').replace('%20', ' ');
			}
			let cmd = `"${javac}" -Xlint:unchecked -d "${classpath[0]}" -cp "${cp}" "${filepath}"`
			console.log(cmd);
			exec(cmd, (err, stderr, stdout) => {
				if (stdout) {
					console.log(stdout);
					if (stdout.split(':')[1].trim() == "directory not found") {
						console.log("Fist classpath doesn't exist")
						return 0;
					}
					let errors = stdout.split(convertUriToPath(textDocument.uri));
					let lines = [], amountOfProblems = 0;
					errors.forEach((element: String) => {
						lines.push(element.split('\n'));
					});
					lines.forEach((element: String[]) => {
						if (element.length > 2) {
							amountOfProblems += 1;
						}
					});
					amountOfProblems = Math.min(amountOfProblems, maxNumberOfProblems);
					for (let index = 0; index <= amountOfProblems; index++) {
						let element = lines[index];
						if (element.length > 2) {
							let firstLine  = element[0].split(':');
							let line = parseInt(firstLine[1]) - 1;
							let severity = firstLine[2].trim();
							let message = firstLine[3].trim();
							if (element[3] != undefined && element[4] != undefined) {
								// symbol and class location
								message += '\n' + element[3].trim();
								message += '\n' + element[4].trim();
							}
							let column = element[2].length - 1;
							diagnostics.push({
								severity: severity == "error" ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
								range: {
									start: { line: line, character: column },
									end: { line: line, character: column }
								},
								message: message,
								source: "Java Language"
							});
						}
					}
				}
				// Send the computed diagnostics to VSCode.
				connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
			});
		} else {
			console.log("javac is not avaliable, check javac-linter.javac on settings.json");
		}
	});
}

connection.onDidChangeWatchedFiles((change) => {
	// Monitored files have change in VSCode
	change.changes.forEach(validateTextDocument)
});

/*

TODO: completions

// This handler provides the initial list of the completion items.
connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
	// The pass parameter contains the position of the text document in 
	// which code complete got requested. For the example we ignore this
	// info and always provide the same completion items.
	return [
		{
			label: 'TypeScript',
			kind: CompletionItemKind.Text,
			data: 1
		},
		{
			label: 'JavaScript',
			kind: CompletionItemKind.Text,
			data: 2
		}
	]
});

// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
	if (item.data === 1) {
		item.detail = 'TypeScript details',
		item.documentation = 'TypeScript documentation'
	} else if (item.data === 2) {
		item.detail = 'JavaScript details',
		item.documentation = 'JavaScript documentation'
	}
	return item;
});
*/

/*
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	connection.console.log(`${params.uri} opened.`);
});

connection.onDidChangeTextDocument((params) => {
	// The content of a text document did change in VSCode.
	// params.uri uniquely identifies the document.
	// params.contentChanges describe the content changes to the document.
	connection.console.log(`${params.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});

connection.onDidCloseTextDocument((params) => {
	// A text document got closed in VSCode.
	// params.uri uniquely identifies the document.
	connection.console.log(`${params.uri} closed.`);
});
*/

// Listen on the connection
connection.listen();
