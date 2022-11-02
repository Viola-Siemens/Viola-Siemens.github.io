navs = [
    "http://localhost:8080/pages/emeraldcraft/blocks.html",
    "http://localhost:8080/pages/emeraldcraft/items.html",
    "http://localhost:8080/pages/emeraldcraft/entities.html"
]

paths = [
    "./emeraldcraft/blocks/",
    "./emeraldcraft/items/",
    "./emeraldcraft/entities/"
]

import requests
from pyquery import PyQuery as pq
import re
from math import log

def getWords(long_content):
    words = []
    reg = re.compile(r"[a-zA-Z0-9]+", re.S)
    c = 0
    i = 0
    while(i < len(long_content)):
        c = 0;
        ss = ""
        while(True):
            ss = long_content[i + c:i + c + 1]
            c += 1
            if(len(re.findall(reg, ss)) > 0 and i + c < len(long_content)):
                continue
            break
        ss = long_content[i:i + c];
        if(c > 1 and len(re.findall(reg, ss[-1])) <= 0):
            words.append(ss[:-1])
            ss = ss[-1]
        words.append(ss);
        i += c
    words = set(words)
    words.remove(' ')
    return list(words)

hrefs = []
titles = []
contents = []
words = []
tf_idfs = []

for nav in navs:
    r = requests.get(nav)
    d = pq(r.text)
    for ab in range(0, 26):
        charab = chr(ord('a')+ab)
        cnt = 0
        h4s = d("section.ab_%s"%charab).find("h4")
        h4 = h4s.eq(cnt)
        while(h4 != None and h4.text() != ""):
            hrefs.append(h4.children("a").attr("href"))
            cnt += 1
            h4 = h4s.eq(cnt)

for href in hrefs:
    content = ""
    r = requests.get("http://localhost:8080" + href)
    d = pq(r.text)
    titles.append(d("title").text())
    cnt = 0
    sections = d("section")
    section = sections.eq(cnt)
    while(section != None and section.text() != ""):
        content += " ".join(section.text().lower().split()) + " "
        cnt += 1
        section = sections.eq(cnt)
    contents.append(content.strip())

words = getWords(" ".join(contents))

tfs = [[0 for __ in range(len(contents))] for _ in range(len(words))]
counts = [[0 for __ in range(len(contents))] for _ in range(len(words))]
#tf

for j in range(len(contents)):
    cws = getWords(contents[j])
    for i in range(len(words)):
        counts[i][j] = cws.count(words[i])
        tfs[i][j] = cws.count(words[i]) / len(cws)

print(words)
print([sum([(1 if counts[i][j] > 0 else 0) for j in range(len(contents))]) for i in range(len(words))])

#idf
idfs = [log(len(contents)) - log(sum([(1 if counts[i][j] > 0 else 0) for j in range(len(contents))])) for i in range(len(words))]

tf_idfs = [[tfs[i][j] * idfs[i] for j in range(len(contents))] for i in range(len(words))]

with open("words.txt", mode="w", encoding="utf8") as f:
    for i in range(len(words)):
        f.writelines('"%s",'%words[i])
        if(i % 10 == 9):
            f.writelines('\n')
        else:
            f.writelines(' ')

with open("pages.txt", mode="w", encoding="utf8") as f:
    for i in range(len(hrefs)):
        f.writelines('"%s",\n'%hrefs[i])

with open("titles.txt", mode="w", encoding="utf8") as f:
    for i in range(len(titles)):
        f.writelines('"%s",\n'%titles[i])

with open("tf_idfs.txt", mode="w", encoding="utf8") as f:
    for i in range(len(tf_idfs)):
        for j in range(len(tf_idfs[i])):
            if(tf_idfs[i][j] < 1e-8):
                f.writelines('0, ');
            else:
                f.writelines('%.8f, '%tf_idfs[i][j])
        f.writelines("\n")
