const puppeteer = require('puppeteer');
const fs = require('fs');

const TEAMS = [
    { id: 'river', url: 'https://www.transfermarkt.com/river-plate/kader/verein/209/saison_id/2025/plus/1' },
    { id: 'boca', url: 'https://www.transfermarkt.com/ca-boca-juniors/kader/verein/189/saison_id/2025/plus/1' },
    { id: 'racing', url: 'https://www.transfermarkt.com/racing-club/kader/verein/1444/saison_id/2025/plus/1' },
    { id: 'independiente', url: 'https://www.transfermarkt.com/ca-independiente/kader/verein/1234/saison_id/2025/plus/1' },
    { id: 'sanlorenzo', url: 'https://www.transfermarkt.com/san-lorenzo/kader/verein/1775/saison_id/2025/plus/1' },
    { id: 'velez', url: 'https://www.transfermarkt.com/velez-sarsfield/kader/verein/1032/saison_id/2025/plus/1' },
    { id: 'estudiantes', url: 'https://www.transfermarkt.com/estudiantes-de-la-plata/kader/verein/288/saison_id/2025/plus/1' },
    { id: 'talleres', url: 'https://www.transfermarkt.com/talleres-cordoba/kader/verein/3938/saison_id/2025/plus/1' },
    { id: 'lanus', url: 'https://www.transfermarkt.com/ca-lanus/kader/verein/333/saison_id/2025/plus/1' },
    { id: 'argentinos', url: 'https://www.transfermarkt.com/argentinos-juniors/kader/verein/1030/saison_id/2025/plus/1' },
    { id: 'huracan', url: 'https://www.transfermarkt.com/ca-huracan/kader/verein/2063/saison_id/2025/plus/1' },
    { id: 'central', url: 'https://www.transfermarkt.com/rosario-central/kader/verein/1418/saison_id/2025/plus/1' },
    { id: 'newells', url: 'https://www.transfermarkt.com/newells-old-boys/kader/verein/1286/saison_id/2025/plus/1' },
    { id: 'defensa', url: 'https://www.transfermarkt.com/defensa-y-justicia/kader/verein/2402/saison_id/2025/plus/1' },
    { id: 'colon', url: 'https://www.transfermarkt.com/club-atletico-colon/kader/verein/1070/saison_id/2025/plus/1' },
    { id: 'banfield', url: 'https://www.transfermarkt.com/ca-banfield/kader/verein/830/saison_id/2025/plus/1' },
    { id: 'belgrano', url: 'https://www.transfermarkt.com/club-atletico-belgrano/kader/verein/2417/saison_id/2025/plus/1' },
    { id: 'atletico', url: 'https://www.transfermarkt.com/club-atletico-tucuman/kader/verein/14554/saison_id/2025/plus/1' },
    { id: 'godoycruz', url: 'https://www.transfermarkt.com/cd-godoy-cruz-antonio-tomba/kader/verein/12574/saison_id/2025/plus/1' },
    { id: 'gimnasia', url: 'https://www.transfermarkt.com/club-de-gimnasia-y-esgrima-la-plata/kader/verein/1106/saison_id/2025/plus/1' },
    { id: 'union', url: 'https://www.transfermarkt.com/ca-union/kader/verein/7097/saison_id/2025/plus/1' },
    { id: 'platense', url: 'https://www.transfermarkt.com/club-atletico-platense/kader/verein/928/saison_id/2025/plus/1' },
    { id: 'tigre', url: 'https://www.transfermarkt.com/club-atletico-tigre/kader/verein/11831/saison_id/2025/plus/1' },
    { id: 'sarmiento', url: 'https://www.transfermarkt.com/ca-sarmiento-junin-/kader/verein/12454/saison_id/2025/plus/1' },
    { id: 'centralcordoba', url: 'https://www.transfermarkt.com/ca-central-cordoba-sde-/kader/verein/31284/saison_id/2025/plus/1' },
    { id: 'barracas', url: 'https://www.transfermarkt.com/ca-barracas-central/kader/verein/25184/saison_id/2025/plus/1' },
    { id: 'instituto', url: 'https://www.transfermarkt.com/instituto-acc/kader/verein/1829/saison_id/2025/plus/1' },
    { id: 'riestra', url: 'https://www.transfermarkt.com/club-deportivo-riestra/kader/verein/19775/saison_id/2025/plus/1' },
    { id: 'independienteriv', url: 'https://www.transfermarkt.com/cs-independiente-rivadavia/kader/verein/12179/saison_id/2025/plus/1' },
];

const extractPlayersScript = `
(() => {
    const players = [];
    const rows = document.querySelectorAll('table.items > tbody > tr');
    
    rows.forEach(row => {
        // NOMBRE
        const nameLink = row.querySelector('.hauptlink a');
        if (!nameLink) return;
        const name = nameLink.textContent.trim();
        
        // POSICIÓN
        let position = "";
        const inlineTable = row.querySelector('table.inline-table');
        if (inlineTable) {
            const trs = inlineTable.querySelectorAll('tr');
            if (trs.length > 1) position = trs[1].textContent.trim();
        }
        
        // NACIONALIDAD
        let nationality = "Argentina";
        const natImg = row.querySelector('img.flaggenrahmen');
        if (natImg) {
            nationality = natImg.getAttribute('title') || "Argentina";
        }
        
        // EDAD
        // Busca patrón "(xx)" en cualquier celda de la fila
        let age = 25;
        const cells = row.querySelectorAll('td');
        for (const cell of cells) {
            const text = cell.innerText; 
            // Transfermarkt formato: "Date (Age)" ej: "Jan 1, 2000 (24)"
            const match = text.match(/\\((\\d{2})\\)/); 
            if (match) {
                age = parseInt(match[1]);
                break;
            }
        }
        
        // VALOR
        let value = "";
        const mvCell = row.querySelector('td.rechts.hauptlink');
        if (mvCell) value = mvCell.textContent.trim();
        
        if (name && position) {
            players.push({ 
                name, 
                pos: position, 
                val: value || "-", 
                age: age,
                nat: nationality
            });
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
    console.log('=== Scraper LIGA ARGENTINA (Completo) ===\n');
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const allData = {};
    for (const team of TEAMS) {
        const result = await scrapeTeam(browser, team);
        allData[result.id] = result.players;
        await new Promise(r => setTimeout(r, 2000));
    }
    await browser.close();

    let jsOutput = '// LIGA ARGENTINA - Datos reales Enero 2026\n';
    jsOutput += 'export const argentinaSquads = {\n';
    for (const [teamId, players] of Object.entries(allData)) {
        jsOutput += `    ${teamId}: [\n`;
        players.forEach(p => {
            jsOutput += `        { name: "${p.name}", pos: "${p.pos}", val: "${p.val}", age: ${p.age}, nat: "${p.nat}" },\n`;
        });
        jsOutput += `    ],\n`;
    }
    jsOutput += '};\n';

    fs.writeFileSync('./src/data/leagues/argentina.js', jsOutput);
    console.log('\n✅ Datos guardados en src/data/leagues/argentina.js');
}

main().catch(console.error);
