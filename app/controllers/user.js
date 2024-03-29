"use strict";

const userModel           = require('../models/userModel');
const levelModel          = require('../models/levelModel');
const dollarRecordModel   = require('../models/dollarRecordModel');
const itemRecordModel     = require('../models/itemRecordModel');
const diamondsRecordModel = require('../models/diamondsRecordModel');
const activityNoticeModel = require('../models/activityNoticeModel');
const jsonUtil            = require('../utils/jsonUtil');
const dateUtil            = require('../utils/dateUtil');
const regUtil             = require('../utils/regUtil');
const encryptionUtil      = require('../utils/encryptionUtil');
const numberUtil          = require('../utils/numberUtil');
const config              = require('../../config');
const co                  = require('co');

co(init);

async function init() {
	let me = await userModel.findOne({account: 'admin'});
	if (!me) {
		me = new userModel({
			account: 'admin',
			password: encryptionUtil.encryptionPassword('123456'),
			registerDate: dateUtil.now(),
			lastLoginDate: dateUtil.now(),
			adminType: 1,
			name: '管理员'
		});
		await me.save();
	}

	// const numUser = await userModel.count();
	// if (numUser < 10) {
	// 	let u = null;
	// 	for (let i = 0; i < 36; i++) {
	// 		u = new userModel({
	// 			account: 'test' + i,
	// 			password: encryptionUtil.encryptionPassword('123456'),
	// 			registerDate: dateUtil.now(),
	// 			lastLoginDate: dateUtil.now(),
	// 			adminType: 0,
	// 			name: 'name' + i
	// 		});
	// 		await u.save();
	// 	}
	// }
}

// exports.register = async function (ctx) {
// 	let { account, password, source, phone } = ctx.params;
// 	let newUser = await userModel.findOne({account}, {id: 1});
// 	if (!newUser) {
// 		newUser = new userModel({
// 			account,
// 			password: encryptionUtil.encryptionPassword(password),
// 			// 创建时间
// 			registerDate: dateUtil.now(),
// 			lastLoginDate: dateUtil.now(),
// 			source,
// 			phone: phone
// 		});
// 		await newUser.save();
// 		ctx.body = jsonUtil.createAPI(1, '注册成功');
// 	} else {
// 		ctx.body = jsonUtil.createAPI(-1, `账号已经被注册了:${account}`);
// 	}
// };

exports.login = async function (ctx, next) {
	let { account, source, deviceMode } = ctx.request.body;
	// console.log('account = ', account)
	// console.log('source = ', source)
	account = jsonUtil.myDecodeURIComponent(account);
	if (source !== 'web' && source !== 'native') {
		source = 'web';
	}
	const now = dateUtil.now();
	/*
	
	*/
	let me = await userModel.findOne({account}, {
		_id: -1,
		id: 1,
		name: 1,
		lastLevel: 1,
		totalScore: 1,
		levelScore: 1,
		exp: 1,
		maxTotalScore: 1,
		lastFetchLoginAwardTime: 1,
		fetchLoginAwardCount: 1,
		liuXingMax: 1,
		lastFailedLevel: 1,
		weekRankRecord: 1,
		weekRank: 1,
		weekScore: 1,
		monthRankRecord: 1,
		monthRank: 1,
		monthScore: 1,
		maxLevel: 1,
		items: 1,
		diamonds: 1,
		dollar: 1
	});
	if (me) {
		await userModel.update({account}, {$set: {lastLoginDate: now, deviceMode}});
	} else {
		me = new userModel({
			account,
			password: encryptionUtil.encryptionPassword('123456'),
			registerDate: now,
			// 最后登录时间
			lastLoginDate: now,
			deviceMode,
			// 昵称
			name: '玩家名字',
			// 来源
			source,
			// // 注册IP
			// registerIP: {type: String, default: ''},
			// // 用户设备型号
			// deviceMode: {type: String, default: ''},
			// // 设备唯一识别ID
			// deviceID: {type: String, default: ''},
			// // 运营商
			// deviceOperator: {type: String, default: ''},
			// // 手机号
			// phone: {type: String, default: ''}
		});
		await me.save();
	}
	ctx.body = jsonUtil.createAPI(1, {
		name: numberUtil.from10To36(me.id),
		// name: me.name,
		lastLevel: me.lastLevel,
		totalScore: me.totalScore,
		levelScore: me.levelScore,
		exp: me.exp,
		maxTotalScore: me.maxTotalScore,
		lastFetchLoginAwardTime: me.lastFetchLoginAwardTime,
		fetchLoginAwardCount: me.fetchLoginAwardCount,
		liuXingMax: me.liuXingMax,
		lastFailedLevel: me.lastFailedLevel,
		weekRankRecord: me.weekRankRecord,
		weekRank: me.weekRank,
		weekScore: me.weekScore,
		monthRankRecord: me.monthRankRecord,
		monthRank: me.monthRank,
		monthScore: me.monthScore,
		maxLevel: me.maxLevel,
		items: me.items,
		diamonds: me.diamonds,
		dollar: me.dollar
	});
};

