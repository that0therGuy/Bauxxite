let storage = {}
let order = []
let n = 0
let isShiftHeld = false;
let activeObservers = [];

document.addEventListener('keydown', (e) => { if (e.key === 'Shift') isShiftHeld = true; });
document.addEventListener('keyup', (e) => { if (e.key === 'Shift') isShiftHeld = false; });

document.querySelector('.createbtn').addEventListener('click', async () => {
    const { value: game } = await Swal.fire({
        title: 'Just a Few Questions...',
        input: 'text',
        inputLabel: 'Game name',
        showCancelButton: true,
        confirmButtonText: 'Next →',
    });
    if (!game) return;

    const { value: key } = await Swal.fire({
        title: 'Add Game',
        input: 'text',
        inputLabel: 'Game key',
        showCancelButton: true,
        confirmButtonText: 'Add Game',
    });
    if (!key) return;

    updateStorage(game, key);
});
function updateStorage(game, key) {
    n++
    const gameKey = `game${n}`
    fetch(`https://api.rawg.io/api/games?key=089c2f7c18ca402fab3d1d7c63c27b91&search='${game}'`)
        .then(res => res.json())
        .then((data) => {
            storage[gameKey] = {
                game: game,
                key: key,
                actual_name: data.results[0].name,
                thumbnail: data.results[0].background_image,
                time: `Listing Date: ${new Date().getDate() }/${new Date().getMonth()+1}/${new Date().getFullYear()}`,
            }

            order.push(gameKey)

            gametoid(storage[gameKey].actual_name)
            updateGUI()
        })

}


