async function extractValueProfile(userId) {
    const csrfToken = getCookie('csrftoken');

    try {
        const profileResponse = await fetch(`/extractProfile/?user_id=${userId}`);

        if (!profileResponse.ok) {
            throw new Error(gettext('Failed to fetch profile data'));
        }

        const profileData = await profileResponse.json();

        return {
            gamesWin: profileData.profile.games_win,
            gamesLose: profileData.profile.games_lose,
            gamesDraw: profileData.profile.games_draw,
        };
    } catch (error) {
        console.error('Error:', error);
        return { gamesWin: 0, gamesLose: 0, gamesDraw: 0 };
    }
}

async function extractValueGame(userId) {
    const csrfToken = getCookie('csrftoken');

    try {
        const profileResponse = await fetch(`/extractGame/?user_id=${userId}`);

        if (!profileResponse.ok) {
            throw new Error(gettext('Failed to fetch profile data'));
        }

        const GameData = await profileResponse.json();

        return GameData;
    } catch (error) {
        return [];
    }
}

async function displayCardGame(userId) {
    const cardGameTemplate = document.getElementById("cardGameResume").content;
    const carouselInner = document.querySelector(".carousel-inner");
    const notFoundTemplate = document.getElementById("gameNotFound").content;
    const containerCardGameResume = document.getElementById("containerCardGameResume");

    const allGames = await extractValueGame(userId);

    function getChunkSize() {
        const width = window.innerWidth;
        if (width < 576) return 1;
        if (width < 768) return 2;
        if (width < 992) return 3;
        if (width < 1200) return 4;
        if (width < 1600) return 6;
        return 8;
    }

    function updateIndicators(chunkCount) {
        const indicatorsContainer = document.querySelector(".carousel-indicators");
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = "";
        
            for (let i = 0; i < chunkCount; i++) {
                const button = document.createElement("button");
                button.type = "button";
                button.setAttribute("data-bs-target", "#carouselExampleIndicators");
                button.setAttribute("data-bs-slide-to", i);
                button.setAttribute("aria-label", `Slide ${i + 1}`);
                if (i === 0) {
                    button.classList.add("active");
                    button.setAttribute("aria-current", "true");
                }
                indicatorsContainer.appendChild(button);
            }
        }
    }

    function chunkData(data, size) {
        const chunks = [];
        for (let i = 0; i < data.length; i += size) {
            chunks.push(data.slice(i, i + size));
        }
        return chunks;
    }

    function rebuildCarousel() {
        carouselInner.innerHTML = "";
        const chunkSize = getChunkSize();
        const gameChunks = chunkData(allGames, chunkSize);

        
        if (allGames.length === 0) {
            containerCardGameResume.innerHTML = "";
            containerCardGameResume.appendChild(notFoundTemplate.cloneNode(true));
            return;
        }
        updateIndicators(gameChunks.length);

        gameChunks.forEach((chunk, index) => {
            const carouselItem = document.createElement("div");
            carouselItem.classList.add("carousel-item");
            if (index === 0) carouselItem.classList.add("active");

            const cardContainer = document.createElement("div");
            cardContainer.classList.add("d-flex", "justify-content-around");

            chunk.forEach(game => {
                const cardClone = cardGameTemplate.cloneNode(true);
                const opponentElement = cardClone.querySelector("[data-opponent]");
                
                opponentElement.addEventListener("click", function() {
                    localStorage.setItem('opponentName', game.opponent);
                    localStorage.setItem('opponentId', game.opponentId);
                    loadStats();
                });
                
                cardClone.querySelector("[data-img-opponent]").src = game.avatar;
                cardClone.querySelector("[data-opponent]").textContent = game.opponent + " " + (game.winner ? '❌' : '🏆') || 'Unknown';
                // cardClone.querySelector("[data-winner]").textContent = game.winner ? 'win' : 'loose';
                cardClone.querySelector("[data-score]").textContent = `${game.player1_name} ${game.player1_score} - ${game.player2_score} ${game.player2_name}`;
                cardClone.querySelector("[data-winner]").textContent = "· " + game.user + " " + (game.winner ? '🏆' : '❌');
                cardClone.querySelector("[data-date]").textContent = game.date_played.split("T")[0] || 'Unknown Date';

                cardContainer.appendChild(cardClone);
            });
            
            carouselItem.appendChild(cardContainer);
            carouselInner.appendChild(carouselItem);
        });
    }
    rebuildCarousel();

    window.addEventListener("resize", () => {
        rebuildCarousel();
    });
}

async function drawCamembert(userId) {
    const { gamesWin, gamesLose, gamesDraw } = await extractValueProfile(userId);

    gWin = document.getElementById("nb-win");
    gLose = document.getElementById("nb-loss");
    gDraw = document.getElementById("nb-draw");
    nbGame = document.getElementById("nb-game");
    winRate = document.getElementById("win-rate");

    gWin.innerText = gamesWin;
    gLose.innerText = gamesLose;
    gDraw.innerText = gamesDraw;
    nbGame.innerText = gamesWin + gamesLose + gamesDraw;
    if (gamesLose == 0)
        winRate.innerText = gamesWin;
    else
        winRate.innerText = (gamesWin / gamesLose).toFixed(2);

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
        if (angles[key] == 360 || total == 0) {
            if (total == 0)
                colors[i] = '#909090';
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

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function func_stats() {
    let userId;
    const idUser = localStorage.getItem('opponentId');
    const nameUser = localStorage.getItem('opponentName');
    const displayName = document.getElementById("nameUserStats");

    if (idUser) {
        userId = idUser;
        displayName.style.display = "block";
        displayName.textContent = gettext(`Page de: ${nameUser}`);
    }
    else {
        try {
            const userResponse = await fetch('/GetUserId/');
            if (!userResponse.ok) {
                throw new Error(gettext('Failed to fetch user ID'));
            }
            const userData = await userResponse.json();
            userId = userData.user_id;
        } catch (error) {
            console.error('Error:', error);
        }
        displayName.style.display = "none";
    }
    displayCardGame(userId);
    drawCamembert(userId);
    localStorage.removeItem('opponentId');
    localStorage.removeItem('opponentName');
}