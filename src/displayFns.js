const displayThings = {
    fixturesPop(fixturesData) {
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
}