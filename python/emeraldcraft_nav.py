from xpinyin import Pinyin

blocks = []
items = []
entities = []

template = ""

with open("../template2.html", encoding="utf8") as f:
    for line in f:
        template += line

with open("../datagen/emeraldcraft.json", encoding="utf8") as f:
    for line in f:
        entry = eval(line.strip())
        typ = entry["type"]
        if(typ == "Block"):
            blocks.append(entry)
        else:
            items.append(entry)

with open("../datagen/emeraldcraft_entity.json", encoding="utf8") as f:
    for line in f:
        entities.append(eval(line.strip()))

trans = {"blocks": "方块", "items": "物品", "entities": "实体"}

pinyin = Pinyin()

def build_section(charab, extra):
    if(extra == None):
        return '<section class="ab_%s" id="alphabet-sorted-%s">\n\t\t<div class="container">\n\t\t\t<div class="row">\n\t\t\t\t<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">\n\t\t\t\t\t<h2>%s</h2>\n\t\t\t\t\t<div class="col-sm-12">\n\t\t\t\t\t\t<h4><br/></h4>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</section>\n'%(charab, charab, charab.upper())
    return '<section class="ab_%s" id="alphabet-sorted-%s">\n\t\t<div class="container">\n\t\t\t<div class="row">\n\t\t\t\t<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">\n\t\t\t\t\t<h2>%s</h2>\n\t\t\t\t\t<div class="col-sm-12">\n%s\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</section>\n'%(charab, charab, charab.upper(), extra)

for typ in ["blocks", "items", "entities"]:
    for i in range(len(eval(typ))):
        eval(typ)[i]["pinyin"] = pinyin.get_pinyin(eval(typ)[i]["name"])
    eval(typ).sort(key=lambda x:(x["pinyin"], x["registerName"]))
    sections = ""
    begin = 0
    for ab in range(0, 26):
        charab = chr(ord('a')+ab)
        extra = ""
        for ind in range(begin, len(eval(typ))):
            if(eval(typ)[ind]["pinyin"].startswith(charab)):
                extra += '\t\t\t\t\t\t<h4><a href="/pages/emeraldcraft/%s/%s.html">%s</a><br/></h4>\n'%(typ, eval(typ)[ind]["englishName"], eval(typ)[ind]["name"])
            else:
                begin = ind
                break
        if(extra == ""):
            extra = "\t\t\t\t\t\t<h4><br/></h4>\n"
        sections += build_section(charab, extra)
        
    with open("../pages/emeraldcraft/%s.html"%(typ), "w", encoding="utf8") as fout:
        fout.write(template.replace("$Page-Name$", trans[typ])
                   .replace('<section class="ab_template" id="alphabet-sorted-template"></section>', sections))
