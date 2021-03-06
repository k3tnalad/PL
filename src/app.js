import moment from 'moment';
import { standingsSection, statsSection, fixturesList, 
         fixtureDataContainer, fixtureHeaderInners, fixtureDataTabs, tabsContent, timelineTab,
         lineupsTab, statsTab, navBtns, weekNavButtons, headingCont} from './elements';
import { eventTypeHandler, animateTabs, setGWHeader } from "./utils";

let currentGW = 6;

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
    let weekPromise = fetch(`${apiUrls.fixByWeek}${currentGW}`, apiUrls.inits);
    let statsPromise = fetch(apiUrls.stats, apiUrls.inits);
    // getting responses and data respectively
    const [tableResponse, weekResponse, statsResponse] = await Promise.all([tablePromise, weekPromise, statsPromise]);
    const [tableData, weekData, statsData] = await Promise.all([tableResponse.json(), weekResponse.json(), statsResponse.json()]);
    // storing data on the localStorage
    localStorage.setItem('table', JSON.stringify(tableData.api.standings[0]));
    localStorage.setItem(`week${currentGW}`, JSON.stringify(weekData.api.fixtures));
    localStorage.setItem('stats', JSON.stringify(statsData.api.topscorers));

}

if (localStorage.getItem('table')) {
    standingPop(JSON.parse(localStorage.getItem('table')));
    fixturesPop(JSON.parse(localStorage.getItem(`week${currentGW}`)));
    statsPop(JSON.parse(localStorage.getItem('stats')));
} else {
    fetchAllData();
}

standingPop(JSON.parse(localStorage.getItem('table')));
fixturesPop(JSON.parse(localStorage.getItem(`week${currentGW}`)));
statsPop(JSON.parse(localStorage.getItem('stats')));


const getFixturesByWeek = async (weekNum) => {
        let weekResponse = await fetch(`${apiUrls.fixByWeek}${weekNum}`, apiUrls.inits);
        let weekData = await weekResponse.json();
        localStorage.setItem(`week${weekNum}`, JSON.stringify(weekData.api.fixtures));
        return weekData.api.fixtures;
}

const getMatchData = async (matchId) => {
        const response = await fetch(`${apiUrls.match}${matchId}`, apiUrls.inits);
        const data = await response.json();
        localStorage.setItem(`match${matchId}`, JSON.stringify(data.api.fixtures[0]));
        return data.api.fixtures[0];
}