exports.levelWin = async function (ctx) {
	let {
		account,
		level,
		startTimer,
		endTimer,
		startNumItem1,
		startNumItem2,
		startNumItem3,
		startNumItem4,
		endNumItem1,
		endNumItem2,
		endNumItem3,
		endNumItem4,
		startDollar,
		endDollar,
		endDiamonds,
		award
	} = ctx.params;
	level = numberUtil.toInt(level);
	startTimer = numberUtil.toInt(startTimer);
	endTimer = numberUtil.toInt(endTimer);
	startNumItem4 = numberUtil.toInt(startNumItem4);
	startNumItem3 = numberUtil.toInt(startNumItem3);
	startNumItem2 = numberUtil.toInt(startNumItem2);
	startNumItem1 = numberUtil.toInt(startNumItem1);
	endNumItem4 = numberUtil.toInt(endNumItem4);
	endNumItem3 = numberUtil.toInt(endNumItem3);
	endNumItem2 = numberUtil.toInt(endNumItem2);
	endNumItem1 = numberUtil.toInt(endNumItem1);
	startDollar = numberUtil.toInt(startDollar);
	endDollar = numberUtil.toInt(endDollar);
	endDiamonds = numberUtil.toInt(endDiamonds);
	const now = dateUtil.now();
	const me = await userModel.findOne({account}, {maxLevel: 1, id: 1, dollar: 1, items: 1, diamonds: 1});
	if (me) {
		// if (me.dollar !== endDollar) {
		// 	// 记录一下金币的变化
		// 	const dollarRecordData = new dollarRecordModel({
		// 		uid: numberUtil.from10To36(me.id),
		// 		date: now,
		// 		// 变化之前的数量
		// 		oldVal: startDollar,
		// 		// 变化之后的数量
		// 		newVal: endDollar,
		// 		// 变化的原因
		// 		reason: 'levelWin',
		// 		// 变化原因的参数
		// 		params: level.toString()
		// 	});
		// 	await dollarRecordData.save();
		// }

		// 判断道具是否有变化，有变化的话，还要记录一下
		// if (endNumItem1 !== me.items[0]) {
		// 	const itemRecordData = new itemRecordModel({
		// 		uid: numberUtil.from10To36(me.id),
		// 		date: now,
		// 		// 变化之前的数量
		// 		oldVal: me.items[0],
		// 		// 变化之后的数量
		// 		newVal: endNumItem1,
		// 		// 变化的原因
		// 		reason: 'levelWin',
		// 		// 变化原因的参数
		// 		params: level.toString(),
		// 		// 关卡数
		// 		level: level,
		// 		// 道具类型
		// 		type: 1
		// 	});
		// 	await itemRecordData.save();
		// }
		// if (endNumItem2 !== me.items[1]) {
		// 	const itemRecordData = new itemRecordModel({
		// 		uid: numberUtil.from10To36(me.id),
		// 		date: now,
		// 		// 变化之前的数量
		// 		oldVal: me.items[1],
		// 		// 变化之后的数量
		// 		newVal: endNumItem2,
		// 		// 变化的原因
		// 		reason: 'levelWin',
		// 		// 变化原因的参数
		// 		params: level.toString(),
		// 		// 关卡数
		// 		level: level,
		// 		// 道具类型
		// 		type: 2
		// 	});
		// 	await itemRecordData.save();
		// }
		// if (endNumItem3 !== me.items[2]) {
		// 	const itemRecordData = new itemRecordModel({
		// 		uid: numberUtil.from10To36(me.id),
		// 		date: now,
		// 		// 变化之前的数量
		// 		oldVal: me.items[2],
		// 		// 变化之后的数量
		// 		newVal: endNumItem3,
		// 		// 变化的原因
		// 		reason: 'levelWin',
		// 		// 变化原因的参数
		// 		params: level.toString(),
		// 		// 关卡数
		// 		level: level,
		// 		// 道具类型
		// 		type: 3
		// 	});
		// 	await itemRecordData.save();
		// }
		// if (endNumItem4 !== me.items[3]) {
		// 	const itemRecordData = new itemRecordModel({
		// 		uid: numberUtil.from10To36(me.id),
		// 		date: now,
		// 		// 变化之前的数量
		// 		oldVal: me.items[3],
		// 		// 变化之后的数量
		// 		newVal: endNumItem4,
		// 		// 变化的原因
		// 		reason: 'levelWin',
		// 		// 变化原因的参数
		// 		params: level.toString(),
		// 		// 关卡数
		// 		level: level,
		// 		// 道具类型
		// 		type: 4
		// 	});
		// 	await itemRecordData.save();
		// }
		// // 钻石变化记录
		// if (me.diamonds !== endDiamonds) {
		// 	const diamondsRecordData = new diamondsRecordModel({
		// 		uid: numberUtil.from10To36(me.id),
		// 		date: now,
		// 		// 变化之前的数量
		// 		oldVal: me.diamonds,
		// 		// 变化之后的数量
		// 		newVal: endDiamonds,
		// 		// 变化的原因
		// 		reason: 'levelWin',
		// 		// 变化原因的参数
		// 		params: level.toString()
		// 	});
		// 	await diamondsRecordData.save();
		// }
		// 更新金币和最大关卡
		const maxLevel = me.maxLevel > level ? me.maxLevel : level;
		await userModel.update({account}, {$set: {
			dollar: endDollar,
			diamonds: endDiamonds,
			maxLevel
		}});

		const levelData = new levelModel({
			uid: numberUtil.from10To36(me.id),
			numLevel: level,
			startDate: startTimer,
			endDate: endTimer,
			startItems: [startNumItem1, startNumItem2, startNumItem3, startNumItem4],
			endItems: [endNumItem1, endNumItem2, endNumItem3, endNumItem4],
			startDollar,
			endDollar,
			awards: JSON.parse(award)
		});
		await levelData.save();

		ctx.body = jsonUtil.createAPI(1);
	} else {
		ctx.body = jsonUtil.createAPI(-1, `没有找到用户:${account}`);
	}
}

