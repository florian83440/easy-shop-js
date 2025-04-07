class Rayon {
    constructor(nom, x, y, largeur, hauteur) {
        this.nom = nom;
        this.x = x;
        this.y = y;
        this.largeur = largeur;
        this.hauteur = hauteur;
    }

    dessiner(ctx, echelle) {
        ctx.fillStyle = '#808080'; // Gris pour les rayons
        ctx.fillRect(this.x * echelle, this.y * echelle, this.largeur * echelle, this.hauteur * echelle);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${12 * echelle}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.nom, (this.x + this.largeur / 2) * echelle, (this.y + this.hauteur / 2) * echelle + 4 * echelle);
    }

    estDansRayon(px, py) {
        return px >= this.x && px < this.x + this.largeur &&
            py >= this.y && py < this.y + this.hauteur;
    }
}

class Magasin {
    constructor(nom, largeurGrille, hauteurGrille) {
        this.nom = nom;
        this.rayons = [];
        this.largeurGrille = largeurGrille;
        this.hauteurGrille = hauteurGrille;
        this.tailleCellule = 10; // Taille d'une cellule de la grille
    }

    ajouterRayon(rayon) {

        this.rayons.push(rayon);
    }

    getCellule(x, y) {
        return {
            x: Math.floor(x / this.tailleCellule),
            y: Math.floor(y / this.tailleCellule)
        };
    }

    estObstacle(celluleX, celluleY) {
        const taille = this.tailleCellule;
        const x1 = celluleX * taille;
        const y1 = celluleY * taille;
        const x2 = x1 + taille;
        const y2 = y1 + taille;

        for (const rayon of this.rayons) {
            // Vérifier si l'un des coins de la cellule est dans le rayon
            if (rayon.estDansRayon(x1, y1) || rayon.estDansRayon(x2, y1) ||
                rayon.estDansRayon(x1, y2) || rayon.estDansRayon(x2, y2) ||
                // Vérifier si le centre de la cellule est dans le rayon (méthode actuelle)
                rayon.estDansRayon((x1 + x2) / 2, (y1 + y2) / 2)) {
                return true;
            }
        }
        return celluleX < 0 || celluleX >= this.largeurGrille || celluleY < 0 || celluleY >= this.hauteurGrille;
    }

}