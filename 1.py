items = []
entities = []

template = ""

with open("template.html", encoding="utf8") as f:
    for line in f:
        template += line

with open("./datagen/emeraldcraft.json", encoding="utf8") as f:
    for line in f:
        items.append(eval(line.strip()))

with open("./datagen/emeraldcraft_entity.json", encoding="utf8") as f:
    for line in f:
        entities.append(eval(line.strip()))

for item in items:
    name = item["name"]
    englishName = item["englishName"]
    registerName = item["registerName"]
    typ = item["type"]
    largeIcon = "data:image/png;base64,"+item["largeIcon"]

    d = ""
    if(typ == "Block"):
        d = "./pages/blocks/"+englishName+".html"
    else:
        d = "./pages/items/"+englishName+".html"

    with open(d, "w", encoding="utf8") as fout:
        fout.write(template.replace("$Page-Name$", name)
                   .replace("$Register-Name$", registerName)
                   .replace("$Page-Image$", largeIcon))

for entity in entities:
    name = entity["name"]
    englishName = entity["englishName"]
    registerName = entity["registerName"].replace(":entities/", ":")
    largeIcon = "data:image/png;base64,"+entity["Icon"]

    with open("./pages/entities/"+englishName+".html", "w", encoding="utf8") as fout:
        fout.write(template.replace("$Page-Name$", name)
                   .replace("$Register-Name$", registerName)
                   .replace("$Page-Image$", largeIcon))