async function gametoid(game) {
    const response = await fetch('https://steam-game-list-api.p.rapidapi.com/games', {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '4c94e7e4b3mshd849cd8814e0bfdp1cff26jsn3f95027dfe40',
            'x-rapidapi-host': 'steam-game-list-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    const apps = data.apps ?? data.games ?? data;
    const lower = game.toLowerCase();

    let match = apps.find(app => app.name.toLowerCase() === lower);


    if (!match) {
        match = apps.find(app => app.name.toLowerCase() === lower)
            ?? apps.find(app => lower.startsWith(app.name.toLowerCase()))
            ?? apps.find(app => app.name.toLowerCase().startsWith(lower));
    }

    return match ? match.appid : null;
}




function updateGUI() {
    writeFile()
    activeObservers.forEach(obs => obs.disconnect());
    activeObservers = [];
    document.querySelector('.lhs').innerHTML = '';

    for (let x of order) {
        if (!storage[x]) continue;




        const steamUrl = `https://store.steampowered.com/api/storesearch/?term=${storage[x].actual_name}&l=english&cc=US`;
        const url = `https://corsproxy.io/?url=${encodeURIComponent(steamUrl)}`;



        let ul = document.createElement('ul')
        ul.setAttribute('id', 'gamelist')

        let li_div = document.createElement('div')
        li_div.classList.add('li_div')
        li_div.setAttribute('id', `${x}`)

        let thumb = document.createElement('img')
        thumb.src = storage[x].thumbnail
        thumb.classList.add('thumb')

        let date = document.createElement('h6')
        date.innerText = storage[x].time
        date.classList.add('date')

        let li = document.createElement('li')
        li.classList.add('gameset')

        li.setAttribute('id', `${x}`)
        li.spellcheck = false
        let li_div_in= document.createElement('div')
        let li_div_p= document.createElement('p')
        li_div_in.appendChild(li_div_p)
        li.appendChild(li_div_in)
        li_div_p.innerText = storage[x].game
        li_div_in.classList.add('li_div_in')
        li_div_p.classList.add('li_div_p')
        li_div_p.contentEditable = 'true'
        li_div_p.contentEditable = 'true'

        li_div_p.addEventListener('blur', function () {
            storage[x].game = this.innerText.trim();
            writeFile();
        });
        let code_inp = document.createElement('input')
        code_inp.setAttribute('type', 'password')
        code_inp.setAttribute('value', storage[x].key)
        code_inp.classList.add('code_inp')


        code_inp.addEventListener('click', async function () {
            this.classList.toggle('password');
            if (this.classList.contains('password')) {
                this.type='password'
            }else{
                this.type='text'
            }
        })
        code_inp.click()
        let li_date = document.createElement('div')
        li_date.setAttribute('id', `li_date`)
        fetch(url)
            .then(res => res.json())
            .then(data => {
                let prices_div = document.createElement('div');

                let ggdealsdom = document.createElement('h6')
                ggdealsdom.style.display = 'none'
                ggdealsdom.classList.add('ggdealsdom')

                prices_div.appendChild(ggdealsdom)
                li_div_in.appendChild(prices_div)

                const searchName = storage[x].actual_name.toLowerCase();

                const bestMatch =
                    data.items.find(item => item.name.toLowerCase() === searchName) ??
                    data.items.find(item => item.name.toLowerCase().startsWith(searchName) && !item.name.toLowerCase().includes('remaster')) ??
                    data.items[0];

                const target2 = `https://api.gg.deals/v1/prices/by-steam-app-id/?ids=${bestMatch.id}&key=SiDijFD5OmudA7TaT0QxQrvvmPm8f24l&region=us`
                const url2 = `https://corsproxy.io/?url=${encodeURIComponent(target2)}`
                let steamid = bestMatch.id

                fetch(url2).then(res => res.json()).then((data) => {
                    let ggdealsphoto = document.createElement('img')
                    ggdealsphoto.src = 'gg.jpg'
                    ggdealsphoto.height = '24'
                    ggdealsphoto.width = '24'
                    ggdealsphoto.classList.add('ggdealsphoto')
                    prices_div.appendChild(ggdealsphoto)

                    let ggdeals_lowestprice = document.createElement('h6')
                    prices_div.appendChild(ggdeals_lowestprice)
                    prices_div.classList.add('prices_div')
                    ggdeals_lowestprice.classList.add('ggdealslowestprice')

                    ggdeals_lowestprice.innerText = `Lowest Keyshop Price: \$${data.data[steamid].prices.currentKeyshops}\nLowest Store Price: \$${data.data[steamid].prices.currentRetail}`;
                    console.log(data)
                    li_div_in.appendChild(code_inp)


                })
            })

        li_date.appendChild(li)
        li_date.appendChild(date)
        li_div.appendChild(li_date)

        li.appendChild(thumb)
        li.setAttribute('id', storage[x].key)




        ul.appendChild(li_div)

        const observer = new ResizeObserver(function (entries) {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                if (width < 20 && isShiftHeld) {
                    entry.target.style.display = 'none';
                    let realid = entry.target.id;
                    delete storage[realid];
                    order = order.filter(k => k !== realid)
                    updateGUI();
                }
            }
        });

        observer.observe(li_div);
        activeObservers.push(observer);

        document.querySelector('.lhs').appendChild(ul)
    }
}

const CLIENT_ID = '414207257758-fb2kfps0clr3qbamerpl7j1uji1cld9g.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
let tokenClient;

gapi.load('client', async () => {
    await gapi.client.init({
        apiKey: 'AIzaSyDscjJe2uAuv9bVmEZk_z5fD7xZVgTR2ws',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });

    const savedToken = localStorage.getItem('gtoken');
    const expiry = parseInt(localStorage.getItem('gtoken_expiry') || '0');

    if (savedToken && Date.now() < expiry - 60000) {
        gapi.auth.setToken({ access_token: savedToken });
        document.querySelector('.sign').style.display = 'none';
        document.querySelector('.obli').style.display = 'none';
        readFile();
    } else {
        tryAutoAuth();
    }
});

tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
        console.log('Access token:', response.access_token);

        const expiry = Date.now() + (response.expires_in * 1000);
        localStorage.setItem('gtoken', response.access_token);
        localStorage.setItem('gtoken_expiry', expiry);

        document.querySelector('.sign').style.display = 'none';
        document.querySelector('.obli').style.display = 'none';
        readFile();
    },
});

function getToken() {
    tokenClient.requestAccessToken();
}

async function listFiles() {
    const res = await gapi.client.drive.files.list({
        pageSize: 10,
        fields: 'files(id, name)',
    });
    console.log(res.result.files);
}

let savedFileId = null;

