import * as vscode from "vscode"

import { diagnosticCollection, getDiagnostic } from "./Diagnostic"

export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		diagnosticCollection,
		vscode.workspace.onDidOpenTextDocument(getDiagnostic),
		vscode.workspace.onDidSaveTextDocument(getDiagnostic)
	)
}

export function deactivate() { }
