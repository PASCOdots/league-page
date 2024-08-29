<script>
  import { onMount } from "svelte";
  import MatchupWeeks from "$lib/Matchups/MatchupWeeks.svelte";

  import Button from "@smui/button";
  import Tab, { Label } from "@smui/tab";
  import CheckBox from "@smui/checkbox";
  import Textfield from "@smui/textfield";
  import Slider from "@smui/slider";
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
  let fantasyImplications = "";
  let homeBenchProblems = "";
  let awayBenchProblems = "";
  let homeTurningPoints = "";
  let awayTurningPoints = "";
  let lessonsLearned = "";
  let spiceLevel = 1.2;

  let disableGenerate = true;
  let rundown = "";

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

    fantasyImplications =
      "With this win, Tua Be or Dobbs to Be becomes the champion of the league. Unknown Team slides into second place.";
    lessonsLearned =
      "Don't stick your hand in a powered sink garbage disposal.";
    homeBenchProblems = "";
    awayBenchProblems = "";
    homeTurningPoints =
      "The last minute addition of Zamir White proved valuable. Davante Adams had his second best game of the season. Every skill position player scored double digit points";
    awayTurningPoints =
      "Austin Ekeler, Jahmyr Gibbs, and Odell Beckham each failed to outscore this team's kicker and 50% of the team failed to reach double digits. Even with 30 points on the bench in Jerome Ford, this team had no chance against their unstoppable opponent";

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
    if (team === "home") {
      // console.log(home.starters[starter.idx]);
      if (checked) {
        starter.points = starter.points.toString();
        topThreeHome = [...topThreeHome, starter];
      } else {
        topThreeHome = topThreeHome.filter((i) => i.idx !== starter.idx);
      }
    } else {
      // console.log(away.starters[starter.idx]);

      if (checked) {
        starter.points = starter.points.toString();
        topThreeAway = [...topThreeAway, starter];
      } else {
        topThreeAway = topThreeAway.filter((i) => i.idx !== starter.idx);
      }
    }

    if (topThreeHome.length >= 3 && topThreeAway.length >= 3) {
      disableGenerate = false;
    } else {
      disableGenerate = true;
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
    disableGenerate = true;
    // console.log(data);

    const payload = {};
    payload.home = {
      roster_id: home.roster_id,
      teamName: home.manager.name,
      managerName: getManagerName(home.manager.name),
      humanName: leagueTeamManagers.pascoUsers[home.manager.user_id],
      user_id: home.manager.user_id,
      score: home.score,
      top3: topThreeHome,
      benchProblems: homeBenchProblems,
      turningPoints: homeTurningPoints,
    };

    payload.away = {
      roster_id: away.roster_id,
      teamName: away.manager.name,
      managerName: getManagerName(away.manager.name),
      humanName: leagueTeamManagers.pascoUsers[home.manager.user_id],
      user_id: home.manager.user_id,
      score: away.score,
      top3: topThreeAway,
      benchProblems: awayBenchProblems,
      turningPoints: awayTurningPoints,
    };

    payload.spiceLevel = spiceLevel;
    payload.week = queryWeek;
    payload.lessonsLearned = lessonsLearned;
    payload.fantasyImplications = fantasyImplications;

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

    const res = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/generate-weekly",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    rundown = await res.text();
    disableGenerate = false;
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
    <div style="width: 20%">
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
    </div>
    <div class="scores-container">
      <div class="scores">
        <div class="flex-container">
          {#if home}
            <div class="half">
              <p>Home Score {home && home.points ? home.score : "-"}</p>

              <div class="flex-container">
                <div class="score-box">
                  <p>Sorted by points home</p>
                  {#each sortedStartersByPoints.home as starter}
                    <FormField align="start" style="width: 100%">
                      <CheckBox
                        cl
                        touch
                        checked={topThreeHome.find(
                          (i) => i.idx === starter.idx
                        ) !== undefined}
                        on:change={(e) => toggleTop3(e, starter, "home")}
                      />
                      <span slot="label">{starter.name} - {starter.points}</span
                      >
                    </FormField>
                  {/each}
                </div>

                <div class="score-box">
                  <p>Sorted by projections home</p>
                  {#each sortedStartersByProjections.home as starter}
                    <FormField align="start" style="width: 100%">
                      <CheckBox
                        cl
                        touch
                        checked={topThreeHome.find(
                          (i) => i.idx === starter.idx
                        ) !== undefined}
                        on:change={(e) => toggleTop3(e, starter, "home")}
                      />
                      <span slot="label">{starter.name} - {starter.points}</span
                      >
                    </FormField>
                  {/each}
                </div>
              </div>

              <ol class="horizontal-list">
                {#each topThreeHome as topHome}
                  <li>{topHome.name}</li>
                {/each}
              </ol>
            </div>

            <div class="half">
              <p>Away Score {away && away.points ? away.score : "-"}</p>

              <div class="flex-container">
                <div class="score-box">
                  <p>Sorted by points away</p>
                  {#each sortedStartersByPoints.away as starter}
                    <FormField align="start" style="width: 100%">
                      <CheckBox
                        cl
                        touch
                        checked={topThreeAway.find(
                          (i) => i.idx === starter.idx
                        ) !== undefined}
                        on:change={(e) => toggleTop3(e, starter, "away")}
                      />
                      <span slot="label">{starter.name} - {starter.points}</span
                      >
                    </FormField>
                  {/each}
                </div>
                <div class="score-box">
                  <p>Sorted by projections away</p>
                  {#each sortedStartersByProjections.away as starter}
                    <FormField align="start" style="width: 100%">
                      <CheckBox
                        cl
                        touch
                        checked={topThreeAway.find(
                          (i) => i.idx === starter.idx
                        ) !== undefined}
                        on:change={(e) => toggleTop3(e, starter, "away")}
                      />
                      <span slot="label" style="height: 20px">
                        {starter.name} - {starter.points}</span
                      >
                    </FormField>
                  {/each}
                </div>
              </div>

              <ol class="horizontal-list">
                {#each topThreeAway as topAway}
                  <li>{topAway.name}</li>
                {/each}
              </ol>
            </div>
          {/if}
        </div>
        <div class="flex-container">
          <Textfield
            textarea
            style="width: 50%; margin: 10px 0px;"
            bind:value={homeTurningPoints}
            label="Turning Points/Critical Moments..."
            disabled={!home}
          />
          <Textfield
            textarea
            style="width: 50%; margin: 10px 0px;"
            bind:value={homeBenchProblems}
            label="Bench/Roster Challenges..."
            disabled={!home}
          />
        </div>
        <div class="flex-container" style="margin-bottom: 10px;">
          <Textfield
            textarea
            style="width: 50%;"
            bind:value={awayTurningPoints}
            label="Turning Points/Critical Moments..."
            disabled={!home}
          />
          <Textfield
            textarea
            style="width: 50%;"
            bind:value={awayBenchProblems}
            label="Bench/Roster Challenges..."
            disabled={!home}
          />
        </div>
        <Textfield
          textarea
          style="width: 100%; margin-bottom: 10px"
          bind:value={lessonsLearned}
          label="Lessons Learned..."
          disabled={!home}
        />
        <Textfield
          textarea
          style="width: 100%; margin-bottom: 10px"
          bind:value={fantasyImplications}
          label="Fantasy Implications"
          disabled={!home}
        />

        <div class="half">
          <FormField align="end">
            <Slider bind:value={spiceLevel} min={0.4} max={2.0} step={0.1} />
            <span
              slot="label"
              style="padding-right: 12px; width: max-content; display: block;"
            >
              Spice Level
            </span>
          </FormField>
          <p>{spiceLevel}</p>
        </div>

        <Button
          style="width: 100%; margin-top: 10px;"
          on:click={submit}
          variant="raised"
          disabled={disableGenerate}
        >
          <Label>Generate</Label>
        </Button>

        {#if rundown}
          <p class="rundown">{rundown}</p>
        {/if}
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
    width: 80%;
  }

  .scores {
    position: sticky;
    top: 0; /* Sticks to the top when scrolling */
  }

  .score-box {
    width: 50%;
  }

  .flex-container {
    width: 100%;
    display: flex;
    /* align-items: center; */
    justify-content: space-evenly;
    /* padding: 10px; */
  }

  .horizontal-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    list-style-position: inside;
    padding-left: 5px;
    border-bottom: 1px solid gold;
    font-size: 20px;
    font-weight: 600;
    /* min-height: 25px; */
  }

  .horizontal-list li {
    margin-right: 20px;
  }

  .half {
    width: 50%;
  }

  .rundown {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 10px;
    margin: 10px 0px;
  }
</style>
