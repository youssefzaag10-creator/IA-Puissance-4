/* ═══════════════════════════════════════════════════════════
   PUISSANCE 4 — Logique de jeu & Intelligence Artificielle
   Auteur  : [Ton prénom]
   Fichier : game.js
   ═══════════════════════════════════════════════════════════ */

'use strict';


/* ════════════════════════════════════════════════════════════
   1. CONSTANTES
   ════════════════════════════════════════════════════════════ */

const ROWS  = 6;   // nombre de lignes de la grille
const COLS  = 7;   // nombre de colonnes de la grille

const EMPTY  = 0;  // case vide
const RED    = 1;  // joueur 1 (rouge)
const YELLOW = 2;  // joueur 2 / IA (jaune)


/* ════════════════════════════════════════════════════════════
   2. VARIABLES D'ÉTAT (état global du jeu)
   ════════════════════════════════════════════════════════════ */

let board;          // tableau 2D [ROWS][COLS] représentant la grille
let currentPlayer;  // RED ou YELLOW — indique à qui c'est le tour
let gameOver;       // true quand la partie est terminée
let mode;           // 'pvp' (1v1) ou 'ai' (contre robot)
let aiDepth;        // profondeur de recherche de l'IA (difficulté)
let aiThinking;     // true pendant que l'IA calcule son coup

let scores = { red: 0, yellow: 0 }; // compteur de victoires par session

aiDepth = 5; // difficulté par défaut : Normal


/* ════════════════════════════════════════════════════════════
   3. NAVIGATION ENTRE LES ÉCRANS
   ════════════════════════════════════════════════════════════ */

/**
 * Lance une partie dans le mode choisi.
 * @param {string} m - 'pvp' ou 'ai'
 */
function startGame(m) {
  mode = m;

  // Basculer les écrans
  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'flex';

  // Configurer les labels selon le mode
  document.getElementById('mode-label').textContent = m === 'pvp' ? '1 VS 1' : 'VS ROBOT';
  document.getElementById('label-r').textContent    = 'Joueur 1';
  document.getElementById('label-y').textContent    = m === 'pvp' ? 'Joueur 2' : 'Robot';

  // Afficher le sélecteur de difficulté uniquement en mode IA
  document.getElementById('difficulty-row').style.display = m === 'ai' ? 'block' : 'none';

  // Remettre les scores à zéro
  scores = { red: 0, yellow: 0 };
  updateScoreUI();

  newRound();
}

/** Retourne au menu principal et réinitialise tout. */
function goMenu() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('game').style.display  = 'none';
  document.getElementById('menu').style.display  = 'flex';
  scores = { red: 0, yellow: 0 };
}

/** Rejoue une nouvelle manche sans revenir au menu. */
function restartGame() {
  document.getElementById('overlay').classList.remove('show');
  newRound();
}

/**
 * Change la profondeur de calcul de l'IA.
 * @param {number} d - profondeur (3, 5, 7 ou 9)
 */
function setDiff(d) {
  aiDepth = d;
  // Mettre à jour visuellement le bouton actif
  [3, 5, 7, 9].forEach(v => {
    const el = document.getElementById('d' + v);
    if (el) el.classList.toggle('active', v === d);
  });
}


/* ════════════════════════════════════════════════════════════
   4. INITIALISATION D'UNE MANCHE
   ════════════════════════════════════════════════════════════ */

/** Remet la grille à zéro et démarre un nouveau tour. */
function newRound() {
  // Créer une grille vide (tableau 2D rempli de EMPTY)
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));

  currentPlayer = RED;   // le joueur 1 commence toujours
  gameOver      = false;
  aiThinking    = false;

  renderBoard();
  updateStatus();
  updateActiveScore();
}


/* ════════════════════════════════════════════════════════════
   5. RENDU VISUEL (affichage de la grille)
   ════════════════════════════════════════════════════════════ */

/**
 * Génère toutes les cases de la grille dans le DOM.
 * Appelée à chaque nouvelle manche.
 */
