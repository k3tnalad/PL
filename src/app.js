import moment from 'moment';
import { standingsSection, statsSection, fixturesSection, fixturesList, 
         fixtureDataContainer, fixtureHeader, fixtureTabsContainer, fixtureMainWindow,
         fixtureHeaderInners, fixtureDataTabs, tabsContent, timelineTab,
         lineupsTab, statsTab, weekHeading, navBtns, weekNavButtons} from './elements';
import { eventTypeHandler, animateTabs } from "./utils";

const apiUrls = {
    table: "https://api-football-v1.p.rapidapi.com/v2/leagueTable/2790",
    last10: "https://api-football-v1.p.rapidapi.com/v2/fixtures/league/2790/last/10",
    fixByWeek: `https://api-football-v1.p.rapidapi.com/v2/fixtures/league/2790/Regular_Season_-_`,
    stats: "https://api-football-v1.p.rapidapi.com/v2/topscorers/2790",
    match: "https://api-football-v1.p.rapidapi.com/v2/fixtures/id/",
    inits: {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": "9b629c4000msh5f1e9f22f14de23p12cb4cjsn5860dd1d131a"
        }
    }
}

const fetchAllData = async (weekNum) => {
    // immediate promises
    let tablePromise = fetch(apiUrls.table, apiUrls.inits);
    let last10Promise = fetch(apiUrls.last10, apiUrls.inits);
    let statsPromise = fetch(apiUrls.stats, apiUrls.inits);
    // getting responses and data respectively
    const [tableResponse, last10Response, statsResponse] = await Promise.all([tablePromise, last10Promise, statsPromise]);
    const [tableData, last10Data, statsData] = await Promise.all([tableResponse.json(), last10Response.json(), statsResponse.json()]);
    // storing data on the localStorage
    localStorage.setItem('table', JSON.stringify(tableData.api.standings[0]));
    localStorage.setItem('last10', JSON.stringify(last10Data.api.fixtures));
    localStorage.setItem('stats', JSON.stringify(statsData.api.topscorers));
}

// fetchAllData();


const getFixturesByWeek = async (weekNum) => {
        const response = await fetch(`${apiUrls.fixByWeek}${weekNum}`, apiUrls.inits);
        const data = await response.json();
        localStorage.setItem(`week${weekNum}`, JSON.stringify(data.api.fixtures));
        fixturesPop(JSON.parse(localStorage.getItem(`week${weekNum}`)));
}

const getMatchData = async (matchId) => {
        const response = await fetch(`${apiUrls.match}${matchId}`, apiUrls.inits);
        const data = await response.json();
        localStorage.setItem(`match${matchId}`, JSON.stringify(data.api.fixtures[0]));
        return data.api.fixtures[0];
}

const matchPop = async (e) => {
    // turning off the list of fixtures and displaying fixture data instead
    // by removing and adding a class to respective elements.
    fixturesList.classList.remove('is_visible');
    fixtureDataContainer.classList.add('is_visible');

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
    standingsSection.innerHTML = [labels, html].join('');
}


function fixturesPop(fixturesData) {
    console.log(fixturesData);
    let weekNumber = (fixturesData[0].round).slice(17);
    console.log(weekNumber);
    let weekElem = `
        <h3 class="gameweek">Gameweek: ${Number(weekNumber)}</h3>
    `;
    let html = fixturesData.map(fix => {
        return `
            <div className="match" data-week="${Number((fix.round).slice(17))}" data-id="${fix.fixture_id}">
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

function animateWeeks(e) {
    fixturesList.classList.add('skipped');
}

function weekHandler(e) {
    // ! BRING THE NUMBER OF THE WEEK IN A PROPER WAY HERE.
    console.log(fixturesList.firstChild.dataset.week);
    if((currentWeek - 1) == 0 && e.currentTarget.classList.contains('prevWeekNavCont')) {
        console.log(`That's the FIRST WEEK, YOU DUMB`);
        return;
    } else if (currentWeek !== 0 && e.currentTarget.classList.contains('prevWeekNavCont')) {
        fixturesPop(JSON.parse(localStorage.getItem(`week${currentWeek - 1}`)) || getFixturesByWeek(currentWeek - 1));
    } else if (currentWeek !== 0 && e.currentTarget.classList.contains('nextWeekNavCont')) {
        fixturesPop(JSON.parse(localStorage.getItem(`week${currentWeek + 1}`)) || getFixturesByWeek(currentWeek + 1));
    }
}

standingPop(JSON.parse(localStorage.getItem('table')));
fixturesPop(JSON.parse(localStorage.getItem('last10')));
statsPop(JSON.parse(localStorage.getItem('stats')));


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
