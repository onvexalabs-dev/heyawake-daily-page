"""Validate static links, resources, metadata and release prerequisites."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,sys
root=Path(__file__).resolve().parents[1];dist=root/"dist"
class Page(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=set();self.title=False
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if attrs.get("id"):self.ids.add(attrs["id"])
  if tag=="title":self.title=True
  for key in ("href","src"):
   if attrs.get(key):self.links.append(attrs[key])
errors=[];pages={}
for path in dist.rglob("*.html"):
 text=path.read_text(encoding="utf-8")
 parser=Page();parser.feed(text);pages[path]=parser
 if "{{" in text:errors.append(str(path)+": unresolved placeholder")
 if not parser.title:errors.append(str(path)+": missing title")
 if not re.search(r'<html[^>]+lang="en"',text):errors.append(str(path)+": missing language")
 if 'name="viewport"' not in text:errors.append(str(path)+": missing viewport")
for path,page in pages.items():
 for link in page.links:
  url=urlsplit(link)
  if url.scheme or url.netloc:continue
  target=(path.parent/unquote(url.path)).resolve() if url.path else path
  if target.is_dir():target=target/"index.html"
  if not target.exists():errors.append(str(path.relative_to(dist))+": missing "+link)
  elif url.fragment and target.suffix==".html":
   data=pages.get(target)
   if data and unquote(url.fragment) not in data.ids:errors.append(str(path.relative_to(dist))+": missing anchor "+link)
if "--release" in sys.argv:
 c=json.loads((root/"site.config.json").read_text());p=c["publisher"]
 if not c["legal_ready"] or not all(p.get(k) for k in ("legal_name","address_lines","country","email")):errors.append("Publisher details are incomplete; public release is blocked.")
if errors:raise SystemExit("\n".join(errors))
print("Validated",len(pages),"HTML pages; all local links, images, scripts, fonts and anchors resolve.")
