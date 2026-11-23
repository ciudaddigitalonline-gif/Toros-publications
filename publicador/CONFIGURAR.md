# Configurar el publicador de Instagram (una sola vez)

Son 4 pasos y llevan unos 20 minutos. Los tokens se pegan solo en GitHub: nunca en el chat.

## 1. Cuenta de Instagram de tipo Empresa

En la app de Instagram, en @toros.smash: **Configuración y actividad → Tipo de cuenta y herramientas**.
Tiene que decir **Empresa**. Si dice Personal o Creador, cambiala a Empresa: es gratis y no se pierde nada.
(Las stories por API solo funcionan con cuentas de Empresa.)

## 2. App de Meta y token de Instagram

1. Entrá a https://developers.facebook.com con tu Facebook e ingresá a **Mis apps → Crear app**.
2. Caso de uso: **Administrar mensajes y contenido en Instagram**. Nombre: por ejemplo "Publicador Toros". Creala.
3. En la app, andá a **Casos de uso → Instagram → Personalizar → Configuración de la API con inicio de sesión de Instagram**.
4. En **Generar tokens de acceso**, tocá **Agregar cuenta** e ingresá con @toros.smash. Aceptá los permisos.
5. Si Instagram pide aceptar una invitación de evaluador: app de Instagram → **Configuración → Apps y sitios web → Invitaciones de evaluador → Aceptar**.
6. Volvé a la app de Meta, tocá **Generar token** al lado de @toros.smash y copiá el token (es un texto largo).

La app queda en modo desarrollo: así alcanza para publicar en tu propia cuenta, no hace falta revisión de Meta.

## 3. Guardar el token en GitHub

1. Abrí https://github.com/ciudaddigitalonline-gif/toros-publications/settings/secrets/actions
2. **New repository secret**. Name: `IG_TOKEN`. Secret: pegá el token del paso 2. **Add secret**.

## 4. Permiso para renovar el token solo (vence cada 60 días)

1. Abrí https://github.com/settings/personal-access-tokens/new
2. Nombre: "Renovar token Instagram". Expiración: la más larga que te deje.
3. **Repository access → Only select repositories → toros-publications**.
4. **Permissions → Repository permissions → Secrets → Read and write**. Nada más.
5. **Generate token** y copiá el texto.
6. Igual que en el paso 3, creá otro secreto: Name `GH_PAT`, Secret: el texto que copiaste.

Listo. Avisale a Claude y hace la prueba con una story.

## Cómo funciona después

- `publicador/calendario.json`: lo que se va a publicar (fecha y hora de Bahía Blanca, tipo, archivo y caption). Lo carga Claude cada semana.
- GitHub revisa el calendario cada 10 minutos y publica lo que ya tocaba. Puede atrasarse unos minutos.
- `publicador/publicados.json`: registro de lo publicado, con errores si los hubo.
- Si algo se atrasa más de 2 horas (por ejemplo, una caída), no se publica tarde: queda como "vencido".
- Todos los lunes se renueva el token solo.
