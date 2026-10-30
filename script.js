const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keypad = document.querySelector(".keypad");
const operatorKeys = [...document.querySelectorAll("[data-operator]")];

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;
let justCalculated = false;

const operatorSymbols = {
	add: "+",
	subtract: "−",
	multiply: "×",
	divide: "÷",
};

function render() {
	display.textContent = currentValue;
	operatorKeys.forEach((key) => {
		key.classList.toggle("is-selected", key.dataset.operator === pendingOperator);
	});
}

function formatNumber(value) {
	if (!Number.isFinite(value)) return "Error";
	const rounded = Number.parseFloat(value.toPrecision(12));
	return String(Object.is(rounded, -0) ? 0 : rounded);
}

function inputDigit(digit) {
	if (currentValue === "Error" || waitingForOperand || justCalculated) {
		currentValue = digit;
		waitingForOperand = false;
		justCalculated = false;
		expression.textContent = "";
	} else {
		currentValue = currentValue === "0" ? digit : currentValue + digit;
	}
	render();
}

function inputDecimal() {
	if (currentValue === "Error" || waitingForOperand || justCalculated) {
		currentValue = "0.";
		waitingForOperand = false;
		justCalculated = false;
		expression.textContent = "";
	} else if (!currentValue.includes(".")) {
		currentValue += ".";
	}
	render();
}

function calculate(left, right, operator) {
	switch (operator) {
		case "add": return left + right;
		case "subtract": return left - right;
		case "multiply": return left * right;
		case "divide": return right === 0 ? NaN : left / right;
		default: return right;
	}
}

function chooseOperator(operator) {
	if (currentValue === "Error") return;
	const value = Number(currentValue);

	if (pendingOperator && !waitingForOperand) {
		const result = calculate(storedValue, value, pendingOperator);
		currentValue = formatNumber(result);
		storedValue = result;
	} else {
		storedValue = value;
	}

	pendingOperator = operator;
	waitingForOperand = true;
	justCalculated = false;
	expression.textContent = `${currentValue} ${operatorSymbols[operator]}`;
	render();
}

function calculateResult() {
	if (!pendingOperator || waitingForOperand || currentValue === "Error") return;
	const left = storedValue;
	const right = Number(currentValue);
	const result = calculate(left, right, pendingOperator);

	expression.textContent = `${formatNumber(left)} ${operatorSymbols[pendingOperator]} ${formatNumber(right)} =`;
	currentValue = formatNumber(result);
	storedValue = null;
	pendingOperator = null;
	waitingForOperand = true;
	justCalculated = true;
	render();
}

function clear() {
	currentValue = "0";
	storedValue = null;
	pendingOperator = null;
	waitingForOperand = false;
	justCalculated = false;
	expression.textContent = "";
	render();
}

function toggleSign() {
	if (currentValue === "Error" || Number(currentValue) === 0) return;
	currentValue = currentValue.startsWith("-") ? currentValue.slice(1) : `-${currentValue}`;
	render();
}

function applyPercent() {
	if (currentValue === "Error") return;
	currentValue = formatNumber(Number(currentValue) / 100);
	render();
}

function backspace() {
	if (currentValue === "Error" || waitingForOperand || justCalculated) {
		clear();
		return;
	}
	currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
	if (currentValue === "-") currentValue = "0";
	render();
}

keypad.addEventListener("click", (event) => {
	const button = event.target.closest("button");
	if (!button) return;

	if (button.dataset.digit !== undefined) inputDigit(button.dataset.digit);
	if (button.dataset.operator) chooseOperator(button.dataset.operator);

	switch (button.dataset.action) {
		case "decimal": inputDecimal(); break;
		case "equals": calculateResult(); break;
		case "clear": clear(); break;
		case "sign": toggleSign(); break;
		case "percent": applyPercent(); break;
		case "backspace": backspace(); break;
	}
});

document.addEventListener("keydown", (event) => {
	if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
	else if (event.key === ".") inputDecimal();
	else if (event.key === "+") chooseOperator("add");
	else if (event.key === "-") chooseOperator("subtract");
	else if (event.key === "*") chooseOperator("multiply");
	else if (event.key === "/") {
		event.preventDefault();
		chooseOperator("divide");
	} else if (event.key === "Enter" || event.key === "=") {
		event.preventDefault();
		calculateResult();
	} else if (event.key === "Backspace") backspace();
	else if (event.key === "Escape") clear();
	else if (event.key === "%") applyPercent();
});

render();
