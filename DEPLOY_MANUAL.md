# Guía de Actualización Manual de Datos

Este documento explica cómo actualizar los datos de la aplicación "Programación Conjunta Formación" para que todos los usuarios vean la nueva información.

## Prerrequisitos

- Acceso a la carpeta del proyecto en tu ordenador.
- Los nuevos archivos Excel (`aspy_formacion.xlsx` y `mas_formacion.xls`).
- Terminal de comandos abierta en la carpeta del proyecto.

## Paso 1: Reemplazar los Archivos Excel

1.  Navega a la carpeta del proyecto:
    `.../ASPY-MAS-Programacion-Formacion/public/data/`
2.  **Borra** o **Sobrescribe** los archivos antiguos con los nuevos que quieres publicar.
    - El archivo de ASPY debe llamarse exactamente: `aspy_formacion.xlsx`
    - El archivo de MAS debe llamarse exactamente: `mas_formacion.xls`

> **Nota:** ¡Es crucial que los nombres sean idénticos! Si cambias el nombre (ej: `aspy_formacion_v2.xlsx`), la aplicación dejará de funcionar.

## Paso 2: Verificar en Local (Opcional pero Recomendado)

Antes de subir los cambios, asegúrate de que todo funciona bien en tu ordenador:

1.  Abre la terminal en la carpeta del proyecto.
2.  Ejecuta: `npm run dev`
3.  Abre tu navegador en `http://localhost:5173` (o el puerto que te indique).
4.  Comprueba que los datos nuevos aparecen en la tabla.

## Paso 3: Subir a Producción

Una vez verificados los datos, debes "construir" y "desplegar" la nueva versión de la web.

### Opción A: Si usas Vercel (Recomendado)

Si tienes configurado Vercel CLI:

1.  Ejecuta en la terminal: `vercel --prod`
2.  Espera a que termine el proceso.

### Opción B: Si usas un Servidor Web (Apache/Nginx/FTP)

1.  Ejecuta en la terminal: `npm run build`
2.  Esto creará una carpeta llamada `dist/` en tu proyecto.
3.  Copia **todo el contenido** de la carpeta `dist/` y súbelo a tu servidor (vía FTP o como lo hagáis habitualmente), reemplazando los archivos previos.

---

**¡Listo!** Los usuarios verán los nuevos datos en cuanto recarguen la página.