function renderBoard() {
  const grid  = document.getElementById('board-grid');
  const hover = document.getElementById('hover-row');
  grid.innerHTML  = '';
  hover.innerHTML = '';

  // --- Rangée de flèches (indicateurs de colonne) ---
  for (let c = 0; c < COLS; c++) {
    const hc    = document.createElement('div');
    hc.className = 'hover-cell';

    const arrow  = document.createElement('div');
    arrow.className = 'hover-arrow';
    arrow.id        = 'arrow-' + c;

    hc.appendChild(arrow);
    hover.appendChild(hc);
  }

  // --- Cases de la grille (6 lignes × 7 colonnes) ---
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id        = `c-${r}-${c}`;
      cell.role      = 'gridcell';
      cell.setAttribute('aria-label', `Colonne ${c + 1}, Ligne ${r + 1}`);

      // Colorier si la case n'est pas vide (ne devrait pas arriver au début, mais sécurité)
      if (board[r][c] === RED)    cell.classList.add('red');
      if (board[r][c] === YELLOW) cell.classList.add('yellow');

      // Événements souris
      cell.addEventListener('click',      () => handleClick(c));
      cell.addEventListener('mouseenter', () => showArrow(c));
      cell.addEventListener('mouseleave', () => hideArrow(c));

      grid.appendChild(cell);
    }
  }
}

/**
 * Affiche la flèche au-dessus de la colonne survolée.
 * @param {number} c - index de colonne
 */
function showArrow(c) {
  if (gameOver || aiThinking) return;
  const arrow = document.getElementById('arrow-' + c);
  if (!arrow) return;
  const color = currentPlayer === RED ? 'var(--red)' : 'var(--yellow)';
  arrow.style.cssText = `
    opacity: 1;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 11px solid ${color};
  `;
}

/**
 * Masque la flèche quand la souris quitte la colonne.
 * @param {number} c - index de colonne
 */
function hideArrow(c) {
  const arrow = document.getElementById('arrow-' + c);
  if (arrow) arrow.style.opacity = '0';
}

/**
 * Met à jour la couleur CSS d'une case individuelle.
 * @param {number} r - ligne
 * @param {number} c - colonne
 */
function refreshCell(r, c) {
  const cell = document.getElementById(`c-${r}-${c}`);
  if (!cell) return;
  cell.className = 'cell';
  if (board[r][c] === RED)    cell.classList.add('red');
  if (board[r][c] === YELLOW) cell.classList.add('yellow');
}

/**
 * Fait pulser les 4 cases gagnantes.
 * @param {Array} cells - tableau de [ligne, colonne]
 */
function highlightWin(cells) {
  cells.forEach(([r, c]) => {
    const el = document.getElementById(`c-${r}-${c}`);
    if (el) el.classList.add('win-flash');
  });
}


/* ════════════════════════════════════════════════════════════
   6. LOGIQUE DE JEU
   ════════════════════════════════════════════════════════════ */

/**
 * Appelée quand le joueur clique sur une colonne.
 * Bloque si c'est le tour de l'IA ou si la partie est finie.
 * @param {number} col - colonne cliquée
 */
function handleClick(col) {
  if (gameOver || aiThinking) return;
  if (mode === 'ai' && currentPlayer === YELLOW) return; // empêche de jouer pour l'IA
  playColumn(col);
}

/**
 * Place un jeton dans la colonne donnée, puis vérifie victoire/nul.
 * @param {number} col - colonne cible
 * @returns {boolean} - false si la colonne est pleine
 */
