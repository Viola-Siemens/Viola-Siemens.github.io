function searchFrom(kw, page) {
	let target;
	let ret = [];
	let threshold = Math.pow(2e-4, kw.length) * 5;
	switch(page) {
		case "emeraldcraft":
			target = emeraldcraft;
			break;
		default:
			console.error("Illegal page name.");
			return ret;
	}
	let scores = new Array(target.pages.length).fill(1);
	for(let keyword of kw) {
		let kw_ind = target.words.indexOf(keyword);
		if(kw_ind < 0) continue;
		for(let doc in target.titles) {
			if(target.titles[doc].indexOf(keyword) > 0) {
				scores[doc] *= 10;
			}
			scores[doc] *= target.tf_idfs[kw_ind][doc] + 5e-9;
		}
	}
	for(let doc in scores) {
		if(scores[doc] > threshold) {
			ret.push({
				title: '<a href="' + target.pages[doc] + '">' + target.titles[doc] + '</a>',
				content: '<span debug-score="' + Math.log(scores[doc] / threshold) + '"></span>',
				score: Math.log(scores[doc] / threshold)
			});
		}
	}
	ret.sort((a, b) => {
		return b.score - a.score;
	});
	return ret;
}
