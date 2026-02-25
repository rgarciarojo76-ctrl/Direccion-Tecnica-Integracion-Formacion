# Guía de Actualización Manual de Datos

Este documento explica cómo actualizar los datos de la aplicación "Programación Conjunta Formación" para que todos los usuarios vean la nueva información.

## Prerrequisitos

- Acceso a la carpeta del proyecto en tu ordenador.
- Los nuevos archivos Excel (`aspy_formacion.xlsx` y `mas_formacion.xls`).

## Paso 1: Reemplazar los Archivos Excel

1.  Navega a la carpeta del proyecto:
    `public/data/`
2.  **Sustituye** los archivos antiguos por los nuevos.
    - **IMPORTANTE:** Los nombres deben ser exactamente:
      - `aspy_formacion.xlsx`
      - `mas_formacion.xls`
    - Si el nombre es distinto (ej: `aspy_formacion_MARZO.xlsx`), cámbialo a `aspy_formacion.xlsx` antes de copiarlo.

## Paso 2: Subir los cambios a Producción

Como el sistema está conectado a GitHub, solo tienes que subir los archivos nuevos:

1.  Abre una terminal en la carpeta del proyecto.
2.  Ejecuta estos comando (o pídeme a mí que lo haga):
    ```bash
    git add public/data/aspy_formacion.xlsx public/data/mas_formacion.xls
    git commit -m "Actualización de datos Excel"
    git push
    ```

---

**¡Listo!** En unos minutos la web se actualizará automáticamente para todos los usuarios.