exports.levelFail = async function (ctx) {
	let {
		account,
		level,
		startTimer,
		endTimer,
		startNumItem1,
		startNumItem2,
		startNumItem3,
		startNumItem4,
		endNumItem1,
		endNumItem2,
		endNumItem3,
		endNumItem4,
		startDollar,
		endDollar,
		endDiamonds
	} = ctx.params;
	level = numberUtil.toInt(level);
	startTimer = numberUtil.toInt(startTimer);
	endTimer = numberUtil.toInt(endTimer);
	startNumItem4 = numberUtil.toInt(startNumItem4);
	startNumItem3 = numberUtil.toInt(startNumItem3);
	startNumItem2 = numberUtil.toInt(startNumItem2);
	startNumItem1 = numberUtil.toInt(startNumItem1);
	endNumItem4 = numberUtil.toInt(endNumItem4);
	endNumItem3 = numberUtil.toInt(endNumItem3);
	endNumItem2 = numberUtil.toInt(endNumItem2);
	endNumItem1 = numberUtil.toInt(endNumItem1);
	startDollar = numberUtil.toInt(startDollar);
	endDollar = numberUtil.toInt(endDollar);
	endDiamonds = numberUtil.toInt(endDiamonds);
	const now = dateUtil.now();
	const me = await userModel.findOne({account}, {maxLevel: 1, id: 1, dollar: 1, items: 1, diamonds: 1});
	if (me) {
		const levelData = new levelModel({
			uid: numberUtil.from10To36(me.id),
			numLevel: level,
			startDate: startTimer,
			endDate: endTimer,
			startItems: [startNumItem1, startNumItem2, startNumItem3, startNumItem4],
			endItems: [endNumItem1, endNumItem2, endNumItem3, endNumItem4],
			startDollar,
			endDollar,
			isWin: false
		});
		await levelData.save();

		ctx.body = jsonUtil.createAPI(1);
	} else {
		ctx.body = jsonUtil.createAPI(-1, `没有找到用户:${account}`);
	}
}

