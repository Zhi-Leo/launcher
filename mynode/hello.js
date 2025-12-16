console.log("hello word");

const { sum, getname } = require("./util.js");
console.log(sum(1, 2, 3));
async function name0() {
	const userInfo = await getname();
	console.log(userInfo);
}

name0();
