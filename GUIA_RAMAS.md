# Guía de ramas (dev → main)

Este repositorio trabaja con dos ramas:

- **`dev`** → aquí se hacen **todos los cambios**. Es la rama de trabajo.
- **`main`** → es la web en producción. Solo se actualiza cuando en `dev` todo funciona.

> Regla de oro: **nunca** se hacen cambios directamente en `main`. Siempre se trabaja en `dev` y, cuando todo está probado, se pasa a `main`.

---

## 1. Trabajar en `dev`

Antes de empezar, asegúrate de estar en `dev` y con lo último:

```powershell
git checkout dev
git pull
```

Haz tus cambios y guárdalos:

```powershell
git status                      # ver qué archivos has tocado (opcional)
git add .                       # añadir todos los cambios
git commit -m "Descripción breve de lo que has cambiado"
git push                        # subir los cambios a la rama dev
```

Repite este paso tantas veces como quieras. **Todos los cambios van a `dev`.**

---

## 2. Probar

Comprueba que todo funciona (en local o en el entorno/prevista de `dev`) **antes** de pasar nada a `main`.

---

## 3. Pasar `dev` a `main` (copiar y pegar)

Cuando estés seguro de que todo funciona en el entorno de prueba, copia y pega este bloque de comandos tal cual:

```powershell
git checkout main
git pull origin main
git merge dev
git push origin main
```

Con esto, `main` queda con exactamente lo mismo que `dev`. No hay que hacer nada más en GitHub.

---

## 4. Sincronizar `dev` con `main` (después del merge)

Para que `dev` vuelva a estar al día con lo que ya hay en `main`:

```powershell
git checkout dev
git merge main
git push
```

---

## Comandos útiles

| Comando                 | Para qué sirve                                        |
| ----------------------- | ----------------------------------------------------- |
| `git status`            | Ver en qué rama estás y qué archivos has cambiado.    |
| `git branch`            | Ver todas las ramas locales (la actual sale con `*`). |
| `git checkout dev`      | Cambiar a la rama `dev`.                              |
| `git checkout main`     | Cambiar a la rama `main`.                             |
| `git log --oneline -10` | Ver los últimos 10 commits.                           |
| `git stash`             | Guardar temporalmente cambios sin hacer commit.       |
| `git stash pop`         | Recuperar los cambios guardados con `git stash`.      |

---

## Si algo va mal

- **No pasa nada por equivocarse**: mientras los cambios no se hayan subido a `main`, todo se puede deshacer.
- Si un `git merge` da conflictos y no sabes resolverlos, **no fuerces nada** (`git push -f`) — pide ayuda.
- Si estás en medio de algo y no sabes en qué estado estás, ejecuta `git status` y compártelo.