exports.changeName = async function (ctx) {
	const { account, name } = ctx.params;
	const me = await userModel.findOne({account}, {name: 1});
	if (me) {
		await userModel.update({account}, {$set: {name}});
		ctx.body = jsonUtil.createAPI(1);
	} else {
		ctx.body = jsonUtil.createAPI(-1, `没有找到用户:${account}`);
	}
}

exports.dollarChanged = async function (ctx) {
	let { account, reason, val, params } = ctx.params;
	params = params || '';
	val = numberUtil.toInt(val);
	const me = await userModel.findOne({account}, {id: 1, dollar: 1, _id: -1});
	if (me) {
		const dollarRecordData = new dollarRecordModel({
			uid: numberUtil.from10To36(me.id),
			date: dateUtil.now(),
			// 变化之前的数量
			oldVal: me.dollar,
			// 变化之后的数量
			newVal: me.dollar + val,
			// 变化的原因
			reason,
			// 变化原因的参数
			params
		});
		await dollarRecordData.save();
		await userModel.update({account}, {$set: {dollar: me.dollar + val}});
		ctx.body = jsonUtil.createAPI(1);
	} else {
		ctx.body = jsonUtil.createAPI(-1, `没有找到用户:${account}`);
	}
}

exports.diamondsChanged = async function (ctx) {
	let { account, reason, val, params } = ctx.params;
	params = params || '';
	val = numberUtil.toInt(val);
	const me = await userModel.findOne({account}, {id: 1, diamonds: 1, _id: -1});
	if (me) {
		const diamondsRecordData = new diamondsRecordModel({
			uid: numberUtil.from10To36(me.id),
			date: dateUtil.now(),
			// 变化之前的数量
			oldVal: me.diamonds,
			// 变化之后的数量
			newVal: me.diamonds + val,
			// 变化的原因
			reason,
			// 变化原因的参数
			params
		});
		await diamondsRecordData.save();
		await userModel.update({account}, {$set: {diamonds: me.diamonds + val}});
		ctx.body = jsonUtil.createAPI(1);
	} else {
		ctx.body = jsonUtil.createAPI(-1, `没有找到用户:${account}`);
	}
}

exports.updateLastLevel = async function (ctx) {
	const { account, lastLevel } = ctx.params;
	await userModel.update({account}, {$set: {lastLevel: numberUtil.toInt(lastLevel)}});
	ctx.body = jsonUtil.createAPI(1);
}

exports.updateTotalScore = async function (ctx) {
	const { account, totalScore } = ctx.params;
	await userModel.update({account}, {$set: {totalScore: numberUtil.toInt(totalScore)}});
	ctx.body = jsonUtil.createAPI(1);
}

exports.updateLevelScore = async function (ctx) {
	const { account, levelScore } = ctx.request.body;
	await userModel.update({account}, {$set: {levelScore: JSON.parse(levelScore)}});
	ctx.body = jsonUtil.createAPI(1);
}

exports.updateExp = async function (ctx) {
	const { account, exp } = ctx.params;
	await userModel.update({account}, {$set: {exp: numberUtil.toInt(exp)}});
	ctx.body = jsonUtil.createAPI(1);
}

