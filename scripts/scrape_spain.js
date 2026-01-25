const puppeteer = require('puppeteer');
const fs = require('fs');

const TEAMS = [
    { id: 'realmadrid', url: 'https://www.transfermarkt.com/real-madrid/kader/verein/418/saison_id/2025/plus/1' },
    { id: 'barcelona', url: 'https://www.transfermarkt.com/fc-barcelona/kader/verein/131/saison_id/2025/plus/1' },
    { id: 'atletico', url: 'https://www.transfermarkt.com/atletico-madrid/kader/verein/13/saison_id/2025/plus/1' },
    { id: 'seville', url: 'https://www.transfermarkt.com/sevilla-fc/kader/verein/368/saison_id/2025/plus/1' },
    { id: 'betis', url: 'https://www.transfermarkt.com/real-betis-balompie/kader/verein/150/saison_id/2025/plus/1' },
    { id: 'realsociedad', url: 'https://www.transfermarkt.com/real-sociedad/kader/verein/681/saison_id/2025/plus/1' },
    { id: 'villarreal', url: 'https://www.transfermarkt.com/villarreal-cf/kader/verein/1050/saison_id/2025/plus/1' },
    { id: 'valencia', url: 'https://www.transfermarkt.com/valencia-cf/kader/verein/1049/saison_id/2025/plus/1' },
    { id: 'athletic', url: 'https://www.transfermarkt.com/athletic-bilbao/kader/verein/621/saison_id/2025/plus/1' },
    { id: 'girona', url: 'https://www.transfermarkt.com/girona-fc/kader/verein/12321/saison_id/2025/plus/1' }
];

const extractPlayersScript = `
(() => {
    const players = [];
    const rows = document.querySelectorAll('table.items > tbody > tr');
    
    rows.forEach(row => {
        const nameLink = row.querySelector('.hauptlink a');
        if (!nameLink) return;
        
        const name = nameLink.textContent.trim();
        
        // Posición
        let position = "";
        const inlineTable = row.querySelector('table.inline-table');
        if (inlineTable) {
            const trs = inlineTable.querySelectorAll('tr');
            if (trs.length > 1) {
                position = trs[1].textContent.trim();
            }
        }
        
        // Nacionalidad
        let nationality = "Spain";
        const natImg = row.querySelector('img.flaggenrahmen');
        if (natImg) {
            nationality = natImg.getAttribute('title') || "Spain";
        }
        
        // Edad
        let age = 25;
        const cells = row.querySelectorAll('td');
        for (const cell of cells) {
            const match = cell.innerText.match(/\\((\\d{2})\\)/);
            if (match) {
                age = parseInt(match[1]);
                break;
            }
        }
        
        // Valor de mercado
        let value = "";
        const mvCell = row.querySelector('td.rechts.hauptlink');
        if (mvCell) {
            value = mvCell.textContent.trim();
        }
        
        if (name && position) {
            players.push({ name, pos: position, val: value || "-", age: age, nat: nationality });
        }
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
    console.log('=== Scraper LA LIGA (España) ===\n');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const allData = {};
    for (const team of TEAMS) {
        const result = await scrapeTeam(browser, team);
        allData[result.id] = result.players;
        await new Promise(r => setTimeout(r, 2000));
    }
    await browser.close();

    // Generar archivo modular para esta liga
    let jsOutput = '// LIGA ESPAÑOLA (La Liga) - Datos reales Enero 2026\n';
    jsOutput += 'export const spainSquads = {\n';
    for (const [teamId, players] of Object.entries(allData)) {
        jsOutput += `    ${teamId}: [\n`;
        players.forEach(p => {
            jsOutput += `        { name: "${p.name}", pos: "${p.pos}", val: "${p.val}", age: ${p.age}, nat: "${p.nat}" },\n`;
        });
        jsOutput += `    ],\n`;
    }
    jsOutput += '};\n';

    fs.writeFileSync('./src/data/leagues/spain.js', jsOutput);
    console.log('\n✅ Datos guardados en src/data/leagues/spain.js');
}

main().catch(console.error);