const matchPop = async (e) => {
    // turning off the list of fixtures and displaying fixture data instead
    // by removing and adding a class of respective elements.
    fixturesList.classList.remove('is_visible');
    fixtureDataContainer.classList.add('is_visible');

    // disabling week buttons
    weekNavButtons.forEach(btn => btn.style.display = 'none');

    setGWHeader(`<a data-back>Back to fixtures</a>`)
    
    // getting a fixtureID to find the match data that was selected.
    let matchID = e.currentTarget.dataset.id;
    
    // if there is no data for the match on the LS, it's gonna fetch it using the matchID.
    let matchBlob = JSON.parse(localStorage.getItem(`match${matchID}`)) || await getMatchData(matchID);
    
    // creating an object that will take specific data of the match.
    let matchObj;    
    
    // header data assignment
    fixtureHeaderInners[0].textContent = matchBlob.homeTeam.team_name;
    fixtureHeaderInners[1].textContent = matchBlob.score.fulltime || `n/a`;
    fixtureHeaderInners[2].textContent = matchBlob.awayTeam.team_name;
    fixtureHeaderInners[3].textContent = `Gameweek - ${(matchBlob.round).slice(17)}`;
    
    // if the match hasn't started yet
    if (matchBlob.statusShort === "NS") {
        timelineTab.innerHTML = `
            <h3 style="text-align:center">Match ig going to be played ${moment(matchBlob.event_timestamp).format('MMMM Do YYYY, h:mm')}</h3>
        `
    } else {
        matchObj = {
            homeTeam: matchBlob.homeTeam.team_name,
            awayTeam: matchBlob.awayTeam.team_name,
            score: matchBlob.score.fulltime,
            gameWeek: (matchBlob.round).slice(17),
            eventsArray: matchBlob.events,
            stats: matchBlob.statistics,
            shots: [matchBlob.statistics["Total Shots"]["home"], matchBlob.statistics["Total Shots"]["away"]],
            lineups: [matchBlob.lineups[matchBlob.homeTeam.team_name], matchBlob.lineups[matchBlob.awayTeam.team_name]],
        }

        let homeEvents = [], awayEvents = [];
        // filling the data of the timeline stuff
        matchObj.eventsArray.forEach(eve => {
            if(eve.teamName == matchObj.homeTeam) {
                homeEvents.push(eve);
            } else {
                awayEvents.push(eve);
            }
        });

        // html for timeline
        let eventsHtml = `
            <section class="homeEvents home">
                ${homeEvents.map(i => {
                    return `
                    <div className="homeEvent" data-type="${i.type}">
                        <p className="time">${i.elapsed}'</p>
                        <p className="player" ${i.type === "subst" ? `style="color:red"` : ''}>${i.player}</p>
                        <p className="type">${eventTypeHandler(i.type)}</p>
                        ${i.assist ? `<p className="assist" ${i.type === "subst" ? `style="color:green"` : ''}>${i.assist}</p>` : ''}
                    </div>
                    `
                }).join('')}
            </section>
            <section class="awayEvents away">
                ${awayEvents.map(i => {
                    return `
                    <div className="homeEvent" data-type="${i.type}">
                        <p className="time">${i.elapsed}'</p>
                        <p className="player" ${i.type === "subst" ? `style="color:red"` : ''}>${i.player}</p>
                        <p className="type">${eventTypeHandler(i.type)}</p>
                        ${i.assist ? `<p className="assist" ${i.type === "subst" ? `style="color:green"` : ''}>${i.assist}</p>` : ''}
                    </div>
                    `
                }
                ).join('')}
            </section>
        `;
        timelineTab.innerHTML = eventsHtml;

        // html for lineups
        let lineupsHTML =  `
                <section class="homeLineups home">
                        ${matchObj.lineups[0]["startXI"].map(plr => {
                            return `
                                <div className="player_cont">
                                    <p className="player">${plr.player}</p>
                                    <p className="number">${plr.number}</p>
                                </div>   
                            `;
                        }).join('')}
                </section>
                <section class="awayLineups away">
                    ${matchObj.lineups[1]["startXI"].map(plr => {
                        return `
                            <div className="player_cont">
                                <p className="player">${plr.player}</p>
                                <p className="number">${plr.number}</p>
                            </div>
                        `;
                    }).join('')}
                </section>
        `;
        lineupsTab.innerHTML = lineupsHTML;

        // html for stats
        let statsHTML = `
                    <div><span>${matchObj.stats["Ball Possession"].home}</span> <span>Possession</span> <span>${matchObj.stats["Ball Possession"].away}</span></div>
                    <div><span>${matchObj.stats["Total passes"].home}</span> <span>Passes Completed</span> <span>${matchObj.stats["Total passes"].away}</span></div>
                    <div><span>${matchObj.stats["Passes %"].home}</span> <span>Pass success</span> <span>${matchObj.stats["Passes %"].away}</span></div>
                    <div><span>${matchObj.stats["Total Shots"].home}</span> <span>Total Shots</span> <span>${matchObj.stats["Total Shots"].away}</span></div>
                    <div><span>${matchObj.stats["Shots on Goal"].home}</span> <span>On target</span> <span>${matchObj.stats["Shots on Goal"].away}</span></div>
                    <div><span>${matchObj.stats["Shots off Goal"].home}</span> <span>Off target</span> <span>${matchObj.stats["Shots off Goal"].away}</span></div>
                    <div><span>${matchObj.stats["Fouls"].home}</span> <span>Fouls</span> <span>${matchObj.stats["Fouls"].away}</span></div>
        `
        statsTab.innerHTML = statsHTML;
    }
}