async function writeFile() {
    const content = JSON.stringify({ storage, order });
    const filename = 'bauxxite_do_not_modify.txt';

    if (!savedFileId) {
        const searchRes = await gapi.client.drive.files.list({
            q: `name='${filename}' and trashed=false`,
            fields: 'files(id, name)',
            pageSize: 1,
        });
        const files = searchRes.result.files;
        if (files && files.length > 0) {
            savedFileId = files[0].id;
        }
    }

    if (savedFileId) {
        await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${savedFileId}?uploadType=media`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${gapi.auth.getToken().access_token}`,
                    'Content-Type': 'text/plain',
                },
                body: content,
            }
        );
        console.log('Updated file ID:', savedFileId);
    } else {
        const metadata = { name: filename, mimeType: 'text/plain' };
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([content], { type: 'text/plain' }));

        const res = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${gapi.auth.getToken().access_token}` },
                body: form,
            }
        );
        const file = await res.json();
        savedFileId = file.id;
        console.log('Created file ID:', savedFileId);
    }
}
async function readFile() {
    const filename = 'bauxxite_do_not_modify.txt';

    if (!savedFileId) {
        const searchRes = await gapi.client.drive.files.list({
            q: `name='${filename}' and trashed=false`,
            fields: 'files(id, name)',
            pageSize: 1,
        });
        const files = searchRes.result.files;
        if (!files || files.length === 0) {
            console.log('No save file found, starting fresh.');
            return;
        }
        savedFileId = files[0].id;
    }

    const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${savedFileId}?alt=media`,
        {
            headers: { Authorization: `Bearer ${gapi.auth.getToken().access_token}` },
        }
    );

    if (!res.ok) {
        console.warn('Failed to fetch file:', res.status, res.statusText);
        return;
    }

    const text = await res.text();

    if (!text || text.trim() === '') {
        console.log('Save file is empty, starting fresh.');
        return;
    }

    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse save file:', e);
        return;
    }

    if (!parsed.storage || !parsed.order) {
        console.warn('Save file is in old format, migrating...');
        storage = parsed.storage ?? parsed;
        order = Object.keys(storage);
    } else {
        storage = parsed.storage;
        order = parsed.order;
    }

    const keys = Object.keys(storage);
    n = keys.length > 0
        ? Math.max(...keys.map(k => parseInt(k.replace('game', ''))))
        : 0;

    updateGUI();
}
function tryAutoAuth() {
    const silentClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        prompt: '',
        callback: (response) => {
            if (response.error || !response.access_token) {

                return;
            }
            const expiry = Date.now() + (response.expires_in * 1000);
            localStorage.setItem('gtoken', response.access_token);
            localStorage.setItem('gtoken_expiry', expiry);

            gapi.auth.setToken({ access_token: response.access_token });
            document.querySelector('.sign').style.display = 'none';
            document.querySelector('.obli').style.display = 'none';
            readFile();
        },
    });
}
document.querySelector('.bauxite').addEventListener('click', ()=>{
    document.querySelector('#xl').style.transform='rotate(360deg)'
    document.querySelector('#xr').style.transform='rotate(-360deg)'

});

let games={
    'half life 2':'324324',
    'gta 5':'453434',
}
function autoGame(){
    for(let key in games){
        updateStorage(key, games[key]);
    }
}

document.querySelector('.massbtn').addEventListener('click', async () => {
    const { value: listofgames } = await Swal.fire({
        title: 'Mass Add Games',
        input: 'textarea',
        inputLabel: 'Paste the games and their codes in any organized or unorganized format.',
        showCancelButton: true,
        confirmButtonText: 'Import',
        inputAttributes: { rows: 8 },
    });
    if (!listofgames) return;

    puter.ai.chat(`${listofgames}\n\n Format the given data into a JSON object like\n {
    'half life 2':'324324',
    'gta 5':'453434',
}
function autoGame(){
    for(let key in games){
        updateStorage(key, games[key]);
    }
}\n\n do not give anty other bullshit apart from the prescribed output. do not use any other (non-relevant) info from text either `, { model: "gpt-5.4-nano" })
        .then(response => {
            console.log(response.message.content)
            games = JSON.parse(response.message.content)
            autoGame();
        });
});

isimpmode=false;
document.querySelector('.impbtn').addEventListener('click', ()=>{
    isimpmode= !isimpmode

})
let bg=0
document.querySelector('.bg_change').addEventListener('click', ()=>{
    if (bg===4){
        bg=0
    }else{
        bg++
    }

    if (bg===0){
        document.body.style.backgroundImage='none'

    }
    if (bg===1){
        document.body.style.backgroundImage=`url(${bg}.png)`

    }
    if (bg===2){
        document.body.style.backgroundImage=`url(${bg}.png)`

    }
    if (bg===3){
        document.body.style.backgroundImage=`url(${bg}.png)`

    }
    if (bg===4){
        document.body.style.backgroundImage=`url(${bg}.png)`

    }
})
if (bg===0){
    document.body.style.backgroundImage='none'

}