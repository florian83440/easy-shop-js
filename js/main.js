// Configuration du canvas
const canvas = document.getElementById('magasinCanvas');
const ctx = canvas.getContext('2d');
const canvasLargeur = 500;
const canvasHauteur = 500;
canvas.width = canvasLargeur;
canvas.height = canvasHauteur;

const intermediatePointsList = document.getElementById('intermediatePointsList');
const calculatePathBtn = document.getElementById('calculatePathBtn');

// Création du magasin et des rayons
const magasinGrilleLargeur = canvasLargeur / 10;
const magasinGrilleHauteur = canvasHauteur / 10;
const monMagasin = new Magasin("Mon Super Magasin", magasinGrilleLargeur, magasinGrilleHauteur);

// Declare 'chemin'
let chemin = null;

// Rayons
monMagasin.ajouterRayon(new Rayon("Paniers", 120, 100, 80, 30));
monMagasin.ajouterRayon(new Rayon("Fruits & Légumes", 50, 150, 120, 80));
monMagasin.ajouterRayon(new Rayon("Boulangerie", 130, 400, 120, 80));
monMagasin.ajouterRayon(new Rayon("Produits Frais", 330, 120, 150, 80));
monMagasin.ajouterRayon(new Rayon("Conserves", 50, 250, 80, 150));
monMagasin.ajouterRayon(new Rayon("Boissons", 250, 250, 80, 150));
monMagasin.ajouterRayon(new Rayon("Hygiène & Beauté", 380, 250, 100, 150));

// Points de départ et d'arrivée initiaux
let departX = 20;
let departY = 100;
let arriveeX = 20;
let arriveeY = 450;
const intermediatePoints = [];
let targetPoint = 'depart'; // 'depart', 'arrivee', 'intermediate'

// Mettre à jour la cible du clic
document.querySelectorAll('input[name="targetPoint"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
        targetPoint = event.target.value;
    });
});

// Fonction pour vérifier si un point est dans un rayon
function estDansUnRayon(x, y) {
    for (const rayon of monMagasin.rayons) {
        if (x >= rayon.x && x < rayon.x + rayon.largeur &&
            y >= rayon.y && y < rayon.y + rayon.hauteur) {
            return true;
        }
    }
    return false;
}

// Gestion du clic sur le canvas
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (!estDansUnRayon(clickX, clickY)) {
        if (targetPoint === 'intermediate') {
            intermediatePoints.push({ x: clickX, y: clickY });
            updateIntermediatePointsList();
            recalculerEtDessinerChemin(); // Afficher les points intermédiaires
        }
    }
});

function updateIntermediatePointsList() {
    intermediatePointsList.innerHTML = '<h3>Points Intermédiaires:</h3>';
    intermediatePoints.forEach((point, index) => {
        const pointDiv = document.createElement('div');
        pointDiv.textContent = `Point ${index + 1}: (${point.x.toFixed(0)}, ${point.y.toFixed(0)}) `;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Supprimer';
        removeButton.addEventListener('click', () => {
            intermediatePoints.splice(index, 1);
            updateIntermediatePointsList();
            recalculerEtDessinerChemin();
        });
        pointDiv.appendChild(removeButton);
        intermediatePointsList.appendChild(pointDiv);
    });
}

function trouverCheminSequence(points) {
    if (points.length < 2) {
        return { totalDistance: 0, path: [] };
    }

    let bestPath = null;
    let shortestDistance = Infinity;

    function calculateDistance(path) {
        let totalDistance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const result = trouverChemin(monMagasin, path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
            if (!result.chemin) {
                return Infinity; // Impossible de trouver un chemin entre deux points
            }
            totalDistance += result.chemin.length; // Simple approximation de la distance
        }
        return totalDistance;
    }

    function permute(arr, l, r) {
        if (l === r) {
            const currentPath = [ { x: departX, y: departY }, ...arr, { x: arriveeX, y: arriveeY } ];
            const distance = calculateDistance(currentPath);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                bestPath = currentPath;
            }
        } else {
            for (let i = l; i <= r; i++) {
                [arr[l], arr[i]] = [arr[i], arr[l]];
                permute(arr, l + 1, r);
                [arr[l], arr[i]] = [arr[i], arr[l]]; // backtrack
            }
        }
    }

    permute([...points], 0, points.length - 1);
    return { totalDistance: shortestDistance, path: bestPath };
}

calculatePathBtn.addEventListener('click', () => {
    const pointsToVisit = [...intermediatePoints];
    const result = trouverCheminSequence(pointsToVisit);

    if (result.path) {
        finalPath = [];
        for (let i = 0; i < result.path.length - 1; i++) {
            const segmentResult = trouverChemin(monMagasin, result.path[i].x, result.path[i].y, result.path[i + 1].x, result.path[i + 1].y);
            if (segmentResult.chemin) {
                if (i > 0) {
                    finalPath = finalPath.concat(segmentResult.chemin.slice(1)); // Avoid duplicate start points
                } else {
                    finalPath = finalPath.concat(segmentResult.chemin);
                }
            } else {
                console.error("Impossible de trouver un chemin entre deux points de la séquence.");
                finalPath = null;
                break;
            }
        }
        chemin = finalPath;
    } else {
        chemin = null;
        console.log("Aucun chemin trouvé passant par tous les points.");
    }
    recalculerEtDessinerChemin();
});

function recalculerEtDessinerChemin() {
    ctx.clearRect(0, 0, canvasLargeur, canvasHauteur);

    // Dessiner les rayons
    const echelle = Math.min(canvasLargeur / 500, canvasHauteur / 300);
    monMagasin.rayons.forEach(rayon => rayon.dessiner(ctx, echelle));

    // Dessiner les nœuds explorés (pour le dernier segment uniquement pour la clarté)
    ctx.fillStyle = 'orange';
    if (chemin) {
        const lastSegmentResult = trouverChemin(monMagasin, departX, departY, arriveeX, arriveeY); // Recalculate last explored for viz
        if (lastSegmentResult && lastSegmentResult.explored) {
            for (const node of lastSegmentResult.explored) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Dessiner le point de départ
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(departX, departY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Dessiner le point d'arrivée
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(arriveeX, arriveeY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Dessiner les points intermédiaires
    ctx.fillStyle = 'purple';
    intermediatePoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Dessiner le chemin final
    if (chemin && chemin.length > 0) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(departX, departY);
        for (const point of chemin) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(arriveeX, arriveeY);
        ctx.stroke();
    } else if (intermediatePoints.length > 0) {
        // Afficher des segments si le chemin complet n'est pas calculé
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(departX, departY);
        intermediatePoints.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.lineTo(arriveeX, arriveeY);
        ctx.stroke();
    }

}

// Fonction pour dessiner le magasin et le chemin
function dessinerMagasinEtChemin() {
    ctx.clearRect(0, 0, canvasLargeur, canvasHauteur);

    // Dessiner les rayons
    const echelle = Math.min(canvasLargeur / 500, canvasHauteur / 300);
    monMagasin.rayons.forEach(rayon => rayon.dessiner(ctx, echelle));

    // Dessiner le point de départ
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(departX, departY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Dessiner le point d'arrivée
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(arriveeX, arriveeY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Dessiner le chemin final
    if (chemin) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(departX, departY);
        for (const point of chemin) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineTo(arriveeX, arriveeY);
        ctx.stroke();
    }
}

// Dessin initial
dessinerMagasinEtChemin();