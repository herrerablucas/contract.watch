const { codeFrameColumns } = require("@babel/code-frame");
const path = require("path");

const pluralize = (word, count) => {
    return (count === 1 ? word : `${word}s`);
}

const formatSummary = (errors, warnings) => {
    const summary = [];
    if (errors > 0) {
        summary.push(`${errors} ${pluralize("error", errors)}`);
    }

    if (warnings > 0) {
        summary.push(`${warnings} ${pluralize("warning", warnings)}`);
    }

    let output = `${summary.join(" and ")} found.`;
    return output;
}

const formatMessage = (message, sourceCode) => {
    const type = message.severity === 3 ? "error" : "warning";
    const msg = `${message.message.replace(/([^ ])\.$/u, "$1")}`;
    const ruleId = `(${message.ruleId})`;

    const firstLine = [
        `${type}:`,
        `${msg}`,
        ruleId ? `${ruleId}` : "",
    ].filter(String).join(" ");

    const result = [firstLine];

	result.push(
		codeFrameColumns(sourceCode, { start: { line: message.line, column: message.column } }, { highlightCode: false, linesAbove: 3, linesBelow: 4 })
	);
	
    return result.join("\n");
}

const formatWithCodeframe = (reports, sourceCode) => {
	
	let errors = 0;
	let warnings = 0;

	let outputs = reports.map(report => {
		report.severity > 2 ? errors++ : warnings++;
		return `${formatMessage(report, sourceCode)}\n\n`;
	}).join('\n');

	outputs += "\n";
	outputs += formatSummary(errors, warnings);

    return outputs;
}

module.exports = {
	formatWithCodeframe
}