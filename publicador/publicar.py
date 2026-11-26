"""Publicador de Instagram de Toro's Smash Burgers.

Lo corre GitHub Actions cada 10 minutos. Lee publicador/calendario.json,
publica en Instagram lo que ya tocaba (posts, Reels y stories) con la API
oficial de Instagram (login de Instagram, graph.instagram.com) y anota lo
publicado en publicador/publicados.json para no repetir nada.

El token vive solo en el secreto IG_TOKEN del repo. Este script nunca lo
imprime: el repo es público y los registros de Actions también.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

API_IG = "https://graph.instagram.com/v23.0"  # token de login de Instagram (empieza con IG)
API_FB = "https://graph.facebook.com/v23.0"  # token de login de Facebook para empresas
RAW = "https://raw.githubusercontent.com/{repo}/main/{archivo}"
ZONA = timezone(timedelta(hours=-3))  # Bahía Blanca, sin horario de verano
VENTANA = timedelta(hours=2)  # si se atrasa más que esto, no se publica
INTENTOS = 3  # reintentos ante errores pasajeros (uno por corrida)

AQUI = Path(__file__).resolve().parent
CALENDARIO = AQUI / "calendario.json"
PUBLICADOS = AQUI / "publicados.json"

TIPOS = {"POST", "REEL", "STORY"}


class ErrorApi(Exception):
    pass


_API = []


def api():
    """Elige el host según el token: prueba login de Instagram y, si no, el de Facebook."""
    if not _API:
        token = os.environ.get("IG_TOKEN", "").strip()
        if not token:
            raise SystemExit("Falta el secreto IG_TOKEN en GitHub (Settings → Secrets → Actions).")
        for host in ([API_IG, API_FB] if not token.startswith("EAA") else [API_FB]):
            q = urllib.parse.urlencode({"access_token": token, "fields": "id"})
            try:
                with urllib.request.urlopen(f"{host}/me?{q}", timeout=60):
                    _API.append(host)
                    break
            except urllib.error.HTTPError:
                continue
        if not _API:
            raise SystemExit(f"El IG_TOKEN guardado no es válido ni para Instagram ni para Facebook "
                             f"(largo {len(token)}, empieza con '{token[:3]}…'). Generá uno nuevo.")
    return _API[0]


def pedir(metodo, ruta, datos=None):
    token = os.environ["IG_TOKEN"].strip()
    API = api()
    datos = dict(datos or {})
    datos["access_token"] = token
    cuerpo = urllib.parse.urlencode(datos).encode()
    if metodo == "GET":
        req = urllib.request.Request(f"{API}/{ruta}?{cuerpo.decode()}")
    else:
        req = urllib.request.Request(f"{API}/{ruta}", data=cuerpo, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        texto = e.read().decode(errors="replace")
        try:
            msg = json.loads(texto).get("error", {}).get("message", texto)
        except ValueError:
            msg = texto
        raise ErrorApi(f"{e.code}: {msg[:300]}") from None


def cuenta():
    """Devuelve el id de la cuenta de Instagram que publica, según el tipo de token."""
    if api() == API_IG:
        yo = pedir("GET", "me", {"fields": "user_id,username"})
        print(f"Cuenta: @{yo.get('username')} (login de Instagram)")
        return yo["user_id"]
    buscado = os.environ.get("IG_USUARIO", "toros.smash")
    ig_id = os.environ.get("IG_ID", "17841408315307930")  # id de @toros.smash en Meta
    try:
        ig = pedir("GET", ig_id, {"fields": "id,username"})
        print(f"Cuenta: @{ig.get('username')} (login de Facebook)")
        return ig["id"]
    except ErrorApi as e:
        print(f"(No se pudo leer la cuenta {ig_id}: {e})")
        try:
            permisos = pedir("GET", "me/permissions").get("data", [])
            ok = [x["permission"] for x in permisos if x.get("status") == "granted"]
            print("Permisos del token: " + (", ".join(ok) or "ninguno"))
        except ErrorApi:
            pass
    campos = {"fields": "instagram_business_account{id,username}", "limit": "100"}
    cuentas = []
    for pagina in pedir("GET", "me/accounts", campos).get("data", []):
        ig = pagina.get("instagram_business_account")
        if ig:
            cuentas.append(ig)
    try:
        for negocio in pedir("GET", "me/businesses", {"fields": "id", "limit": "100"}).get("data", []):
            for ig in pedir("GET", f"{negocio['id']}/owned_instagram_accounts",
                            {"fields": "id,username", "limit": "100"}).get("data", []):
                cuentas.append(ig)
    except ErrorApi as e:
        print(f"(No se pudieron leer los portfolios: {e})")
    for ig in cuentas:
        if ig.get("username") == buscado:
            print(f"Cuenta: @{buscado} (login de Facebook)")
            return ig["id"]
    vistas = ", ".join("@" + c.get("username", "?") for c in cuentas) or "ninguna"
    raise SystemExit(f"El token no da acceso a @{buscado}. Cuentas visibles: {vistas}")


def url_de(item):
    if item.get("url"):
        return item["url"]
    repo = os.environ.get("GITHUB_REPOSITORY", "ciudaddigitalonline-gif/toros-publications")
    return RAW.format(repo=repo, archivo=urllib.parse.quote(item["archivo"]))


def es_video(item):
    return item["tipo"] == "REEL" or url_de(item).lower().split("?")[0].endswith(".mp4")


def crear_contenedor(ig_id, item):
    url = url_de(item)
    datos = {}
    if item["tipo"] == "REEL":
        datos.update(media_type="REELS", video_url=url, share_to_feed="true")
    elif item["tipo"] == "STORY":
        datos["media_type"] = "STORIES"
        datos["video_url" if es_video(item) else "image_url"] = url
    else:
        datos["image_url"] = url
    if item["tipo"] != "STORY" and item.get("caption"):
        datos["caption"] = item["caption"]
    return pedir("POST", f"{ig_id}/media", datos)["id"]


def esperar_listo(contenedor, minutos):
    limite = time.time() + minutos * 60
    while time.time() < limite:
        estado = pedir("GET", contenedor, {"fields": "status_code,status"})
        codigo = estado.get("status_code")
        if codigo == "FINISHED":
            return
        if codigo in ("ERROR", "EXPIRED"):
            raise ErrorApi(f"Instagram no pudo procesar el archivo: {estado.get('status', codigo)}")
        time.sleep(10)
    raise ErrorApi("Instagram tardó demasiado en procesar el archivo")


def publicar(ig_id, item):
    contenedor = crear_contenedor(ig_id, item)
    esperar_listo(contenedor, 8 if es_video(item) else 2)
    return pedir("POST", f"{ig_id}/media_publish", {"creation_id": contenedor})["id"]


def cargar(ruta, vacio):
    if not ruta.exists():
        return vacio
    return json.loads(ruta.read_text(encoding="utf-8"))


def fecha_de(item):
    f = datetime.fromisoformat(item["fecha"])
    return f if f.tzinfo else f.replace(tzinfo=ZONA)


def validar(calendario):
    vistos = set()
    for item in calendario:
        for campo in ("id", "fecha", "tipo"):
            if not item.get(campo):
                raise SystemExit(f"Falta '{campo}' en: {item}")
        if item["tipo"] not in TIPOS:
            raise SystemExit(f"Tipo desconocido en {item['id']}: {item['tipo']}")
        if not item.get("archivo") and not item.get("url"):
            raise SystemExit(f"Falta 'archivo' o 'url' en {item['id']}")
        if item["id"] in vistos:
            raise SystemExit(f"id repetido: {item['id']}")
        vistos.add(item["id"])
        fecha_de(item)


def main():
    calendario = cargar(CALENDARIO, [])
    validar(calendario)
    if os.environ.get("SOLO_VALIDAR"):
        print(f"Calendario OK: {len(calendario)} publicaciones")
        return 0

    if os.environ.get("SOLO_VERIFICAR"):
        cuenta()
        print("Token OK. No se publicó nada.")
        return 0

    publicados = cargar(PUBLICADOS, {})
    solo_id = os.environ.get("SOLO_ID", "").strip()
    ahora = datetime.now(timezone.utc)

    if solo_id:
        pendientes = [i for i in calendario if i["id"] == solo_id]
        if not pendientes:
            raise SystemExit(f"No hay ningún id '{solo_id}' en el calendario")
    else:
        # Solo lo marcado "via": "publicador"; el resto lo publica Buffer.
        pendientes = [
            i for i in calendario
            if i.get("via") == "publicador" and fecha_de(i) <= ahora and (
                i["id"] not in publicados
                or (publicados[i["id"]].get("estado") == "error"
                    and publicados[i["id"]].get("intentos", 1) < INTENTOS))
        ]
    pendientes.sort(key=fecha_de)

    if not pendientes:
        print("Nada para publicar ahora.")
        return 0

    ig_id = cuenta()

    fallas = 0
    for item in pendientes:
        atraso = ahora - fecha_de(item)
        previo = publicados.get(item["id"], {})
        registro = {"fecha": item["fecha"], "tipo": item["tipo"],
                    "cuando": ahora.astimezone(ZONA).isoformat(timespec="minutes")}
        if not solo_id and atraso > VENTANA:
            registro["estado"] = "vencido"
            print(f"- {item['id']}: vencido ({atraso} tarde), no se publica")
        else:
            try:
                registro["media_id"] = publicar(ig_id, item)
                registro["estado"] = "publicado"
                print(f"- {item['id']}: publicado ({item['tipo']})")
            except ErrorApi as e:
                fallas += 1
                registro["estado"] = "error"
                registro["error"] = str(e)
                registro["intentos"] = previo.get("intentos", 0) + 1
                print(f"- {item['id']}: ERROR (intento {registro['intentos']}) {e}")
                # Se reintenta en las próximas corridas hasta INTENTOS veces,
                # siempre dentro de la VENTANA. Se fuerza con SOLO_ID.
        publicados[item["id"]] = registro
        PUBLICADOS.write_text(json.dumps(publicados, ensure_ascii=False, indent=1) + "\n",
                              encoding="utf-8")

    return 1 if fallas else 0


if __name__ == "__main__":
    sys.exit(main())
