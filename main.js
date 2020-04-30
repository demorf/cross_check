filter = 'critical'

async function loadPlayerAlgos(playerId, info){
  const fetched = await fetch(`https://terminal.c1games.com/api/game/user/${playerId}/algos?team=false`)
  if (fetched.status != 200) return alert('failed to retrieve user data')
  const response = await fetched.json()
  const algos = response.data.algos
  if (algos.length < 1) return alert('no algos found')

  enemies = {}
  for (const algo of algos) {
    algoId = algo.id
    const fetched = await fetch(`https://terminal.c1games.com/api/game/algo/${algoId}/matches`)
    if (fetched.status != 200)
        return alert('failed to retrieve algo data')
    const response = await fetched.json()
    const matches = response.data.matches.reverse()

    algo.num_matches = matches.length
    algo.num_wins = 0
    algo.num_lost = 0
    for (match of matches){
        if(match.winning_algo.id == algoId){
            match.result = "W";
            match.enemy_algo = match.losing_algo;
            match.my_algo = match.winning_algo;
            algo.num_wins += 1
        }else{
            match.result = "L";
            match.enemy_algo = match.winning_algo;
            match.my_algo = match.losing_algo;
            algo.num_lost += 1
        }

        if (!(match.enemy_algo.id in enemies)){
            enemies[match.enemy_algo.id] = {'player':{}, 'algo':match.enemy_algo, 'matches':[]}
        }
        enemies[match.enemy_algo.id]['matches'].push({'match_id': match.id, 'my_algo':match.my_algo.id,  'enemy_algo_id': match.enemy_algo.id, 'result': match.result, 'crashed': match.crashed} )
    }
  }
  printTable(enemies, algos);
  if (info & info == 1){
    load_player_info();
  }
}

async function printTable(enemies, algos, ){
    // Find a <table> element with id="myTable":
    var table = document.getElementById("table");
    var header = table.createTHead();
    var row = header.insertRow(-1);
    hcell1 =row.insertCell();
    hcell1.innerHTML = 'Algo';
    hcell2 =row.insertCell();
    hcell2.innerHTML = 'Rating';
    for(algo of algos){
        var cell = row.insertCell().innerHTML = algo.name + '</br><small>R:' + algo.rating + ' W/L:' + algo.num_wins +'/'+ algo.num_lost + '</small>'
    }

    enemies_arr = Object.values(enemies)
    enemies_arr.sort(function(a, b){
        return a.algo.rating > b.algo.rating ? -1 : ( a.algo.rating < b.algo.rating ? 1 : 0 );
    });

    for (enemy of enemies_arr) {
        critical_row = false
        for(match of enemy.matches){
            if(match.result == "L"){
                critical_row = true
            }
        }

        if (critical_row || filter == 'all'){
            var row = table.insertRow(-1);
            row.setAttribute('data-match-id', match.match_id)
            row.setAttribute('data-enemy-algo-id', enemy.algo.id)
            cell1 = row.insertCell()
            cell1.innerHTML = "<a href=https://bcverdict.github.io/?id="+ enemy.algo.id +" target='_blank'>"+ enemy.algo.name +"</a>";
            https://bcverdict.github.io/?id=118425
            cell2 = row.insertCell().innerHTML = enemy.algo.rating;
            cell2.innerHTML = enemy.algo.rating;
            for(algo of algos){
                cell = row.insertCell();
                for (match of enemy.matches){
                    if ( match.my_algo == algo.id){
//                        cell.innerHTML = match.result;
                        if (match.crashed){
                            cell.innerHTML = "<a title='crashed' href=https://felixrichter2000.github.io/watch?id="+ match.match_id +" target='_blank'>!"+ match.result +"</a>" ;
                        }else{
                            cell.innerHTML = "<a href=https://felixrichter2000.github.io/watch?id="+ match.match_id +" target='_blank'>"+ match.result +"</a>";
                        }
                        cell.className = 'result-'+match.result.toLowerCase()
                    }
                }
            }
        }
    }
}

async function load_player_info(){
    var table = document.getElementById("table");
    rows = table.rows

    header = rows[0];
    header.insertCell().innerHTML = ''
    header.insertCell().innerHTML = 'Player'
    header.insertCell().innerHTML = 'Ranked'
    for (index in rows){
        if (index == 0) continue;

        row = rows[index]
        if (typeof(row) != "object") continue;

        enemy_algo_id = row.getAttribute('data-enemy-algo-id');
        const fetched = await fetch(`https://terminal.c1games.com/api/game/algo/${enemy_algo_id}/matches?user_info=true&limit=1`)
//        const fetched = await fetch(`https://terminal.c1games.com/api/game/algo/${enemy_algo_id}/matches?user_info=true`)
        if (fetched.status != 200)
            return alert('failed to retrieve algo data')
        const response = await fetched.json()
        const matches = response.data.matches.reverse()
        const match_with_info = matches[0]

        if (match_with_info.losing_algo['id'] == enemy_algo_id){
            user_id = match_with_info.losing_user['id']
            avatarUrl = match_with_info.losing_user['avatarUrl']
            player_name = match_with_info.losing_user['displayName']  // match_with_info.losing_user['name']
            ranking = match_with_info.losing_user['rankedTier']
        }else{
            user_id = match_with_info.winning_user['id']
            avatarUrl = match_with_info.winning_user['avatarUrl']
            player_name = match_with_info.winning_user['displayName'] // match_with_info.losing_user['name']
            ranking = match_with_info.winning_user['rankedTier']
        }

        cell1 =row.insertCell()
        cell2 =row.insertCell()
        cell3 =row.insertCell()
        if(avatarUrl){
            cell1.innerHTML = "<img style='height:22px; width:22px; margin: -6px -5px;' src='"+avatarUrl+"' >"
        }
        if(player_name){
            cell2.innerHTML = "<a href='index.html?id="+user_id+"&filter=critical&info=1' target='_blank'>"+player_name+"</a>"
        }
        if(ranking){
            cell3.innerHTML = ranking
        }

//        old_matches = []
//        for(match in matches){
//            if (match.winning_user.userID = user_id){
//                console.log('W '+ match.winning_algo.name)
//            }
//            if (match.losing_user.userID = user_id){
//                console.log('L '+ match.losing_algo.name)
//            }
//        }
    }
}


window.onload = () => {
//  document.getElementById('find').onclick = () => window.location.search = `?id=${document.getElementById('algo-id').value}`
//  document.getElementById('update').onclick = () => plot()
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    filter = 'critical';
    if (urlParams.get('filter')) {
         filter = urlParams.get('filter').toLowerCase();
    }

    if (urlParams.get('id')) {
        loadPlayerAlgos(urlParams.get('id'), urlParams.get('info'));
    }else{
        document.getElementById('player_form').style.display = "";
    }

}