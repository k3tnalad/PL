import moment from 'moment';

// Sections
const standingsSection = document.querySelector('.standings_section');
const statsSection = document.querySelector('.statistics_section')
const fixturesSection = document.querySelector('.fixtures_section');

// fixture window 
const fixturesList = fixturesSection.querySelector('.fixtures .fixturesList');
const fixtureDataContainer = fixturesSection.querySelector('.fixtureDataContainer');

// fixture container inner elems
const fixtureHeader = fixtureDataContainer.querySelector('.header');
const fixtureTabsContainer = fixtureDataContainer.querySelector('.tabsContainer');
const fixtureMainWindow = fixtureDataContainer.querySelector('.main');

// inner elems of the header
const fixtureHeaderInners = [
    fixtureHeader.querySelector('.home'),
    fixtureHeader.querySelector('.score'),
    fixtureHeader.querySelector('.away'),
    fixtureHeader.querySelector('.gameWeek')
];


// fixture data tabs and contents
const fixtureDataTabs = fixtureTabsContainer.querySelectorAll("[data-tab-target]");
const tabsContent = fixtureMainWindow.querySelectorAll("[data-tab-content]");
const timelineTab = document.getElementById("timelineTab");
const lineupsTab = document.getElementById("lineupsTab");
const statsTab = document.getElementById("matchStatsTab");


const weekHeading = fixturesSection.querySelector('.weekHeadingContainer');
const navBtns = document.querySelectorAll('nav .tabs a');
const weekNavButtons = fixturesSection.querySelectorAll('.weekNavButton');


// let standingsData = JSON.parse(localStorage.getItem('standings')) || getStandings();
// let fixturesData = JSON.parse(localStorage.getItem('fixtures')) || getFixtures();
// let statsData = JSON.parse(localStorage.getItem('stats')) || getStats();

// let standingsData = getStandings();
// let fixturesData = getFixtures();
// let statsData = getStats();

async function getStandings() {
    if (localStorage.getItem('standings')) {
        standingPop(JSON.parse(localStorage.getItem('standings')));
    } else {
        const response = await fetch("https://api-football-v1.p.rapidapi.com/v2/leagueTable/2790", {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
                "x-rapidapi-key": "9b629c4000msh5f1e9f22f14de23p12cb4cjsn5860dd1d131a"
            }
        });
        const data = await response.json();
        localStorage.setItem('standings', JSON.stringify(data.api.standings[0]));
        standingPop(JSON.parse(localStorage.getItem('standings')));
    }
}

async function getFixtures() {
    if (localStorage.getItem(`fixtures`)) {
        fixturesPop(JSON.parse(localStorage.getItem(`fixtures`)));
    } else {
        const response = await fetch("https://api-football-v1.p.rapidapi.com/v2/fixtures/league/2790/last/10", {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
                "x-rapidapi-key": "9b629c4000msh5f1e9f22f14de23p12cb4cjsn5860dd1d131a"
            }
        });
        const data = await response.json();
        localStorage.setItem('fixtures', JSON.stringify(data.api.fixtures));
        fixturesPop(JSON.parse(localStorage.getItem(`fixtures`)));
    }
}

async function getFixturesByWeek(weekNum) {
    if (localStorage.getItem(`week${weekNum}`)) {
        fixturesPop(JSON.parse(localStorage.getItem(`week${weekNum}`)));
    } else {
        const response = await fetch(`https://api-football-v1.p.rapidapi.com/v2/fixtures/league/2790/Regular_Season_-_${weekNum}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
                "x-rapidapi-key": "9b629c4000msh5f1e9f22f14de23p12cb4cjsn5860dd1d131a"
            }
        });
        const data = await response.json();
        localStorage.setItem(`week${weekNum}`, JSON.stringify(data.api.fixtures));
        fixturesPop(JSON.parse(localStorage.getItem(`week${weekNum}`)));
        fixturesList.dispatchEvent('click');
    }
}

async function getStats() {
    if (localStorage.getItem('stats')) {
        statsPop(JSON.parse(localStorage.getItem('stats')));
    } else {
        const response = await fetch("https://api-football-v1.p.rapidapi.com/v2/topscorers/2790", {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
                "x-rapidapi-key": "9b629c4000msh5f1e9f22f14de23p12cb4cjsn5860dd1d131a"
            }
        });
        const data = await response.json();
        localStorage.setItem('stats', JSON.stringify(data.api.topscorers));
        statsPop(JSON.parse(localStorage.getItem('stats')));
    }   
}

async function getMatchData(matchId) {
    if (localStorage.getItem(`match${matchId}`)) {
        matchPop(JSON.parse(localStorage.getItem(`match${matchId}`)))
    } else {
        const response = await fetch(`https://api-football-v1.p.rapidapi.com/v2/fixtures/id/${matchId}`, {
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
                "x-rapidapi-key": "9b629c4000msh5f1e9f22f14de23p12cb4cjsn5860dd1d131a"
            }
        });
        const data = await response.json();
        localStorage.setItem(`match${matchId}`, JSON.stringify(data.api.fixtures[0]));
        return data.api.fixtures[0];
    }
}

