const puppeteer = require('puppeteer');
const fs = require('fs');

const TEAMS = [
    { id: 'bayern', url: 'https://www.transfermarkt.com/fc-bayern-munchen/kader/verein/27/saison_id/2025/plus/1' },
    { id: 'leverkusen', url: 'https://www.transfermarkt.com/bayer-04-leverkusen/kader/verein/15/saison_id/2025/plus/1' },
    { id: 'dortmund', url: 'https://www.transfermarkt.com/borussia-dortmund/kader/verein/16/saison_id/2025/plus/1' },
    { id: 'leipzig', url: 'https://www.transfermarkt.com/rb-leipzig/kader/verein/23826/saison_id/2025/plus/1' },
    { id: 'stuttgart', url: 'https://www.transfermarkt.com/vfb-stuttgart/kader/verein/79/saison_id/2025/plus/1' },
    { id: 'frankfurt', url: 'https://www.transfermarkt.com/eintracht-frankfurt/kader/verein/24/saison_id/2025/plus/1' },
];

const extractPlayersScript = `
(() => {
    const players = [];
    const rows = document.querySelectorAll('table.items > tbody > tr');
    rows.forEach(row => {
        const nameLink = row.querySelector('.hauptlink a');
        if (!nameLink) return;
        const name = nameLink.textContent.trim();
        let position = "";
        const inlineTable = row.querySelector('table.inline-table');
        if (inlineTable) {
            const trs = inlineTable.querySelectorAll('tr');
            if (trs.length > 1) position = trs[1].textContent.trim();
        }

        let nationality = "Germany";
        const natImg = row.querySelector('img.flaggenrahmen');
        if (natImg) {
            nationality = natImg.getAttribute('title') || "Germany";
        }

        let age = 25;
        const cells = row.querySelectorAll('td');
        for (const cell of cells) {
            const match = cell.innerText.match(/\\((\\d{2})\\)/);
            if (match) {
                age = parseInt(match[1]);
                break;
            }
        }

        let value = "";
        const mvCell = row.querySelector('td.rechts.hauptlink');
        if (mvCell) value = mvCell.textContent.trim();
        if (name && position) players.push({ name, pos: position, val: value || "-", age: age, nat: nationality });
    });
    return players;
})();
`;

async function scrapeTeam(browser, team) {
    console.log(`Extrayendo ${team.id}...`);
    const page = await browser.newPage();
    try {
        await page.goto(team.url, { waitUntil: 'networkidle2', timeout: 45000 });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 2000));
        const players = await page.evaluate(extractPlayersScript);
        console.log(`  -> ${players.length} jugadores encontrados`);
        await page.close();
        return { id: team.id, players };
    } catch (error) {
        console.error(`  Error en ${team.id}:`, error.message);
        await page.close();
        return { id: team.id, players: [] };
    }
}

async function main() {
    console.log('=== Scraper BUNDESLIGA (Alemania) ===\n');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const allData = {};
    for (const team of TEAMS) {
        const result = await scrapeTeam(browser, team);
        allData[result.id] = result.players;
        await new Promise(r => setTimeout(r, 2000));
    }
    await browser.close();

    let jsOutput = '// BUNDESLIGA (Alemania) - Datos reales Enero 2026\n';
    jsOutput += 'export const germanySquads = {\n';
    for (const [teamId, players] of Object.entries(allData)) {
        jsOutput += `    ${teamId}: [\n`;
        players.forEach(p => {
            jsOutput += `        { name: "${p.name}", pos: "${p.pos}", val: "${p.val}", age: ${p.age}, nat: "${p.nat}" },\n`;
        });
        jsOutput += `    ],\n`;
    }
    jsOutput += '};\n';

    fs.writeFileSync('./src/data/leagues/germany.js', jsOutput);
    console.log('\n✅ Datos guardados en src/data/leagues/germany.js');
}

main().catch(console.error);