function playColumn(col) {
  const row = availableRow(board, col);
  if (row === -1) return false; // colonne pleine

  // Mettre à jour la grille logique
  board[row][col] = currentPlayer;

  // Mettre à jour l'affichage
  refreshCell(row, col);

  // Vérifier victoire
  const win = checkWin(board, row, col, currentPlayer);
  if (win) {
    endGame(currentPlayer, win);
    return true;
  }

  // Vérifier match nul
  if (isDraw(board)) {
    endGame(0);
    return true;
  }

  // Passer au joueur suivant
  currentPlayer = (currentPlayer === RED) ? YELLOW : RED;
  updateStatus();
  updateActiveScore();

  // Si c'est le tour de l'IA, déclencher son calcul
  if (mode === 'ai' && currentPlayer === YELLOW && !gameOver) {
    aiThinking = true;
    updateStatus(); // affiche "Le robot réfléchit..."
    setTimeout(aiMove, 40); // laisse le navigateur redessiner avant de calculer
  }

  return true;
}

/**
 * Trouve la première ligne disponible dans une colonne (gravité).
 * Parcourt de bas en haut.
 * @param {number[][]} b - grille
 * @param {number} col   - colonne
 * @returns {number} ligne disponible, ou -1 si colonne pleine
 */
function availableRow(b, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (b[r][col] === EMPTY) return r;
  }
  return -1;
}

/**
 * Vérifie si un joueur a aligné 4 jetons à partir de la case (row, col).
 * Teste les 4 directions : horizontal, vertical, diagonales.
 * @param {number[][]} b  - grille
 * @param {number} row    - ligne du dernier jeton posé
 * @param {number} col    - colonne du dernier jeton posé
 * @param {number} player - RED ou YELLOW
 * @returns {Array|null} liste des 4 cases gagnantes, ou null
 */
function checkWin(b, row, col, player) {
  // Directions : [horizontal, vertical, diag ↘, diag ↗]
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (const [dr, dc] of dirs) {
    const cells = [[row, col]]; // on part du jeton posé

    // Avancer dans la direction
    for (let i = 1; i < 4; i++) {
      const nr = row + dr * i;
      const nc = col + dc * i;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || b[nr][nc] !== player) break;
      cells.push([nr, nc]);
    }
    // Reculer dans la direction opposée
    for (let i = 1; i < 4; i++) {
      const nr = row - dr * i;
      const nc = col - dc * i;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || b[nr][nc] !== player) break;
      cells.push([nr, nc]);
    }

    if (cells.length >= 4) return cells; // alignement trouvé !
  }
  return null;
}

/**
 * Vérifie si la grille est pleine (match nul).
 * @param {number[][]} b - grille
 * @returns {boolean}
 */
function isDraw(b) {
  return b[0].every(v => v !== EMPTY);
}

/**
 * Termine la partie : met à jour les scores et affiche l'overlay.
 * @param {number} winner  - RED, YELLOW, ou 0 (nul)
 * @param {Array}  winCells - cases gagnantes (si victoire)
 */
function endGame(winner, winCells) {
  gameOver = true;

  if (winner === RED) {
    scores.red++;
    updateScoreUI();
    highlightWin(winCells);
    const msg = mode === 'pvp' ? 'Joueur 1 gagne !' : 'Vous gagnez !';
    setTimeout(() => showOverlay('🔴', msg, 'Bravo, 4 jetons alignés !'), 620);

  } else if (winner === YELLOW) {
    scores.yellow++;
    updateScoreUI();
    highlightWin(winCells);
    const msg = mode === 'pvp' ? 'Joueur 2 gagne !' : 'Le robot gagne !';
    const sub = mode === 'ai'  ? "L'IA vous a battu cette fois… Revanchez-vous !" : 'Bien joué, Joueur 2 !';
    setTimeout(() => showOverlay('🟡', msg, sub), 620);

  } else {
    setTimeout(() => showOverlay('🤝', 'Match nul !', 'La grille est pleine. Personne ne gagne.'), 400);
  }
}

/**
 * Affiche l'overlay de fin de partie.
 */
function showOverlay(icon, title, sub) {
  document.getElementById('ov-icon').textContent  = icon;
  document.getElementById('ov-title').textContent = title;
  document.getElementById('ov-sub').textContent   = sub;
  document.getElementById('overlay').classList.add('show');
}


