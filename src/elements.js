// Main Sections
export const standingsSection = document.querySelector('.standings_section');
export const statsSection = document.querySelector('.statistics_section')
export const fixturesSection = document.querySelector('.fixtures_section');

// Fixture Section inner main sections 
export const fixturesList = fixturesSection.querySelector('.fixtures .fixturesList');
export const fixtureDataContainer = fixturesSection.querySelector('.fixtureDataContainer');

// fixture container inner elems
export const fixtureHeader = fixtureDataContainer.querySelector('.header');
export const fixtureTabsContainer = fixtureDataContainer.querySelector('.tabsContainer');
export const fixtureMainWindow = fixtureDataContainer.querySelector('.main');

// inner elems of the header
export const fixtureHeaderInners = [
    fixtureHeader.querySelector('.home'),
    fixtureHeader.querySelector('.score'),
    fixtureHeader.querySelector('.away'),
    fixtureHeader.querySelector('.gameWeek')
];


// fixture data tabs and contents
export const fixtureDataTabs = fixtureTabsContainer.querySelectorAll("[data-tab-target]");
export const tabsContent = fixtureMainWindow.querySelectorAll("[data-tab-content]");
export const timelineTab = document.getElementById("timelineTab");
export const lineupsTab = document.getElementById("lineupsTab");
export const statsTab = document.getElementById("matchStatsTab");

// other elements
export const headingCont = fixturesSection.querySelector(".weekHeadingContainer");
export const navBtns = document.querySelectorAll('nav .tabs a');
export const weekNavButtons = fixturesSection.querySelectorAll('.weekNavButton');

