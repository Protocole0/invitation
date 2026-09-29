/* ---------- Ouverture de l'enveloppe ---------- */
const scene = document.getElementById('scene');
const enveloppe = document.getElementById('enveloppe');
const carte = document.getElementById('main-card');
const rabat = enveloppe.querySelector('.rabat');
let dejaOuverte = false;

function ouvrirEnveloppe() {
    if (dejaOuverte) return;
    dejaOuverte = true;
    document.getElementById('consigne').textContent = '';
    enveloppe.classList.add('ouvert');

    // Le rabat passe derrière la lettre quand il est à mi-course
    setTimeout(function () { rabat.style.zIndex = 1; }, 300);
    // L'enveloppe s'estompe, puis l'invitation apparaît
    setTimeout(function () { scene.classList.add('fondu'); }, 1900);
    setTimeout(function () {
        scene.hidden = true;
        carte.hidden = false;
    }, 2600);
}
document.getElementById('sceau').addEventListener('click', ouvrirEnveloppe);

/* ---------- Boutons OUI / NON ---------- */
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const hint = document.getElementById('hint');

const messages = [
    "Hé, il t'a échappé…",
    "Tu es sûre ? Pense aux lacquemants.",
    "Il est plus rapide que prévu, celui-là.",
    "Le grand OUI est juste là, tu sais.",
    "La vue d'en haut vaut vraiment le coup.",
    "Je crois qu'il ne veut pas être cliqué."
];
let tentatives = 0;

function flyAway(event) {
    if (event) event.preventDefault();
    tentatives++;
    yesBtn.style.transform = 'scale(' + Math.min(1 + tentatives * 0.08, 1.6) + ')';
    hint.textContent = messages[(tentatives - 1) % messages.length];

    const x = Math.random() * (window.innerWidth - noBtn.offsetWidth - 40) + 20;
    const y = Math.random() * (window.innerHeight - noBtn.offsetHeight - 40) + 20;
    noBtn.style.position = 'fixed';
    noBtn.style.right = 'auto';
    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
}
noBtn.addEventListener('pointerenter', flyAway);
noBtn.addEventListener('click', flyAway);
noBtn.addEventListener('focus', flyAway);

function lancerCoeurs() {
    if (typeof confetti !== 'function') return;
    try {
        const coeur = confetti.shapeFromPath({
            path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z'
        });
        confetti({
            particleCount: 90,
            spread: 90,
            origin: { y: 0.6 },
            shapes: [coeur],
            scalar: 1.6,
            colors: ['#f08fa4', '#e0577a', '#f3c77b', '#fdf0e6']
        });
    } catch (e) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
}

/* ---------- Choix de la date et de l'heure ---------- */
// Attention : dans un objet Date, les mois commencent à 0 (0 = janvier, 9 = octobre)
const DEBUT_FOIRE = new Date(2026, 9, 3);
const FIN_FOIRE = new Date(2026, 10, 11);
const HEURES = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

const formatCourt = new Intl.DateTimeFormat('fr-BE', { weekday: 'short', day: 'numeric', month: 'short' });
const formatLong = new Intl.DateTimeFormat('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' });

// Parcourt la foire jour par jour et ne garde que les samedis et dimanches
function joursDeWeekend() {
    const jours = [];
    const jour = new Date(DEBUT_FOIRE);
    while (jour <= FIN_FOIRE) {
        const numero = jour.getDay(); // 0 = dimanche, 6 = samedi
        if (numero === 0 || numero === 6) {
            jours.push(new Date(jour));
        }
        jour.setDate(jour.getDate() + 1);
    }
    return jours;
}

let dateChoisie = null;
let heureChoisie = null;

// Crée une rangée de boutons "pastilles" dont un seul peut être choisi
function creerPastilles(conteneur, valeurs, libelle, quandChoisi) {
    valeurs.forEach(function (valeur) {
        const bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'pastille';
        bouton.textContent = libelle(valeur);
        bouton.addEventListener('click', function () {
            conteneur.querySelectorAll('.pastille').forEach(function (p) { p.classList.remove('choisie'); });
            bouton.classList.add('choisie');
            quandChoisi(valeur);
        });
        conteneur.appendChild(bouton);
    });
}

