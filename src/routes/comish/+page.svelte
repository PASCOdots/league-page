<script>
  import { onMount } from "svelte";
  import MatchupWeeks from "$lib/Matchups/MatchupWeeks.svelte";

  import Button from "@smui/button";
  import Tab, { Label } from "@smui/tab";
  import CheckBox from "@smui/checkbox";
  import Textfield from "@smui/textfield";
  import FormField from "@smui/form-field";
  import League from "./League.svelte";

  export let data;
  let active;

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

    // console.log(leagueTeamManagers);

    // if (playersInfo.stale) {
    //   const newPlayersInfo = await loadPlayers(null, true);
    //   players = newPlayersInfo.players;
    // }
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
  let topThreeHome = [];
  let topThreeAway = [];
  let homeFantasyImplications = "";
  let homeLessonsLearned = "";
  let homeBenchProblems = "";
  let awayFantasyImplications = "";
  let awayLessonsLearned = "";
  let awayBenchProblems = "";

  const splitTeamsStarters = (starters) => {
    const homeStarters = [];
    const awayStarters = [];

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

    // clean up previous team data
    topThreeHome = [];
    topThreeAway = [];

    homeFantasyImplications = "";
    homeLessonsLearned = "";
    homeBenchProblems = "";
    awayFantasyImplications = "";
    awayLessonsLearned = "";
    awayBenchProblems = "";

    home.score = home.points.reduce((a, b) => a + b).toFixed(2);
    away.score = away.points.reduce((a, b) => a + b).toFixed(2);

    // const {manager, points, roster_id, starters} = home;
    // const {avatar, name} = home.manager;
    const { homeStarters, awayStarters } = splitTeamsStarters(startersList);
    startersToPoints([...homeStarters], [...awayStarters]);
    startersToPointsOverProj([...homeStarters], [...awayStarters]);
  };

  const toggleTop3 = (event, starter, team) => {
    const { checked } = event.target;
    console.log(checked, starter, team);

    if (team === "home") {
      // console.log(home.starters[starter.idx]);
      if (checked) {
        topThreeHome = [...topThreeHome, starter];
      } else {
        topThreeHome = topThreeHome.filter((i) => i.idx !== starter.idx);
      }
    } else {
      // console.log(away.starters[starter.idx]);

      if (checked) {
        topThreeAway = [...topThreeAway, starter];
      } else {
        topThreeAway = topThreeAway.filter((i) => i.idx !== starter.idx);
      }
    }
  };

  const getManagerName = (teamName) => {
    const userID = Object.keys(data.leagueTeamManagersData.users).find((i) => {
      return (
        data.leagueTeamManagersData.users[i].metadata.team_name === teamName
      );
    });
    return userID
      ? data.leagueTeamManagersData.users[userID].display_name
      : "no display name found";
  };

  const submit = async () => {
    // console.log(home);
    // console.log(data);

    const payload = {};
    payload.home = {
      roster_id: home.roster_id,
      teamName: home.manager.name,
      managerName: getManagerName(home.manager.name),
      score: home.score,
      top3: topThreeHome,
      homeFantasyImplications,
      homeLessonsLearned,
      homeBenchProblems,
    };

    payload.away = {
      roster_id: away.roster_id,
      teamName: away.manager.name,
      managerName: getManagerName(away.manager.name),
      score: away.score,
      top3: topThreeAway,
      awayFantasyImplications,
      awayLessonsLearned,
      awayBenchProblems,
    };

    payload.week = queryWeek;

    // convert the top 3's projection to the calculated projection %
    payload.home.top3.forEach((i) => {
      const starter = (i.projection = sortedStartersByProjections.home.find(
        (j) => j.idx === i.idx
      ).points); // stored the calc in points;
    });
    payload.away.top3.forEach((i) => {
      i.projection = sortedStartersByProjections.away.find(
        (j) => j.idx === i.idx
      ).points; // stored the calc in points;
    });

    console.log(payload);
  };
</script>

<div class="flex-container">
  <Tab
    tab="Content"
    on:click={() => {
      active = "Content";
    }}
    minWidth
    ><Label>Content</Label>
  </Tab>
  <Tab
    tab="Leagues"
    on:click={() => {
      active = "Leagues";
    }}
    minWidth
    ><Label>Leagues</Label>
  </Tab>
</div>