/* ════════════════════════════════════════════════════════════
   7. MISE À JOUR DE L'INTERFACE (UI helpers)
   ════════════════════════════════════════════════════════════ */

/** Met à jour la barre de statut (tour en cours / IA réfléchit). */
function updateStatus() {
  const el = document.getElementById('status');

  if (aiThinking) {
    el.innerHTML = `
      <span class="dot" style="background:var(--yellow)"></span>
      Le robot réfléchit
      <span class="thinking-dots"><span>.</span><span>.</span><span>.</span></span>
    `;
    return;
  }

  const color = currentPlayer === RED ? 'var(--red)' : 'var(--yellow)';
  const name  = mode === 'pvp'
    ? (currentPlayer === RED ? 'Joueur 1' : 'Joueur 2')
    : (currentPlayer === RED ? 'Joueur 1' : 'Robot');

  el.innerHTML = `<span class="dot" style="background:${color}"></span>${name} joue`;
}

/** Surbrillance du score du joueur actif. */
function updateActiveScore() {
  document.getElementById('score-box-r').className =
    'score-box' + (currentPlayer === RED    ? ' active-red'    : '');
  document.getElementById('score-box-y').className =
    'score-box' + (currentPlayer === YELLOW ? ' active-yellow' : '');
}

/** Affiche les chiffres des scores dans le DOM. */
function updateScoreUI() {
  document.getElementById('score-r').textContent = scores.red;
  document.getElementById('score-y').textContent = scores.yellow;
}


/* ════════════════════════════════════════════════════════════
   8. INTELLIGENCE ARTIFICIELLE — MINIMAX + ÉLAGAGE ALPHA-BÊTA
   ════════════════════════════════════════════════════════════

   Principe :
   L'IA simule toutes les parties possibles jusqu'à une
   profondeur N, évalue chaque position finale avec un score,
   et choisit le coup qui maximise ses chances de gagner.

   L'élagage alpha-bêta coupe les branches qu'il est inutile
   d'explorer (celles qui ne peuvent pas changer le résultat),
   ce qui accélère énormément le calcul.

   L'IA joue toujours YELLOW.
   ════════════════════════════════════════════════════════════ */

/** Déclenche le coup de l'IA après le recalcul. */
function aiMove() {
  const col = bestMove(board, aiDepth);
  playColumn(col);
  aiThinking = false;
  if (!gameOver) updateStatus();
}

/**
 * Choisit la meilleure colonne pour l'IA.
 * Teste chaque colonne possible et garde celle au meilleur score.
 * @param {number[][]} b     - grille actuelle
 * @param {number}     depth - profondeur de recherche
 * @returns {number} index de la meilleure colonne
 */
function bestMove(b, depth) {
  let best    = -Infinity;
  let bestCol = 3; // préférer le centre en cas d'égalité

  // Ordre de test : centre d'abord, puis vers les bords
  for (const col of [3, 2, 4, 1, 5, 0, 6]) {
    const row = availableRow(b, col);
    if (row === -1) continue; // colonne pleine, on saute

    // Simuler le coup de l'IA
    const nb = clone(b);
    nb[row][col] = YELLOW;

    const score = minimax(nb, depth - 1, -Infinity, Infinity, false, row, col);

    if (score > best) {
      best    = score;
      bestCol = col;
    }
  }
  return bestCol;
}

/**
 * Algorithme Minimax avec élagage Alpha-Bêta.
 *
 * @param {number[][]} b          - grille simulée
 * @param {number}     depth      - profondeur restante
 * @param {number}     alpha      - meilleur score garanti pour MAX (IA)
 * @param {number}     beta       - meilleur score garanti pour MIN (joueur)
 * @param {boolean}    maximizing - true = tour de l'IA, false = tour du joueur
 * @param {number}     lastRow    - ligne du dernier coup joué
 * @param {number}     lastCol    - colonne du dernier coup joué
 * @returns {number} score de la position
 */
