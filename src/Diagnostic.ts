import * as vscode from "vscode";
import { exec, spawn } from "child_process";
import { platform } from "os";

class Counter {
	static processes = 0;
	static limit() {
		return 3;
	}
}

export const diagnosticCollection = vscode.languages.createDiagnosticCollection("java");
const config = vscode.workspace.getConfiguration("javac-linter");

let maxNumberOfProblems = config.maxNumberOfProblems || 20;
let classpath = config["classpath"];
let enable = config["enable"];
let javac = config["javac"];

function convertUriToPath(uri: string): string {
	return decodeURI(uri.replace("file://", ""));
}

export async function getDiagnostic(document: vscode.TextDocument) {
	if (Counter.processes < Counter.limit() && enable && document.languageId == "java") {
		Counter.processes += 1;
		try {
			let diagnostics: vscode.Diagnostic[] = [];

			var cp = classpath.join(":");
			var filepath = convertUriToPath(document.uri.toString());
			if (platform() == 'win32') {
				cp = classpath.join(";");
				filepath = filepath.substr(1).replace(/%3A/g, ':').replace(/\//g, '\\');
			}
			var cmd = `"${javac}" -Xlint:unchecked -g -d "${classpath[0]}" -cp "${cp}" "${filepath}"`;
			console.log(cmd);
			await exec(cmd, (err, stderr, stdout) => {
				if (stdout) {
					console.log(stdout);
					let firstMsg = stdout.split(':')[1].trim();
					if (firstMsg == "directory not found" ||
						firstMsg == "invalid flag") {
						console.error(firstMsg);
						return;
					}
					let errors = stdout.split(filepath);
					var lines = [];
					var problemsCount = 0;
					errors.forEach((element: String) => {
						lines.push(element.split('\n'));
					});
					lines.every((element) => {
						if (element.length > 2) {
							problemsCount++;
							if (problemsCount > maxNumberOfProblems) {
								return false;
							}
							let firstLine = element[0].split(':');
							let line = parseInt(firstLine[1]) - 1;
							let severity = firstLine[2].trim();
							severity = severity == "error" ? vscode.DiagnosticSeverity.Error.valueOf : vscode.DiagnosticSeverity.Warning;
							let column = element[2].length - 1;
							let message = firstLine[3].trim();
							let position = new vscode.Position(line, column);
							diagnostics.push(new vscode.Diagnostic(
								new vscode.Range(position, position),
								message,
								severity
							));
						}
						return true;
					});
				}
				Counter.processes -= 1;
				diagnosticCollection.set(document.uri, diagnostics)
			});
		} catch (e) {
			diagnosticCollection.clear();
			Counter.processes -= 1;
			console.log(e);
		}
	}
}
