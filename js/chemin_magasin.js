function heuristic(a, b) {
    // Distance de Manhattan (peut être remplacée par la distance euclidienne)
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function trouverChemin(magasin, departX, departY, arriveeX, arriveeY) {
    const departCellule = magasin.getCellule(departX, departY);
    const arriveeCellule = magasin.getCellule(arriveeX, arriveeY);

    if (magasin.estObstacle(departCellule.x, departCellule.y) || magasin.estObstacle(arriveeCellule.x, arriveeCellule.y)) {
        console.log("Le point de départ ou d'arrivée est dans un obstacle.");
        return { chemin: null };
    }

    const openSet = [departCellule];
    const closedSet = new Set(); // Ensemble des nœuds explorés
    const cameFrom = new Map();
    const gScore = new Map();
    gScore.set(JSON.stringify(departCellule), 0);
    const fScore = new Map();
    fScore.set(JSON.stringify(departCellule), heuristic(departCellule, arriveeCellule));

    while (openSet.length > 0) {
        let current = openSet[0];
        for (let i = 1; i < openSet.length; i++) {
            if (fScore.get(JSON.stringify(openSet[i])) < fScore.get(JSON.stringify(current))) {
                current = openSet[i];
            }
        }

        if (current.x === arriveeCellule.x && current.y === arriveeCellule.y) {
            return { chemin: reconstruireChemin(cameFrom, current, magasin) };
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.add(JSON.stringify(current));

        const voisins = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];

        for (const voisin of voisins) {
            if (
                voisin.x >= 0 &&
                voisin.x < magasin.largeurGrille &&
                voisin.y >= 0 &&
                voisin.y < magasin.hauteurGrille &&
                !magasin.estObstacle(voisin.x, voisin.y) &&
                !closedSet.has(JSON.stringify(voisin)) // Ignorer les voisins déjà évalués
            ) {
                const tentativeGScore = gScore.get(JSON.stringify(current)) + 1;
                const voisinGScore = gScore.get(JSON.stringify(voisin)) === undefined ? Infinity : gScore.get(JSON.stringify(voisin));

                if (tentativeGScore < voisinGScore) {
                    cameFrom.set(JSON.stringify(voisin), current);
                    gScore.set(JSON.stringify(voisin), tentativeGScore);
                    fScore.set(JSON.stringify(voisin), tentativeGScore + heuristic(voisin, arriveeCellule));
                    if (!openSet.some(cell => cell.x === voisin.x && cell.y === voisin.y)) {
                        openSet.push(voisin);
                    }
                }
            }
        }
    }

    console.log("Aucun chemin trouvé.");
    return { chemin: null };
}

function reconstruireChemin(cameFrom, current, magasin) {
    const chemin = [current];
    while (cameFrom.has(JSON.stringify(current))) {
        current = cameFrom.get(JSON.stringify(current));
        chemin.unshift(current);
    }
    return chemin.map(cell => ({
        x: (cell.x + 0.5) * magasin.tailleCellule,
        y: (cell.y + 0.5) * magasin.tailleCellule
    }));
}