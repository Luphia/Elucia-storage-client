module.exports = {
	getPartialKey: function(_key, _part1) {
		var length = Math.max(_key.length, _part1.length);
		var fill = parseInt(Math.random()*255);
		var add = module.exports.getAdd(_key.length, fill);
		var bKey = new Buffer(length);
		var bPart1 = new Buffer(length);
		var bPart2 = new Buffer(length + add.length);

		bKey.fill(parseInt(Math.random()*255));
		bKey.write(_key);
		bPart1.fill(fill);
		bPart1.write(_part1);

		var i = 0;
		for(i = 0; i < length; i++) {
			bPart2[i] = bKey[i] ^ bPart1[i];
		}

		for(j = 0; j < add.length; j++) {
			bPart2[i + j] = add[j];
		}

		return bPart2.toString('hex');
	},
	getKey: function(_part1, _part2) {
		var part2 = module.exports.decodePart2(_part2);
		var keyL = part2[1];
		var fill = part2[2];
		var bPart1 = new Buffer(keyL);
		var bPart2 = part2[0];
		var bKey = new Buffer(keyL);

		bPart1.fill(fill);
		bPart1.write(_part1);

		for(i = 0; i < keyL; i++) {
			bKey[i] = bPart1[i] ^ bPart2[i];
		}

		return bKey.toString();
	},
	getAdd: function(_keyL, _fill, _mode) {
	// 補位陣列 
		!_mode && (_mode = 1);	// 分割模式
		var rt = [];
		var k = 1;

		while(_keyL > 255) {
			rt.push(_keyL / (_keyL - (_keyL % 255)));
			_keyL = _keyL % 255;
			k++;
		}
		rt.push(_keyL);
		rt.push(k);
		rt.push(_fill);
		rt.push(_mode);

		return rt;
	},
	decodePart2: function(_part2) {
		var add = 0;
		var tmpB = new Buffer(_part2, 'hex');
		var l = tmpB.length;
		var mode = tmpB[l - 1];
		var fill = tmpB[l - 2];
		var max = tmpB[l - 3];
		var sl = l - max - 3;

		while(max > 0) {
			add += Math.pow(255, max - 1) * tmpB[l - max - 3];
			max --;
		}

		var rBuff = tmpB.slice(0, sl);
		var rt = [rBuff, add, fill];	// [part2Buffer, KEY長度, part1補位]

		return rt;
	}
};