async function matchPop(e) {
    // turning off the list of fixtures and displaying fixture data instead
    // by removing and adding a class to respective elements.
    fixturesList.classList.remove('is_visible');
    fixtureDataContainer.classList.add('is_visible');

    // ! TODO: turn weekHeading element into a back button
    weekHeading.innerHTML = `<a>Back</a>`;
    weekHeading.innerHTML === `<a>Back</a>` ? weekHeading.style.cursor = 'pointer' : weekHeading.style.cursor = 'default';

    // getting a fixtureID to find the match data that was selected.
    let matchID = e.currentTarget.dataset.id;
    
    // if there is no data for the match on the LS, it's gonna fetch it using the matchID.
    let matchBlob = JSON.parse(localStorage.getItem(`match${matchID}`)) || await getMatchData(matchID);
    // creating an object with necessary data from api.
    let matchObj = {
        homeTeam: matchBlob.homeTeam.team_name,
        awayTeam: matchBlob.awayTeam.team_name,
        score: matchBlob.score.fulltime,
        gameWeek: (matchBlob.round).slice(17),
        eventsArray: matchBlob.events,
        possession: [matchBlob.statistics["Ball Possession"]["home"], matchBlob.statistics["Ball Possession"]["away"]],
        shots: [matchBlob.statistics["Total Shots"]["home"], matchBlob.statistics["Total Shots"]["away"]],
    }
    
    // header data assignment
    fixtureHeaderInners[0].textContent = matchObj.homeTeam;
    fixtureHeaderInners[1].textContent = matchObj.score;
    fixtureHeaderInners[2].textContent = matchObj.awayTeam;
    fixtureHeaderInners[3].textContent = `Gameweek - ${matchObj.gameWeek}`;

    // TIMELINE DATA FILL
    const eventsHtml = matchObj.eventsArray.map(i => {
        return `
            <div className="event">
                <p className="elapsed">'${i.elapsed}</p>
                <p className="type">${eventTypeHandler(i.type)}</p>
                <p className="name">${i.player} - ${i.assist}</p>
            </div>
        `
    }).join('');
    timelineTab.innerHTML = eventsHtml;
}

const eventTypeHandler = (e) => {
    if (e == 'Goal') {
        return `<i class="fas fa-futbol"></i>`;
    } else if (e == 'subst') {
        return `<i class="fas fa-people-arrows"></i>`;
    } else if (e == 'Card') {
        return `<i class="fas fa-square"></i>`;
    }
}

function standingPop(standingsData) {
    let num = 0;
    let labels = `
    <div class="headings">
        <span>#</span>
        <span>Team</span>
        <span>Played</span>
        <span>Won</span>
        <span>Lost</span>
        <span>Drawn</span>
        <span>Points</span>
    </div>
    `;

    let html = standingsData.map(team => {
        num++;
        return `
            <div className="standing">
                <span class="num">${num}</span>
                <span class="name"><img src ="${team.logo}">${team.teamName}</span>
                <span class="played">${team.all.matchsPlayed}</span>
                <span class="won">${team.all.win}</span>
                <span class="lost">${team.all.lose}</span>
                <span class="draw">${team.all.draw}</span>
                <span class="points">${team.points}</span>
            </div>
        `;
    }).join('');

    return standingsSection.innerHTML = [labels, html].join('');
}


