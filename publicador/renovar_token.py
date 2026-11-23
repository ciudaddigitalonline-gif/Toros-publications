"""Renueva el token de Instagram (vence a los 60 días) y lo guarda en el secreto IG_TOKEN.

Lo corre GitHub Actions una vez por semana. Necesita el secreto GH_PAT: un token
de GitHub con permiso "Secrets: read and write" solo sobre este repo. Nunca
imprime ningún token.
"""

import base64
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

from nacl import encoding, public


def http(url, metodo="GET", datos=None, cabeceras=None):
    cuerpo = json.dumps(datos).encode() if datos is not None else None
    req = urllib.request.Request(url, data=cuerpo, method=metodo, headers=cabeceras or {})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            texto = r.read().decode()
            return json.loads(texto) if texto else {}
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Falló {metodo} {url.split('?')[0]}: HTTP {e.code}") from None


def main():
    ig = os.environ["IG_TOKEN"]
    pat = os.environ.get("GH_PAT", "")
    repo = os.environ["GITHUB_REPOSITORY"]
    if not pat:
        print("::warning::Falta el secreto GH_PAT: el token de Instagram no se puede "
              "renovar solo y vence a los 60 días de generado.")
        return 1

    q = urllib.parse.urlencode({"grant_type": "ig_refresh_token", "access_token": ig})
    nuevo = http(f"https://graph.instagram.com/refresh_access_token?{q}")
    token = nuevo["access_token"]
    print(f"::add-mask::{token}")
    dias = int(nuevo.get("expires_in", 0)) // 86400

    gh = {"Authorization": f"Bearer {pat}", "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"}
    clave = http(f"https://api.github.com/repos/{repo}/actions/secrets/public-key", cabeceras=gh)
    caja = public.SealedBox(public.PublicKey(clave["key"].encode(), encoding.Base64Encoder()))
    cifrado = base64.b64encode(caja.encrypt(token.encode())).decode()
    http(f"https://api.github.com/repos/{repo}/actions/secrets/IG_TOKEN", "PUT",
         {"encrypted_value": cifrado, "key_id": clave["key_id"]}, gh)
    print(f"Token de Instagram renovado; vence en {dias} días.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
