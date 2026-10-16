"""Build the static website without third-party dependencies."""
from pathlib import Path
import argparse,html,json,re,shutil
from urllib.parse import urlparse
root=Path(__file__).resolve().parents[1]
args=argparse.ArgumentParser();args.add_argument("--release",action="store_true");options=args.parse_args()
config=json.loads((root/"site.config.json").read_text(encoding="utf-8"))
publisher=config["publisher"]
required=("legal_name","address_lines","country","email")
ready=bool(config.get("legal_ready")) and all(publisher.get(key) for key in required)
if options.release and not ready:raise SystemExit("Publisher identity, postal address, country, and public contact email are required before public release.")
base=config["base_url"].rstrip("/")+"/"
if urlparse(base).scheme!="https":raise SystemExit("Use an HTTPS canonical URL.")
dist=root/"dist"
if dist.exists():shutil.rmtree(dist)
shutil.copytree(root/"src",dist,ignore=shutil.ignore_patterns("legal"))
esc=lambda text:html.escape(str(text),quote=True)
email=publisher.get("email")
contact=('<a href="mailto:'+esc(email)+'">'+esc(email)+'</a>') if email else "Publisher contact details are awaiting confirmation"
if ready:
 address="<br>".join(esc(x) for x in publisher["address_lines"])
 block="<address><strong>"+esc(publisher["legal_name"])+"</strong><br>"+address+"<br>"+esc(publisher["country"])+"<br>"+contact+"</address>"
else:
 block="<p><strong>"+esc(config["brand"])+"</strong> (brand)<br>The legal publisher identity, postal address, country, and public contact email are awaiting confirmation.</p>"
registration=""
if publisher.get("registration"):registration+="<h2>Registration</h2><p>"+esc(publisher["registration"])+"</p>"
if publisher.get("vat_id"):registration+="<p>VAT identification: "+esc(publisher["vat_id"])+"</p>"
tokens={"BASE_URL":base,"BRAND":esc(config["brand"]),"APP_VERSION":esc(config["app_version"]),"PUBLISHER_BLOCK":block,"CONTACT_LINK":contact,"REGISTRATION_BLOCK":registration}
def render(text):
 for key,value in tokens.items():text=text.replace("{{"+key+"}}",value)
 if "{{" in text:raise SystemExit("Unresolved source placeholder.")
 return text
index=render((root/"src/index.html").read_text(encoding="utf-8"))
if not ready:index=index.replace("<head>","<head><meta name=\"robots\" content=\"noindex,nofollow\">")
(dist/"index.html").write_text(index,encoding="utf-8")
titles={"privacy":"Privacy policy","terms":"Terms of use","legal":"Legal notice","data-deletion":"Your data","support":"Support"}
footer=''.join('<a href="../'+slug+'/">'+title+'</a>' for slug,title in titles.items())
for slug,title in titles.items():
 body=render((root/"src/legal"/(slug+".html")).read_text(encoding="utf-8"))
 banner="" if ready else '<div class="legal-banner" role="note">Legal draft: publisher identity and public contact details must be completed before release.</div>'
 robot="" if ready else '<meta name="robots" content="noindex,nofollow">'
 page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c1224">{robot}<meta name="description" content="{esc(title)} for Heyawake Daily."><title>{esc(title)} — Heyawake Daily</title><link rel="canonical" href="{base}{slug}/"><link rel="icon" href="../assets/favicon.png"><link rel="stylesheet" href="../assets/styles.css"></head><body><a class="skip-link" href="#main">Skip to content</a><header class="site-header wrap"><a class="brand" href="../"><img src="../assets/icon.webp" alt="" width="48" height="48"><span>HEYAWAKE<small>DAILY</small></span></a><a class="text-link" href="../#play">Play the demo ↗</a></header><main id="main" class="legal-main wrap"><a class="back-link" href="../">← Back to Heyawake Daily</a><p class="eyebrow">HEYAWAKE DAILY / INFORMATION</p><h1>{esc(title)}</h1><p class="updated">Updated {esc(config["updated"])} · App version {esc(config["app_version"])}</p>{banner}<div class="legal-body">{body}</div></main><footer class="site-footer wrap"><div><p>Heyawake Daily · {esc(config["brand"])}</p></div><nav aria-label="Legal and support">{footer}</nav></footer></body></html>'''
 target=dist/slug;target.mkdir();(target/"index.html").write_text(page,encoding="utf-8")
(dist/".nojekyll").write_text("",encoding="utf-8")
(dist/"robots.txt").write_text("User-agent: *\n"+("Allow: /\nSitemap: "+base+"sitemap.xml\n" if ready else "Disallow: /\n"),encoding="utf-8")
urls=[base]+[base+x+"/" for x in titles]
(dist/"sitemap.xml").write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join("<url><loc>"+esc(u)+"</loc><lastmod>"+config["updated"]+"</lastmod></url>" for u in urls)+"</urlset>",encoding="utf-8")
(dist/"site.webmanifest").write_text(json.dumps({"name":"Heyawake Daily","short_name":"Heyawake","start_url":"./","display":"browser","background_color":"#0c1224","theme_color":"#0c1224","icons":[{"src":"assets/icon.webp","sizes":"512x512","type":"image/webp","purpose":"any"}]},indent=2),encoding="utf-8")
(dist/"app-ads.txt").write_text("google.com, pub-9404893474354911, DIRECT, f08c47fec0942fa0\n",encoding="utf-8")
if ready:
 (dist/"404.html").write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Page not found — Heyawake Daily</title><body style="background:#0c1224;color:#f0f5ff;font-family:system-ui;padding:10vw"><h1>This room is still a mystery.</h1><p>That page could not be found.</p><a style="color:#58e6f3" href="'+base+'">Back to Heyawake Daily</a></body></html>',encoding="utf-8")
print("Built",dist,"| publisher details confirmed:",ready)
