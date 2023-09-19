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

let _Scale = 0;
function setScale(newScale) {
	if((newScale & (-newScale)) == newScale) {
		_Scale = newScale - 1;
	} else {
		throw `ValueError: ${newScale} is not power of 2! Try 1, 2, 4...`;
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

function generateNoise(seed, adder) {
	let maph = [];
	let noise = [];
	for(let i = 0; i < _Size; ++i) {
		let tmp = [];
		for(let j = 0; j < _Size; ++j) {
			tmp.push(0);
		}
		maph.push(tmp);
	}
	srand(seed);
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
		if((i & _Scale) == 0) {
			for(let j = 0; j < _Size; ++j) {
				if((j & _Scale) == 0) {
					noise.push(maph[i][j] * 1.625);
				}
			}
		}
	}
	return noise;
}

const CANVAS_SIZE = 1024;

function getPixel(imdata, x, y) {
	x = x * CANVAS_SIZE / _Size;
	y = y * CANVAS_SIZE / _Size;
	let column = 4 * (y * CANVAS_SIZE + x);
	let r = imdata.data[column++];
	let g = imdata.data[column++];
	let b = imdata.data[column++];
	let a = imdata.data[column];
	return [r, g, b, a / 255];
}

function setPixel(imdata, x, y, r, g, b, a) {
	let w = Math.floor(_Size / CANVAS_SIZE);
	let h = Math.floor(_Size / CANVAS_SIZE);
	if(_Size > CANVAS_SIZE) {
		if(x % w != 0) {
			return;
		}
	}
	if(_Size > CANVAS_SIZE) {
		if(y % h != 0) {
			return;
		}
	}
	let dw = Math.max(1, CANVAS_SIZE / _Size);
	let dh = Math.max(1, CANVAS_SIZE / _Size);
	x = x * CANVAS_SIZE / _Size;
	y = y * CANVAS_SIZE / _Size;
	for(let i = x; i < x + dw; ++i) {
		for(let j = y; j < y + dh; ++j) {
			let column = 4 * (j * CANVAS_SIZE + i);
			imdata.data[column++] = r;
			imdata.data[column++] = g;
			imdata.data[column++] = b;
			imdata.data[column] = a;
		}
	}
}

function addPixel(imdata, x, y, r, g, b, a) {
	let color = getPixel(imdata, x, y);
	let a1 = 1 - (1 - color[3]) * (1 - a);
	let r1 = color[0] * (1 - a) + r * a;
	let g1 = color[1] * (1 - a) + g * a;
	let b1 = color[2] * (1 - a) + b * a;
	setPixel(imdata, x, y, r1, g1, b1, a1 * 255);
}

function setNoise(ctx, noise, palette, a) {
	var imdata = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
	for(let i = 0; i < noise.length; ++i) {
		let color = palette(noise[i]);
		let x = i % _Size;
		let y = Math.floor(i / _Size);
		addPixel(imdata, x, y, color[0], color[1], color[2], a);
	}
	ctx.putImageData(imdata, 0, 0);
}