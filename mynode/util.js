function sum(a, b, c) {
	return a + b + c;
}

function cea(num, s) {
	return num * s;
}

function getname() {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve("张三"), 3000);
	});
}

module.exports = {
	sum,
	cea,
	getname,
};
