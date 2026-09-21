# Guía de ramas (dev → main)

- **`dev`** → aquí se hacen **todos los cambios** (rama de trabajo).
- **`main`** → la web en producción. Solo se actualiza cuando en `dev` todo funciona.

> Regla de oro: los cambios se hacen **siempre** en `dev`, nunca directamente en `main`.

---

## 1. Hacer cambios en `dev`

```powershell
git checkout dev
git pull
git add .
git commit -m "descripción de los cambios"
git push
```

---

## 2. Subirlo a `main` y seguir en `dev` (copiar y pegar)

Cuando en `dev` todo funcione, copia y pega este bloque **tal cual**:

```powershell
git checkout main
git pull origin main
git merge dev
git push origin main
git checkout dev
git merge main
git push
```

Resultado: `main` queda **igual que `dev`** y tú sigues en `dev` para seguir trabajando.

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
