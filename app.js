import moment from 'moment';

const dataSection = document.querySelector('.data');
const refreshButton = document.querySelector('.refreshData');
const standingsSection = document.querySelector('.standings');
const statsSection = document.querySelector('.statistics')
const fixturesSection = document.querySelector('.fixtures_section');
const fixturesCont = document.querySelector('.fixtures_section .fixtures');
const navBtns = document.querySelectorAll('nav .tabs a');
const weekNavButtons = document.querySelectorAll('.fixtures_section .weekNavButton');


// let standingsData = JSON.parse(localStorage.getItem('standings')) || getStandings();
// let fixturesData = JSON.parse(localStorage.getItem('fixtures')) || getFixtures();
// let statsData = JSON.parse(localStorage.getItem('stats')) || getStats();

// let standingsData = getStandings();
// let fixturesData = getFixtures();
// let statsData = getStats();

async function getStandings() {
    const response = await fetch("https://api-football-v1.p.rapidapi.com/v2/leagueTable/2790", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": "9b629c4000msh5f1e9f22f14de23p12cb4cjsn5860dd1d131a"
        }
    });
    const data = await response.json();
    localStorage.setItem('standings', JSON.stringify(data.api.standings[0]));
    standingPop(data.api.standings[0]);
}

async function getFixtures() {
    const response = await fetch("https://api-football-v1.p.rapidapi.com/v2/fixtures/league/2790/last/10", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": "9b629c4000msh5f1e9f22f14de23p12cb4cjsn5860dd1d131a"
        }
    });
    const data = await response.json();
    localStorage.setItem('fixtures', JSON.stringify(data.api.fixtures));
    // console.log(data);
    fixturesPop(data.api.fixtures);
}

async function getFixturesByWeek(weekNum) {
    fixturesPop(JSON.parse(localStorage.getItem(`week${weekNum}`)));
    const response = await fetch(`https://api-football-v1.p.rapidapi.com/v2/fixtures/league/2790/Regular_Season_-_${weekNum}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": "9b629c4000msh5f1e9f22f14de23p12cb4cjsn5860dd1d131a"
        }
    });
    const data = await response.json();
    localStorage.setItem(`week${weekNum}`, JSON.stringify(data.api.fixtures));
}

async function getStats() {
    const response = await fetch("https://api-football-v1.p.rapidapi.com/v2/topscorers/2790", {
	    "method": "GET",
	    "headers": {
		    "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
		    "x-rapidapi-key": "9b629c4000msh5f1e9f22f14de23p12cb4cjsn5860dd1d131a"
	    }
    });
    const data = await response.json();
    localStorage.setItem('stats', JSON.stringify(data.api.topscorers));
    statsPop(data.api.topscorers);
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
    let weekNumber = fixturesData.find(fixture => fixture.round);
    let weekElem = `
        <div><h3>Gameweek: ${weekNumber}</h3></div>
    `;
    let html = fixturesData.map(fix => {
        return `
            <div className="match" data-week="${fix.round}">
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
    fixturesCont.innerHTML = [weekElem, html].join('');   
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

function highlightTab(e) {
    console.log(e.target);
}

function weekHandler(e) {
    let currentWeek = [...fixturesCont.children]
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
navBtns.forEach(btn => btn.addEventListener('click', e => highlightTab(e)));
weekNavButtons.forEach(btn => btn.addEventListener('click', e => weekHandler(e)));
