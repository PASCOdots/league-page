<script>
  import { onMount } from "svelte";
  import MatchupWeeks from "$lib/Matchups/MatchupWeeks.svelte";

  export let data;
  const {
    queryWeek = 1,
    matchupsData,
    bracketsData,
    playersData,
    leagueTeamManagersData,
  } = data;

  let players,
    matchupWeeks,
    year,
    week,
    regularSeasonLength,
    brackets,
    leagueTeamManagers;

  let loading = true;

  onMount(async () => {
    brackets = await bracketsData;
    const matchupsInfo = await matchupsData;
    leagueTeamManagers = await leagueTeamManagersData;
    matchupWeeks = matchupsInfo.matchupWeeks;
    year = matchupsInfo.year;
    week = matchupsInfo.week;
    regularSeasonLength = matchupsInfo.regularSeasonLength;
    const playersInfo = await playersData;
    players = playersInfo.players;
    loading = false;

    if (playersInfo.stale) {
      const newPlayersInfo = await loadPlayers(null, true);
      players = newPlayersInfo.players;
    }
  });

  let home;
  let away;
  let sortedStartersByPoints = {
    home: [],
    away: [],
  };
  let sortedStartersByProjections = {
    home: [],
    away: [],
  };

  const splitTeamsStarters = (starters) => {
    const homeStarters = [];
    const awayStarters = [];
    ("");
    for (let i = 0; i < starters.length - 1; i++) {
      // intentionally excluding the last element since it is the team score

      const { away, home } = starters[i];
      away["idx"] = i;
      home["idx"] = i;

      awayStarters.push(away);
      homeStarters.push(home);
    }

    return { homeStarters, awayStarters };
  };

  const startersToPoints = (homeStarters, awayStarters) => {
    sortedStartersByPoints.home = homeStarters.sort((a, b) => {
      if (a.points > b.points) {
        return -1;
      }
      return 1;
    });
    sortedStartersByPoints.away = awayStarters.sort((a, b) => {
      if (a.points > b.points) {
        return -1;
      }
      return 1;
    });
  };
  const startersToPointsOverProj = (homeStarters, awayStarters) => {
    // convert the points to projections/points
    // homeStarters.map((i) => (i.points = i.projection / i.points));
    for (let i = 0; i < homeStarters.length; i++) {
      const r = { ...homeStarters[i] };
      //   console.log(r.idx, r.points, r.projection, r.points / r.projection);
      const newPoints = r.points / r.projection;

      r.points = newPoints;
      homeStarters[i] = r;
    }

    for (let i = 0; i < awayStarters.length; i++) {
      const r = { ...awayStarters[i] };
      const newPoints = r.points / r.projection;

      r.points = newPoints;
      awayStarters[i] = r;
    }

    // awayStarters.map((i) => (i.points = i.projection / i.points));
    sortedStartersByProjections.home = homeStarters.sort((a, b) => {
      if (a.points > b.points) {
        return -1;
      }
      return 1;
    });
    sortedStartersByProjections.home.forEach((i) => {
      i.points = (i.points * 100).toFixed(2) + "%";
    });
    sortedStartersByProjections.away = awayStarters.sort((a, b) => {
      if (a.points > b.points) {
        return -1;
      }
      return 1;
    });
    sortedStartersByProjections.away.forEach((i) => {
      i.points = (i.points * 100).toFixed(2) + "%";
    });
  };

  const logMatchupContent = (data, idx, startersList) => {
    // console.log("logMatchupContent >> ", data, idx);
    // console.log("starters > ", startersList);
    const match = data[idx];
    home = match[0];
    away = match[1];
    // const {manager, points, roster_id, starters} = home;
    // const {avatar, name} = home.manager;
    const { homeStarters, awayStarters } = splitTeamsStarters(startersList);
    startersToPoints([...homeStarters], [...awayStarters]);
    startersToPointsOverProj([...homeStarters], [...awayStarters]);

    // const homeStartersToPoints = startersToPoints(home.starters, home.points);
    // console.log(homeStartersToPoints);
  };
</script>

<div id="main">
  {#if !loading}
    <MatchupWeeks
      {players}
      {queryWeek}
      {matchupWeeks}
      {regularSeasonLength}
      {year}
      {week}
      selection="regular"
      {leagueTeamManagers}
      isContent={true}
      {logMatchupContent}
    />
  {/if}
  <div class="scores-container">
    <div class="flex-container scores">
      <div class="flex-container">
        <div class="score-box">
          <p>Sorted by points home</p>
          <ol>
            {#each sortedStartersByPoints.home as starter}
              <li>{starter.name} - {starter.points} - {starter.idx}</li>
            {/each}
          </ol>
        </div>
        <div>
          <p>Sorted by projections home</p>
          <ol>
            {#each sortedStartersByProjections.home as starter}
              <li>{starter.name} - {starter.points} - {starter.idx}</li>
            {/each}
          </ol>
        </div>
      </div>
      <div class="flex-container">
        <div class="score-box">
          <p>Sorted by points away</p>
          <ol>
            {#each sortedStartersByPoints.away as starter}
              <li>{starter.name} - {starter.points} - {starter.idx}</li>
            {/each}
          </ol>
        </div>
        <div>
          <p>Sorted by projections away</p>
          <ol>
            {#each sortedStartersByProjections.away as starter}
              <li>
                {starter.name} - {starter.points} - {starter.idx}
                <input type="checkbox" />
              </li>
            {/each}
          </ol>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  #main {
    position: relative;
    z-index: 1;
    display: flex;
    align-content: center;
    padding: 10px;
  }

  ol,
  li {
    padding: 0;
    margin: 0;
  }

  .scores-container {
    position: relative;
  }

  .scores {
    position: sticky;
    top: 0; /* Sticks to the top when scrolling */
  }

  .score-box {
    margin-left: 50px;
    margin-right: 50px;
    min-width: 200px;
  }

  .flex-container {
    width: 100%;
    display: flex;
    align-content: center;
    justify-content: space-evenly;
    padding: 10px;
  }
</style>
