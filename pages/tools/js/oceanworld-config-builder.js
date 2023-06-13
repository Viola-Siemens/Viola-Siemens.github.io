const _Settings = {
  amplitudes: [
    1.0,
    1.0,
    2.0,
    2.0,
    2.0,
    1.0,
    1.0,
    1.0,
    1.0
  ],
  firstOctave: -9
};
const _N = _Settings.amplitudes.length - 1;

let _Size = 512;
function setSize(newSize) {
	if((newSize & (-newSize)) == newSize) {
		_Size = newSize;
	} else {
		throw `ValueError: ${newSize} is not power of 2! Try 128, 256, 512...`;
	}
}

let _holdrand = 42;
function srand(seed) {
    _holdrand = seed;
}
function rand() {
	_holdrand = _holdrand & 0xffffffff;
    return ((_holdrand = _holdrand * 214013 + 2531011) >> 16) & 0x7fff;
}

function smooth(x) {
	return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

function lerp(x1, x2, b) {
	return x1 * (1.0 - b) + x2 * b;
}

function getAmplifier(a, i) {
	return Math.pow(2, _N - i) * a / (Math.pow(2, _N + 1) - 1);
}

function getRandomLinearHashFunction() {
	const ks = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59];
	return {
		k: ks[rand() & 15],
		b: rand() & 15,
		get: function(x) {
			return (x * this.k + this.b) & 0xffff;
		}
	};
}

function buildNoiseVectors() {
	let ret = {
		hold: rand(),
		hashFunc: getRandomLinearHashFunction(),
		get: function(i, j) {
			let v = ((((this.hold ^ (this.hashFunc.get(i) * 0x10000 + this.hashFunc.get(j))) * 1103515245 + 20001121) >> 4) & 0x7fff) / 0x8000 * 2.0 * Math.PI;
			return [Math.cos(v), Math.sin(v)];
		}
	};
	return ret;
}

function generateNoise() {
	let maph = [];
	let noise = [];
	for(let i = 0; i < _Size; ++i) {
		let tmp = [];
		for(let j = 0; j < _Size; ++j) {
			tmp.push(0);
		}
		maph.push(tmp);
	}
	srand(parseInt(document.getElementById("seed").value));
	let adder = parseInt(document.getElementById("adder").value);
	for(let ee = 0; ee < 2; ++ee) {
		for(let e = 0; e <= _N; ++e) {
			if(-_Settings.firstOctave - adder - e >= 0) {
				let _ChunkSize = Math.round(Math.pow(2, -_Settings.firstOctave - adder - e));
				let noise_vecs = buildNoiseVectors();
				if(_Size >= _ChunkSize) {
					let _D = Math.round(_Size / _ChunkSize);
					for (let i = 0; i < _D; ++i) {
						for (let j = 0; j < _D; ++j) {
							let v00 = noise_vecs.get(i, j);
							let v01 = noise_vecs.get(i, j + 1);
							let v10 = noise_vecs.get(i + 1, j);
							let v11 = noise_vecs.get(i + 1, j + 1);
							
							for (let di = 0; di < _ChunkSize; ++di) {
								let u = (di + 0.5) / _ChunkSize;
								for (let dj = 0; dj < _ChunkSize; ++dj) {
									let v = (dj + 0.5) / _ChunkSize;
									let h00 = v00[0] * u + v00[1] * v;
									let h01 = v01[0] * u + v01[1] * (v - 1.0);
									let h10 = v10[0] * (u - 1.0) + v10[1] * v;
									let h11 = v11[0] * (u - 1.0) + v11[1] * (v - 1.0);
									let ans = lerp(lerp(h00, h10, smooth(u)), lerp(h01, h11, smooth(u)), smooth(v));
									
									let value = ans * getAmplifier(_Settings.amplitudes[e], e);
									maph[i * _ChunkSize + di][j * _ChunkSize + dj] += value;
								}
							}
						}
					}
				} else {
					let v00 = noise_vecs.get(0, 0);
					let v01 = noise_vecs.get(0, 1);
					let v10 = noise_vecs.get(1, 0);
					let v11 = noise_vecs.get(1, 1);
					
					for (let di = 0; di < _Size; ++di) {
						let u = (di + 0.5) / _ChunkSize;
						for (let dj = 0; dj < _Size; ++dj) {
							let v = (dj + 0.5) / _ChunkSize;
							let h00 = v00[0] * u + v00[1] * v;
							let h01 = v01[0] * u + v01[1] * (v - 1.0);
							let h10 = v10[0] * (u - 1.0) + v10[1] * v;
							let h11 = v11[0] * (u - 1.0) + v11[1] * (v - 1.0);
							let ans = lerp(lerp(h00, h10, smooth(u)), lerp(h01, h11, smooth(u)), smooth(v));
							
							let value = ans * getAmplifier(_Settings.amplitudes[e], e);
							maph[di][dj] += value;
						}
					}
				}
			} else {
				let ind = Math.round(Math.pow(2, _Settings.firstOctave + adder + e));
				let noise_vecs = buildNoiseVectors();
				
				for (let i = 0; i < _Size; ++i) {
					for (let j = 0; j < _Size; ++j) {
						let v = noise_vecs.get(i * ind + ind / 2, j * ind + ind / 2);
						let h00 = (v[0] + v[1]) / 2;
						let h01 = (v[0] - v[1]) / 2;
						let h10 = (-v[0] + v[1]) / 2;
						let h11 = -(v[0] + v[1]) / 2;
						let ans = lerp(lerp(h00, h10, smooth(0.5)), lerp(h01, h11, smooth(0.5)), smooth(0.5));
						
						let value = ans * getAmplifier(_Settings.amplitudes[e], e);
						maph[i][j] += value;
					}
				}
			}
		}
	}
	for(let i = 0; i < _Size; ++i) {
		for(let j = 0; j < _Size; ++j) {
			noise.push([i, j, maph[i][j] * 1.625]);
		}
	}
	return noise;
}
