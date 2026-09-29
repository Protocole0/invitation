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

yesBtn.addEventListener('click', function () {
    lancerCoeurs();
    noBtn.remove();
    carte.classList.add('fin');
    document.getElementById('titre').textContent = "J'ai hâte d'y être.";
    carte.querySelectorAll('p, .btn-container').forEach(function (el) { el.remove(); });
    carte.insertAdjacentHTML('beforeend',
        '<p>Ce soir-là, on laisse les soucis au pied de la roue.</p>' +
        '<p class="signature">Je te propose une date très vite, en message privé.</p>');

    // Le petit message taquin arrive après un moment de suspense
    setTimeout(function () {
        const taquin = document.createElement('p');
        taquin.className = 'taquin';
        taquin.textContent = "Je savais que tu dirais oui. Et sache que je compte bien profiter de l'instant où la cabine s'arrête tout en haut… 😏";
        carte.appendChild(taquin);
        lancerCoeurs();
    }, 3000);
});
