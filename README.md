# 🎮 Puissance 4

Un Puissance 4 complet jouable dans le navigateur, sans installation, sans serveur.  
Deux modes : **1v1 local** et **contre une IA Minimax** qui peut vous battre.

---

## 📁 Fichiers

```
puissance4/
└── index.html    ← le jeu entier (un seul fichier)
```

C'est tout. Un seul fichier HTML suffit.

---

## 🚀 Comment jouer

### Option 1 — En local (immédiat, 0 configuration)
Double-cliquez sur `index.html` → il s'ouvre dans votre navigateur. C'est tout.

### Option 2 — Héberger gratuitement sur GitHub Pages
1. Créez un compte sur [github.com](https://github.com)
2. Créez un nouveau dépôt (ex. `puissance4`)
3. Uploadez `index.html` dans le dépôt
4. Allez dans **Settings → Pages → Source → main → / (root)** → Save
5. Votre jeu est en ligne à `https://votre-pseudo.github.io/puissance4`

### Option 3 — Héberger sur Netlify Drop (30 secondes)
1. Allez sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glissez-déposez le fichier `index.html`
3. Netlify vous donne une URL publique instantanément

### Option 4 — Héberger sur Vercel
```bash
npm i -g vercel
vercel --name puissance4
```
Répondez aux questions, votre jeu est en ligne.

---

## 🎯 Fonctionnalités

| Feature | Détail |
|---|---|
| Mode 1v1 | Deux joueurs sur le même clavier/écran |
| Mode IA | Robot Minimax avec élagage Alpha-Bêta |
| 4 niveaux | Facile (3) · Normal (5) · Difficile (7) · Impossible (9) |
| Scores | Compteur de victoires persistant entre les manches |
| Animations | Chute des jetons, flash sur victoire, overlay de fin |
| Responsive | Fonctionne sur mobile, tablette et desktop |
| Clavier | Touches 1–7 pour jouer sans souris |
| Accessibilité | Rôles ARIA, navigation clavier, live region |
| Autonome | Aucune dépendance externe sauf Google Fonts (optionnel) |

---

## 🧠 Comment fonctionne l'IA

L'IA utilise l'algorithme **Minimax avec élagage Alpha-Bêta** :

1. Elle explore toutes les parties possibles jusqu'à une profondeur N
2. Elle attribue un score à chaque position (nombre de menaces, contrôle du centre…)
3. Elle choisit le coup qui maximise son score en supposant que vous jouez parfaitement
4. L'élagage coupe les branches sans intérêt → beaucoup plus rapide

| Difficulté | Profondeur | Comportement |
|---|---|---|
| Facile | 3 coups | Fait des erreurs |
| Normal | 5 coups | Joue correctement |
| Difficile | 7 coups | Très solide |
| Impossible | 9 coups | Quasi-imbattable |

---

## 🛠 Personnalisation rapide

Ouvrez `index.html` dans un éditeur (VS Code, Notepad++…) et modifiez :

```css
/* Changer les couleurs des jetons */
--red:    #ff2d55;   /* Joueur 1 */
--yellow: #ffd60a;   /* Joueur 2 / IA */
--bg:     #0a0a12;   /* Fond */
--board:  #0f1a3a;   /* Plateau */
```

```javascript
// Changer les noms des joueurs
document.getElementById('label-r').textContent = 'Alice';
document.getElementById('label-y').textContent = 'Bob';
```

---

## 🌐 Compatibilité navigateurs

| Navigateur | Support |
|---|---|
| Chrome / Edge 90+ | ✅ Parfait |
| Firefox 88+ | ✅ Parfait |
| Safari 14+ | ✅ Parfait |
| Mobile Chrome/Safari | ✅ Parfait |
| IE 11 | ❌ Non supporté |

---

## 📄 Licence

Libre d'utilisation, modification et distribution.
