import os
import hashlib


def sha1_hash(input_bytes) -> str:
    sha1 = hashlib.sha1()
    sha1.update(input_bytes)
    return sha1.hexdigest()

template = "<project>\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>%s</groupId>\n  <artifactId>%s</artifactId>\n  <version>%s</version>\n</project>\n"


for dirpath, dirnames, filenames in os.walk("."):
  print("Walking at " + dirpath)
  for filename in filenames:
    if filename.endswith(".jar"):
      print("\tFound Jarfile " + filename)
      pom_name = filename[:-4] + ".pom"
      packs = dirpath[2:].split("\\")
      group_id = ".".join(packs[:-2])
      artifact_id = packs[-2]
      version = packs[-1]
      pom_content = (template%(group_id, artifact_id, version)).encode('utf-8')
      
      with open(os.path.join(dirpath, pom_name), "wb") as fout:
        fout.write(pom_content)
      
      with open(os.path.join(dirpath, pom_name + ".sha1"), "w") as fout:
        fout.write(sha1_hash(pom_content))
      
      with open(os.path.join(dirpath, filename), "rb") as fin:
        with open(os.path.join(dirpath, filename + ".sha1"), "w") as fout:
          fout.write(sha1_hash(fin.read()))