exports.updateMaxTotalScore = async function (ctx) {
	const { account, maxTotalScore } = ctx.params;
	await userModel.update({account}, {$set: {maxTotalScore: numberUtil.toInt(maxTotalScore)}});
	ctx.body = jsonUtil.createAPI(1);
}

exports.updateLastFetchLoginAwardTime = async function (ctx) {
	const { account, lastFetchLoginAwardTime, fetchLoginAwardCount } = ctx.params;
	await userModel.update({account}, {$set: {
		lastFetchLoginAwardTime: numberUtil.toInt(lastFetchLoginAwardTime),
		fetchLoginAwardCount: numberUtil.toInt(fetchLoginAwardCount)
	}});
	ctx.body = jsonUtil.createAPI(1);
}

exports.updateLastFailedLevel = async function (ctx) {
	const { account, lastFailedLevel } = ctx.params;	
	await userModel.update({account}, {$set: {
		lastFailedLevel: numberUtil.toInt(lastFailedLevel)
	}});
	ctx.body = jsonUtil.createAPI(1);
}

exports.updateLiuXingMax = async function (ctx) {
	const { account, liuXingMax } = ctx.params;
	await userModel.update({account}, {$set: {liuXingMax: numberUtil.toInt(liuXingMax)}});
	ctx.body = jsonUtil.createAPI(1);
}

exports.updateWeekRankRecord = async function (ctx) {
	const { account, weekRankRecord } = ctx.params;
	await userModel.update({account}, {$set: {weekRankRecord: numberUtil.toInt(weekRankRecord)}});
	ctx.body = jsonUtil.createAPI(1);	
}

exports.updateMaxLevel = async function (ctx) {
	const { account, maxLevel } = ctx.params;
	await userModel.update({account}, {$set: {maxLevel: numberUtil.toInt(maxLevel)}});
	ctx.body = jsonUtil.createAPI(1);	
}

exports.getActivityNotice = async function (ctx) {
	const noticeList = await activityNoticeModel.find({isDeleted: false});
	ctx.body = jsonUtil.createAPI(1, noticeList);
}


// exports.thirdPartyLogin = async function (ctx, next) {
// 	const { account, headURL, source, app } = ctx.request.body;
// 	let myAccount = await userModel.findOne({account}, {id: 1, password: 1});
// 	if (!myAccount) {
// 		// 没有账号，就新建一个
// 		myAccount = new userModel({
// 			account,
// 			password: account,
// 			// 生日
// 			birthday: dateUtil.now(),
// 			// 创建时间
// 			registerDate: dateUtil.now(),
// 			source
// 		});
// 		await myAccount.save();
// 	}
// 	if (app === 'easy') {
// 		const me = await easyUserController.register(myAccount.id, myAccount. id, myAccount.password, jsonUtil.myDecodeURIComponent(headURL));
// 		me.account = account;
// 		me.password = myAccount.password;
// 		me.source = source;
// 		me.modifyPwdCount = myAccount.modifyPwdCount;
// 		ctx.body = jsonUtil.createAPI(1, jsonUtil.user2Json(me));
// 	} else {
// 		ctx.body = jsonUtil.createAPI(-1, `未知的应用:${app}`);
// 	}
// };

// exports.checkAccount = async function (ctx, next) {
// 	let { account } = ctx.params;
// 	account = jsonUtil.myDecodeURIComponent(account);
// 	const me = await userModel.findOne({account: account}, {id: 1});
// 	ctx.body = jsonUtil.createAPI(1, me ? 1 : 0);
// };

// exports.modifyPassword = async function (ctx, next) {
// 	let { account, password } = ctx.request.body;
// 	let myAccount = await userModel.findOne({account}, {id: 1, password: 1});
// 	if (myAccount) {
// 		password = encryptionUtil.encryptionPassword(password);
// 		await userModel.update({account}, {$set: {password}, $inc: {modifyPwdCount: 1}});
// 		ctx.body = jsonUtil.createAPI(1);
// 	} else {
// 		ctx.body = jsonUtil.createAPI(-1, `没有找到账号:${account}`);
// 	}
// };