var footer = document.getElementById("section-footer");

function addResult(title, content, cnt) {
	let section = document.createElement("section");
	section.className = "ab_"+String.fromCharCode(0x61 + (cnt % 26));
	section.id = "result" + cnt;
	
	let div = document.createElement("div");
	div.className = "container";
	
	let row = document.createElement("div");
	row.className = "row";
	
	let col = document.createElement("div");
	col.className = "col-lg-12 col-md-12 col-sm-12 col-xs-12";
	
	let animated = document.createElement("div");
	animated.className = "wow bounceInLeft";
	animated["data-wow-delay"] = "0.1s";
	
	let h2 = document.createElement("h2");
	h2.innerHTML = title;
	
	animated.appendChild(h2);
	col.appendChild(animated);
	
	let para = document.createElement("div");
	para.className = "col-sm-12";
	
	let p = document.createElement("p");
	p.innerHTML = content;
	
	para.appendChild(p);
	col.appendChild(para);
	
	row.appendChild(col);
	div.appendChild(row);
	section.appendChild(div);
	footer.parentNode.insertBefore(section, footer);
}

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return decodeURI(r[2]);
	}
	return null;
}

let count = 0;

let kw = getUrlParam("kw");
let page = getUrlParam("page");

if(kw !== null && page !== null) {
	kw = kw.split(' ').join('');
	let kwl = [];
	let re = new RegExp("[a-zA-Z0-9]+");
	let c = 0;
	let i = 0;
	while(i < kw.length) {
		c = 0;
		let ss;
		do {
			ss = kw.substr(i + c, 1);
			c += 1;
		} while(re.test(ss) && i + c < kw.length);
		ss = kw.substr(i, c);
		if(c > 1 && !re.test(ss.charAt(c - 1))) {
			kwl.push(ss.substr(0, c - 1));
			ss = ss.charAt(c - 1);
		}
		kwl.push(ss);
		i += c;
	}
	
	let l = searchFrom(kwl, page);
	for(let i in l) {
		addResult(l[i].title, l[i].content, i);
	}
	count = l.length;
}
if(count == 0) {
	addResult('<span style="font-color: #7f7f7f;">找不到内容？</span>', "换一下关键词再次搜索试试~", 0);
}
document.getElementById("search-count").innerHTML = count;