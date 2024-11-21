function drawCamembert() {
    // function updateLegend() {
    //     document.getElementById("nb-win").textContent = gamesWin;
    //     document.getElementById("nb-loss").textContent = gamesLose;
    //     document.getElementById("nb-draw").textContent = gamesDraw;
    //     document.getElementById("nb-game").textContent = gamesWin + gamesLose + gamesDraw;
    // }

    // updateLegend();

    const gamesWin = 3;
    const gamesLose = 2;
    const gamesDraw = 1;

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

    const total = gamesWin + gamesLose + gamesDraw;
    const angles = {
        victoires: (gamesWin / total) * 360,
        defaites: (gamesLose / total) * 360,
        draw: (gamesDraw / total) * 360
    };

    const svg = document.getElementById('drawgraph');

    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    const colors = ['#27AE60', '#ee1e1e', '#ff7b00'];
    let startAngle = 0;
    let i = 0;

    for (const key in angles) {
        const endAngle = startAngle + angles[key];
        if (angles[key] == 360) {
            const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path1.setAttribute("d", describeArc(cx, cy, radius, 0, 180));
            path1.setAttribute("fill", colors[i]);
            svg.appendChild(path1);
            path2.setAttribute("d", describeArc(cx, cy, radius, 180, 360));
            path2.setAttribute("fill", colors[i]);
            svg.appendChild(path2);
        }
        else if (angles[key] != 0) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", describeArc(cx, cy, radius, startAngle, endAngle));
            path.setAttribute("fill", colors[i]);
            svg.appendChild(path);
        }
        startAngle = endAngle;
        i++;
    }
}

// document.addEventListener('DOMContentLoaded', function() {
//     if (window.location.pathname === "/stats/") {
//         drawCamembert();
//     }
// });