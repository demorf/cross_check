


async function loadPlayerAlgos(playerId){
  const fetched = await fetch(`https://terminal.c1games.com/api/game/user/${playerId}/algos?team=false`)
  if (fetched.status != 200) return alert('failed to retrieve user data')
  const response = await fetched.json()
//  console.log(response)
  const algos = response.data.algos
  if (algos.length < 1) return alert('no matches found')

  enemies = {}
  for (const algo of algos) {
//  algos.forEach((algo, index) => {
    algoId = algo.id
    const fetched = await fetch(`https://terminal.c1games.com/api/game/algo/${algoId}/matches`)
    if (fetched.status != 200)
        return alert('failed to retrieve algo data')
    const response = await fetched.json()
    const matches = response.data.matches.reverse()
    if (matches.length < 1)
        return alert('no matches found')

    matches.forEach((match, index) => {
        match.result = match.winning_algo.id == algoId ? "W" : "L";
        match.enemy_algo = match.winning_algo.id == algoId ? match.losing_algo : match.winning_algo;
        match.my_algo = match.winning_algo.id == algoId ? match.winning_algo : match.losing_algo;

        if (!(match.enemy_algo.id in enemies)){
            enemies[match.enemy_algo.id] = {'player':{}, 'algo':match.enemy_algo, 'matches':[]}
        }
        enemies[match.enemy_algo.id]['matches'].push({'match_id': match.id, 'my_algo':match.my_algo.id,  'enemy_algo_id': match.enemy_algo.id, 'result': match.result} )
    })
  }
  printTable(enemies, algos);
}

async function printTable(enemies, algos){
    // Find a <table> element with id="myTable":
    var table = document.getElementById("table");
    var header = table.createTHead();
    var row = header.insertRow();
    hcell1 =row.insertCell();
    hcell1.innerHTML = 'Algo ID'; // try to fetch the Player name/id/link ... or at least the top10 or something
    hcell2 =row.insertCell();
    hcell2.innerHTML = 'Algo';
    hcell3 =row.insertCell();
    hcell3.innerHTML = 'Rating';
    for(algo of algos){
        var cell = row.insertCell().innerHTML = algo.name
    }

    enemies_arr = Object.values(enemies)
    enemies_arr.sort(function(a, b){
        return a.algo.rating > b.algo.rating ? -1 : ( a.algo.rating < b.algo.rating ? 1 : 0 );
    });

    for (enemy of enemies_arr) {
        interesting_row = false
        for(match of enemy.matches){
            if(match.result == "L"){
                interesting_row = true
            }
        }

        if (interesting_row){
            var row = table.insertRow();
            cell1 = row.insertCell()
            cell1.innerHTML = enemy.algo.id;
            cell2 = row.insertCell().innerHTML = enemy.algo.name;
            cell2.innerHTML = enemy.algo.name;
            cell3 = row.insertCell().innerHTML = enemy.algo.rating;
            cell3.innerHTML = enemy.algo.rating;
            for(algo of algos){
                cell = row.insertCell();
                for (match of enemy.matches){
                    if ( match.my_algo == algo.id){
//                        cell.innerHTML = match.result;
                        cell.innerHTML = "<a href=https://felixrichter2000.github.io/watch?id="+ match.match_id +" target='_blank'>"+ match.result +"</a>";
                    }
                }
            }
        }
    }
}


window.onload = () => {
//  document.getElementById('find').onclick = () => window.location.search = `?id=${document.getElementById('algo-id').value}`
//  document.getElementById('update').onclick = () => plot()

    const algoId = window.location.search.split('?id=')[1];
    if (typeof(algoId) == "undefined"){
        document.getElementById('player_form').style.display = "";
    }else{
        loadPlayerAlgos(algoId);
    }

}