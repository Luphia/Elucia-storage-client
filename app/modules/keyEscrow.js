// 輸入: 金鑰檔案, 保存密碼 -> 輸出: 代管金鑰
// - 產生金鑰 3 位校驗資訊
// - 產生金鑰長度資訊
// - 建立保存密碼 pwBuffer
// - 建立保存金鑰 escrowBuffer, 其長度為 pwBuffer 整數倍並大於金鑰長度
// - 將 pwBuffer 與金鑰進行 XOR 運算直到填滿 escrowBuffer 為止
// - 


// 輸入: 保存密碼, 代管金鑰 -> 輸出: 金鑰

module.exports = {
	getVerificationBuffer: function(_buffer, _outputLength) {
		var outputBuffer = new Buffer(_outputLength);
		outputBuffer.fill(0);
		for(i=0, j=0; i<_buffer.length || j<_outputLength; i++, j++) {
			var a = i % _buffer.length;
			var b = j % _outputLength;

			outputBuffer[b] = _buffer[a] ^ outputBuffer[b];
		}

		return outputBuffer;
	},
	getPartialKey: function(_keyPath, _pw) {
		var fs = require("fs");
		var fill = parseInt(Math.random()*255);
		var keyBuffer = fs.readFileSync(_keyPath);
		var add = module.exports.getAdd(keyBuffer, fill);
		var pwBuffer = new Buffer(_pw);
		var eslen = Math.ceil(keyBuffer.length / _pw.length) * _pw.length + add.length;
		var escrowBuffer = new Buffer(eslen);

		var i = 0;
		for(i = 0; i < (eslen - add.length); i++) {
			iKey = i % keyBuffer.length;
			iPW = i % pwBuffer.length;
			escrowBuffer[i] = keyBuffer[iKey] ^ pwBuffer[iPW];
		}
		for(j = 0; j < add.length; j++) {
			escrowBuffer[i + j] = add[j];
		}

		return escrowBuffer.toString('hex');
	},
	getKey: function(_part1, _part2) {
		var part2 = module.exports.decodePart2(_part2);
		var keyL = part2[1];
		var fill = part2[2];
		var bPart1 = new Buffer(_part1);
		var bPart2 = part2[0];
		var bKey = new Buffer(keyL);

		bPart1.fill(fill);
		bPart1.write(_part1);

		for(i = 0; i < keyL; i++) {
			iPW = i % _part1.length;
			bKey[i] = bPart1[iPW] ^ bPart2[i];
		}

		return bKey.toString();
	},
	getAdd: function(_key, _fill, _mode) {
	// 補位陣列 
		_keyL = _key.length;
		var crcLength = 3;
		var crc = module.exports.getVerificationBuffer(_key, crcLength);
		!_mode && (_mode = 1);	// 分割模式
		var rt = [];
		var k = 1;

		for(i = 0; i < crc.length; i++) {
			rt.push(crc[i]);
		}

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
		var sl = l - max - 3 - 3;

		while(max > 0) {
			add += Math.pow(255, max - 1) * tmpB[l - max - 3];
			max --;
		}

		var crc = new Buffer(3);
		crc[0] = tmpB[l - max - 3 - 4];
		crc[1] = tmpB[l - max - 3 - 3];
		crc[2] = tmpB[l - max - 3 - 2];

		var rBuff = tmpB.slice(0, sl);
		var rt = [rBuff, add, fill, crc];	// [part2Buffer, KEY長度, part1補位, crcBuffer]

		return rt;
	}
};