function afficherChoix() {
    carte.insertAdjacentHTML('beforeend',
        '<p>Ce soir-là, on laisse les soucis au pied de la roue.</p>' +
        '<p class="signature">Choisis notre soirée.</p>' +
        '<div id="choix">' +
            '<p class="etape">Un samedi ou un dimanche, pendant la foire :</p>' +
            '<div class="grille" id="grille-jours"></div>' +
            '<div id="bloc-heures" hidden>' +
                '<p class="etape">À quelle heure ?</p>' +
                '<div class="grille" id="grille-heures"></div>' +
            '</div>' +
            '<button id="confirmer" class="bouton-principal" type="button" disabled>Confirmer</button>' +
        '</div>');

    const blocHeures = document.getElementById('bloc-heures');
    const confirmerBtn = document.getElementById('confirmer');

    function verifier() {
        confirmerBtn.disabled = !(dateChoisie && heureChoisie);
    }

    creerPastilles(document.getElementById('grille-jours'), joursDeWeekend(),
        function (jour) { return formatCourt.format(jour); },
        function (jour) { dateChoisie = jour; blocHeures.hidden = false; verifier(); });

    creerPastilles(document.getElementById('grille-heures'), HEURES,
        function (heure) { return heure.replace(':', 'h'); },
        function (heure) { heureChoisie = heure; verifier(); });

    confirmerBtn.addEventListener('click', confirmerChoix);
}

async function envoyerChoix(texte, bouton) {
    // Sur mobile : ouvre le menu de partage (WhatsApp, SMS, Messenger...)
    if (navigator.share) {
        try {
            await navigator.share({ text: texte });
            return;
        } catch (e) {
            if (e.name === 'AbortError') return; // elle a fermé le menu, on ne fait rien
        }
    }
    // Sinon : on copie le message pour qu'elle puisse le coller
    try {
        await navigator.clipboard.writeText(texte);
        bouton.textContent = 'Copié ! Colle-le dans notre conversation';
    } catch (e) {
        window.prompt('Copie ce message :', texte);
    }
}

function confirmerChoix() {
    const jourTexte = formatLong.format(dateChoisie);
    const heureTexte = heureChoisie.replace(':', 'h');
    const message = 'Je choisis le ' + jourTexte + ' à ' + heureTexte + ' pour la Foire de Liège ! 🎡';

    document.getElementById('titre').textContent = "C'est noté !";
    carte.querySelectorAll('p, #choix').forEach(function (el) { el.remove(); });
    carte.insertAdjacentHTML('beforeend',
        '<p>Rendez-vous le <strong>' + jourTexte + '</strong> à <strong>' + heureTexte + '</strong>, à la Foire de Liège.</p>' +
        '<p class="signature">Envoie-moi ton choix pour que je le note.</p>' +
        '<button id="envoyer" class="bouton-principal" type="button">Envoyer mon choix</button>');
    lancerCoeurs();

    const envoyerBtn = document.getElementById('envoyer');
    envoyerBtn.addEventListener('click', function () { envoyerChoix(message, envoyerBtn); });

    // Le petit message taquin arrive après un moment de suspense
    setTimeout(function () {
        const taquin = document.createElement('p');
        taquin.className = 'taquin';
        taquin.textContent = "Je savais que tu dirais oui. Et sache que je compte bien profiter de l'instant où la cabine s'arrête tout en haut… 😏";
        carte.appendChild(taquin);
        lancerCoeurs();
    }, 3000);
}

yesBtn.addEventListener('click', function () {
    lancerCoeurs();
    noBtn.remove();
    carte.classList.add('fin');
    document.getElementById('titre').textContent = "J'ai hâte d'y être.";
    carte.querySelectorAll('p, .btn-container').forEach(function (el) { el.remove(); });
    afficherChoix();
});
