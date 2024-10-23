function drawCamembert() {
    const data = {
        victoires: 8,
        defaites: 1,
        draw: 3
    };

    // Mettre à jour la légende avec les valeurs actuelles
    function updateLegend() {
        document.getElementById("nb-win").textContent = data.victoires;
        document.getElementById("nb-loss").textContent = data.defaites;
        document.getElementById("nb-draw").textContent = data.draw;
        document.getElementById("nb-game").textContent = data.victoires + data.defaites + data.draw;
    }

    updateLegend();

    // Fonction pour calculer les coordonnées polaires
    function polarToCartesian(cx, cy, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: cx + (radius * Math.cos(angleInRadians)),
            y: cy + (radius * Math.sin(angleInRadians))
        };
    }

    // Fonction pour décrire un arc dans le SVG
    function describeArc(cx, cy, radius, startAngle, endAngle) {
        const start = polarToCartesian(cx, cy, radius, startAngle);
        const end = polarToCartesian(cx, cy, radius, endAngle);
        const largeArcFlag = (endAngle - startAngle) <= 180 ? "0" : "1";

        return [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y,
            "L", cx, cy,
            "Z"
        ].join(" ");
    }

    const cx = 100;
    const cy = 100;
    const radius = 80;

    const total = data.victoires + data.defaites + data.draw;
    const angles = {
        victoires: (data.victoires / total) * 360,
        defaites: (data.defaites / total) * 360,
        draw: (data.draw / total) * 360
    };

    const svg = document.getElementById('drawgraph');

    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    const colors = ['#27AE60', '#ee1e1e', '#ff7b00'];
    let startAngle = 0;
    let i = 0;

    // Dessiner les secteurs du camembert
    for (const key in angles) {
        const endAngle = startAngle + angles[key];

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", describeArc(cx, cy, radius, startAngle, endAngle));
        path.setAttribute("fill", colors[i]);

        svg.appendChild(path);

        startAngle = endAngle;
        i++;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === "/stats/") {
        drawCamembert();
    }
});