function standingPop(standingsData) {
    let num = 0;
    let labels = `
    <div class="headings">
        <span>#</span>
        <span>Team</span>
        <span>P</span>
        <span>W</span>
        <span>L</span>
        <span>D</span>
        <span>Pts</span>
    </div>
    `;
    // console.log(standingsData);
    let html = standingsData.map(team => {
        num++;
        return `
            <div className="standing">
                <span class="num">${num}</span>
                <span class="name"><img src ="${team.logo}">${team.teamName.includes('chester') ? team.teamName.replace('chester', '.') : team.teamName}</span>
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


async function fixturesPop(fixturesData) {
    let fixtures = fixturesData;
    setGWHeader(currentGW);
    let html = fixtures.map(fix => {
        return `
            <div className="match" data-week="${Number((fix.round).slice(17))}" data-id="${fix.fixture_id}">
                <span className="home">${fix.homeTeam.team_name.includes('chester') ? fix.homeTeam.team_name.replace('chester', '.') : fix.homeTeam.team_name}<img src="${fix.homeTeam.logo}"></img></span>
                <span className="score"><p>${fix.score.fulltime || moment(fix.event_date).format('h:mm')}</p></span>
                <span className="away"><img src="${fix.awayTeam.logo}">${fix.awayTeam.team_name.includes('chester') ? fix.awayTeam.team_name.replace('chester', '.') : fix.awayTeam.team_name}</span>
                <div className="additional__info">
                        <p className="venue">${fix.venue || "N/A"}</p>
                        <p className="eventDate">${moment(fix.event_date).format('MMMM Do YYYY, h:mm')}</p>
                </div>
            </div>
        `;
    }).join('');
    fixturesList.innerHTML = html; 
    [...fixturesList.children].forEach(child => child.addEventListener('click', (e) => matchPop(e))); 
}



function statsPop(statsData) {
    let labels = `
        <div className="headings">
            <span>Player</span>
            <span>G<small>(p)</small></span>
            <span>As.</span>
            <span>Apps.</span>
            <span>Mins</span>
        </div>
    `;
    let html = statsData.map(scorer => {
        return `
            <div className="scorer">
                <span><img src="https://media.api-sports.io/football/teams/${scorer.team_id}.png" alt="club logo" className="logo"/><p>${scorer.firstname[0]}. ${scorer.lastname}</p></span>
                <span className="goals">${scorer.goals.total}<small> (${scorer.penalty.success})</small></span>
                <span className="assists">${scorer.goals.assists ? scorer.goals.assists : '0'}</span>
                <span className="apps">${scorer.games.appearences}</span>
                <span className="minsPlayed">${scorer.games.minutes_played}</span>
            </div>
        `;
    }).join('');
    statsSection.innerHTML = [labels, html].join('');
}

async function weekHandler(e) {
    // DONE
    // TODO: a notificaation that there is no week 0
    if (currentGW == 1 && e.currentTarget.classList.contains('prevWeekNavCont')){
        console.log(currentGW);
    } else if ((currentGW == 1 && e.currentTarget.classList.contains('nextWeekNavCont'))){
        currentGW = currentGW + 1;
        let dataToPop = JSON.parse(localStorage.getItem(`week${currentGW}`)) || await getFixturesByWeek(currentGW);
        fixturesPop(dataToPop);
    } else if (currentGW > 1 && e.currentTarget.classList.contains('nextWeekNavCont')) {
        currentGW = currentGW + 1;
        let dataToPop = JSON.parse(localStorage.getItem(`week${currentGW}`)) || await getFixturesByWeek(currentGW);
        fixturesPop(dataToPop);
    } else if ((currentGW > 1) && e.currentTarget.classList.contains('prevWeekNavCont')) {
        currentGW = currentGW - 1;
        let dataToPop = JSON.parse(localStorage.getItem(`week${currentGW}`)) || await getFixturesByWeek(currentGW);
        fixturesPop(dataToPop);
    } 
}





navBtns.forEach(btn => btn.addEventListener('click', e => animateTabs(e)));
weekNavButtons.forEach(btn => btn.addEventListener('click', e => weekHandler(e)));
weekNavButtons.forEach(btn => btn.addEventListener('click', () => fixturesList.classList.add('skipped')));
fixturesList.addEventListener('animationend', () => fixturesList.classList.remove('skipped'));
[...fixturesList.children].forEach(child => child.addEventListener('click', (e) => {
    matchPop(e);
}));
headingCont.addEventListener('click', (e) => {
    if(e.target.textContent == "Back to fixtures") {
        fixtureDataContainer.classList.remove('is_visible');
        fixturesList.classList.add('is_visible');
        setGWHeader(currentGW);
            weekNavButtons.forEach(btn => btn.style.display = 'grid');
        [...fixturesList.children].forEach(child => child.addEventListener('click', (e) => matchPop(e)));
    } else return;
});
fixtureDataTabs.forEach(t => t.addEventListener('click', () => {
    const target = document.querySelector(t.dataset.tabTarget);
    tabsContent.forEach(tc => tc.classList.remove('active'));
    target.classList.add('active');
}))