function fixturesPop(fixturesData) {
    let weekNumber = (fixturesData[0].round).slice(17);
    let weekElem = `
        <h3 class="gameweek">Gameweek: ${weekNumber}</h3>
    `;
    let html = fixturesData.map(fix => {
        return `
            <div className="match" data-week="${fix.round}" data-id="${fix.fixture_id}">
                <span className="home">${fix.homeTeam.team_name}<img src="${fix.homeTeam.logo}"></img></span>
                <span className="score"><p>${fix.score.fulltime || moment(fix.event_date).format('h:mm')}</p></span>
                <span className="away"><img src="${fix.awayTeam.logo}">${fix.awayTeam.team_name}</span>
                <div className="additional__info">
                    <p className="referee">Referee: ${fix.referee || "N/A"}</p>
                    <p className="venue">Venue: ${fix.venue || "N/A"}</p>
                    <p className="eventDate">${moment(fix.event_date).format('MMMM Do YYYY, h:mm')}</p>
                </div>
            </div>
        
        `;
    }).join('');
    fixturesList.innerHTML = html; 
    weekHeading.innerHTML = weekElem;
    [...fixturesList.children].forEach(child => child.addEventListener('click', (e) => matchPop(e))); 
}

function statsPop(statsData) {
    let logos = JSON.parse(localStorage.getItem('standings'));
    // const findLogo = (team) => {
    //     return logos.find(team => {
    //         if()
    //     })
    // }
    let labels = `
        <div className="headings">
            <span>Player</span>
            <span>Goals</span>
            <span>Mins played</span>
        </div>
    `;
    let html = statsData.map(scorer => {
        return `
            <div className="scorer">
                <span><img src="">${scorer.player_name}</span>
                <span className="goals">${scorer.goals.total}</span>
                <span className="minsPlayed">${scorer.games.minutes_played}</span>
            </div>
        `;
    }).join('');
    statsSection.innerHTML = [labels, html].join('');
}

const showElem = (elem) => {
    elem.classList.add('is_visible');
}

const hideElem = (elem) => {
    elem.classList.remove('is_visible');
}

function animateTabs(e) {
    let curElement;
    if (e.target.classList.contains("fixturesBtn")) {
        [standingsSection, statsSection].forEach(elem => hideElem(elem));
        showElem(fixturesSection);
    } else if (e.target.classList.contains("standingsBtn")) {
        [fixturesSection, statsSection].forEach(elem => hideElem(elem));
        showElem(standingsSection);
    } else if (e.target.classList.contains('statsBtn')) {
        [standingsSection, fixturesSection].forEach(elem => hideElem(elem));
        showElem(statsSection);
    }
}

function animateWeeks(e) {
    fixturesList.classList.add('skipped');
}

function weekHandler(e) {
    let currentWeek = [...fixturesList.children]
        .map(elem => parseInt(elem.dataset.week.slice(elem.dataset.week.length - 2)))
        .reduce((num, cur) => {
            if (cur == num) {
                return num;
            }
        });
    if((currentWeek - 1) == 0 && e.currentTarget.classList.contains('prevWeekNavCont')) {
        console.log(`That's the FIRST WEEK, YOU DUMB`);
        return;
    } else if (currentWeek !== 0 && e.currentTarget.classList.contains('prevWeekNavCont')) {
        fixturesPop(JSON.parse(localStorage.getItem(`week${currentWeek - 1}`)) || getFixturesByWeek(currentWeek - 1));
    } else if (currentWeek !== 0 && e.currentTarget.classList.contains('nextWeekNavCont')) {
        fixturesPop(JSON.parse(localStorage.getItem(`week${currentWeek + 1}`)) || getFixturesByWeek(currentWeek + 1));
    }
}


getFixtures();
getStandings();
getStats(); 

navBtns.forEach(btn => btn.addEventListener('click', e => animateTabs(e)));
weekNavButtons.forEach(btn => btn.addEventListener('click', e => weekHandler(e)));
weekNavButtons.forEach(btn => btn.addEventListener('click', () => fixturesList.classList.add('skipped')));
fixturesList.addEventListener('animationend', () => fixturesList.classList.remove('skipped'));
[...fixturesList.children].forEach(child => child.addEventListener('click', (e) => matchPop(e)));
weekHeading.addEventListener('click', (e) => {
    if(e.target.textContent == "Back") {
        fixtureDataContainer.classList.remove('is_visible');
        fixturesList.classList.add('is_visible');
        fixturesPop(JSON.parse(localStorage.getItem(`fixtures`)));
        [...fixturesList.children].forEach(child => child.addEventListener('click', (e) => matchPop(e)));
    }
});
fixtureDataTabs.forEach(t => t.addEventListener('click', () => {
    const target = document.querySelector(t.dataset.tabTarget);
    tabsContent.forEach(tc => tc.classList.remove('active'));
    target.classList.add('active');
}))