import { standingsSection, statsSection, fixturesSection, headingCont } from './elements';

export const eventTypeHandler = (e) => {
    if (e == 'Goal') {
        return `<i class="fas fa-futbol"></i>`;
    } else if (e == 'subst') {
        return `<i class="fas fa-people-arrows"></i>`;
    } else if (e == 'Card') {
        return `<i class="fas fa-square" style="color: yellow"></i>`;
    }
}

const showElem = (elem) => {
    elem.classList.add('is_visible');
}

const hideElem = (elem) => {
    elem.classList.remove('is_visible');
}

export const animateTabs = (e) => {
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


export const setGWHeader = (weekNum) => {
    if (Number.isInteger(weekNum)) {
        headingCont.innerHTML = `<p>Gameweek - ${weekNum}`; 
    } else {
        headingCont.innerHTML = `${weekNum}`;
    }

}