function minimax(b, depth, alpha, beta, maximizing, lastRow, lastCol) {
  // Quel joueur vient de jouer ?
  const lastPlayer = maximizing ? RED : YELLOW;

  // --- Conditions terminales ---
  if (checkWin(b, lastRow, lastCol, lastPlayer)) {
    // Un joueur a gagné : score très élevé, favorisant les victoires rapides
    return maximizing ? (-10000 - depth) : (10000 + depth);
  }
  if (isDraw(b) || depth === 0) {
    // Grille pleine ou profondeur atteinte : évaluation heuristique
    return evaluate(b);
  }

  // --- Tour de l'IA (maximise son score) ---
  if (maximizing) {
    let best = -Infinity;
    for (const col of [3, 2, 4, 1, 5, 0, 6]) {
      const row = availableRow(b, col);
      if (row === -1) continue;

      const nb = clone(b);
      nb[row][col] = YELLOW;
      best = Math.max(best, minimax(nb, depth - 1, alpha, beta, false, row, col));

      alpha = Math.max(alpha, best);
      if (beta <= alpha) break; // ✂️ élagage bêta — inutile d'aller plus loin
    }
    return best;

  // --- Tour du joueur (minimise le score de l'IA) ---
  } else {
    let best = Infinity;
    for (const col of [3, 2, 4, 1, 5, 0, 6]) {
      const row = availableRow(b, col);
      if (row === -1) continue;

      const nb = clone(b);
      nb[row][col] = RED;
      best = Math.min(best, minimax(nb, depth - 1, alpha, beta, true, row, col));

      beta = Math.min(beta, best);
      if (beta <= alpha) break; // ✂️ élagage alpha — inutile d'aller plus loin
    }
    return best;
  }
}

/**
 * Évalue la qualité d'une position pour l'IA (sans victoire claire).
 * Plus le score est élevé, plus la position est favorable à l'IA (YELLOW).
 * @param {number[][]} b - grille à évaluer
 * @returns {number} score heuristique
 */
function evaluate(b) {
  let score = 0;

  // Bonus pour les jetons au centre (la colonne centrale est stratégiquement forte)
  for (let r = 0; r < ROWS; r++) {
    if (b[r][3] === YELLOW) score += 3;
    else if (b[r][3] === RED) score -= 3;
  }

  // Évaluer toutes les "fenêtres" de 4 cases consécutives
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        const w = [];
        for (let i = 0; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            w.push(b[nr][nc]);
          }
        }
        if (w.length === 4) score += scoreWindow(w);
      }
    }
  }

  return score;
}

/**
 * Attribue un score à une fenêtre de 4 cases.
 * @param {number[]} w - tableau de 4 valeurs (EMPTY, RED ou YELLOW)
 * @returns {number} score partiel
 */
function scoreWindow(w) {
  const y = w.filter(x => x === YELLOW).length; // jetons IA
  const r = w.filter(x => x === RED).length;    // jetons joueur
  const e = w.filter(x => x === EMPTY).length;  // cases vides

  if (y === 4)            return  100; // l'IA gagne avec cette fenêtre
  if (y === 3 && e === 1) return    5; // menace forte de l'IA
  if (y === 2 && e === 2) return    2; // début de menace
  if (r === 3 && e === 1) return   -4; // bloquer le joueur en danger
  if (r === 4)            return -100; // le joueur gagne
  return 0;
}

/**
 * Crée une copie indépendante de la grille (pour la simulation).
 * @param {number[][]} b - grille originale
 * @returns {number[][]} copie profonde
 */
function clone(b) {
  return b.map(row => row.slice());
}


/* ════════════════════════════════════════════════════════════
   9. SUPPORT CLAVIER
   Touches 1–7 pour jouer dans la colonne correspondante.
   ════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (gameOver || aiThinking) return;
  if (document.getElementById('game').style.display === 'none') return;

  const n = parseInt(e.key);
  if (n >= 1 && n <= 7) handleClick(n - 1); // touche 1 → colonne 0, etc.
});