{#if active === "Content"}
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
      <div class="scores">
        <div class="flex-container">
          {#if home}
            <p class="half" style="text-align:center;">
              Home Score {home && home.points ? home.score : "-"}
            </p>
            <p class="half" style="text-align:center;">
              Away Score {away && away.points ? away.score : "-"}
            </p>
          {/if}
        </div>
        <div class="flex-container">
          <div class="flex-container">
            <div class="score-box">
              <p>Sorted by points home</p>
              {#each sortedStartersByPoints.home as starter}
                <FormField>
                  <CheckBox
                    cl
                    touch
                    checked={topThreeHome.find((i) => i.idx === starter.idx) !==
                      undefined}
                    style="padding: 5px;"
                    on:change={(e) => toggleTop3(e, starter, "home")}
                  />
                  <span slot="label">{starter.name} - {starter.points}</span>
                </FormField>
              {/each}
            </div>
            <div>
              <p>Sorted by projections home</p>
              {#each sortedStartersByProjections.home as starter}
                <FormField>
                  <CheckBox
                    cl
                    style="padding: 5px;"
                    touch
                    checked={topThreeHome.find((i) => i.idx === starter.idx) !==
                      undefined}
                    on:change={(e) => toggleTop3(e, starter, "home")}
                  />
                  <span slot="label">{starter.name} - {starter.points}</span>
                </FormField>
              {/each}
            </div>
          </div>
          <div class="flex-container">
            <div class="score-box">
              <p>Sorted by points away</p>
              {#each sortedStartersByPoints.away as starter}
                <div>
                  <FormField>
                    <CheckBox
                      cl
                      style="padding: 5px;"
                      touch
                      checked={topThreeAway.find(
                        (i) => i.idx === starter.idx
                      ) !== undefined}
                      on:change={(e) => toggleTop3(e, starter, "away")}
                    />
                    <span slot="label">{starter.name} - {starter.points}</span>
                  </FormField>
                </div>
              {/each}
            </div>
            <div>
              <p>Sorted by projections away</p>
              {#each sortedStartersByProjections.away as starter}
                <FormField align="end">
                  <CheckBox
                    cl
                    style="padding: 5px;"
                    touch
                    checked={topThreeAway.find((i) => i.idx === starter.idx) !==
                      undefined}
                    on:change={(e) => toggleTop3(e, starter, "away")}
                  />
                  <span slot="label" style="height: 20px">
                    {starter.name} - {starter.points}</span
                  >
                </FormField>
              {/each}
            </div>
          </div>
        </div>
        <div class="flex-container">
          <div class="half">
            <ol class="horizontal-list">
              {#each topThreeHome as topHome}
                <li>{topHome.name}</li>
              {/each}
            </ol>
          </div>
          <div class="half">
            <ol class="horizontal-list">
              {#each topThreeAway as topAway}
                <li>{topAway.name}</li>
              {/each}
            </ol>
          </div>
        </div>
        <div class="flex-container">
          <div>
            <Textfield
              textarea
              style="width: 100%; margin-bottom: 5px;"
              bind:value={homeFantasyImplications}
              label="Fantasy Implications..."
              disabled={!home}
            />
            <Textfield
              textarea
              style="width: 100%; margin-bottom: 5px;"
              bind:value={homeLessonsLearned}
              label="Lessons Learned..."
              disabled={!home}
            />
            <Textfield
              textarea
              style="width: 100%; margin-bottom: 5px;"
              bind:value={homeBenchProblems}
              label="Bench/Roster Challenges..."
              disabled={!home}
            />
          </div>
          <div>
            <Textfield
              textarea
              style="width: 100%; margin-bottom: 5px;"
              bind:value={awayFantasyImplications}
              label="Fantasy Implications..."
              disabled={!home}
            />
            <Textfield
              textarea
              style="width: 100%; margin-bottom: 5px;"
              bind:value={awayLessonsLearned}
              label="Lessons Learned..."
              disabled={!home}
            />
            <Textfield
              textarea
              style="width: 100%; margin-bottom: 5px;"
              bind:value={awayBenchProblems}
              label="Bench/Roster Challenges..."
              disabled={!home}
            />
          </div>
        </div>
        <Button style="width: 100%" on:click={submit} variant="raised">
          <Label>Generate</Label>
        </Button>
      </div>
    </div>
  </div>
{:else if leagueTeamManagers}
  <League
    homeUsers={leagueTeamManagers.users}
    homeLeagueID={leagueTeamManagers.leagueID}
  />
{/if}

<style>
  #main {
    position: relative;
    z-index: 1;
    display: flex;
    align-content: center;
    padding: 0px 10px;
  }

  p {
    padding: 0px;
    margin: 0px;
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
    align-items: center;
    justify-content: space-evenly;
    padding: 10px;
  }

  .horizontal-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    list-style-position: inside;
    padding-left: 0;
  }

  .horizontal-list li {
    margin-right: 20px;
  }

  .half {
    width: 50%;
  }
</style>
